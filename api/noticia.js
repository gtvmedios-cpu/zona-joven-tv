const SB_URL='https://cyekgljjacpbutiwcehk.supabase.co';
const SB_KEY='sb_publishable__whKicW16irtizYTEQ9xhQ_Fni8q0H2';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
module.exports=async(req,res)=>{
 const slug=String(req.query.slug||'').trim();
 if(!slug)return res.status(400).send('Falta el slug.');
 try{
  const url=`${SB_URL}/rest/v1/posts?select=title,slug,excerpt,content,cover_image,published_at,categories(name)&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`;
  const r=await fetch(url,{headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`}});
  if(!r.ok)throw new Error(`Supabase HTTP ${r.status}`);
  const rows=await r.json(),p=rows[0];
  if(!p)return res.status(404).send('Noticia no encontrada.');
  const title=esc(p.title),desc=esc(plain(p.excerpt||p.content||p.title).slice(0,220));
  const image=esc(p.cover_image||'https://cdn.phototourl.com/member/2026-11-10-232e563c-d33b-414d-9b3f-25ae06c97afe.png');
  const canonical=`https://zona-joven-tv.vercel.app/noticia/${encodeURIComponent(p.slug)}`;
  const body=esc(p.content||p.excerpt||'').replace(/\r?\n/g,'<br>');
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','public, s-maxage=180, stale-while-revalidate=300');
  return res.status(200).send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | Zona Joven TV</title><meta name="description" content="${desc}"><link rel="canonical" href="${canonical}">
<meta property="og:type" content="article"><meta property="og:site_name" content="Zona Joven TV"><meta property="og:locale" content="es_CO">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:image" content="${image}"><meta property="og:image:secure_url" content="${image}"><meta property="og:image:alt" content="${title}"><meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${desc}"><meta name="twitter:image" content="${image}">
<meta http-equiv="refresh" content="0;url=${canonical}">
</head><body><h1>${title}</h1><p>${desc}</p>${p.cover_image?`<img src="${image}" alt="${title}" style="max-width:100%">`:''}<p>${body}</p><p><a href="/">Ir a Zona Joven TV</a></p></body></html>`);
 }catch(e){console.error(e);return res.status(500).send('Error al cargar la noticia.');}
};
