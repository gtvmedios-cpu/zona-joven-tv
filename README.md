# Zona Joven TV — versión actualizada

## Incluye
- Sitio adaptable con logo oficial.
- Noticias con slug y página individual.
- Metadatos Open Graph servidos desde `/api/noticia.js` para compartir noticias.
- Panel `/admin` con autenticación Supabase y gestión de publicaciones.
- Sección `/videos`: lista de videos publicados y páginas `/video/slug`.
- Sección `/programas`: catálogo y páginas `/programa/slug` con episodios.
- En el panel se pueden crear programas, subir videos MP4/WebM/OGG a Supabase Storage o pegar enlaces de YouTube/Vimeo, añadir portadas y guardar borradores/publicar.
- Rutas absolutas para CSS, JavaScript y manifest.

## Publicación en Vercel
1. Sube el contenido de esta carpeta (no la carpeta exterior) a la raíz del repositorio conectado a Vercel.
2. Verifica que el proyecto use Node.js compatible con las funciones serverless de Vercel.
3. Ejecuta primero `SUPABASE_SETUP.sql` si todavía no has configurado tablas, categorías y permisos.
4. Ejecuta `VIDEOS_PROGRAMAS_SETUP.sql` en Supabase SQL Editor para crear las tablas, políticas RLS y bucket `zjtv-media`.
5. Comprueba que el usuario administrador ya esté registrado en `public.admin_users`.
6. Despliega en Vercel y prueba `/admin`, `/videos` y `/programas`.

## Subida de videos
- El archivo se guarda en el bucket público `zjtv-media`; el enlace público queda guardado en `videos.video_url`.
- La implementación del panel limita el archivo a 100 MB. El límite real de Supabase puede depender del plan y de la configuración del proyecto; para videos grandes se recomienda YouTube/Vimeo.
- Los enlaces de YouTube y Vimeo se convierten en reproductores incrustados.

## Seguridad
La clave publishable de Supabase puede estar en el navegador. La seguridad depende de las políticas RLS y del registro del administrador. Nunca publiques una clave `service_role`.
