# Zona Joven TV — conexión de administración con Supabase

## Configuración
1. Publica el contenido de esta carpeta en la raíz del proyecto conectado a Vercel.
2. En Supabase > SQL Editor ejecuta el archivo `SUPABASE_SETUP.sql`.
3. En Supabase > Authentication > Users, crea el usuario con el correo y contraseña que usarás para entrar en `/admin` (o conserva el usuario que ya tengas).
4. Copia el UUID del usuario y ejecuta en SQL Editor: `insert into public.admin_users(user_id) values ('UUID-DEL-USUARIO');`.
5. Abre `https://zona-joven-tv.vercel.app/admin` e inicia sesión con ese correo y contraseña.

La URL y la clave pública publishable del proyecto están configuradas en `app.js`. La clave publishable puede estar en el navegador; la seguridad depende de RLS y de la tabla `admin_users`. Nunca publiques la clave `service_role`.

## Funciones
- Inicio de sesión real con Supabase Auth.
- Verificación adicional de pertenencia a `admin_users`.
- Crear, editar, publicar, guardar borradores y eliminar noticias.
- Slug generado desde el titular y normalizado.
- Categorías iniciales y selector de categoría.
- Subida de portada a Supabase Storage (`post-covers`).
- Lectura pública solo de noticias publicadas.
- Detalle de noticias por `/noticia/slug`.

## Nota importante
No basta con copiar el ZIP: hay que ejecutar el SQL y dar de alta el UUID del administrador. Sin esos pasos la autenticación puede funcionar, pero el panel denegará permisos editoriales. La clave del proyecto es pública (publishable); no contiene ni sustituye una contraseña de usuario.
