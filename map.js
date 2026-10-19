const MapView={
 m:null,g:null,
 init(){
  this.m=L.map('map').setView([19.24,-98.41],12);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri'}).addTo(this.m);
  this.g=L.layerGroup().addTo(this.m);
  this.m.on('click',e=>{const {lat,lng}=e.latlng;
   L.popup().setLatLng(e.latlng).setContent(`<button onclick="pickPoint('o',${lat},${lng})">Estoy aquí</button><button onclick="pickPoint('d',${lat},${lng})">Quiero llegar aquí</button>`).openOn(this.m)});
 },
 draw(its,sel,o,d){
  const g=this.g;g.clearLayers();let pts=[o.ll,d.ll];
  ROUTES.forEach(r=>L.polyline(r.path,{color:r.color,weight:5,opacity:.22}).addTo(g));
  const cur=its.find(x=>x.id===sel);
  if(cur){
   cur.legs.forEach(l=>{
    const r=l.r,[lo,hi]=l.a.i<l.b.i?[l.a.i,l.b.i]:[l.b.i,l.a.i],seg=r.path.slice(lo,hi+1);pts=pts.concat(seg);
    L.polyline(seg,{color:r.color,weight:8,opacity:.95,lineCap:'round'}).addTo(g);
    r.stops.forEach(s=>L.circleMarker(s.ll,{radius:5,color:r.color,weight:3,fillColor:'#fff',fillOpacity:1}).bindTooltip(s.n).addTo(g));
   });
   const w=[[o.ll,cur.legs[0].a.ll]];cur.legs.forEach((l,k)=>{if(k)w.push([cur.legs[k-1].b.ll,l.a.ll])});
   w.push([cur.legs[cur.legs.length-1].b.ll,d.ll]);
   w.forEach(p=>L.polyline(p,{color:'#444',weight:3,dashArray:'2 8'}).addTo(g));
  }
  const pin=(ll,c,t)=>L.marker(ll,{icon:L.divIcon({className:'',html:`<div class="pin" style="--c:${c}"><b>${t}</b></div>`,iconSize:[0,0]})}).addTo(g);
  pin(o.ll,'#2fae85','Tú');pin(d.ll,'#ff7eb6','Destino');
  const fit=()=>{this.m.invalidateSize();this.m.fitBounds(pts,{padding:[40,40],maxZoom:16})};fit();setTimeout(fit,250);
 }
};
