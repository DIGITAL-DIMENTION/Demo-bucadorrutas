const $=id=>document.getElementById(id);
let from=null,to=null,sel=null,last=[];
const ALL=[],GEO={};
const ic=n=>`<svg class="ic"><use href="#i-${n}"/></svg>`;
function addPlaces(r){r.stops.forEach((s,k)=>ALL.push({id:r.id+'-'+k,name:s.n,ll:s.ll}))}
const places=()=>ALL.concat(PLACES);
const short=n=>n.split(',').slice(0,2).join(',');

/* Buscar cualquier lugar por nombre (gratis: Nominatim / OpenStreetMap). null = sin internet o bloqueado. */
async function geocode(q){
 if(q.trim().length<3)return [];
 try{
  const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=mx&accept-language=es&viewbox=-99.3,19.7,-97.7,18.6&q='+encodeURIComponent(q));
  return (await r.json()).map(x=>({id:'geo-'+x.place_id,name:short(x.display_name),ll:[+x.lat,+x.lon]}));
 }catch(e){return null}
}
function resolve(id,cur){
 const t=Geo.norm($(id).value);if(!t)return null;
 if(cur&&t===Geo.norm(cur.name))return cur;
 return places().find(p=>Geo.norm(p.name).includes(t))||null;
}
function auto(id,sid,set){
 const i=$(id),b=$(sid);let tm;
 const show=(extra=[])=>{
  const q=Geo.norm(i.value),m=places().filter(p=>Geo.norm(p.name).includes(q)).concat(extra);
  extra.forEach(p=>GEO[p.id]=p);
  b.innerHTML=m.map(p=>`<div data-id="${p.id}">${ic('pin')}${p.name}</div>`).join('')||'<div class="none">Sin resultados · presiona Enter para buscar en el mapa</div>';
  b.style.display='block';
 };
 i.onfocus=()=>{i.select();show()};
 i.oninput=()=>{show();clearTimeout(tm);tm=setTimeout(async()=>{const g=await geocode(i.value);if(g&&document.activeElement===i)show(g)},500)};
 b.onpointerdown=e=>{const t=e.target.closest('[data-id]');if(!t)return;e.preventDefault();
  const p=places().find(x=>x.id===t.dataset.id)||GEO[t.dataset.id];set(p);i.value=p.name;b.style.display='none';i.blur()};
 i.onblur=()=>setTimeout(()=>b.style.display='none',150);
 i.onkeydown=e=>{if(e.key==='Enter'){b.style.display='none';i.blur();search()}};
}

async function search(){
 let o=resolve('o',from),d=resolve('d',to);
 if(!o||!d){
  $('res').innerHTML='<div class="empty">Buscando ese lugar…</div>';
  if(!o){const g=await geocode($('o').value);o=g&&g[0]}
  if(!d){const g=await geocode($('d').value);d=g&&g[0]}
  if(!o||!d){$('res').innerHTML='<div class="empty">No encontramos ese lugar. Revisa el nombre, tu internet, o toca el punto en el mapa.</div>';return}
 }
 from=o;to=d;$('o').value=o.name;$('d').value=d.name;
 last=Engine.find(o,d);sel=last[0]?.id||null;render(o,d);
}

function card(x,i){
 const col=x.legs[0].r.color,L=x.legs;
 let h=`<li>${ic('walk')}<span>Camina <b>${Math.round(L[0].a.d)} m</b> hasta la ruta, cerca de <b>${L[0].a.label}</b>.</span></li>`;
 L.forEach((l,k)=>{
  if(k)h+=`<li>${ic('walk')}<span>Bájate y camina <b>${Math.round(l.a.d)} m</b> a <b>${l.a.label}</b> para el siguiente transporte.</span></li>`;
  h+=`<li>${ic('bus')}<span>Toma <b>${l.r.name}</b>: <b>${l.km.toFixed(1)} km</b>${l.back?' (sentido contrario al grabado)':''} hasta cerca de <b>${l.b.label}</b>.</span></li>`;
 });
 h+=`<li>${ic('flag')}<span>${x.direct?'Te deja prácticamente en tu destino.':`Bájate y camina <b>${Math.round(x.walk1)} m</b> hasta tu destino.`}</span></li>`;
 const badge=x.transfers?`${x.transfers} transbordo`:x.direct?'Directo':'Pasa por fuera';
 return `<div class="card ${x.id===sel?'on':''}" style="--rc:${col};animation-delay:${i*70}ms" data-id="${x.id}">
  <div class="top"><div class="name"><span class="bus">${ic('bus')}</span>${L.map(l=>l.r.name).join(' + ')}</div>
  <span class="badge ${x.transfers||!x.direct?'out':'dir'}">${badge}</span></div>
  <ul class="steps">${h}</ul>
  <div class="meta"><span>${ic('clock')}~${x.total} min</span><span>${ic('coin')}$${L.reduce((s,l)=>s+l.r.price,0)}</span></div></div>`;
}

function render(o,d){
 if(last.length)$('res').innerHTML=last.map(card).join('');
 else{
  const na=Engine.nearestRoute(o.ll),nb=Engine.nearestRoute(d.ll),m=[];
  if(na.d>1500)m.push(`Ninguna ruta pasa cerca de <b>${o.name}</b> (la más cercana está a ${(na.d/1000).toFixed(1)} km).`);
  if(nb.d>2000)m.push(`Ninguna ruta pasa cerca de <b>${d.name}</b> (la más cercana está a ${(nb.d/1000).toFixed(1)} km).`);
  $('res').innerHTML=`<div class="empty">${m.join('<br>')||'Las rutas cercanas a esos puntos no se conectan entre sí.'}<br><br>Falta grabar ese tramo con GeoTracker y agregarlo con el botón de GPX.</div>`;
 }
 document.querySelectorAll('.card').forEach(c=>c.onclick=()=>{sel=c.dataset.id;render(o,d)});
 MapView.draw(last,sel,o,d);
}

function pickPoint(k,lat,lng){
 const p={id:'map-'+k,name:'Punto elegido en el mapa',ll:[lat,lng]};
 if(k==='o'){from=p;$('o').value=p.name}else{to=p;$('d').value=p.name}
 MapView.m.closePopup();search();
}

$('go').onclick=search;
$('sw').onclick=()=>{const t=from;from=to;to=t;$('o').value=from.name;$('d').value=to.name;search()};
$('gps').onclick=()=>{
 const fail=()=>alert('No pudimos obtener tu ubicación. Escribe tu punto manualmente.');
 if(!navigator.geolocation)return fail();
 navigator.geolocation.getCurrentPosition(p=>{
  from={id:'gps',name:'Mi ubicación',ll:[p.coords.latitude,p.coords.longitude]};$('o').value=from.name;search();
 },fail,{timeout:8000});
};
$('gpxf').onchange=e=>{
 const f=e.target.files[0];if(!f)return;
 f.text().then(t=>{
  const name=prompt('¿Cómo se llama esta ruta?','Nueva ruta')||'Nueva ruta',r=GPX.parse(t,name);
  if(!r)return alert('No encontré puntos de recorrido en ese archivo.');
  ROUTES.push(r);addPlaces(r);search();
 });e.target.value='';
};

ROUTES.forEach(addPlaces);
from=ALL[0];to=ALL[ROUTES[0].stops.length-1];
$('o').value=from.name;$('d').value=to.name;
auto('o','so',p=>from=p);auto('d','sd',p=>to=p);
MapView.init();search();
