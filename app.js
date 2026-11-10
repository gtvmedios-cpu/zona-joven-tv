document.addEventListener('DOMContentLoaded', async () => {
  const menuToggle=document.getElementById('menu-toggle'),nav=document.getElementById('main-nav');
  if(menuToggle&&nav){menuToggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.textContent=open?'×':'☰';});}
  const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
  const path=decodeURIComponent(location.pathname).replace(/\/$/,'')||'/';
  if(path==='/'||path==='/index.html')return;
  const main=document.querySelector('main');if(!main)return;
  const logo='https://cdn.phototourl.com/member/2026-11-10-232e563c-d33b-414d-9b3f-25ae06c97afe.png';
  const cfg=window.ZJTV_SUPABASE_URL&&window.ZJTV_SUPABASE_ANON_KEY&&window.supabase;
  const db=cfg?window.supabase.createClient(window.ZJTV_SUPABASE_URL,window.ZJTV_SUPABASE_ANON_KEY):null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const shell=(title,sub,body)=>{document.title=`${title} | Zona Joven TV`;const desc=document.querySelector('meta[name="description"]');if(desc)desc.content=sub;const canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href=location.origin+location.pathname;main.innerHTML=`<section class="section container route-page"><div class="section-heading"><div><span class="section-kicker">ZONA JOVEN TV</span><h2>${esc(title)}</h2><p>${esc(sub)}</p></div><a class="button button-blue" href="/">← Inicio</a></div>${body}</section>`;};
  const unavailable=()=>'<div class="admin-msg">El contenido se mostrará aquí cuando conectes el proyecto Supabase en <b>supabase-config.js</b> y publiques noticias desde el panel administrativo.</div>';
  const cards=posts=>posts.length?`<div class="news-grid">${posts.map(p=>`<article class="news-card"><a href="/${p.post_type==='video'?'video':'noticia'}/${encodeURIComponent(p.slug)}" style="color:inherit;text-decoration:none">${p.cover_image?`<img class="mini-photo" style="width:100%;object-fit:cover" src="${esc(p.cover_image)}" alt="${esc(p.title)}">`:'<div class="mini-photo photo-blue">ZJTV</div>'}<div class="news-card-body"><span class="tag tag-blue">${esc(p.categories?.name||'ZONA JOVEN')}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt||'')}</p><span class="date-label">${p.published_at?new Date(p.published_at).toLocaleDateString('es-CO'):''}</span></div></a></article>`).join('')}</div>`:unavailable();
  async function getPosts(query){if(!db)return null;let q=db.from('posts').select('*,categories(name)').eq('status','publicado').order('published_at',{ascending:false});if(query?.category)q=q.eq('category_id',query.category);if(query?.type)q=q.eq('post_type',query.type);if(query?.slug)q=q.eq('slug',query.slug).single();const {data,error}=await q;return error?null:data;}
  const parts=path.split('/').filter(Boolean);
  if(path==='/noticias'||path==='/cultura'||path==='/comunidad'||path==='/educacion'||path==='/videos'||path.startsWith('/categoria/')){
    const label=parts[0]==='noticias'?'Noticias':parts[0]==='videos'?'Videos':parts[0]==='categoria'?(parts[1]||'Categoría').replace(/-/g,' '):parts[0].charAt(0).toUpperCase()+parts[0].slice(1);
    let posts=null;if(db){if(parts[0]==='videos')posts=await getPosts({type:'video'});else if(parts[0]==='categoria'){const {data:cat}=await db.from('categories').select('id').eq('slug',parts[1]).maybeSingle();posts=cat?await getPosts({category:cat.id}):[];}else if(parts[0]==='noticias')posts=await getPosts({type:'noticia'});else{const {data:cat}=await db.from('categories').select('id').eq('slug',slug(label)).maybeSingle();posts=cat?await getPosts({category:cat.id}):[];}}
    shell(label,`Explora ${label.toLowerCase()} de Zona Joven TV.`,posts===null?unavailable():cards(posts));return;
  }
  if(parts[0]==='noticia'||parts[0]==='video'){
    const post=db?await getPosts({slug:parts[1],type:parts[0]==='video'?'video':'noticia'}):null;
    if(!post){shell('Contenido no disponible','No encontramos esta publicación o todavía no se ha conectado Supabase.',unavailable());return;}
    document.title=`${post.title} | Zona Joven TV`;const desc=document.querySelector('meta[name="description"]');if(desc)desc.content=post.excerpt||post.title;const ogTitle=document.querySelector('meta[property="og:title"]');if(ogTitle)ogTitle.content=post.title;const ogDesc=document.querySelector('meta[property="og:description"]');if(ogDesc)ogDesc.content=post.excerpt||post.title;const ogImage=document.querySelector('meta[property="og:image"]');if(ogImage&&post.cover_image)ogImage.content=post.cover_image;
    shell(post.title,post.excerpt||'Zona Joven TV',`<article class="article-detail">${post.cover_image?`<img src="${esc(post.cover_image)}" alt="${esc(post.title)}" style="width:100%;max-height:480px;object-fit:cover;border-radius:22px;margin:20px 0">`:''}<div class="article-content" style="white-space:pre-wrap;line-height:1.85;font-size:17px">${esc(post.content)}</div><p class="date-label">${post.published_at?new Date(post.published_at).toLocaleDateString('es-CO'):''}</p></article>`);return;
  }
  shell('Página no encontrada','La dirección que buscas no existe.', '<a class="button button-blue" href="/">Volver al inicio</a>');
});
