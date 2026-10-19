const Geo={
 hav(a,b){const R=6371000,r=Math.PI/180,x=Math.sin((b[0]-a[0])*r/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin((b[1]-a[1])*r/2)**2;return 2*R*Math.asin(Math.sqrt(x))},
 nearest(r,p){return r.stops.reduce((m,s,i)=>{const d=Geo.hav(s.ll,p);return d<m.d?{i,d,s}:m},{d:1e9})},
 norm(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
};
