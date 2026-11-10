-- Ejecutar una sola vez en Supabase > SQL Editor.
-- Después crea el usuario desde Authentication > Users y registra su UUID en profiles:
-- insert into public.profiles (id, role) values ('UUID_DEL_USUARIO', 'admin');
create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin'))
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text default '',
  content text default '',
  cover_image text default '',
  category_id uuid references public.categories(id) on delete set null,
  post_type text not null default 'noticia' check (post_type in ('noticia','video')),
  status text not null default 'borrador' check (status in ('borrador','publicado')),
  author_id uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_idx on public.posts(status, published_at desc);
create index if not exists posts_category_idx on public.posts(category_id);
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;

drop policy if exists "Administrador consulta su perfil" on public.profiles;
create policy "Administrador consulta su perfil" on public.profiles for select to authenticated using (id = auth.uid() and role = 'admin');
drop policy if exists "Categorías visibles públicamente" on public.categories;
create policy "Categorías visibles públicamente" on public.categories for select using (true);
drop policy if exists "Posts publicados visibles" on public.posts;
create policy "Posts publicados visibles" on public.posts for select using (status = 'publicado');
drop policy if exists "Administradores gestionan categorías" on public.categories;
create policy "Administradores gestionan categorías" on public.categories for all to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Administradores gestionan posts" on public.posts;
create policy "Administradores gestionan posts" on public.posts for all to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

insert into storage.buckets (id, name, public)
values ('zjtv-portadas', 'zjtv-portadas', true)
on conflict (id) do nothing;
drop policy if exists "Portadas públicas visibles" on storage.objects;
create policy "Portadas públicas visibles" on storage.objects for select using (bucket_id = 'zjtv-portadas');
drop policy if exists "Usuarios autenticados suben portadas" on storage.objects;
create policy "Usuarios autenticados suben portadas" on storage.objects for insert to authenticated with check (bucket_id = 'zjtv-portadas' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Usuarios autenticados actualizan portadas" on storage.objects;
create policy "Usuarios autenticados actualizan portadas" on storage.objects for update to authenticated using (bucket_id = 'zjtv-portadas' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (bucket_id = 'zjtv-portadas' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Usuarios autenticados eliminan portadas" on storage.objects;
create policy "Usuarios autenticados eliminan portadas" on storage.objects for delete to authenticated using (bucket_id = 'zjtv-portadas' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
