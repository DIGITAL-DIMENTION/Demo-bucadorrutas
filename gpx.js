/* Importar un GPX de GeoTracker directo desde la página (se guarda en tu navegador). */
const COLORS=['#ff7eb6','#6ec6ff','#ffb86b','#a58bff','#5fd6a6'];
const GPX={
 parse(text,name){
  const doc=new DOMParser().parseFromString(text,'text/xml');
  const raw=[...doc.querySelectorAll('trkpt')].map(p=>[+p.getAttribute('lat'),+p.getAttribute('lon')]);
  if(raw.length<2)return null;
  const path=[raw[0]];raw.slice(1,-1).forEach(p=>{if(Geo.hav(path[path.length-1],p)>=30)path.push(p)});path.push(raw[raw.length-1]);
  const cum=[0];for(let i=1;i<path.length;i++)cum.push(cum[i-1]+Geo.hav(path[i-1],path[i]));
  const tot=cum[cum.length-1],marks=[0];for(let m=1000;m<tot-500;m+=1000)marks.push(m);marks.push(tot);
  const stops=marks.map((m,j)=>{let i=0;cum.forEach((c,t)=>{if(Math.abs(c-m)<Math.abs(cum[i]-m))i=t});
   return {n:j===0?'Inicio · '+name:j===marks.length-1?'Final · '+name:`Parada ${j} (${name})`,ll:path[i]}});
  return {id:'R'+(ROUTES.length+1),name,color:COLORS[ROUTES.length%COLORS.length],price:5,stops,path,custom:true};
 }
};
