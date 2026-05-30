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
        coalesce((select sum(pv.stock_quantity) from public.product_variants pv where pv.product_id = p.id), 0) stock,
        coalesce(pm.view_count, 0) views
      from public.products p
      left join public.categories c on c.id = p.category_id
      left join public.seller_profiles sp on sp.user_id = p.seller_id
      left join public.product_metrics pm on pm.product_id = p.id
    ) row_data
  );
end;
$$;

revoke all on function public.get_admin_products() from public;
grant execute on function public.get_admin_products() to authenticated;

commit;
