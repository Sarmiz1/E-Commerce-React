-- Buyer dashboard access must be scoped to the authenticated Supabase user.
drop function if exists public.get_buyer_dashboard(uuid);
drop function if exists public.get_buyer_dashboard();

create function public.get_buyer_dashboard()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_buyer_id uuid := auth.uid();
  dashboard_data json;
begin
  if v_buyer_id is null then
    raise exception 'Authentication required';
  end if;

  select json_build_object(
    'profile', (
      select json_build_object(
        'full_name', coalesce(bp.full_name, p.full_name),
        'reward_points', coalesce(bp.reward_points, 0),
        'tier', coalesce(bp.tier, 'Silver'),
        'member_since', coalesce(bp.created_at, p.created_at),
        'email', u.email,
        'phone', coalesce(bp.phone, u.phone)
      )
      from public.profiles p
      left join public.buyer_profiles bp on bp.user_id = p.id
      join auth.users u on u.id = p.id
      where p.id = v_buyer_id
    ),
    'wallet', (
      select json_build_object(
        'balance', coalesce(sum(amount), 0),
        'totalFunded', coalesce(sum(amount) filter (where amount > 0 and type = 'fund'), 0),
        'totalWithdrawn', coalesce(abs(sum(amount) filter (where amount < 0 and type = 'withdraw')), 0),
        'totalSpent', coalesce(abs(sum(amount) filter (where amount < 0 and type in ('purchase', 'credit'))), 0),
        'transactions', (
          select coalesce(json_agg(t order by created_at desc), '[]'::json)
          from public.wallet_ledger t
          where t.user_id = v_buyer_id
        )
      )
      from public.wallet_ledger
      where user_id = v_buyer_id
    ),
    'ai_credits', (
      select json_build_object(
        'balance', coalesce(sum(amount), 0),
        'totalPurchased', coalesce(sum(amount) filter (where amount > 0 and type = 'purchase'), 0),
        'totalUsed', coalesce(abs(sum(amount) filter (where amount < 0 and type = 'usage')), 0),
        'history', (
          select coalesce(
            json_agg(
              json_build_object(
                'date', created_at::date,
                'used', abs(amount),
                'desc', description
              )
              order by created_at desc
            ),
            '[]'::json
          )
          from public.ai_credits_ledger c
          where c.user_id = v_buyer_id
            and type = 'usage'
        )
      )
      from public.ai_credits_ledger
      where user_id = v_buyer_id
    ),
    'orders', (
      select coalesce(
        json_agg(
          json_build_object(
            'id', o.id,
            'order_number', o.order_number,
            'status', o.status,
            'payment_status', o.payment_status,
            'total_minor', o.total_minor,
            'created_at', o.created_at,
            'address', coalesce(
              o.shipping_address::text,
              (
                select a.line1 || ', ' || a.city
                from public.addresses a
                where a.id = o.shipping_address_id
              ),
              'No address provided'
            ),
            'order_items', (
              select coalesce(
                json_agg(
                  json_build_object(
                    'id', oi.id,
                    'quantity', oi.quantity,
                    'products', p
                  )
                ),
                '[]'::json
              )
              from public.order_items oi
              join public.products p on p.id = oi.product_id
              where oi.order_id = o.id
            )
          )
          order by o.created_at desc
        ),
        '[]'::json
      )
      from public.orders o
      where o.user_id = v_buyer_id
    ),
    'reviews', (
      select coalesce(
        json_agg(
          json_build_object(
            'id', r.id,
            'rating', r.rating,
            'review_text', r.review_text,
            'products', p
          )
        ),
        '[]'::json
      )
      from public.product_reviews r
      join public.products p on p.id = r.product_id
      where r.user_id = v_buyer_id
    ),
    'notifications', (
      select coalesce(json_agg(n order by created_at desc), '[]'::json)
      from (
        select *
        from public.notifications
        where user_id = v_buyer_id
        order by created_at desc
        limit 30
      ) n
    ),
    'addresses', (
      select coalesce(json_agg(a), '[]'::json)
      from public.addresses a
      where a.user_id = v_buyer_id
    ),
    'payment_methods', (
      select coalesce(json_agg(pm), '[]'::json)
      from public.payment_methods pm
      where pm.user_id = v_buyer_id
    ),
    'insights', (
      select coalesce(json_agg(i), '[]'::json)
      from public.buyer_insights i
      where i.user_id = v_buyer_id
    ),
    'recommendations', (
      select coalesce(
        json_agg(
          json_build_object(
            'id', br.id,
            'reason', br.reason,
            'budget_fit', br.budget_fit,
            'products', p
          )
        ),
        '[]'::json
      )
      from public.buyer_recommendations br
      join public.products p on p.id = br.product_id
      where br.user_id = v_buyer_id
    )
  )
  into dashboard_data;

  return dashboard_data;
end;
$$;

revoke all on function public.get_buyer_dashboard() from public;
grant execute on function public.get_buyer_dashboard() to authenticated;

revoke insert, update, delete on table public.wallet_ledger from anon, authenticated;
revoke insert, update, delete on table public.ai_credits_ledger from anon, authenticated;
grant select on table public.wallet_ledger to authenticated;
grant select on table public.ai_credits_ledger to authenticated;
