begin;

create index if not exists idx_events_product_type
  on public.events(product_id, event_type)
  where product_id is not null;

create or replace function public.sync_product_view_metric_from_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.product_id is null or new.event_type not in (
    'view_product',
    'product_detail_viewed',
    'quick_view_opened'
  ) then
    return new;
  end if;

  insert into public.product_metrics(product_id, view_count)
  values (new.product_id, 1)
  on conflict (product_id) do update
  set view_count = coalesce(public.product_metrics.view_count, 0) + excluded.view_count;

  return new;
end;
$$;

drop trigger if exists events_sync_product_view_metric on public.events;
create trigger events_sync_product_view_metric
after insert on public.events
for each row
execute function public.sync_product_view_metric_from_event();

insert into public.product_metrics(product_id, view_count)
select e.product_id, count(*)::integer
from public.events e
where e.product_id is not null
  and e.event_type in (
    'view_product',
    'product_detail_viewed',
    'quick_view_opened'
  )
group by e.product_id
on conflict (product_id) do update
set view_count = greatest(
  coalesce(public.product_metrics.view_count, 0),
  excluded.view_count
);

revoke all on function public.sync_product_view_metric_from_event() from public;

commit;
