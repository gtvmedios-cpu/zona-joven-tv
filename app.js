(() => {
  const SUPABASE_URL = 'https://cyekgljjacpbutiwcehk.supabase.co';
  const SUPABASE_KEY = 'sb_publishable__whKicW16irtizYTEQ9xhQ_Fni8q0H2';
  const sb = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY);
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
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const page = (title,kicker,description,body) => `<section class="section container route-page"><div class="section-heading"><div><span class="section-kicker">${esc(kicker)}</span><h1>${esc(title)}</h1><p>${esc(description)}</p></div></div>${body}</section>`;
  const articleCard = post => `<article class="news-card"><div class="mini-photo photo-blue" ${post.cover_image ? `style="background-image:url('${esc(post.cover_image)}');background-size:cover;background-position:center"` : ''}>${post.cover_image?'': 'ZJTV'}</div><div class="news-card-body"><span class="tag tag-blue">${esc((post.category_name || post.category || 'Actualidad').toUpperCase())}</span><h3>${esc(post.title)}</h3><p>${esc(post.excerpt || post.description || '')}</p><a class="read-link" href="/noticia/${encodeURIComponent(post.slug)}">Leer más →</a></div></article>`;
  const main = document.querySelector('main');
  if (!main) return;

  async function getPublishedPosts(){
    if(!sb) return demoPosts;
    const {data,error}=await sb.from('posts').select('id,title,slug,excerpt,content,cover_image,status,published_at,categories(name)').eq('status','published').order('published_at',{ascending:false});
    if(error) return demoPosts;
    return (data||[]).map(p=>({...p,category_name:p.categories?.name||'Actualidad',description:p.excerpt}));
  }

  async function renderArticle(rawSlug){
    const slug = decodeURIComponent(rawSlug || '').trim();
    let post = null;
    if (sb) {
      const result = await sb.from('posts')
        .select('id,title,slug,excerpt,content,cover_image,published_at,status,category_id,categories(name)')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (!result.error) post = result.data;
      else console.error('No se pudo cargar la noticia:', result.error.message);
    }
    if (!post) {
      const demo = demoPosts.find(item => item.slug === slug);
      if (demo) post = {...demo, content: demo.description, status: 'published'};
    }
    if (!post) {
      main.innerHTML = page('Noticia no encontrada','404','No encontramos una noticia publicada con esta dirección.','<a class="button button-blue" href="/noticias">Volver a noticias</a>');
      document.title = 'Noticia no encontrada | Zona Joven TV';
      return;
    }
    const categoryName = post.categories?.name || post.category_name || post.category || 'Noticias';
    const image = post.cover_image
      ? `<img class="article-cover" src="${esc(post.cover_image)}" alt="${esc(post.title)}" loading="eager">`
      : '';
    const date = post.published_at
      ? new Date(post.published_at).toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'})
      : '';
    const content = esc(post.content || post.description || post.excerpt || 'Esta noticia no tiene contenido adicional.').replace(/\r?\n/g,'<br>');
    main.innerHTML = page(post.title, categoryName.toUpperCase(), post.excerpt || '', `
      <article class="article-detail">
        ${image}
        ${date ? `<p class="article-date">${esc(date)}</p>` : ''}
        <div class="article-content">${content}</div>
        <div class="article-footer"><a class="button button-blue" href="/noticias">← Volver a noticias</a></div>
      </article>`);
    document.title = `${post.title} | Zona Joven TV`;
    const description = post.excerpt || post.title;
    let meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', `${location.origin}/noticia/${encodeURIComponent(post.slug)}`);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', post.title);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description);
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && post.cover_image) ogImage.setAttribute('content', post.cover_image);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', `${location.origin}/noticia/${encodeURIComponent(post.slug)}`);
  }

  async function renderAdmin(){
    main.innerHTML=page('Panel administrativo','ZONA JOVEN TV','Administra las noticias y los contenidos de tu comunidad.',`<section class="admin-panel"><div class="admin-brand"><img src="https://cdn.phototourl.com/member/2026-11-10-232e563c-d33b-414d-9b3f-25ae06c97afe.png" alt="Zona Joven TV"><div><strong>ZONA JOVEN TV</strong><span>Centro de administración</span></div></div><div id="admin-app"><p>Comprobando conexión segura…</p></div><a class="button button-light" href="/">← Volver al sitio</a></section>`);
    const box=document.getElementById('admin-app');
    if(!sb){box.innerHTML='<p class="admin-error">No se pudo cargar el servicio de autenticación. Recarga la página.</p>';return;}
    const {data:{session}}=await sb.auth.getSession();
    if(session){await showDashboard(session);return;}
    showLogin();
    function showLogin(){
      box.innerHTML=`<form class="admin-login" id="admin-login-form"><h2>Iniciar sesión</h2><label for="admin-email">Correo electrónico</label><input id="admin-email" type="email" placeholder="tu correo de administrador" autocomplete="username" required><label for="admin-password">Contraseña</label><input id="admin-password" type="password" placeholder="Tu contraseña" autocomplete="current-password" required><button class="button button-blue" type="submit">Entrar al panel</button><p id="admin-status" role="status">Acceso protegido mediante Supabase.</p></form>`;
      document.getElementById('admin-login-form').addEventListener('submit',async e=>{e.preventDefault();const btn=e.currentTarget.querySelector('button');const status=document.getElementById('admin-status');btn.disabled=true;btn.textContent='Verificando…';status.textContent='';
        const {data,error}=await sb.auth.signInWithPassword({email:document.getElementById('admin-email').value.trim(),password:document.getElementById('admin-password').value});
        btn.disabled=false;btn.textContent='Entrar al panel';
        if(error){status.textContent='No fue posible iniciar sesión: '+error.message;return;}
        await showDashboard(data.session);
      });
    }
    async function showDashboard(session){
      const {data:admin,error:adminErr}=await sb.from('admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
      if(adminErr || !admin){await sb.auth.signOut();box.innerHTML=`<div class="admin-error"><strong>Tu cuenta inició sesión, pero todavía no tiene permisos de administrador.</strong><p>Debes registrar el UID de este usuario en la tabla admin_users de Supabase. Consulta el archivo SUPABASE_SETUP.sql y el README.</p><p>UID: <code>${esc(session.user.id)}</code></p><button class="button button-light" id="admin-logout">Cerrar sesión</button></div>`;document.getElementById('admin-logout').onclick=()=>showLogin();return;}
      const {data:cats}=await sb.from('categories').select('id,name').order('name');
      box.innerHTML=`<div class="admin-dashboard"><div class="admin-toolbar"><div><h2>Hola, ${esc(session.user.email)}</h2><p>Gestiona las publicaciones de Zona Joven TV.</p></div><button class="button button-light" id="admin-logout">Cerrar sesión</button></div><form id="post-form" class="admin-editor"><h2 id="editor-title">Crear publicación</h2><input type="hidden" id="post-id"><label>Titular</label><input id="post-title" required maxlength="180" placeholder="Título de la noticia"><label>Slug (dirección web)</label><input id="post-slug" required placeholder="titulo-de-la-noticia"><label>Categoría</label><select id="post-category" required>${(cats||[]).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select><label>Resumen</label><textarea id="post-excerpt" rows="3" placeholder="Breve descripción"></textarea><label>Contenido</label><textarea id="post-content" rows="9" placeholder="Escribe el contenido de la noticia"></textarea><label>Fotografía de portada</label><input id="post-image" type="file" accept="image/*"><label>Estado</label><select id="post-status"><option value="draft">Borrador</option><option value="published">Publicada</option></select><div class="admin-actions"><button class="button button-blue" type="submit">Guardar publicación</button><button class="button button-light" type="button" id="post-reset">Limpiar</button></div><p id="post-status-message" role="status"></p></form><div class="admin-list"><h2>Publicaciones</h2><div id="admin-posts">Cargando publicaciones…</div></div></div>`;
      document.getElementById('admin-logout').onclick=async()=>{await sb.auth.signOut();showLogin();};
      const title=document.getElementById('post-title'),slug=document.getElementById('post-slug');title.addEventListener('input',()=>{if(!document.getElementById('post-id').value)slug.value=clean(title.value);});
      document.getElementById('post-reset').onclick=resetForm;
      document.getElementById('post-form').addEventListener('submit',savePost);
      await loadAdminPosts();
      function resetForm(){document.getElementById('post-form').reset();document.getElementById('post-id').value='';document.getElementById('editor-title').textContent='Crear publicación';}
      async function savePost(e){e.preventDefault();const msg=document.getElementById('post-status-message');msg.textContent='Guardando…';const id=document.getElementById('post-id').value;let cover_image=null;const file=document.getElementById('post-image').files[0];
        if(file){const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');const path=`${session.user.id}/${Date.now()}.${ext}`;const up=await sb.storage.from('post-covers').upload(path,file,{upsert:true,contentType:file.type});if(up.error){msg.textContent='Error al subir imagen: '+up.error.message;return;}cover_image=sb.storage.from('post-covers').getPublicUrl(path).data.publicUrl;}
        const payload={title:title.value.trim(),slug:clean(slug.value),category_id:document.getElementById('post-category').value,excerpt:document.getElementById('post-excerpt').value.trim(),content:document.getElementById('post-content').value,status:document.getElementById('post-status').value,author_id:session.user.id,updated_at:new Date().toISOString()};if(cover_image)payload.cover_image=cover_image;if(payload.status==='published')payload.published_at=new Date().toISOString();
        const result=id?await sb.from('posts').update(payload).eq('id',id):await sb.from('posts').insert(payload);if(result.error){msg.textContent='No se pudo guardar: '+result.error.message;return;}msg.textContent='Publicación guardada correctamente.';resetForm();await loadAdminPosts();
      }
      async function loadAdminPosts(){const target=document.getElementById('admin-posts');const {data,error}=await sb.from('posts').select('id,title,slug,status,published_at,categories(name)').order('created_at',{ascending:false});if(error){target.textContent='Error al cargar: '+error.message;return;}if(!data?.length){target.innerHTML='<p>Aún no hay publicaciones.</p>';return;}target.innerHTML=data.map(p=>`<div class="admin-post-row"><div><strong>${esc(p.title)}</strong><small>/${p.status==='published'?'noticia':'borrador'}/${esc(p.slug)} · ${esc(p.categories?.name||'Sin categoría')} · ${p.status==='published'?'Publicada':'Borrador'}</small></div><div class="admin-row-actions"><button type="button" data-edit="${p.id}">Editar</button><button type="button" data-delete="${p.id}">Eliminar</button></div></div>`).join('');target.querySelectorAll('[data-edit]').forEach(b=>b.onclick=async()=>{const {data:p}=await sb.from('posts').select('*').eq('id',b.dataset.edit).single();if(!p)return;document.getElementById('post-id').value=p.id;title.value=p.title;slug.value=p.slug;document.getElementById('post-category').value=p.category_id;document.getElementById('post-excerpt').value=p.excerpt||'';document.getElementById('post-content').value=p.content||'';document.getElementById('post-status').value=p.status;document.getElementById('editor-title').textContent='Editar publicación';window.scrollTo({top:document.querySelector('.admin-editor').offsetTop-30,behavior:'smooth'});});target.querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('¿Eliminar esta publicación?'))return;const {error}=await sb.from('posts').delete().eq('id',b.dataset.delete);if(error)alert('No se pudo eliminar: '+error.message);else await loadAdminPosts();});}
    }
  }

  (async()=>{
    let routeKey=path.split('/')[1]||'inicio';
    if(path==='/admin'){await renderAdmin();}
    else if(path==='/'){
      const posts=await getPublishedPosts();
      const grid=document.getElementById('news-grid');if(grid && posts.length){grid.innerHTML=posts.slice(0,9).map(articleCard).join('');}
      const featured=document.getElementById('featured-grid');if(featured && posts.length){featured.innerHTML=posts.slice(0,3).map(articleCard).join('');}
    }
    else if(categories[routeKey] && path.split('/').length===2){
      const cfg=categories[routeKey];let posts=await getPublishedPosts();if(cfg.category)posts=posts.filter(p=>(p.category_name||p.category)===cfg.category);const body=`<div class="news-grid">${posts.length?posts.map(articleCard).join(''):'<p>Próximamente publicaremos contenido en esta sección.</p>'}</div>`;main.innerHTML=page(cfg.title,cfg.kicker,cfg.description,body);
    }
    else if(routeKey==='categoria' && path.split('/')[2]){const slug=path.split('/')[2];const name=slug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());let posts=await getPublishedPosts();posts=posts.filter(p=>clean(p.category_name||p.category)===slug);main.innerHTML=page(name,'CATEGORÍA',`Publicaciones clasificadas en ${name}.`,`<div class="news-grid">${posts.length?posts.map(articleCard).join(''):'<p>Aún no hay publicaciones en esta categoría.</p>'}</div>`);}
    else if(routeKey==='noticia' && path.split('/')[2]){await renderArticle(path.split('/')[2]);}
    else if(routeKey==='video'&&path.split('/')[2]){main.innerHTML=page('Video','ZONA JOVEN TV','Contenido audiovisual de nuestra comunidad.',`<p>El video solicitado todavía no está publicado.</p><a class="button button-blue" href="/videos">Volver a videos</a>`);}
    else{main.innerHTML=page('Página no encontrada','404','No encontramos la sección que estás buscando.','<a class="button button-blue" href="/">Volver al inicio</a>');}
    document.querySelectorAll('.main-nav a').forEach(a=>{const href=a.getAttribute('href');a.classList.toggle('active',href===path||(path==='/'&&href==='/'));});const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();const toggle=document.getElementById('menu-toggle'),nav=document.getElementById('main-nav');if(toggle&&nav)toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'×':'☰';});
  })();
})();
