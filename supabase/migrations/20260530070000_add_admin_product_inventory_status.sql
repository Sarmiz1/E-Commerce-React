begin;

create or replace function public.get_admin_products()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'content_mod']);

  return (
    select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.created_at desc), '[]'::jsonb)
    from (
      select p.id, p.name, p.price_minor, p.is_active, p.created_at, p.updated_at,
        coalesce(c.name, 'Uncategorized') category,
        coalesce(sp.store_name, 'Unassigned') seller,
        coalesce(inventory.sellable_stock, 0) stock,
        coalesce(pm.view_count, 0) views,
        case
          when not p.is_active then 'inactive'
          when coalesce(inventory.sellable_stock, 0) = 0 then 'out_of_stock'
          else 'active'
        end status
      from public.products p
      left join public.categories c on c.id = p.category_id
      left join public.seller_profiles sp on sp.user_id = p.seller_id
      left join public.product_metrics pm on pm.product_id = p.id
      left join lateral (
        select coalesce(sum(pv.stock_quantity), 0) sellable_stock
        from public.product_variants pv
        where pv.product_id = p.id
          and pv.is_active = true
      ) inventory on true
    ) row_data
  );
end;
$$;

create or replace function public.admin_set_product_active(product_id uuid, active boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'content_mod']);

  if active is null then
    raise exception 'Product visibility state is required'
      using errcode = '22023';
  end if;

  if active and not exists (
    select 1
    from public.product_variants pv
    where pv.product_id = $1
      and pv.is_active = true
      and pv.stock_quantity > 0
  ) then
    raise exception 'Product cannot be activated without sellable stock'
      using errcode = '22023';
  end if;

  update public.products
  set is_active = active,
    updated_at = timezone('utc'::text, now())
  where id = $1;

  if not found then
    raise exception 'Product was not found'
      using errcode = 'P0002';
  end if;

  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values (
    (select auth.uid()),
    'product_status',
    'Product visibility updated',
    jsonb_build_object('productId', product_id, 'isActive', active)
  );
end;
$$;

revoke all on function public.get_admin_products() from public;
grant execute on function public.get_admin_products() to authenticated;

revoke all on function public.admin_set_product_active(uuid, boolean) from public;
grant execute on function public.admin_set_product_active(uuid, boolean) to authenticated;

commit;
