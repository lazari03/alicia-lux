-- Alicia Lux — initial schema
-- Money is stored as integer öre (1 SEK = 100 öre). Prices include 25 % VAT.

set client_min_messages = warning;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name             text not null check (length(name) between 1 and 200),
  subtitle         text,
  description      text not null default '',
  features         text[] not null default '{}',
  price_ore        integer not null check (price_ore > 0),
  compare_at_ore   integer check (compare_at_ore is null or compare_at_ore > 0),
  images           text[] not null default '{}',
  swatch           text check (swatch is null or swatch ~ '^#[0-9a-fA-F]{6}$'),
  stock            integer not null default 0 check (stock >= 0),
  active           boolean not null default true,
  featured         boolean not null default false,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists products_active_sort_idx on public.products (active, sort_order);

-- ---------------------------------------------------------------------------
-- Store settings (single row)
-- ---------------------------------------------------------------------------
create table if not exists public.store_settings (
  id                       boolean primary key default true check (id),
  shipping_fee_ore         integer not null default 0 check (shipping_fee_ore >= 0),
  free_shipping_over_ore   integer check (free_shipping_over_ore is null or free_shipping_over_ore > 0),
  updated_at               timestamptz not null default now()
);
insert into public.store_settings (id) values (true) on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.order_status as enum ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

create table if not exists public.orders (
  id                        uuid primary key default gen_random_uuid(),
  order_number              bigint generated always as identity (start with 1001) unique,
  status                    public.order_status not null default 'pending',
  email                     text not null,
  first_name                text not null,
  last_name                 text not null,
  phone                     text,
  address_line1             text not null,
  address_line2             text,
  postal_code               text not null,
  city                      text not null,
  country                   text not null default 'SE',
  subtotal_ore              integer not null check (subtotal_ore >= 0),
  shipping_ore              integer not null default 0 check (shipping_ore >= 0),
  total_ore                 integer not null check (total_ore >= 0),
  vat_ore                   integer not null default 0,
  currency                  text not null default 'sek',
  stripe_payment_intent_id  text unique,
  tracking_number           text,
  note                      text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  paid_at                   timestamptz,
  fulfilled_at              timestamptz
);

create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists orders_paid_at_idx on public.orders (paid_at desc) where paid_at is not null;

create table if not exists public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders (id) on delete cascade,
  product_id      uuid references public.products (id) on delete set null,
  name            text not null,
  image           text,
  unit_price_ore  integer not null check (unit_price_ore >= 0),
  quantity        integer not null check (quantity between 1 and 99)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();
drop trigger if exists settings_touch on public.store_settings;
create trigger settings_touch before update on public.store_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Mark an order paid and decrement stock — atomic and idempotent.
-- Called by the Stripe webhook and the success page (whichever is first).
-- ---------------------------------------------------------------------------
create or replace function public.complete_order(p_payment_intent text, p_amount integer)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders
   where stripe_payment_intent_id = p_payment_intent
   for update;

  if not found then
    raise exception 'No order for payment intent %', p_payment_intent;
  end if;

  if v_order.status <> 'pending' then
    return v_order.id; -- already processed
  end if;

  if v_order.total_ore <> p_amount then
    raise exception 'Amount mismatch for order % (expected %, got %)', v_order.id, v_order.total_ore, p_amount;
  end if;

  update public.products p
     set stock = greatest(p.stock - i.quantity, 0)
    from public.order_items i
   where i.order_id = v_order.id and i.product_id = p.id;

  update public.orders set status = 'paid', paid_at = now() where id = v_order.id;
  return v_order.id;
end $$;

revoke all on function public.complete_order(text, integer) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Dashboard stats (admins only)
-- ---------------------------------------------------------------------------
create or replace function public.sales_by_day(p_days integer default 30)
returns table (day date, revenue_ore bigint, orders bigint)
language sql
stable
security definer
set search_path = public
as $$
  select d::date as day,
         coalesce(sum(o.total_ore), 0)::bigint as revenue_ore,
         count(o.id)::bigint as orders
    from generate_series(current_date - (p_days - 1), current_date, interval '1 day') d
    left join public.orders o
      on o.paid_at::date = d::date
     and o.status in ('paid', 'fulfilled')
   where public.is_admin() or current_user in ('postgres', 'service_role')
   group by d
   order by d;
$$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.admin_users    enable row level security;
alter table public.products       enable row level security;
alter table public.store_settings enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;

drop policy if exists "admins read self" on public.admin_users;
create policy "admins read self" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "public reads active products" on public.products;
create policy "public reads active products" on public.products
  for select to anon, authenticated using (active or public.is_admin());
drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public reads settings" on public.store_settings;
create policy "public reads settings" on public.store_settings
  for select to anon, authenticated using (true);
drop policy if exists "admins update settings" on public.store_settings;
create policy "admins update settings" on public.store_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Orders are written only by the server (service role). Admins may read/update.
drop policy if exists "admins manage orders" on public.orders;
create policy "admins manage orders" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage order items" on public.order_items;
create policy "admins manage order items" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: public product images. Uploads happen server-side (service role).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
