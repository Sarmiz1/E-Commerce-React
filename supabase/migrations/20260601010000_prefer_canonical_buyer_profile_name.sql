create or replace function public.get_buyer_account_settings()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
begin
  perform private.assert_customer_session();

  return (
    select jsonb_build_object(
      'profile', jsonb_build_object(
        'full_name', coalesce(nullif(trim(profile.full_name), ''), nullif(trim(buyer_profile.full_name), ''), ''),
        'first_name', split_part(
          coalesce(nullif(trim(profile.full_name), ''), nullif(trim(buyer_profile.full_name), ''), 'Buyer'),
          ' ',
          1
        ),
        'email', coalesce(auth_user.email, ''),
        'phone', coalesce((
          select phone.phone_number
          from public.buyer_phone_numbers phone
          where phone.user_id = auth_user.id
          order by phone.is_default desc, phone.created_at, phone.id
          limit 1
        ), buyer_profile.phone, auth_user.phone, ''),
        'avatar_url', coalesce(buyer_profile.avatar_url, profile.avatar_url, '')
      ),
      'preferences', jsonb_build_object(
        'ai_suggestions', coalesce(preferences.ai_suggestions, true),
        'price_drop_alerts', coalesce(preferences.price_drop_alerts, true),
        'order_status_updates', coalesce(preferences.order_status_updates, true),
        'promotions_deals', coalesce(preferences.promotions_deals, false)
      )
    )
    from auth.users auth_user
    left join public.profiles profile on profile.id = auth_user.id
    left join public.buyer_profiles buyer_profile on buyer_profile.user_id = auth_user.id
    left join public.buyer_account_preferences preferences
      on preferences.user_id = auth_user.id
    where auth_user.id = buyer_id
  );
end;
$$;

revoke all on function public.get_buyer_account_settings() from public;
grant execute on function public.get_buyer_account_settings() to authenticated;
