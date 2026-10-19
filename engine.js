/* Motor: directo o con 1 transbordo. Se aborda/baja en cualquier punto del recorrido (path). */
const Engine={
 cum(r){if(!r._c){r._c=[0];for(let i=1;i<r.path.length;i++)r._c.push(r._c[i-1]+Geo.hav(r.path[i-1],r.path[i]))}return r._c},
 pt(r,i,d){return {i,d,ll:r.path[i],label:Geo.nearest(r,r.path[i]).s.n}},
 near(r,p){let m={d:1e9,i:0};r.path.forEach((q,i)=>{const d=Geo.hav(q,p);if(d<m.d)m={i,d}});return Engine.pt(r,m.i,m.d)},
 mk(legs){
  let ride=0,walk=0,km=0;
  legs.forEach(l=>{const c=Engine.cum(l.r);l.km=Math.abs(c[l.b.i]-c[l.a.i])/1000;l.back=l.b.i<l.a.i;km+=l.km;ride+=l.km*1000/420;walk+=l.a.d});
  const last=legs[legs.length-1];walk+=last.b.d;
  const t=legs.length-1;
  return {id:legs.map(l=>l.r.id).join('+'),legs,km,transfers:t,walk1:last.b.d,
   total:Math.round(ride+walk/75+t*6),direct:t===0&&last.b.d<=250};
 },
 find(o,d){
  const A=ROUTES.map(r=>Engine.near(r,o.ll)),B=ROUTES.map(r=>Engine.near(r,d.ll)),out=[];
  ROUTES.forEach((r,k)=>{if(A[k].d<=1500&&B[k].d<=2000&&Math.abs(A[k].i-B[k].i)>=3)out.push(Engine.mk([{r,a:A[k],b:B[k]}]))});
  ROUTES.forEach((r1,x)=>ROUTES.forEach((r2,y)=>{
   if(x===y||A[x].d>1500||B[y].d>2000)return;
   const c1=Engine.cum(r1),c2=Engine.cum(r2);let best=null;
   r1.path.forEach((p,i)=>r2.path.forEach((q,j)=>{
    if(Math.abs(p[0]-q[0])>.004||Math.abs(p[1]-q[1])>.004)return;
    const dd=Geo.hav(p,q);if(dd>400)return;
    const l1=Math.abs(c1[i]-c1[A[x].i]),l2=Math.abs(c2[B[y].i]-c2[j]);
    if(l1<300||l2<300)return;
    const cost=l1+l2+dd*4;if(!best||cost<best.cost)best={cost,i,j,dd};
   }));
   if(best)out.push(Engine.mk([{r:r1,a:A[x],b:Engine.pt(r1,best.i,0)},{r:r2,a:Engine.pt(r2,best.j,best.dd),b:B[y]}]));
  }));
  return out.sort((x,y)=>(x.total+x.transfers*4)-(y.total+y.transfers*4)).slice(0,5);
 },
 nearestRoute(p){let m={d:1e9};ROUTES.forEach(r=>{const n=Engine.near(r,p);if(n.d<m.d)m={d:n.d,r}});return m}
};
