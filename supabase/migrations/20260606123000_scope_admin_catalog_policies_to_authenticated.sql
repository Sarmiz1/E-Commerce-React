-- Older catalog/curation admin policies were created FOR ALL without a role.
-- That makes anon reads evaluate admin_users checks and can break guest curations.

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
on public.categories
for all
to authenticated
using ((select private.has_admin_role(array['super_admin', 'content_mod'])))
with check ((select private.has_admin_role(array['super_admin', 'content_mod'])));

drop policy if exists "Admins can manage curations" on public.curations;
create policy "Admins can manage curations"
on public.curations
for all
to authenticated
using ((select private.has_admin_role(array['super_admin', 'content_mod'])))
with check ((select private.has_admin_role(array['super_admin', 'content_mod'])));

drop policy if exists "Admins can manage curation products" on public.curation_products;
create policy "Admins can manage curation products"
on public.curation_products
for all
to authenticated
using ((select private.has_admin_role(array['super_admin', 'content_mod'])))
with check ((select private.has_admin_role(array['super_admin', 'content_mod'])));
