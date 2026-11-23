-- Explicit Data API grants.
-- Newer Supabase projects no longer auto-expose tables created over SQL to the
-- anon / authenticated / service_role roles. Without these grants the shop
-- sees no products and the admin check can't read admin_users.
-- Row Level Security (0001_init.sql) still decides which rows each role sees.

set client_min_messages = warning;

grant usage on schema public to anon, authenticated, service_role;

-- Server-side (service role): full access for checkout, webhooks and admin.
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Public storefront (anon + signed-in admins): read the catalog and settings.
grant select on public.products, public.store_settings to anon, authenticated;

-- Signed-in users: RLS limits these to admins only.
grant select, insert, update, delete on public.products, public.orders, public.order_items to authenticated;
grant update on public.store_settings to authenticated;
grant select on public.admin_users to authenticated;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.sales_by_day(integer) to authenticated;
-- complete_order stays service-role only (revoked from anon/authenticated in 0001).

-- Keep future tables/functions created by this role reachable for service_role.
alter default privileges in schema public grant all on tables    to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;
