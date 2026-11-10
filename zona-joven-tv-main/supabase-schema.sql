-- Ejecutar en Supabase > SQL Editor.
create extension if not exists pgcrypto;
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
  excerpt text not null default '',
  content text not null default '',
  cover_image text,
  category_id uuid references public.categories(id) on delete set null,
  type text not null default 'noticia' check (type in ('noticia','video')),
  video_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.categories(name,slug) values
 ('Actualidad','actualidad'),('Cultura','cultura'),('Comunidad','comunidad'),('Educación','educacion')
on conflict do nothing;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts" on public.posts for select using (status='published');
drop policy if exists "Authenticated editors manage posts" on public.posts;
create policy "Authenticated editors manage posts" on public.posts for all to authenticated using (true) with check (true);
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories for select using (true);
drop policy if exists "Authenticated editors manage categories" on public.categories;
create policy "Authenticated editors manage categories" on public.categories for all to authenticated using (true) with check (true);
-- Bucket público para imágenes de portada. La escritura exige sesión.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('post-covers','post-covers',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "Public reads post covers" on storage.objects;
create policy "Public reads post covers" on storage.objects for select using (bucket_id='post-covers');
drop policy if exists "Authenticated upload post covers" on storage.objects;
create policy "Authenticated upload post covers" on storage.objects for insert to authenticated with check (bucket_id='post-covers');
drop policy if exists "Authenticated update post covers" on storage.objects;
create policy "Authenticated update post covers" on storage.objects for update to authenticated using (bucket_id='post-covers') with check (bucket_id='post-covers');
drop policy if exists "Authenticated delete post covers" on storage.objects;
create policy "Authenticated delete post covers" on storage.objects for delete to authenticated using (bucket_id='post-covers');
