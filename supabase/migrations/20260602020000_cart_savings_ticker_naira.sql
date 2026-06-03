-- Keep cart savings ticker currency server-authoritative and Nigerian Naira.
-- This wraps the already-deployed cart summary function so live databases do
-- not need the full cart backend migration rerun.

do $$
begin
  if to_regprocedure('public.get_cart_summary_currency_source(uuid,boolean,text)') is null then
    alter function public.get_cart_summary(uuid, boolean, text)
      rename to get_cart_summary_currency_source;
  end if;
end $$;

create or replace function public.get_cart_summary(
  p_cart_id uuid,
  p_update_promo boolean default false,
  p_promo_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_summary jsonb;
  v_savings bigint := 0;
begin
  perform private.assert_customer_session();

  v_summary := public.get_cart_summary_currency_source(
    p_cart_id,
    p_update_promo,
    p_promo_code
  );
  v_savings := coalesce((v_summary ->> 'savings')::bigint, 0);

  return jsonb_set(
    v_summary,
    '{savings_ticker_message}',
    case
      when v_savings > 0 then to_jsonb(
        'You''re saving ' || chr(8358) || format(
          '%s.%s on this order',
          v_savings / 100,
          lpad((v_savings % 100)::text, 2, '0')
        )
      )
      else 'null'::jsonb
    end,
    true
  );
end;
$$;

revoke all on function public.get_cart_summary(uuid, boolean, text) from public, anon;
grant execute on function public.get_cart_summary(uuid, boolean, text) to authenticated;
