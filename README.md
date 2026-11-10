# Zona Joven TV

Portal juvenil responsive con páginas independientes, slugs para noticias y videos, panel `/admin` y conexión a Supabase.

## Rutas
- `/` inicio
- `/noticias`, `/cultura`, `/comunidad`, `/educacion`, `/videos`
- `/categoria/slug-de-categoria`
- `/noticia/slug-de-la-noticia`
- `/video/slug-del-video`
- `/admin` panel privado (Supabase Auth)

Vercel usa `vercel.json` para resolver las rutas limpias. Las páginas de detalle y categorías consultan Supabase desde el navegador.

## Activar Supabase
1. En Supabase abre Project Settings > API y copia Project URL y la clave pública `anon`/`publishable`.
2. Completa `supabase-config.js`. No uses `service_role` ni claves secretas en el navegador.
3. Ejecuta `supabase-schema.sql` en SQL Editor.
4. En Authentication > Users crea el usuario administrador (desactiva el registro público si no lo necesitas).
5. Copia el UUID del usuario y ejecuta: `insert into public.profiles (id, role) values ('UUID_DEL_USUARIO', 'admin');`
6. Despliega el proyecto en Vercel. Entra a `/admin` para iniciar sesión.

## Publicación
Sube todos los archivos a la raíz del repositorio GitHub conectado a Vercel. Vercel debe usar framework Other, sin build command y con output directory `.`.

## Importante
El panel `/admin` está implementado, pero no podrá iniciar sesión ni guardar noticias hasta completar la configuración de Supabase y crear el perfil administrador. Las páginas usan renderizado en navegador; para que Facebook/WhatsApp lean metadatos distintos por noticia se requiere prerenderizado o una función de servidor/edge adicional. Sitemap actual incluye las páginas principales; agregar slugs publicados dinámicamente requiere generar el sitemap desde Supabase en servidor.
