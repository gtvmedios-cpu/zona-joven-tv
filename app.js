(() => {
  const path = decodeURI(window.location.pathname).replace(/\/+$/, '') || '/';
  const clean = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const categories = {
    noticias: {title:'Noticias', kicker:'AL DÍA', description:'Información y actualidad de nuestra comunidad.', category:null},
    cultura: {title:'Cultura', kicker:'EXPRESA · CREA · PARTICIPA', description:'Arte, música, talento y expresiones culturales de nuestra generación.', category:'Cultura'},
    comunidad: {title:'Comunidad', kicker:'SOMOS GENERACIÓN', description:'Historias, iniciativas y personas que transforman nuestro entorno.', category:'Comunidad'},
    educacion: {title:'Educación', kicker:'APRENDE · CRECE · AVANZA', description:'Ideas, oportunidades y herramientas para construir nuevos caminos.', category:'Educación'},
    videos: {title:'Videos', kicker:'MIRA Y COMPARTE', description:'Entrevistas, reportajes y contenidos audiovisuales de nuestra comunidad.', category:'Videos'}
  };
  const demoPosts = [
    {title:'Bienvenidos a Zona Joven TV',slug:'bienvenidos-a-zona-joven-tv',category:'Actualidad',description:'Muy pronto encontrarás aquí nuestras noticias y novedades.'},
    {title:'Creatividad que inspira',slug:'creatividad-que-inspira',category:'Cultura',description:'Un espacio para compartir el talento y las expresiones culturales.'},
    {title:'Ideas que transforman nuestro entorno',slug:'ideas-que-transforman-nuestro-entorno',category:'Comunidad',description:'Proyectos y personas que generan cambios positivos.'},
    {title:'Aprender, crecer y avanzar',slug:'aprender-crecer-y-avanzar',category:'Educación',description:'Ideas y oportunidades para construir nuevos caminos.'}
  ];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const articleCard = post => `<article class="news-card"><div class="mini-photo photo-blue">ZJTV</div><div class="news-card-body"><span class="tag tag-blue">${esc(post.category.toUpperCase())}</span><h3>${esc(post.title)}</h3><p>${esc(post.description)}</p><a class="read-link" href="/noticia/${encodeURIComponent(post.slug)}">Leer noticia →</a></div></article>`;
  const page = (title,kicker,description,body) => `<section class="section container route-page"><div class="section-heading"><div><span class="section-kicker">${esc(kicker)}</span><h1>${esc(title)}</h1><p>${esc(description)}</p></div></div>${body}</section>`;
  const main = document.querySelector('main');
  if (!main) return;

  let routeKey = path.split('/')[1] || 'inicio';
  let content = '';
  if (path === '/admin') {
    main.innerHTML = page('Panel administrativo','ZONA JOVEN TV','Administra las noticias y los contenidos de tu comunidad.', `
      <section class="admin-panel">
        <div class="admin-brand"><img src="https://cdn.phototourl.com/member/2026-11-10-232e563c-d33b-414d-9b3f-25ae06c97afe.png" alt="Zona Joven TV"><div><strong>ZONA JOVEN TV</strong><span>Centro de administración</span></div></div>
        <div class="admin-notice"><strong>Panel administrativo disponible</strong><p>Esta dirección ya está habilitada. Para activar el inicio de sesión, la creación de noticias, las categorías y la subida de imágenes, falta conectar las credenciales de tu proyecto Supabase.</p></div>
        <form class="admin-login" id="admin-login-form">
          <h2>Iniciar sesión</h2>
          <label for="admin-email">Correo electrónico</label><input id="admin-email" type="email" placeholder="tu correo de administrador" autocomplete="username" required>
          <label for="admin-password">Contraseña</label><input id="admin-password" type="password" placeholder="Tu contraseña" autocomplete="current-password" required>
          <button class="button button-blue" type="submit">Entrar al panel</button>
          <p id="admin-status" role="status">Pendiente de configurar Supabase.</p>
        </form>
        <a class="button button-light" href="/">← Volver al sitio</a>
      </section>`);
    const form = document.getElementById('admin-login-form');
    if (form) form.addEventListener('submit', e => { e.preventDefault(); const status=document.getElementById('admin-status'); status.textContent='El panel ya carga correctamente, pero el acceso aún no está conectado a Supabase. No ingreses aquí tu contraseña hasta completar esa configuración.'; });
  } else if (path === '/') {
    // La portada conserva el diseño editorial original.
  } else if (categories[routeKey] && path.split('/').length === 2) {
    const cfg = categories[routeKey];
    let posts = cfg.category ? demoPosts.filter(p => p.category === cfg.category) : demoPosts;
    content = page(cfg.title,cfg.kicker,cfg.description,
      `<div class="news-grid">${posts.length ? posts.map(articleCard).join('') : '<p>Próximamente publicaremos contenido en esta sección.</p>'}</div>`);
    main.innerHTML = content;
  } else if (routeKey === 'categoria' && path.split('/')[2]) {
    const slug = path.split('/')[2];
    const name = slug.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase());
    const posts = demoPosts.filter(p => clean(p.category) === slug);
    main.innerHTML = page(name,'CATEGORÍA',`Publicaciones clasificadas en ${name}.`,
      `<div class="news-grid">${posts.length ? posts.map(articleCard).join('') : '<p>Aún no hay publicaciones en esta categoría.</p>'}</div>`);
  } else if (routeKey === 'noticia' && path.split('/')[2]) {
    const slug = path.split('/')[2];
    const post = demoPosts.find(p => p.slug === slug);
    main.innerHTML = post
      ? page(post.title,post.category.toUpperCase(),post.description,`<article class="article-detail"><p>${esc(post.description)}</p><p>Esta es una publicación de muestra. Cuando se conecte el panel editorial, aquí aparecerá el contenido completo de la noticia, su fotografía y sus videos.</p><a class="button button-blue" href="/noticias">Volver a noticias</a></article>`)
      : page('Noticia no encontrada','404','La dirección puede ser incorrecta o la noticia todavía no está publicada.','<a class="button button-blue" href="/noticias">Ver noticias</a>');
  } else if (routeKey === 'video' && path.split('/')[2]) {
    const slug = path.split('/')[2];
    main.innerHTML = page('Video','ZONA JOVEN TV','Contenido audiovisual de nuestra comunidad.',`<p>El video solicitado (${esc(slug)}) todavía no está publicado.</p><a class="button button-blue" href="/videos">Volver a videos</a>`);
  } else {
    main.innerHTML = page('Página no encontrada','404','No encontramos la sección que estás buscando.','<a class="button button-blue" href="/">Volver al inicio</a>');
  }

  // Resalta la sección correspondiente y corrige enlaces del pie de página.
  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === path || (path === '/' && href === '/'));
  });
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '×' : '☰';
  });
})();