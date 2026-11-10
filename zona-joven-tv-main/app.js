/* Zona Joven TV: rutas limpias y páginas por slug.
   La versión incluida funciona con contenido de demostración. La conexión real
   a Supabase se activa al configurar las variables indicadas en README.md. */
let DEMO_POSTS = [
  {title:'Las historias de nuestra generación empiezan aquí',slug:'las-historias-de-nuestra-generacion-empiezan-aqui',category:'Actualidad',type:'noticia',excerpt:'Noticias, ideas y experiencias que conectan con lo que pasa en nuestra comunidad.',body:'Zona Joven TV es un espacio para contar las historias de nuestra generación. Aquí encontrarás información, cultura, comunidad, educación y contenidos audiovisuales.',image:'',date:'2026-11-10'},
  {title:'Creatividad que inspira',slug:'creatividad-que-inspira',category:'Cultura',type:'noticia',excerpt:'Un espacio para compartir el talento y las expresiones culturales.',body:'La cultura reúne las expresiones, talentos e iniciativas que dan identidad a nuestras comunidades. En Zona Joven TV queremos visibilizar esas historias.',image:'',date:'2026-11-10'},
  {title:'Aprender, crecer y avanzar',slug:'aprender-crecer-y-avanzar',category:'Educación',type:'noticia',excerpt:'Ideas y oportunidades para construir nuevos caminos.',body:'La educación abre oportunidades y fortalece el futuro. Compartiremos iniciativas, experiencias y recursos para aprender y crecer.',image:'',date:'2026-11-10'},
  {title:'Ideas que transforman nuestro entorno',slug:'ideas-que-transforman-nuestro-entorno',category:'Comunidad',type:'noticia',excerpt:'Proyectos y personas que generan cambios positivos.',body:'Las buenas ideas crecen cuando se comparten. Conoce proyectos y personas que trabajan por el bienestar de su comunidad.',image:'',date:'2026-11-10'}
];
const CATEGORIES = ['Actualidad','Cultura','Comunidad','Educación'];
const routeLabels = {'/':'Inicio','/noticias':'Noticias','/cultura':'Cultura','/comunidad':'Comunidad','/educacion':'Educación','/videos':'Videos'};
const slugify = value => String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path = () => decodeURI(location.pathname).replace(/\/+$/,'') || '/';
function setMeta(title,description,image=''){
  document.title = `${title} | Zona Joven TV`;
  const set=(key,val,attr='name')=>{let el=document.querySelector(`meta[${attr}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.appendChild(el)}el.content=val};
  set('description',description);set('og:title',title,'property');set('og:description',description,'property');set('og:type','article','property');set('og:url',location.href,'property');
  if(image)set('og:image',image,'property');
  set('twitter:card',image?'summary_large_image':'summary');set('twitter:title',title);set('twitter:description',description);
}
function card(post){return `<article class="news-card"><div class="mini-photo ${post.category==='Cultura'?'photo-green':post.category==='Educación'?'photo-yellow':'photo-blue'}">${post.image?`<img src="${esc(post.image)}" alt="${esc(post.title)}" style="width:100%;height:100%;object-fit:cover">`:'ZJTV'}</div><div class="news-card-body"><span class="tag tag-blue">${esc(post.category.toUpperCase())}</span><h3>${esc(post.title)}</h3><p>${esc(post.excerpt)}</p><a class="read-link" href="/${post.type}/${post.slug}">Leer más →</a></div></article>`}
function shell(content){return `<div class="container route-page"><a class="text-link" href="/">← Volver al inicio</a>${content}</div>`}
async function loadPublishedPosts(){
 try {
  const configured=window.ZJTV_SUPABASE_URL&&window.ZJTV_SUPABASE_ANON_KEY&&!window.ZJTV_SUPABASE_URL.includes('PEGA_AQUI')&&!window.ZJTV_SUPABASE_ANON_KEY.includes('PEGA_AQUI');
  if(!configured||!window.supabase)return;
  const client=window.supabase.createClient(window.ZJTV_SUPABASE_URL,window.ZJTV_SUPABASE_ANON_KEY);
  const {data,error}=await client.from('posts').select('title,slug,excerpt,content,cover_image,type,status,published_at,categories(name,slug)').eq('status','published').order('published_at',{ascending:false});
  if(error)throw error;
  DEMO_POSTS=(data||[]).map(p=>({title:p.title,slug:p.slug,excerpt:p.excerpt||'',body:p.content||'',image:p.cover_image||'',type:p.type,category:p.categories?.name||'Actualidad',date:p.published_at?new Date(p.published_at).toLocaleDateString('es-CO'):''}));
  const grid=document.getElementById('news-grid');if(grid)grid.innerHTML=DEMO_POSTS.map(card).join('')||'<p>Próximamente encontrarás aquí nuestras publicaciones.</p>';
  const featured=document.getElementById('featured-grid');if(featured&&DEMO_POSTS.length)featured.innerHTML=DEMO_POSTS.slice(0,3).map(card).join('');
  render();
 }catch(err){console.warn('No fue posible consultar las publicaciones de Supabase:',err.message)}
}
function render(){
 const p=path(); const main=document.querySelector('main'); if(!main)return;
 // Preserve the original landing page at root.
 if(p==='/'){main.style.display='';setMeta('Tu espacio, tu generación','Noticias, cultura, comunidad, educación y actualidad con voz joven.');return}
 main.style.display='none';
 let routeContent='',title='Zona Joven TV',desc='Noticias, cultura, comunidad y actualidad.';
 const detail=p.match(/^\/(noticia|video)\/([^/]+)$/);
 if(detail){
   const post=DEMO_POSTS.find(x=>x.slug===detail[2] && x.type===detail[1]) || {title:detail[2].split('-').map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(' '),slug:detail[2],category:detail[1]==='video'?'Videos':'Actualidad',type:detail[1],excerpt:'Contenido de Zona Joven TV.',body:'Esta publicación está preparada para ser administrada desde el panel editorial cuando se conecte Supabase.'};
   title=post.title;desc=post.excerpt;
   routeContent=`<article class="article-page"><span class="section-kicker">${esc(post.category)}</span><h1>${esc(post.title)}</h1><p class="article-date">Zona Joven TV · ${esc(post.date||'')}</p>${post.image?`<img class="article-cover" src="${esc(post.image)}" alt="${esc(post.title)}">`:`<div class="article-cover placeholder-photo photo-blue"><span class="photo-symbol">ZJTV</span></div>`}<p class="article-lead">${esc(post.excerpt)}</p><div class="article-body"><p>${esc(post.body).replace(/\n/g,'</p><p>')}</p></div><div class="article-share"><strong>Comparte esta publicación</strong><button class="button button-blue" id="share-link">Copiar enlace</button></div></article>`;
 } else if(p==='/videos'){
   title='Videos';routeContent=`<span class="section-kicker">MIRA Y COMPARTE</span><h1>Videos</h1><p>Entrevistas, reportajes y contenidos especiales.</p><div class="news-grid">${DEMO_POSTS.filter(x=>x.type==='video').map(card).join('')||'<p>Próximamente encontrarás aquí nuestros videos.</p>'}</div>`;
 } else {
   const categorySlug=p.match(/^\/categoria\/([^/]+)$/);
   const requestedCategory=categorySlug?categorySlug[1]:p.slice(1);
   const category=p==='/noticias'?'':requestedCategory==='actualidad'?'Actualidad':requestedCategory==='cultura'?'Cultura':requestedCategory==='comunidad'?'Comunidad':requestedCategory==='educacion'?'Educación':null;
   if(category!==null){
     title=category||'Noticias';const items=category?DEMO_POSTS.filter(x=>x.category===category):DEMO_POSTS;
     routeContent=`<span class="section-kicker">ZONA JOVEN TV</span><h1>${esc(title)}</h1><p class="route-intro">Información, historias e iniciativas de nuestra generación.</p><div class="filter-row">${CATEGORIES.map(c=>`<a class="filter-chip ${c===category?'selected':''}" href="/${slugify(c)}">${c}</a>`).join('')}<a class="filter-chip ${!category?'selected':''}" href="/noticias">Todas</a></div><div class="news-grid">${items.map(card).join('')||'<p>Aún no hay publicaciones en esta sección.</p>'}</div>`;
   } else {title='Página no encontrada';routeContent='<h1>Esta página no está disponible</h1><p>Revisa la dirección o vuelve al inicio.</p><a class="button button-blue" href="/">Ir al inicio</a>'}
 }
 setMeta(title,desc);
 let view=document.getElementById('route-view');if(!view){view=document.createElement('div');view.id='route-view';main.parentNode.insertBefore(view,main.nextSibling)}
 view.innerHTML=shell(routeContent);
 const share=document.getElementById('share-link');if(share)share.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);share.textContent='¡Enlace copiado!'}catch(e){share.textContent=location.href}});
 window.scrollTo(0,0);
}
function navigate(url){history.pushState({},'',url);render()}
document.addEventListener('DOMContentLoaded',()=>{
 const menuToggle=document.getElementById('menu-toggle'),nav=document.getElementById('main-nav');
 if(menuToggle&&nav){menuToggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.textContent=open?'×':'☰'});}
 document.body.addEventListener('click',e=>{const a=e.target.closest('a[href^="/"]');if(!a||a.origin!==location.origin||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();navigate(a.getAttribute('href'));if(nav)nav.classList.remove('open')});
 const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
 render();
 loadPublishedPosts();
});
window.addEventListener('popstate',render);
