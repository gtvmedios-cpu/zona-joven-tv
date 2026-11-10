-- Ejecutar en Supabase > SQL Editor con el usuario propietario del proyecto.
create extension if not exists pgcrypto;
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category_id uuid references public.categories(id) on delete set null,
  excerpt text default '',
  content text default '',
  cover_image text,
  status text not null default 'draft' check (status in ('draft','published')),
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
insert into public.categories(name,slug) values
 ('Actualidad','actualidad'),('Cultura','cultura'),('Comunidad','comunidad'),('Educación','educacion'),('Videos','videos')
on conflict (slug) do nothing;
create or replace function public.is_zjtv_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()); $$;
grant execute on function public.is_zjtv_admin() to authenticated;
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
drop policy if exists "admin can read own admin record" on public.admin_users;
create policy "admin can read own admin record" on public.admin_users for select to authenticated using (user_id=auth.uid());
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select to anon,authenticated using (true);
drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories" on public.categories for all to authenticated using (public.is_zjtv_admin()) with check (public.is_zjtv_admin());
drop policy if exists "public read published posts" on public.posts;
create policy "public read published posts" on public.posts for select to anon,authenticated using (status='published' or public.is_zjtv_admin());
drop policy if exists "admin manage posts" on public.posts;
create policy "admin manage posts" on public.posts for all to authenticated using (public.is_zjtv_admin()) with check (public.is_zjtv_admin());
insert into storage.buckets(id,name,public) values('post-covers','post-covers',true) on conflict(id) do update set public=true;
drop policy if exists "public view post covers" on storage.objects;
create policy "public view post covers" on storage.objects for select using (bucket_id='post-covers');
drop policy if exists "admins upload post covers" on storage.objects;
create policy "admins upload post covers" on storage.objects for insert to authenticated with check (bucket_id='post-covers' and public.is_zjtv_admin());
drop policy if exists "admins update post covers" on storage.objects;
create policy "admins update post covers" on storage.objects for update to authenticated using (bucket_id='post-covers' and public.is_zjtv_admin()) with check (bucket_id='post-covers' and public.is_zjtv_admin());
drop policy if exists "admins delete post covers" on storage.objects;
create policy "admins delete post covers" on storage.objects for delete to authenticated using (bucket_id='post-covers' and public.is_zjtv_admin());
-- PASO FINAL: crea primero el usuario en Authentication > Users.
-- Luego copia su UUID y ejecuta: insert into public.admin_users(user_id) values ('UUID-DEL-USUARIO');
