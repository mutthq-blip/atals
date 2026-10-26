/* ================= desert locust model v2 (built in millimetres, ground y=0, head towards +z) ================= */
/* ---- procedural texture helpers ---- */
function normalFromHeight(hc,strength){const W=hc.width,H=hc.height,src=hc.getContext('2d').getImageData(0,0,W,H).data,c=cv(W,H),g=c.getContext('2d'),out=g.createImageData(W,H),d=out.data;
  const h=(x,y)=>src[(((y+H)%H)*W+((x+W)%W))*4]/255;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=(h(x+1,y)-h(x-1,y))*strength,dy=(h(x,y+1)-h(x,y-1))*strength;let nx=-dx,ny=dy,nz=1;const l=Math.hypot(nx,ny,nz);const j=(y*W+x)*4;d[j]=(nx/l*.5+.5)*255;d[j+1]=(ny/l*.5+.5)*255;d[j+2]=(nz/l*.5+.5)*255;d[j+3]=255;}
  g.putImageData(out,0,0);const t=new THREE.CanvasTexture(c);t.anisotropy=ANISO;return t;}
/* fine punctation + segment grooves for chitin */
function chitinNormal(segs,seed,pits=1){const W=512,H=512,c=cv(W,H),g=c.getContext('2d'),rnd=mulberry(seed);g.fillStyle='#808080';g.fillRect(0,0,W,H);
  for(let i=0;i<5200*pits;i++){const x=rnd()*W,y=rnd()*H,r=.6+rnd()*1.6;g.fillStyle=`rgba(0,0,0,${.12+rnd()*.2})`;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
  for(let i=0;i<900;i++){const x=rnd()*W,y=rnd()*H;g.fillStyle=`rgba(255,255,255,${.08+rnd()*.12})`;g.fillRect(x,y,2,2);}
  if(segs){for(let k=1;k<segs;k++){const y=H*(k/segs);const gr=g.createLinearGradient(0,y-6,0,y+6);gr.addColorStop(0,'rgba(255,255,255,.35)');gr.addColorStop(.45,'rgba(0,0,0,.55)');gr.addColorStop(.6,'rgba(0,0,0,.2)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,y-6,W,12);}}
  return normalFromHeight(c,2.2);}
const NRM={abd:chitinNormal(10,3),abdH:chitinNormal(9,13),plain:chitinNormal(0,5),pron:chitinNormal(0,7,1.6),leg:chitinNormal(0,9,.8)};
/* femur: herringbone (chevron) ridges on the outer face, as a height map */
function femurMaps(sc){const W=512,H=256,c=cv(H,W),g=c.getContext('2d'),h=cv(H,W),k=h.getContext('2d'),rnd=mulberry(41);g.setTransform(0,-1,1,0,0,W);k.setTransform(0,-1,1,0,0,W);/* drawn as x along, y around; turned so u runs around */
  g.fillStyle=sc.leg;g.fillRect(0,0,W,H);k.fillStyle='#808080';k.fillRect(0,0,W,H);
  /* u around (0..1, .5 = dorsal), v along femur (0 knee .. 1 base): draw along x=v*W, y=u*H */
  for(let i=0;i<34;i++){const x=W*(.06+i*.027);for(const side of[.25,.75]){g.strokeStyle=sc.femLine;g.lineWidth=2.2;g.globalAlpha=.55;k.strokeStyle='#ffffff';k.lineWidth=3;
    for(const ctx of[g,k]){ctx.beginPath();ctx.moveTo(x-9,H*(side-.16));ctx.lineTo(x,H*side);ctx.lineTo(x-9,H*(side+.16));ctx.stroke();}}}
  g.globalAlpha=1;
  /* dorsal carina dark marks (gregarious adults have dark bars, hoppers black) */
  if(sc.femBars){g.fillStyle=sc.dark;for(let i=0;i<sc.femBars;i++){g.globalAlpha=.75;g.fillRect(W*(.18+i*.24),H*.38,W*.08,H*.24);}g.globalAlpha=1;}
  if(sc.femDark){g.fillStyle=sc.dark;g.globalAlpha=sc.femDark;g.fillRect(0,H*.36,W,H*.28);g.globalAlpha=1;}
  /* knee */g.fillStyle=sc.knee||'#2a1c10';g.fillRect(0,0,W*.06,H);
  for(let i=0;i<1400;i++){g.fillStyle=`rgba(0,0,0,${rnd()*.08})`;g.fillRect(rnd()*W,rnd()*H,2,2);}
  return{map:ctex(c),normal:normalFromHeight(h,3)};}
/* body skin: u around (0..1, .5 dorsal), v along (0 rear .. 1 front) */
function skinMap(sc,part,seed){const W=512,H=512,c=cv(W,H),g=c.getContext('2d'),rnd=mulberry(seed);
  const grd=g.createLinearGradient(0,0,W,0);grd.addColorStop(0,sc.pale);grd.addColorStop(.3,sc.body);grd.addColorStop(.5,sc.body);grd.addColorStop(.7,sc.body);grd.addColorStop(1,sc.pale);g.fillStyle=grd;g.fillRect(0,0,W,H);
  const P=sc.pattern||'speckle';
  if(part==='abd'){/* segments: darker hind margins, spiracles */for(let k=0;k<10;k++){const y=H*(k/10);g.fillStyle=`rgba(40,25,10,${sc.suture||.28})`;g.fillRect(0,y,W,H*.018);
      for(const u of[.22,.78]){g.fillStyle='rgba(30,20,10,.75)';g.beginPath();g.ellipse(W*u,y+H*.05,3,4.5,0,0,7);g.fill();}}}
  if(P==='speckle'){for(let i=0;i<700;i++){g.fillStyle=sc.dark;g.globalAlpha=.12+rnd()*.35;g.beginPath();g.ellipse(rnd()*W,rnd()*H,1+rnd()*3.5,1+rnd()*2.4,rnd()*3,0,7);g.fill();}}
  if(P==='black'){g.fillStyle=sc.dark;g.globalAlpha=.94;g.fillRect(0,0,W,H);g.globalAlpha=1;for(let i=0;i<(sc.dots||0);i++){g.fillStyle=sc.body;g.globalAlpha=.8;g.beginPath();g.arc(rnd()*W,rnd()*H,2+rnd()*4,0,7);g.fill();}}
  if(P==='dorsal'){/* black back, coloured flanks and belly */g.fillStyle=sc.dark;g.globalAlpha=.95;g.fillRect(W*(.5-sc.dw),0,W*sc.dw*2,H);
    if(part==='abd'){for(let k=0;k<10;k++){const y=H*(k/10);g.fillRect(W*.1,y,W*.8,H*.025);}}
    g.globalAlpha=1;g.fillStyle=sc.body;for(let i=0;i<(sc.dots||0);i++){g.beginPath();g.arc(W*(.5+(rnd()-.5)*sc.dw*1.6),rnd()*H,2+rnd()*3,0,7);g.fill();}}
  if(P==='yspots'){g.fillStyle=sc.dark;for(let k=0;k<10;k++){const y=H*(k/10)+H*.04;for(const u of[.36,.5,.64]){g.globalAlpha=.88;g.beginPath();g.ellipse(W*u,y,7+rnd()*5,5+rnd()*3,0,0,7);g.fill();}}g.globalAlpha=.85;g.fillRect(W*.485,0,W*.03,H);}
  g.globalAlpha=1;for(let i=0;i<2600;i++){g.fillStyle=`rgba(${rnd()<.5?0:255},${rnd()<.5?0:255},${rnd()<.5?0:200},${rnd()*.05})`;g.fillRect(rnd()*W,rnd()*H,2,2);}
  return ctex(c);}
function pronMap(sc,seed){const W=512,H=512,c=cv(W,H),g=c.getContext('2d'),rnd=mulberry(seed);g.fillStyle=sc.body;g.fillRect(0,0,W,H);
  /* lateral lobes paler, three transverse sulci, dark median line for hoppers */
  const gr=g.createLinearGradient(0,0,W,0);gr.addColorStop(0,sc.pale);gr.addColorStop(.28,sc.body);gr.addColorStop(.72,sc.body);gr.addColorStop(1,sc.pale);g.fillStyle=gr;g.fillRect(0,0,W,H);
  if(sc.pron==='black'){g.fillStyle=sc.dark;g.globalAlpha=.95;g.fillRect(0,0,W,H);g.globalAlpha=1;}
  if(sc.pron==='bands'){g.fillStyle=sc.dark;g.globalAlpha=.92;g.fillRect(W*.3,0,W*.4,H);g.fillRect(0,H*.0,W*.12,H);g.fillRect(W*.88,0,W*.12,H);g.globalAlpha=1;g.fillStyle=sc.body;g.fillRect(W*.47,0,W*.06,H);}
  for(const v of[.38,.55,.72]){g.strokeStyle='rgba(40,25,10,.55)';g.lineWidth=3;g.beginPath();g.moveTo(W*.18,H*v);g.bezierCurveTo(W*.35,H*(v+.04),W*.65,H*(v+.04),W*.82,H*v);g.stroke();}
  for(let i=0;i<500;i++){g.fillStyle=sc.dark;g.globalAlpha=.1+rnd()*.25;g.beginPath();g.arc(rnd()*W,rnd()*H,1+rnd()*2.2,0,7);g.fill();}g.globalAlpha=1;
  return ctex(c);}
function headMap(sc,seed){const W=512,H=512,c=cv(W,H),g=c.getContext('2d'),rnd=mulberry(seed);g.fillStyle=sc.head||sc.body;g.fillRect(0,0,W,H);
  if(sc.pattern==='black'||sc.pron==='black'){g.fillStyle=sc.dark;g.globalAlpha=.9;g.fillRect(0,0,W,H);g.globalAlpha=1;}
  /* frontal ridges (u=.5 front face for the head sphere mapping below) */g.strokeStyle='rgba(50,30,10,.45)';g.lineWidth=2;for(const d of[-18,0,18]){g.beginPath();g.moveTo(W*.5+d,H*.15);g.lineTo(W*.5+d*.6,H*.85);g.stroke();}
  if(sc.faceStripe){g.fillStyle=sc.dark;g.globalAlpha=.8;g.fillRect(W*.2,H*.2,W*.06,H*.6);g.fillRect(W*.74,H*.2,W*.06,H*.6);g.globalAlpha=1;}
  for(let i=0;i<600;i++){g.fillStyle=sc.dark;g.globalAlpha=.08+rnd()*.25;g.beginPath();g.arc(rnd()*W,rnd()*H,1+rnd()*2,0,7);g.fill();}g.globalAlpha=1;return ctex(c);}
function eyeMap(sc){const c=cv(256,256),g=c.getContext('2d');g.fillStyle=sc.eye||'#7b5e36';g.fillRect(0,0,256,256);g.fillStyle='rgba(25,15,5,.75)';for(let x=10;x<256;x+=30)g.fillRect(x,0,10,256);
  for(let y=0;y<256;y+=4)for(let x=(y/4%2)*2;x<256;x+=4){g.fillStyle='rgba(255,255,255,.06)';g.fillRect(x,y,2,2);}return ctex(c);}
function eyeNormal(){const c=cv(256,256),g=c.getContext('2d');g.fillStyle='#808080';g.fillRect(0,0,256,256);for(let y=0;y<256;y+=5)for(let x=(y/5%2)*2.5;x<256;x+=5){g.fillStyle='#bbbbbb';g.beginPath();g.arc(x,y,1.8,0,7);g.fill();}return normalFromHeight(c,1.5);}
const EYE_N=eyeNormal();
/* forewing (tegmen): leathery base, veined, dark brown blotches, translucent towards the apex. u along (0 base .. 1 apex), v across (0 anal/dorsal .. 1 costal) */
function tegmenMaps(sc,seed){const W=1024,H=192,c=cv(W,H),g=c.getContext('2d'),rnd=mulberry(seed),a=cv(W,H),ga=a.getContext('2d');
  g.fillStyle=sc.teg;g.fillRect(0,0,W,H);
  const gr=g.createLinearGradient(0,0,W,0);gr.addColorStop(0,'rgba(80,55,20,.25)');gr.addColorStop(.35,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(255,250,235,.25)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  /* longitudinal veins */g.strokeStyle=sc.vein;g.lineWidth=2;const LV=[.12,.22,.34,.48,.6,.72,.84,.93];LV.forEach((v,i)=>{g.globalAlpha=.75;g.beginPath();g.moveTo(0,H*v*(.6+.4*(i/8)));for(let x=0;x<=W;x+=32)g.lineTo(x,H*(v+(v-.5)*.15*x/W)+Math.sin(x*.01+i)*2);g.stroke();});
  /* cross-veins: dense net */g.lineWidth=1;g.globalAlpha=.45;for(let i=0;i<1500;i++){const x=rnd()*W,y=rnd()*H;g.beginPath();g.moveTo(x,y);g.lineTo(x+(rnd()-.5)*5,y+6+rnd()*9);g.stroke();}
  /* brown blotches, heavier in the distal two thirds */g.fillStyle=sc.tegSpot;for(let i=0;i<sc.tegSpots;i++){const x=W*(.18+Math.pow(rnd(),.8)*.8),y=H*(.12+rnd()*.78);g.globalAlpha=.45+rnd()*.45;g.beginPath();g.ellipse(x,y,5+rnd()*14,3+rnd()*7,(rnd()-.5)*.6,0,7);g.fill();}
  g.globalAlpha=1;
  /* alpha: opaque base, ~.55 at apex */const ag=ga.createLinearGradient(0,0,W,0);ag.addColorStop(0,'#ffffff');ag.addColorStop(.45,'#f0f0f0');ag.addColorStop(1,'#8c8c8c');ga.fillStyle=ag;ga.fillRect(0,0,W,H);
  ga.strokeStyle='#ffffff';ga.lineWidth=2;LV.forEach(v=>{ga.beginPath();ga.moveTo(0,H*v);ga.lineTo(W,H*v);ga.stroke();});
  const am=ctex(a,{srgb:false});return{map:ctex(c),alpha:am};}

/* ---- colour schemes (from the guide's photos) ---- */
const LSC={
  adult:{body:'#dcb52a',pale:'#efd978',dark:'#4b3212',head:'#d9b02c',leg:'#d8b02a',femLine:'#7a5a18',femBars:3,tib:'#d4aa24',teg:'#c3a465',tegSpot:'#4f3412',tegSpots:120,vein:'#6b4f22',eye:'#7d5a30'},
  imm:{body:'#c95b45',pale:'#e2927e',dark:'#58200f',head:'#c0523e',leg:'#c4523e',femLine:'#6a2414',femBars:3,tib:'#c24a3c',teg:'#bf8f76',tegSpot:'#5a2814',tegSpots:120,vein:'#6a3a28',eye:'#6a3a28'},
  fledg:{body:'#dccfae',pale:'#efe7d2',dark:'#8a7a5a',leg:'#d9ccaa',femLine:'#9a8a68',tib:'#d4c6a0',teg:'#e2d8c2',tegSpot:'#8a7656',tegSpots:70,vein:'#a89878',eye:'#8a7a5a'},
  sol:{body:'#a59874',pale:'#cbc09c',dark:'#544a30',leg:'#ab9c74',femLine:'#5e5236',femBars:3,tib:'#9aa0a0',teg:'#b3a37e',tegSpot:'#463a22',tegSpots:150,vein:'#6a5c3c',eye:'#6a5a3a'},
  h1:{body:'#d8cfb0',pale:'#2a2620',dark:'#1b1814',pattern:'black',pron:'black',leg:'#24201a',femLine:'#000000',femDark:.9,tib:'#2a251f',eye:'#3a3020',suture:.5},
  h2:{body:'#d8cfb0',pale:'#2a2620',dark:'#1b1814',pattern:'black',dots:30,pron:'black',leg:'#24201a',femLine:'#000000',femDark:.9,tib:'#2a251f',eye:'#3a3020',suture:.5},
  h3:{body:'#d9be48',pale:'#e6d070',dark:'#1b1814',pattern:'dorsal',dw:.3,dots:24,pron:'bands',leg:'#cfb244',femLine:'#1b1814',femDark:.85,tib:'#2a251f',eye:'#3a3020',faceStripe:1},
  h4:{body:'#e3b52e',pale:'#efce62',dark:'#1b1814',pattern:'dorsal',dw:.22,dots:10,pron:'bands',leg:'#dcaa2c',femLine:'#1b1814',femBars:4,femDark:.35,tib:'#2a251f',eye:'#3a3020',faceStripe:1},
  h5:{body:'#efcb2a',pale:'#f6e070',dark:'#1b1814',pattern:'yspots',pron:'bands',leg:'#ebc42c',femLine:'#1b1814',femBars:4,tib:'#e0b82a',eye:'#3a3020',faceStripe:1},
  hsol:{body:'#8db24f',pale:'#b7d27a',dark:'#4a6a26',leg:'#88ac4a',femLine:'#4a6a26',tib:'#7fa246',eye:'#5a6a3a'}};
const LMC={};
function lmats(key){if(LMC[key])return LMC[key];const sc=LSC[key],s=key.charCodeAt(0)*7+key.length;
  const chit=(map,nrm,o={})=>keep(new THREE.MeshPhysicalMaterial(Object.assign({map,normalMap:nrm,normalScale:new THREE.Vector2(.55,.55),roughness:.46,clearcoat:.55,clearcoatRoughness:.38},o)));
  const fm=femurMaps(sc),tm=sc.teg?tegmenMaps(sc,s+5):null;
  const m={abd:chit(skinMap(sc,'abd',s),NRM.abd),tho:chit(skinMap(sc,'tho',s+1),NRM.plain),pron:chit(pronMap(sc,s+2),NRM.pron),head:chit(headMap(sc,s+3),NRM.plain),
    eye:keep(new THREE.MeshPhysicalMaterial({map:eyeMap(sc),normalMap:EYE_N,roughness:.18,clearcoat:1,clearcoatRoughness:.08})),
    fem:chit(fm.map,fm.normal,{normalScale:new THREE.Vector2(.9,.9)}),leg:chit(null,NRM.leg,{color:col(sc.leg)}),tib:chit(null,NRM.leg,{color:col(sc.tib||sc.leg)}),
    dark:keep(new THREE.MeshPhysicalMaterial({color:col(sc.dark),roughness:.35,clearcoat:.6})),mouth:keep(new THREE.MeshPhysicalMaterial({color:col('#2a1c12'),roughness:.3,clearcoat:.8})),
    spine:keep(new THREE.MeshStandardMaterial({color:col('#1f160e'),roughness:.4})),pad:keep(new THREE.MeshStandardMaterial({color:col('#e8d9b0'),roughness:.7})),
    teg:tm?keep(new THREE.MeshPhysicalMaterial({map:tm.map,alphaMap:tm.alpha,transparent:true,side:THREE.DoubleSide,roughness:.5,clearcoat:.4,clearcoatRoughness:.3,depthWrite:true})):null,
    ant:keep(new THREE.MeshStandardMaterial({color:col(sc.ant||'#7a6040'),roughness:.55}))};
  if(key[0]==='h'&&key!=='hsol')m.ant.color=col('#2a241c');
  /* see-through exoskeleton for the inside view */
  ['abd','tho','pron','head','fem'].forEach(k=>xrMat(m[k],.1,'body'));if(m.teg)xrMat(m.teg,.06,'body');
  return LMC[key]=m;}

/* orient a shapedBody (front = +z) so it runs from a (front) to b (rear), keeping its local y as close to `upHint` as possible */
function placeAlong(mesh,a,b,upHint=UP){const z=new V3().subVectors(a,b).normalize(),x=new V3().crossVectors(upHint,z).normalize(),y=new V3().crossVectors(z,x);
  mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));mesh.position.copy(a).add(b).multiplyScalar(.5);return mesh;}
function beadChain(curve,n,r0,r1,mat){const im=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,8),mat,n),m=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new V3(),t=new V3();
  for(let i=0;i<n;i++){const u=i/(n-1);curve.getPointAt(u,p);curve.getTangentAt(u,t);q.setFromUnitVectors(new V3(0,0,1),t);const r=r0+(r1-r0)*u,L=curve.getLength()/n*.62;m.compose(p,q,new V3(r,r,L));im.setMatrixAt(i,m);}
  im.castShadow=true;return im;}
function segTube(pts,r0,r1,mat,rs=10){const cu=new THREE.CatmullRomCurve3(pts);return new THREE.Mesh(taperTube(cu,u=>r0+(r1-r0)*u,Math.max(8,pts.length*6),rs),mat);}

/* the model. o.key: colour scheme; o.hopper + o.bud (0..1 wing-pad size); o.lay: abdomen telescoped down into the soil (depth in mm) */
function makeLocust(len,o={}){const key=o.key||'adult',M=lmats(key),hop=!!o.hopper,g=new THREE.Group(),P={};const S=s=>new V3(...s);
  const hs=hop?1.32:1;/* head scale */
  const AZ0=hop?-15:-17,AL=hop?24:32,abdY=hop?6.6:7.0;
  /* --- abdomen (10 segments), bending down a little towards the tip --- */
  if(!o.lay){const ab=shapedBody(AL,hop?3.7:3.9,hop?3.8:4.0,t=>{const u=(t+1)/2;return{w:endCap(t,2.2)*(.62+.38*Math.min(1,u*1.6)),h:endCap(t,2.2)*(.6+.4*Math.min(1,u*1.5))};},{n:2.15,cyl:1,ws:64,hs:48});
    const p=ab.attributes.position;for(let i=0;i<p.count;i++){const z=p.getZ(i);if(z<0){const k=-z/(AL/2);p.setY(i,p.getY(i)-k*k*(hop?1:1.6));}}ab.computeVertexNormals();
    const abd=new THREE.Mesh(ab,M.abd);abd.position.set(0,abdY,AZ0-AL/2);g.add(abd);g.userData.abd=abd;
    /* ovipositor valves (female) */if(!hop){for(const[sx,sy]of[[1,1],[-1,1],[1,-1],[-1,-1]]){const v=segTube([new V3(sx*.5,abdY-1.3+sy*.6,AZ0-AL+.6),new V3(sx*.8,abdY-1.3+sy*1.0,AZ0-AL-.6),new V3(sx*.5,abdY-1.3+sy*1.5,AZ0-AL-1.5)],.45,.12,M.mouth,6);g.add(v);}}
    P.abd=new V3(0,abdY+4,AZ0-AL*.55);P.tip=new V3(0,abdY-1,AZ0-AL);}
  else{/* telescoped abdomen digging: from the thorax back, then straight down into the soil */const D=o.lay;const pts=[new V3(0,7,-17),new V3(0,6.4,-24),new V3(0,3.5,-29),new V3(0,-4,-31),new V3(0,-D*.5,-31.5),new V3(0,-D,-31.5)];
    const cu=new THREE.CatmullRomCurve3(pts);const tg=taperTube(cu,u=>3.6*(1-.35*Math.min(1,u*1.6)),90,16);const uv=tg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getY(i),uv.getX(i)*6);
    const am=M.abd.clone();am.map=M.abd.map.clone();am.map.wrapT=am.map.wrapS=THREE.RepeatWrapping;am.map.needsUpdate=true;keep(am);g.add(new THREE.Mesh(tg,am));P.ovi=new V3(0,-D,-31.5);P.abd=new V3(0,4,-28);}
  /* --- thorax under the pronotum --- */
  const th=new THREE.Mesh(shapedBody(hop?9:10,hop?3.7:4.0,hop?4.0:4.3,t=>({w:endCap(t,2.4),h:endCap(t,2.4)}),{n:2.2,cyl:1}),M.tho);th.position.set(0,8.0,hop?-10.5:-12.5);g.add(th);
  /* --- pronotum: saddle-shaped shield with a median ridge --- */
  const PL=hop?13:12.5,PZ=hop?-4.6:-5.2;
  const pg=shapedBody(PL,hop?4.3:4.45,4.7,t=>{const u=(t+1)/2;return{w:endCap(t,5)*(1.06-.1*u)*(1-.05*Math.cos(u*Math.PI*2.2)),h:endCap(t,5)*(.95+.06*(1-u))};},{n:2.7,top:1.0,bot:.62,cyl:1});
  const pr=new THREE.Mesh(pg,M.pron);pr.position.set(0,9.4,PZ);g.add(pr);
  const car=new THREE.Mesh(new THREE.BoxGeometry(.35,.5,PL*.92),M.pron);car.position.set(0,9.4+4.62,PZ);g.add(car);
  P.pronotum=new V3(0,14.2,PZ);
  /* prosternal tubercle: the peg between the front legs that marks the genus */
  const pt=new THREE.Mesh(new THREE.ConeGeometry(.75,1.9,10),M.tho);pt.position.set(0,4.6,-1.4);pt.rotation.x=Math.PI;g.add(pt);
  /* --- head: tall oval, face sloping down and forward --- */
  const hg=new THREE.SphereGeometry(1,48,36);hg.rotateY(-Math.PI/2);/* puts u=.5 on the face */
  const head=new THREE.Mesh(hg,M.head);head.scale.set(3.4*hs,4.6*hs,3.8*hs);head.rotation.x=-.32;const HC=new V3(0,9.7+(hs-1)*1.5,4.4+(hs-1)*2.4);head.position.copy(HC);g.add(head);
  const F=v=>new V3(v.x*hs,v.y*hs,v.z*hs).add(new V3(0,(hs-1)*1.5-(hs-1)*9.7*.0,(hs-1)*2.4-(hs-1)*4.4*0));
  const fc=(x,y,z)=>{const v=new V3(x,y-9.7,z-4.4).multiplyScalar(hs);return v.add(HC);};
  for(const s of[-1,1]){/* compound eyes */const e=new THREE.Mesh(new THREE.SphereGeometry(1,28,20),M.eye);e.scale.set(1.35*hs,2.35*hs,1.85*hs);e.position.copy(fc(s*3.0,11.3,5.2));e.rotation.set(-.3,s*.4,0);g.add(e);
    /* ocellus */const oc=new THREE.Mesh(new THREE.SphereGeometry(.28*hs,10,8),M.eye);oc.position.copy(fc(s*1.4,12.6,7.0));g.add(oc);
    /* antennae: beaded, ~25 segments */const a0=fc(s*1.25,11.9,7.4);const ac=new THREE.CatmullRomCurve3([a0,a0.clone().add(new V3(s*.4,1.4,2.4)),a0.clone().add(new V3(s*1.6,2.9,7)),a0.clone().add(new V3(s*3.0,3.4,12.2)),a0.clone().add(new V3(s*4.2,2.9,hop?14.5:16.5))]);
    const an=beadChain(ac,hop?18:26,hop?.3:.42,hop?.2:.3,M.ant);an.userData.ant=s;g.add(an);if(s>0)P.antenna=ac.getPoint(.62);
    /* mandibles, maxillary palps */const md=new THREE.Mesh(new THREE.SphereGeometry(1,12,10),M.mouth);md.scale.set(.9*hs,1.0*hs,.75*hs);md.position.copy(fc(s*1.05,4.5,7.4));md.rotation.z=s*.4;g.add(md);
    g.add(segTube([fc(s*1.7,4.7,7.0),fc(s*2.3,3.2,8.1),fc(s*2.4,2.1,7.7),fc(s*2.3,1.5,7.2)],.32*hs,.22*hs,M.head,6));
    g.add(segTube([fc(s*.8,4.0,7.6),fc(s*1.0,2.8,8.3),fc(s*1.0,2.2,8.0)],.26*hs,.18*hs,M.head,6));}
  const cly=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),M.head);cly.scale.set(1.8*hs,1.15*hs,.75*hs);cly.position.copy(fc(0,5.9,7.7));g.add(cly);
  const lab=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),M.mouth);lab.scale.set(1.6*hs,1.0*hs,.6*hs);lab.position.copy(fc(0,4.8,7.9));g.add(lab);
  P.eye=fc(3.6,11.3,5.4);P.mouth=fc(0,4.0,8.2);P.head=fc(0,12,6);
  /* --- legs --- */
  const LG=hop?{fc:[2.2,5.6,-1.3],fk:[4.6,7.4,3.0],ff:[5.6,.5,4.6],mc:[3.0,5.6,-9.2],mk:[6.2,8.0,-7.0],mf:[8.0,.5,-11],hc:[3.5,6.0,-13.2],hk:[5.4,13.0,-34.5],ha:[6.2,1.2,-14.5],ht:[6.4,.5,-7.4]}
    :{fc:[2.2,5.6,-1.3],fk:[4.8,7.6,3.4],ff:[5.8,.5,5.0],mc:[3.0,5.6,-9.6],mk:[6.4,8.3,-7.3],mf:[8.4,.5,-11.6],hc:[3.6,6.0,-15.6],hk:[5.4,14.6,-41.5],ha:[6.3,1.3,-17.6],ht:[6.5,.5,-9.2]};
  const SV=(a,s)=>new V3(a[0]*s,a[1],a[2]);
  for(const s of[-1,1]){
    /* front and middle legs: femur, tibia, 3-segment tarsus with pads */
    [[LG.fc,LG.fk,LG.ff,.72],[LG.mc,LG.mk,LG.mf,.8]].forEach(([c0,k0,f0,r])=>{const c=SV(c0,s),k=SV(k0,s),f=SV(f0,s);
      const fe=new THREE.Mesh(shapedBody(c.distanceTo(k),r*.75,r,t=>({w:endCap(t,2.5),h:endCap(t,2.5)*(.75+.25*(t+1)/2)}),{n:2.2,cyl:1,ws:20,hs:14}),M.leg);placeAlong(fe,c,k);g.add(fe);
      const ank=f.clone().add(new V3(0,1.1,-.9*Math.sign(f.z-k.z||1)));g.add(segTube([k,k.clone().lerp(ank,.5).add(new V3(0,.3,0)),ank],r*.55,r*.45,M.tib,8));
      const tz=f.z>k.z?1:-1;const t1=ank.clone().add(new V3(s*.1,-.8,tz*1.6)),t2=t1.clone().add(new V3(s*.1,-.2,tz*1.4));g.add(segTube([ank,t1,t2],r*.42,r*.34,M.tib,6));
      const pad=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),M.pad);pad.scale.set(.42,.2,1.1);pad.position.copy(t1).lerp(t2,.5).add(new V3(0,-.32,0));g.add(pad);
      for(const cs of[-1,1]){const cl=new THREE.Mesh(new THREE.ConeGeometry(.12,.7,5),M.spine);cl.position.copy(t2).add(new V3(cs*.2,-.1,tz*.3));cl.rotation.x=tz*1.9;g.add(cl);}});
    /* hind femur: long, laterally flattened, herringbone ridges */
    const hc=SV(LG.hc,s),hk=SV(LG.hk,s),ha=SV(LG.ha,s),ht=SV(LG.ht,s);const FL=hc.distanceTo(hk);
    const fg=shapedBody(FL,hop?1.45:1.55,hop?2.7:3.05,t=>{const u=(1-t)/2;/* 0 base .. 1 knee */return{w:endCap(t,2.6)*(1-.45*u),h:endCap(t,2.6)*(1-.62*Math.pow(u,1.15))*(t>.82?.8:1)};},{n:2.4,cyl:1,ws:40,hs:30});
    const fem=new THREE.Mesh(fg,M.fem);placeAlong(fem,hc,hk,new V3(0,.35,1).normalize());g.add(fem);
    const knee=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),M.dark);knee.scale.set(1.05,1.25,1.25);knee.position.copy(hk);g.add(knee);
    /* tibia with two rows of spines and apical spurs */
    const tib=segTube([hk,hk.clone().lerp(ha,.5).add(new V3(s*.15,0,0)),ha],.62,.48,M.tib,10);g.add(tib);
    for(let row=-1;row<=1;row+=2)for(let i=0;i<(hop?7:10);i++){const u=.28+i*(hop?.095:.07);const p=hk.clone().lerp(ha,u);const sp=new THREE.Mesh(new THREE.ConeGeometry(.17,1.05,6),M.spine);
      sp.position.copy(p).add(new V3(s*(.25+row*.32),-.1,-.42));const dir=new V3(s*row*.35,-.55,-1).normalize();sp.quaternion.setFromUnitVectors(UP,dir);sp.position.addScaledVector(dir,.45);g.add(sp);}
    for(const cs of[-1,1]){const sp=new THREE.Mesh(new THREE.ConeGeometry(.2,1.4,6),M.spine);sp.position.copy(ha).add(new V3(s*cs*.4,-.2,.6));sp.rotation.x=1.6;g.add(sp);}
    const t1=ha.clone().add(new V3(0,-.7,3.2)),t2=t1.clone().add(new V3(0,-.1,2.4)),t3=ht.clone();g.add(segTube([ha,t1],.46,.4,M.tib,8),segTube([t1,t2],.38,.34,M.tib,8),segTube([t2,t3],.32,.28,M.tib,8));
    for(const[a,b]of[[ha,t1],[t1,t2]]){const pad=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),M.pad);pad.scale.set(.46,.2,a.distanceTo(b)*.42);pad.position.copy(a).lerp(b,.5).add(new V3(0,-.36,0));g.add(pad);}
    for(const cs of[-1,1]){const cl=new THREE.Mesh(new THREE.ConeGeometry(.13,.8,5),M.spine);cl.position.copy(t3).add(new V3(cs*.22,-.05,.35));cl.rotation.x=1.9;g.add(cl);}
    if(s>0){P.femur=hc.clone().lerp(hk,.45).add(new V3(1.8,0,0));P.tibia=hk.clone().lerp(ha,.5).add(new V3(.8,0,0));}}
  /* --- forewings folded like a roof over the abdomen, reaching well past the tip --- */
  if(!hop&&M.teg){const NS=48,NW=10,L=53,Wd=7.6,R=5.3,z0=-8.8;
    for(const s of[-1,1]){const pos=[],uv=[],idx=[];for(let i=0;i<=NS;i++){const u=i/NS;const wid=Wd*(.55+.45*Math.sin(Math.min(1,u*2.6)*Math.PI/2))*(u>.86?Math.sqrt(Math.max(0,1-Math.pow((u-.86)/.14,2))):1);
        const yTop=13.9-u*3.3+(s<0?.22:0),z=z0-u*L;
        for(let j=0;j<=NW;j++){const w=j/NW,th=(w*Math.max(wid,.05))/R;pos.push(s*(R*Math.sin(th)+.05),yTop-R*(1-Math.cos(th)),z);uv.push(u,w*wid/Wd);}}
      for(let i=0;i<NS;i++)for(let j=0;j<NW;j++){const a=i*(NW+1)+j,b=a+NW+1;idx.push(a,b,a+1,b,b+1,a+1);}
      const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));tg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));tg.setIndex(idx);tg.computeVertexNormals();
      const w=new THREE.Mesh(tg,M.teg);w.renderOrder=2;g.add(w);}
    P.wing=new V3(4.6,11,-40);}
  else if(hop&&o.bud){/* wing pads at the sides of the thorax, larger each instar, flipped upwards in the last two */const L=3+o.bud*8,Wd=2.2+o.bud*2.6;
    for(const s of[-1,1]){const sh=new THREE.Shape();sh.moveTo(0,0);sh.quadraticCurveTo(Wd*.9,-L*.2,Wd*.6,-L);sh.quadraticCurveTo(Wd*.1,-L*.8,0,0);const pg2=new THREE.ShapeGeometry(sh,8);
      const pad=new THREE.Mesh(pg2,M.pron);pad.material=M.pron;pad.position.set(s*3.9,9.6,-9.5);pad.rotation.set(-Math.PI/2+.35,s>0?Math.PI/2-.15:-Math.PI/2+.15,0);pad.rotation.order='YXZ';pad.rotation.y=s*Math.PI/2;pad.rotation.x=-1.25+o.bud*.4;pad.scale.x=s;g.add(pad);}
    P.bud=new V3(4.4,10,-12);}
  /* --- inside view: gut, flight muscles, developing eggs --- */
  if(!hop&&!o.lay&&o.inside){const IN=xrGroup(new THREE.Group(),'body');const gm=std('#d9a43a',{roughness:.45,emissive:col('#5a3a08'),emissiveIntensity:.5}),mg=std('#b8892e',{roughness:.45,emissive:col('#4a3008'),emissiveIntensity:.4}),mu=std('#d0604e',{roughness:.55,emissive:col('#5a160c'),emissiveIntensity:.45}),eg=phys('#f0dca0',{roughness:.3,clearcoat:.6});
    IN.add(segTube([fc(0,5.2,7.2),fc(0,8.5,4),new V3(0,9,-2),new V3(0,8.8,-9),new V3(0,8.4,-15)],.6,2.0,gm,14));/* foregut and crop */
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;IN.add(segTube([new V3(Math.cos(a)*1.6,8.2+Math.sin(a)*1.6,-15.5),new V3(Math.cos(a)*2.2,8.2+Math.sin(a)*2.2,-12.5)],.55,.25,mg,6));}/* gastric caeca */
    IN.add(segTube([new V3(0,8.2,-15.5),new V3(0,7.6,-24),new V3(0,7,-33)],1.5,1.3,mg,12));/* midgut */
    IN.add(segTube([new V3(0,7,-33),new V3(0,6.6,-42),new V3(0,5.8,-47.5)],.9,.7,gm,10));/* hindgut */
    for(const s of[-1,1])for(let i=0;i<14;i++){const e=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),eg);e.scale.set(.45,.45,1.5);e.position.set(s*(1.3+(i%2)*.5),8.6+(i%3)*.4,-21-i*1.1);g.add(e);IN.add(e);}/* ovarioles with eggs */
    for(const s of[-1,1])for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),mu);m.scale.set(1.2,2.2,2.6);m.position.set(s*1.6,9.8,-10-i*2.4);IN.add(m);}/* flight muscles */
    g.add(IN);P.crop=new V3(0,9,-4);P.midgut=new V3(0,7.6,-21);P.eggs=new V3(1.6,9,-33);P.muscle=new V3(1.6,10.5,-12);}
  g.traverse(n=>{if(n.isMesh||n.isInstancedMesh){n.castShadow=true;n.receiveShadow=true;}});
  const K=len/(hop?52:71);g.scale.setScalar(K);g.userData.P=P;
  const ants=g.children.filter(n=>n.userData.ant);const abd=g.userData.abd;
  g.userData.anim=t=>{ants.forEach(n=>{n.rotation.x=Math.sin(t*1.3+n.userData.ant)*.035;n.rotation.y=Math.sin(t*.9+n.userData.ant*2)*.03;});if(abd)abd.scale.y=1+.018*Math.sin(t*2.1);};
  return g;}
const WL=(g,k)=>{g.updateWorldMatrix(true,false);return g.localToWorld(g.userData.P[k].clone());};
