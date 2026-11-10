# Zona Joven TV

Portal web inicial con diseño adaptable y rutas limpias.

## Rutas incluidas

- `/` — página principal
- `/noticias` — listado de noticias
- `/cultura`, `/comunidad`, `/educacion` — secciones
- `/categoria/actualidad` — página por categoría
- `/noticia/mi-titular` — página de una noticia por slug
- `/video/mi-video` — página de un video por slug
- `/videos` — listado de videos

Las rutas usan el historial del navegador y Vercel reescribe las direcciones a `index.html` mediante `vercel.json`.

## Archivos

- `index.html`: página principal y estructura.
- `styles.css`: diseño y estilos.
- `app.js`: navegación, páginas de sección y páginas de detalle.
- `vercel.json`: reglas de reescritura para rutas directas en Vercel.
- `supabase-schema.sql`: tabla inicial para publicaciones en Supabase.

## Publicar en Vercel

1. Sube el contenido de esta carpeta a GitHub.
2. Importa el repositorio en Vercel.
3. Framework preset: `Other`.
4. Build command: vacío; Output directory: `.`.
5. Despliega.

## Estado de la conexión con Supabase

Esta entrega incluye el esquema SQL inicial y rutas de demostración. **Supabase todavía no está conectado**, no hay panel administrativo ni persistencia real de publicaciones. Para activarlo hay que ejecutar `supabase-schema.sql` en el SQL Editor del proyecto Supabase y conectar el proyecto con su URL y clave pública `anon` (nunca incluir la `service_role` en el navegador). Después se reemplaza el contenido de demostración por consultas a `posts` y se construye el panel administrativo con autenticación.

## Importante sobre Facebook y WhatsApp

Esta versión actualiza el título y la descripción SEO al navegar en el navegador, pero es una aplicación estática del lado del cliente. Los robots de Facebook/WhatsApp normalmente necesitan recibir las etiquetas Open Graph ya presentes en el HTML inicial. Para garantizar que cada enlace compartido muestre automáticamente la foto y el titular de la noticia, hace falta una función de renderizado previo/servidor que consulte Supabase y genere las etiquetas Open Graph para cada slug. Esa etapa no está incluida todavía.

## Contenido

Las publicaciones de `app.js` son ejemplos de demostración, no noticias reales. Reemplázalas cuando se conecte el panel editorial.

## Panel administrativo y conexión real

La carpeta ahora incluye `admin.html` y `admin.js`. La ruta `/admin` permite iniciar sesión con Supabase Auth, crear/editar/eliminar publicaciones, guardar borradores, publicar, administrar categorías y subir portadas a Storage. Las publicaciones públicas se consultan desde Supabase en la página web cuando se configura el proyecto. Si las credenciales siguen como marcadores, el sitio conserva el contenido de demostración.

### Configuración obligatoria

1. En `supabase-config.js`, reemplaza `PEGA_AQUI_TU_PROJECT_URL` por la Project URL y `PEGA_AQUI_TU_CLAVE_PUBLICA_ANON` por la clave publishable/anon de Supabase. Son valores públicos de cliente; jamás pegues una clave `service_role`.
2. En Supabase > SQL Editor, ejecuta el archivo completo `supabase-schema.sql`.
3. En Supabase > Authentication > Providers, habilita Email. En Authentication > Settings, desactiva los registros públicos (Allow new users to sign up). Crea manualmente el usuario administrador desde Authentication > Users. Así solo las cuentas que tú crees podrán autenticarse.
4. En Authentication > URL Configuration, agrega el dominio de producción, por ejemplo `https://zonajoventv.com`, y la URL de redirección `https://zonajoventv.com/admin` (ajusta al dominio real).
5. Sube todos los archivos de esta carpeta al repositorio GitHub conectado a Vercel y despliega. La ruta `/admin` reescribe a `admin.html`.

### Seguridad y límites

Las políticas RLS limitan la lectura pública de publicaciones a `published`; las escrituras requieren una sesión autenticada. El bucket `post-covers` permite lectura pública de las imágenes y escritura solo a usuarios autenticados. **No habilites el registro público** con estas políticas: el panel está pensado para usuarios administradores creados manualmente. Para un equipo editorial con distintos permisos, conviene agregar roles y una tabla de perfiles antes de abrir cuentas a otros usuarios.

El editor incluido es un campo de texto multilínea, no un editor WYSIWYG avanzado. El contenido se muestra como texto con saltos de línea. Las vistas previas enriquecidas de Facebook/WhatsApp todavía requieren renderizado previo o una función de servidor que genere Open Graph por cada slug; cambiar metadatos con JavaScript no garantiza que los rastreadores sociales los lean.

### Categorías

Se pueden crear categorías desde el panel. La tabla y los slugs únicos están en Supabase; los enlaces públicos de sección que vienen en el diseño inicial siguen siendo `/cultura`, `/comunidad` y `/educacion`. Para categorías personalizadas, las URLs públicas pueden ampliarse en una siguiente iteración.
