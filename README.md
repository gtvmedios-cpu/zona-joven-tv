# Zona Joven TV — rutas independientes

## Corrección del error 404 en Vercel
Se agregó `vercel.json` con una regla de reescritura para que las rutas amigables (`/noticias`, `/cultura`, `/noticia/slug`, etc.) carguen la aplicación y no devuelvan el 404 de Vercel.

## Rutas incluidas
- `/`
- `/noticias`
- `/cultura`
- `/comunidad`
- `/educacion`
- `/videos`
- `/categoria/slug`
- `/noticia/slug`
- `/video/slug`

Las páginas de noticia y video muestran contenido de demostración mientras no esté conectado el backend editorial. Los slugs reales deberán venir de Supabase cuando se integre.

## Publicar
1. Descomprime el ZIP.
2. Sube **el contenido de la carpeta `zona-joven-tv-main`** a la raíz del repositorio GitHub (donde está `index.html`).
3. Confirma que `vercel.json`, `index.html`, `app.js` y `styles.css` queden en esa misma raíz.
4. Haz commit/push y espera el nuevo deployment en Vercel.
5. Prueba `/noticias`, `/cultura` y `/comunidad`.

## Nota sobre administración
El ZIP base recibido no contenía panel administrativo ni conexión funcional a Supabase. Esta corrección resuelve las rutas del menú; no afirma que el panel de administración ya esté implementado.
