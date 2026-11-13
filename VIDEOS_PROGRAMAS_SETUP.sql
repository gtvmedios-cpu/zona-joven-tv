
-- MIGRACIÓN DE VIDEOS Y PROGRAMAS PARA ZONA JOVEN TV
-- Ejecutar en Supabase > SQL Editor con el usuario propietario.

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text default '',
  cover_image text,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text default '',
  video_url text not null,
  cover_image text,
  program_id uuid references public.programs(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published')),
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.programs enable row level security;
alter table public.videos enable row level security;

drop policy if exists "public read published programs" on public.programs;
create policy "public read published programs" on public.programs
 for select to anon, authenticated using (status='published' or public.is_zjtv_admin());

drop policy if exists "admins manage programs" on public.programs;
create policy "admins manage programs" on public.programs
 for all to authenticated using (public.is_zjtv_admin()) with check (public.is_zjtv_admin());

drop policy if exists "public read published videos" on public.videos;
create policy "public read published videos" on public.videos
 for select to anon, authenticated using (status='published' or public.is_zjtv_admin());

drop policy if exists "admins manage videos" on public.videos;
create policy "admins manage videos" on public.videos
 for all to authenticated using (public.is_zjtv_admin()) with check (public.is_zjtv_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('zjtv-media','zjtv-media',true,104857600,array['video/mp4','video/webm','video/ogg','image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true;

drop policy if exists "public view zjtv media" on storage.objects;
create policy "public view zjtv media" on storage.objects
 for select using (bucket_id='zjtv-media');

drop policy if exists "admins upload zjtv media" on storage.objects;
create policy "admins upload zjtv media" on storage.objects
 for insert to authenticated with check (bucket_id='zjtv-media' and public.is_zjtv_admin());

drop policy if exists "admins update zjtv media" on storage.objects;
create policy "admins update zjtv media" on storage.objects
 for update to authenticated using (bucket_id='zjtv-media' and public.is_zjtv_admin())
 with check (bucket_id='zjtv-media' and public.is_zjtv_admin());

drop policy if exists "admins delete zjtv media" on storage.objects;
create policy "admins delete zjtv media" on storage.objects
 for delete to authenticated using (bucket_id='zjtv-media' and public.is_zjtv_admin());
