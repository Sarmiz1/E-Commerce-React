-- Buyer phone numbers are stored as strict E.164 components. Existing accounts
-- without a saved number are not backfilled with invented data. Once a buyer
-- saves a number, the final number cannot be removed.

create extension if not exists pgcrypto;

alter table public.buyer_phone_numbers
  add column if not exists country_code text;

alter table public.buyer_phone_numbers
  drop constraint if exists buyer_phone_numbers_phone_number_format;

alter table public.buyer_phone_numbers
  drop constraint if exists buyer_phone_numbers_phone_number_key;

with legacy_phone_numbers as (
  select phone.id,
    regexp_replace(phone.phone_number, '[^0-9]', '', 'g') digits
  from public.buyer_phone_numbers phone
  where phone.country_code is null
),
split_phone_numbers as (
  select legacy.id,
    case
      when legacy.digits like '234%' then '234'
      when legacy.digits like '233%' then '233'
      when legacy.digits like '254%' then '254'
      when legacy.digits like '971%' then '971'
      when legacy.digits like '44%' then '44'
      when legacy.digits like '27%' then '27'
      when legacy.digits like '91%' then '91'
      when legacy.digits like '1%' then '1'
      else '234'
    end country_code,
    case
      when legacy.digits like '234%' then substr(legacy.digits, 4)
      when legacy.digits like '233%' then substr(legacy.digits, 4)
      when legacy.digits like '254%' then substr(legacy.digits, 4)
      when legacy.digits like '971%' then substr(legacy.digits, 4)
      when legacy.digits like '44%' then substr(legacy.digits, 3)
      when legacy.digits like '27%' then substr(legacy.digits, 3)
      when legacy.digits like '91%' then substr(legacy.digits, 3)
      when legacy.digits like '1%' then substr(legacy.digits, 2)
      else regexp_replace(legacy.digits, '^0+', '')
    end phone_number
  from legacy_phone_numbers legacy
)
update public.buyer_phone_numbers phone
set country_code = split.country_code,
  phone_number = regexp_replace(split.phone_number, '^0+', ''),
  updated_at = now()
from split_phone_numbers split
where phone.id = split.id;

alter table public.buyer_phone_numbers
  alter column country_code set not null;

alter table public.buyer_phone_numbers
  add column if not exists e164_phone text
    generated always as ('+' || country_code || phone_number) stored;

alter table public.buyer_phone_numbers
  drop constraint if exists buyer_phone_numbers_country_code_format;
alter table public.buyer_phone_numbers
  add constraint buyer_phone_numbers_country_code_format
    check (country_code ~ '^[1-9][0-9]{0,2}$');

alter table public.buyer_phone_numbers
  drop constraint if exists buyer_phone_numbers_local_number_format;
alter table public.buyer_phone_numbers
  add constraint buyer_phone_numbers_local_number_format
    check (phone_number ~ '^[1-9][0-9]{3,13}$');

alter table public.buyer_phone_numbers
  drop constraint if exists buyer_phone_numbers_e164_length;
alter table public.buyer_phone_numbers
  add constraint buyer_phone_numbers_e164_length
    check (length(country_code || phone_number) between 7 and 15);

create unique index if not exists buyer_phone_numbers_e164_phone_uidx
  on public.buyer_phone_numbers(e164_phone);

create unique index if not exists buyer_phone_numbers_one_default_per_user_uidx
  on public.buyer_phone_numbers(user_id)
  where is_default = true;

create or replace function private.normalize_buyer_phone_country_code(
  p_country_code text
)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized_country_code text :=
    regexp_replace(trim(coalesce(p_country_code, '')), '[^0-9]', '', 'g');
begin
  if normalized_country_code !~ '^[1-9][0-9]{0,2}$' then
    raise exception 'Enter a valid country calling code, such as 234.';
  end if;

  return normalized_country_code;
end;
$$;

create or replace function private.normalize_buyer_local_phone_number(
  p_phone_number text
)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized_phone_number text := regexp_replace(
    regexp_replace(trim(coalesce(p_phone_number, '')), '[^0-9]', '', 'g'),
    '^0+',
    ''
  );
begin
  if normalized_phone_number !~ '^[1-9][0-9]{3,13}$' then
    raise exception 'Enter a valid local phone number.';
  end if;

  return normalized_phone_number;
end;
$$;

create or replace function private.format_buyer_phone_number(
  p_country_code text,
  p_phone_number text
)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select '+' || p_country_code || p_phone_number;
$$;

revoke all on function private.normalize_buyer_phone_country_code(text)
  from public, anon, authenticated;
revoke all on function private.normalize_buyer_local_phone_number(text)
  from public, anon, authenticated;
revoke all on function private.format_buyer_phone_number(text, text)
  from public, anon, authenticated;

create or replace function private.sync_buyer_primary_phone_number(
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  primary_phone text;
begin
  select private.format_buyer_phone_number(
    phone.country_code,
    phone.phone_number
  )
  into primary_phone
  from public.buyer_phone_numbers phone
  where phone.user_id = p_user_id
  order by phone.is_default desc, phone.created_at, phone.id
  limit 1;

  insert into public.buyer_profiles (user_id, phone)
  values (p_user_id, primary_phone)
  on conflict (user_id) do update
  set phone = excluded.phone;
end;
$$;

revoke all on function private.sync_buyer_primary_phone_number(uuid)
  from public;

create or replace function private.prevent_last_buyer_phone_number_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*)
    from public.buyer_phone_numbers phone
    where phone.user_id = old.user_id
  ) <= 1 then
    raise exception 'Keep at least one phone number on your account. Add another number before removing this one.';
  end if;

  return old;
end;
$$;

revoke all on function private.prevent_last_buyer_phone_number_delete()
  from public;

drop trigger if exists buyer_phone_numbers_require_one_number
  on public.buyer_phone_numbers;
create trigger buyer_phone_numbers_require_one_number
before delete on public.buyer_phone_numbers
for each row execute function private.prevent_last_buyer_phone_number_delete();

create table if not exists public.buyer_phone_number_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null
    check (action_type in ('add', 'update', 'delete')),
  phone_id uuid references public.buyer_phone_numbers(id) on delete cascade,
  country_code text,
  phone_number text,
  make_default boolean not null default false,
  confirmation_code_hash text not null,
  failed_attempts integer not null default 0
    check (failed_attempts between 0 and 5),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  constraint buyer_phone_number_actions_payload
    check (
      (
        action_type = 'delete'
        and phone_id is not null
        and country_code is null
        and phone_number is null
      )
      or
      (
        action_type = 'add'
        and phone_id is null
        and country_code is not null
        and phone_number is not null
      )
      or
      (
        action_type = 'update'
        and phone_id is not null
        and country_code is not null
        and phone_number is not null
      )
    )
);

create index if not exists buyer_phone_number_actions_user_expires_at_idx
  on public.buyer_phone_number_actions(user_id, expires_at desc);

alter table public.buyer_phone_number_actions enable row level security;
revoke all on table public.buyer_phone_number_actions from anon, authenticated;
grant all on table public.buyer_phone_number_actions to service_role;

create or replace function public.get_buyer_phone_numbers()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
begin
  perform private.assert_customer_session();

  return coalesce((
    select jsonb_agg(
      to_jsonb(phone)
      || jsonb_build_object(
        'isDefault', phone.is_default,
        'formatted_phone',
        private.format_buyer_phone_number(
          phone.country_code,
          phone.phone_number
        )
      )
      order by phone.is_default desc, phone.created_at, phone.id
    )
    from public.buyer_phone_numbers phone
    where phone.user_id = buyer_id
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_buyer_phone_numbers() from public;
grant execute on function public.get_buyer_phone_numbers() to authenticated;

create or replace function public.begin_buyer_phone_number_action(
  p_user_id uuid,
  p_action_type text,
  p_phone_id uuid default null,
  p_country_code text default null,
  p_phone_number text default null,
  p_make_default boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_country_code text;
  normalized_phone_number text;
  confirmation_code text;
  requested_action public.buyer_phone_number_actions%rowtype;
begin
  if not exists (
    select 1
    from public.profiles profile
    where profile.id = p_user_id
      and profile.role = 'buyer'
  ) then
    raise exception 'Buyer account not found.';
  end if;

  if p_action_type not in ('add', 'update', 'delete') then
    raise exception 'Unsupported phone-number action.';
  end if;

  if p_action_type in ('update', 'delete') and not exists (
    select 1
    from public.buyer_phone_numbers phone
    where phone.id = p_phone_id
      and phone.user_id = p_user_id
  ) then
    raise exception 'Phone number not found.';
  end if;

  if p_action_type = 'delete' and (
    select count(*)
    from public.buyer_phone_numbers phone
    where phone.user_id = p_user_id
  ) <= 1 then
    raise exception 'Keep at least one phone number on your account. Add another number before removing this one.';
  end if;

  if p_action_type in ('add', 'update') then
    normalized_country_code :=
      private.normalize_buyer_phone_country_code(p_country_code);
    normalized_phone_number :=
      private.normalize_buyer_local_phone_number(p_phone_number);

    if length(normalized_country_code || normalized_phone_number)
      not between 7 and 15 then
      raise exception 'Enter a valid international phone number.';
    end if;

    if exists (
      select 1
      from public.buyer_phone_numbers phone
      where phone.e164_phone = private.format_buyer_phone_number(
        normalized_country_code,
        normalized_phone_number
      )
      and (p_action_type = 'add' or phone.id <> p_phone_id)
    ) then
      raise exception 'That phone number is already linked to an account.';
    end if;
  end if;

  if p_action_type = 'add' and (
    select count(*)
    from public.buyer_phone_numbers phone
    where phone.user_id = p_user_id
  ) >= 2 then
    raise exception 'You can save at most two phone numbers.';
  end if;

  delete from public.buyer_phone_number_actions action
  where action.user_id = p_user_id;

  confirmation_code := lpad(
    (
      (
        ('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint
        % 1000000
      )::text
    ),
    6,
    '0'
  );

  insert into public.buyer_phone_number_actions (
    user_id,
    action_type,
    phone_id,
    country_code,
    phone_number,
    make_default,
    confirmation_code_hash
  )
  values (
    p_user_id,
    p_action_type,
    p_phone_id,
    normalized_country_code,
    normalized_phone_number,
    coalesce(p_make_default, false),
    extensions.crypt(confirmation_code, extensions.gen_salt('bf', 8))
  )
  returning * into requested_action;

  return jsonb_build_object(
    'requestId', requested_action.id,
    'actionType', requested_action.action_type,
    'expiresAt', requested_action.expires_at,
    'confirmationCode', confirmation_code
  );
end;
$$;

revoke all on function public.begin_buyer_phone_number_action(
  uuid, text, uuid, text, text, boolean
) from public, anon, authenticated;
grant execute on function public.begin_buyer_phone_number_action(
  uuid, text, uuid, text, text, boolean
) to service_role;

create or replace function public.approve_buyer_phone_number_action(
  p_request_id uuid,
  p_confirmation_code text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  requested_action public.buyer_phone_number_actions%rowtype;
  make_default boolean;
begin
  perform private.assert_customer_session();

  select action.*
  into requested_action
  from public.buyer_phone_number_actions action
  where action.id = p_request_id
    and action.user_id = buyer_id
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error', 'This phone-number approval request was not found. Start again.'
    );
  end if;

  if requested_action.expires_at <= now() then
    delete from public.buyer_phone_number_actions action
    where action.id = requested_action.id;

    return jsonb_build_object(
      'success', false,
      'error', 'This confirmation code expired. Start the change again.'
    );
  end if;

  if requested_action.failed_attempts >= 5 then
    delete from public.buyer_phone_number_actions action
    where action.id = requested_action.id;

    return jsonb_build_object(
      'success', false,
      'error', 'Too many incorrect codes. Start the change again.'
    );
  end if;

  if coalesce(p_confirmation_code, '') !~ '^[0-9]{6}$'
    or extensions.crypt(p_confirmation_code, requested_action.confirmation_code_hash)
      <> requested_action.confirmation_code_hash then
    update public.buyer_phone_number_actions action
    set failed_attempts = least(action.failed_attempts + 1, 5)
    where action.id = requested_action.id;

    return jsonb_build_object(
      'success', false,
      'error', 'That confirmation code is incorrect.',
      'attemptsRemaining', greatest(4 - requested_action.failed_attempts, 0)
    );
  end if;

  delete from public.buyer_phone_number_actions action
  where action.id = requested_action.id;

  begin
    if requested_action.action_type = 'add' then
      make_default := requested_action.make_default or not exists (
        select 1
        from public.buyer_phone_numbers phone
        where phone.user_id = buyer_id
      );

      if make_default then
        update public.buyer_phone_numbers
        set is_default = false,
          updated_at = now()
        where user_id = buyer_id
          and is_default = true;
      end if;

      insert into public.buyer_phone_numbers (
        user_id,
        country_code,
        phone_number,
        is_default
      )
      values (
        buyer_id,
        requested_action.country_code,
        requested_action.phone_number,
        make_default
      );
    elsif requested_action.action_type = 'update' then
      update public.buyer_phone_numbers
      set country_code = requested_action.country_code,
        phone_number = requested_action.phone_number,
        updated_at = now()
      where id = requested_action.phone_id
        and user_id = buyer_id;

      if not found then
        raise exception 'Phone number not found.';
      end if;
    else
      if (
        select count(*)
        from public.buyer_phone_numbers phone
        where phone.user_id = buyer_id
      ) <= 1 then
        raise exception 'Keep at least one phone number on your account. Add another number before removing this one.';
      end if;

      delete from public.buyer_phone_numbers phone
      where phone.id = requested_action.phone_id
        and phone.user_id = buyer_id;

      if not found then
        raise exception 'Phone number not found.';
      end if;

      if not exists (
        select 1
        from public.buyer_phone_numbers phone
        where phone.user_id = buyer_id
          and phone.is_default = true
      ) then
        update public.buyer_phone_numbers
        set is_default = true,
          updated_at = now()
        where id = (
          select phone.id
          from public.buyer_phone_numbers phone
          where phone.user_id = buyer_id
          order by phone.created_at, phone.id
          limit 1
        );
      end if;
    end if;
  exception
    when unique_violation then
      raise exception 'That phone number is already linked to an account.';
  end;

  perform private.sync_buyer_primary_phone_number(buyer_id);

  return jsonb_build_object(
    'success', true,
    'phoneNumbers', public.get_buyer_phone_numbers()
  );
end;
$$;

revoke all on function public.approve_buyer_phone_number_action(uuid, text)
  from public;
grant execute on function public.approve_buyer_phone_number_action(uuid, text)
  to authenticated;

drop function if exists public.add_buyer_phone_number(text, boolean);
drop function if exists public.update_buyer_phone_number(uuid, text);
drop function if exists public.delete_buyer_phone_number(uuid);

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
          select private.format_buyer_phone_number(
            phone.country_code,
            phone.phone_number
          )
          from public.buyer_phone_numbers phone
          where phone.user_id = auth_user.id
          order by phone.is_default desc, phone.created_at, phone.id
          limit 1
        ), ''),
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

do $$
declare
  buyer_phone record;
begin
  for buyer_phone in
    select distinct phone.user_id
    from public.buyer_phone_numbers phone
  loop
    perform private.sync_buyer_primary_phone_number(buyer_phone.user_id);
  end loop;
end;
$$;
