-- First-party, cookie-free analytics.
-- No IP addresses or cookies are stored. `visitor` is a SHA-256 of
-- (daily rotating salt + IP + user agent), so a person can be counted once per
-- day but cannot be identified or followed across days.

set client_min_messages = warning;

create table if not exists public.analytics_events (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  name          text not null check (name in ('pageview', 'product_view', 'add_to_cart', 'begin_checkout', 'purchase')),
  visitor       text not null,
  path          text not null,
  referrer      text,           -- host only, e.g. instagram.com
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  country       text,           -- ISO-3166 alpha-2 from Cloudflare
  region        text,
  city          text,
  device        text,           -- mobile | tablet | desktop
  browser       text,
  os            text,
  language      text,
  product_id    uuid,
  value_ore     integer
);

create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_name_created_idx on public.analytics_events (name, created_at desc);

alter table public.analytics_events enable row level security;
-- No policies: only the server (service role) reads and writes.
grant all on public.analytics_events to service_role;
revoke all on public.analytics_events from anon, authenticated;

-- ---------------------------------------------------------------------------
-- One call returns everything the dashboard needs for a date range.
-- ---------------------------------------------------------------------------
create or replace function public.analytics_report(p_from timestamptz, p_to timestamptz default now())
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
with ev as (
  select * from public.analytics_events where created_at >= p_from and created_at < p_to
),
pv as (select * from ev where name = 'pageview'),
-- A "visit" = one visitor on one calendar day (Stockholm time).
visits as (
  select distinct visitor, (created_at at time zone 'Europe/Stockholm')::date as day from ev
),
paid as (
  select * from public.orders
   where status in ('paid', 'fulfilled') and paid_at >= p_from and paid_at < p_to
),
-- Where a visit came from = its first pageview of the day (landing page).
landing as (
  select distinct on (visitor, (created_at at time zone 'Europe/Stockholm')::date) *
    from pv
   order by visitor, (created_at at time zone 'Europe/Stockholm')::date, created_at
),
dims as (
  select visitor, created_at, d.dim, d.key
    from pv,
         lateral (values
           ('country',  coalesce(country, '??')),
           ('city',     coalesce(nullif(city, '') || coalesce(', ' || country, ''), 'Unknown')),
           ('page',     path),
           ('device',   coalesce(device, 'Unknown')),
           ('browser',  coalesce(browser, 'Unknown')),
           ('os',       coalesce(os, 'Unknown')),
           ('language', coalesce(language, 'Unknown'))
         ) as d(dim, key)
  union all
  select visitor, created_at, d.dim, d.key
    from landing,
         lateral (values
           ('referrer', coalesce(referrer, 'Direct')),
           ('source',   coalesce(utm_source, referrer, 'Direct')),
           ('campaign', utm_campaign)
         ) as d(dim, key)
),
top as (
  select dim, key, count(distinct visitor || '|' || (created_at at time zone 'Europe/Stockholm')::date) as visitors
    from dims
   where key is not null
   group by dim, key
)
select jsonb_build_object(
  'visitors',  (select count(*) from visits),
  'pageviews', (select count(*) from pv),
  'orders',    (select count(*) from paid),
  'revenue',   (select coalesce(sum(total_ore), 0) from paid),
  'series', (
    select coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'visitors', coalesce(v.n, 0), 'pageviews', coalesce(p.n, 0)) order by d.day), '[]')
      from generate_series((p_from at time zone 'Europe/Stockholm')::date, ((p_to - interval '1 second') at time zone 'Europe/Stockholm')::date, interval '1 day') d(day)
      left join (select day, count(*) as n from visits group by day) v on v.day = d.day::date
      left join (select (created_at at time zone 'Europe/Stockholm')::date as day, count(*) as n from pv group by 1) p on p.day = d.day::date
  ),
  'funnel', jsonb_build_object(
    'visitors',       (select count(*) from visits),
    'product_view',   (select count(distinct visitor || ((created_at at time zone 'Europe/Stockholm')::date)) from ev where name = 'product_view'),
    'add_to_cart',    (select count(distinct visitor || ((created_at at time zone 'Europe/Stockholm')::date)) from ev where name = 'add_to_cart'),
    'begin_checkout', (select count(distinct visitor || ((created_at at time zone 'Europe/Stockholm')::date)) from ev where name = 'begin_checkout'),
    'purchase',       (select count(*) from paid)
  ),
  'breakdowns', (
    select coalesce(jsonb_object_agg(dim, rows), '{}')
      from (
        select dim, jsonb_agg(jsonb_build_object('key', key, 'visitors', visitors) order by visitors desc, key) filter (where rn <= 10) as rows
          from (select *, row_number() over (partition by dim order by visitors desc, key) rn from top) ranked
         group by dim
      ) b
  ),
  'customers', jsonb_build_object(
    'total',      (select count(distinct lower(email)) from paid),
    'repeat',     (select count(*) from (select lower(email) from public.orders where status in ('paid','fulfilled')
                                         group by lower(email) having count(*) > 1
                                         and max(paid_at) >= p_from) r),
    'aov',        (select coalesce(round(avg(total_ore)), 0) from paid),
    'top_cities', (select coalesce(jsonb_agg(c order by (c->>'orders')::int desc), '[]') from (
                     select jsonb_build_object('key', initcap(city), 'orders', count(*), 'revenue', sum(total_ore)) c
                       from paid group by initcap(city) order by count(*) desc limit 8) x),
    'top', (select coalesce(jsonb_agg(c order by (c->>'revenue')::bigint desc), '[]') from (
              select jsonb_build_object('name', max(first_name || ' ' || last_name), 'email', lower(email),
                                        'orders', count(*), 'revenue', sum(total_ore)) c
                from paid group by lower(email) order by sum(total_ore) desc limit 8) x)
  )
)
where public.is_admin() or current_user in ('postgres', 'service_role');
$$;

revoke all on function public.analytics_report(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.analytics_report(timestamptz, timestamptz) to service_role;

-- Optional housekeeping: keep 13 months of raw events.
create or replace function public.analytics_prune()
returns void language sql security definer set search_path = public as $$
  delete from public.analytics_events where created_at < now() - interval '13 months';
$$;
revoke all on function public.analytics_prune() from public, anon, authenticated;
grant execute on function public.analytics_prune() to service_role;
