/* ================= desert locust models ================= */
/* ---- textures ---- */
function sandMaps(seed,base,o={}){
  const S=512,c=cv(S),h=cv(S),g=c.getContext('2d'),k=h.getContext('2d'),ci=g.createImageData(S,S),hi=k.createImageData(S,S),rnd=mulberry(seed),b=new THREE.Color(base);
  const R=b.r*255,G=b.g*255,B=b.b*255;
  for(let i=0;i<S*S;i++){const n=(rnd()-.5)*(o.n||22),j=i*4;ci.data[j]=R+n;ci.data[j+1]=G+n*.92;ci.data[j+2]=B+n*.8;ci.data[j+3]=255;const hv=128+n*1.6;hi.data[j]=hi.data[j+1]=hi.data[j+2]=hv;hi.data[j+3]=255;}
  g.putImageData(ci,0,0);k.putImageData(hi,0,0);
  /* wind ripples */
  if(o.ripple!==false){g.lineWidth=2;k.lineWidth=2;for(let i=0;i<70;i++){const y0=rnd()*S,a=6+rnd()*5,ph=rnd()*6;g.strokeStyle=`rgba(${R*.82|0},${G*.8|0},${B*.74|0},.22)`;k.strokeStyle='rgba(70,70,70,.35)';
    for(const ctx of[g,k]){ctx.beginPath();for(let x=0;x<=S;x+=8){const y=y0+Math.sin(x/38+ph)*a;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}}}
  for(let i=0;i<900;i++){const x=rnd()*S,y=rnd()*S,r=.6+rnd()*1.6,l=rnd()<.5;g.fillStyle=l?`rgba(255,248,228,${.3+rnd()*.3})`:`rgba(${R*.6|0},${G*.55|0},${B*.5|0},${.25+rnd()*.3})`;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
  return{map:ctex(c,{rep:o.rep||[30,30]}),bump:ctex(h,{srgb:false,rep:o.rep||[30,30]})};}
/* locust body skin: base colour + pattern, cylindrical u (0..1 around), v along body (0 rear .. 1 front) */
function skinTex(base,dark,kind,seed){const W=256,H=256,c=cv(W,H),g=c.getContext('2d'),rnd=mulberry(seed);
  g.fillStyle=base;g.fillRect(0,0,W,H);
  /* subtle shading noise */
  for(let i=0;i<1600;i++){g.fillStyle=`rgba(0,0,0,${rnd()*.06})`;g.fillRect(rnd()*W,rnd()*H,2,2);g.fillStyle=`rgba(255,255,255,${rnd()*.06})`;g.fillRect(rnd()*W,rnd()*H,2,2);}
  g.fillStyle=dark;
  if(kind==='speckle'){for(let i=0;i<260;i++){g.globalAlpha=.25+rnd()*.5;g.beginPath();g.ellipse(rnd()*W,rnd()*H,1+rnd()*4,1+rnd()*2.5,rnd()*3,0,7);g.fill();}}
  else if(kind==='black'){g.globalAlpha=.9;g.fillRect(0,0,W,H);g.globalAlpha=1;}
  else if(kind==='blackspots'){/* black body with a few pale spots (3rd instar) */g.globalAlpha=.92;g.fillRect(0,0,W,H);g.fillStyle=base;for(let i=0;i<40;i++){g.globalAlpha=.7;g.beginPath();g.arc(rnd()*W,rnd()*H,2+rnd()*4,0,7);g.fill();}}
  else if(kind==='bands'){/* black and yellow (4th instar): black dorsal half, yellow sides, black segment bars */
    g.globalAlpha=.92;g.fillRect(W*.3,0,W*.4,H);for(let y=0;y<H;y+=H/10){g.fillRect(0,y,W,H/30);}}
  else if(kind==='yspots'){/* bright yellow with black spots (5th instar) */for(let y=8;y<H;y+=H/9)for(let x=6;x<W;x+=W/7){g.globalAlpha=.85;g.beginPath();g.ellipse(x+(rnd()-.5)*10,y+(rnd()-.5)*8,4+rnd()*4,3+rnd()*3,0,0,7);g.fill();}g.globalAlpha=.8;g.fillRect(W*.47,0,W*.06,H);}
  g.globalAlpha=1;
  /* segment lines */g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1.4;for(let y=H*.05;y<H*.7;y+=H/11){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
  return ctex(c);}
/* forewing (tegmen): long narrow, mottled with dark spots, translucent towards the tip */
function tegTex(base,spot,seed){const W=512,H=96,c=cv(W,H),g=c.getContext('2d'),rnd=mulberry(seed);
  const shape=()=>{g.beginPath();g.moveTo(4,H*.42);g.bezierCurveTo(W*.2,H*.12,W*.8,H*.12,W*.985,H*.42);g.bezierCurveTo(W*.99,H*.62,W*.85,H*.86,W*.5,H*.84);g.bezierCurveTo(W*.2,H*.82,W*.06,H*.68,4,H*.42);g.closePath();};
  shape();g.fillStyle=base;g.fill();g.save();shape();g.clip();
  const grd=g.createLinearGradient(0,0,W,0);grd.addColorStop(0,'rgba(0,0,0,0)');grd.addColorStop(1,'rgba(255,255,255,.28)');g.fillStyle=grd;g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(60,45,20,.45)';g.lineWidth=1;for(let i=0;i<9;i++){g.beginPath();g.moveTo(0,H*(.3+i*.05));g.bezierCurveTo(W*.3,H*(.2+i*.06),W*.7,H*(.2+i*.06),W,H*(.38+i*.03));g.stroke();}
  for(let i=0;i<120;i++){const x=rnd()*W,y=rnd()*H;g.strokeStyle='rgba(60,45,20,.25)';g.beginPath();g.moveTo(x,y);g.lineTo(x+4+rnd()*6,y+(rnd()-.5)*8);g.stroke();}
  g.fillStyle=spot;for(let i=0;i<46;i++){g.globalAlpha=.55+rnd()*.35;g.beginPath();g.ellipse(W*(.12+rnd()*.85),H*(.25+rnd()*.5),3+rnd()*7,2+rnd()*4,rnd()*3,0,7);g.fill();}
  g.restore();g.globalAlpha=1;return ctex(c);}
/* hind wing: wide, clear, faint veins */
function hindTex(tint){const W=256,H=256,c=cv(W,H),g=c.getContext('2d');g.beginPath();g.moveTo(4,H/2);g.lineTo(W*.95,H*.12);g.bezierCurveTo(W*1.02,H*.5,W*.98,H*.8,W*.75,H*.98);g.closePath();g.fillStyle=tint;g.fill();
  g.strokeStyle='rgba(80,70,40,.5)';g.lineWidth=1;for(let i=0;i<14;i++){const a=-.55+i*.09;g.beginPath();g.moveTo(4,H/2);g.lineTo(4+Math.cos(a)*W,H/2+Math.sin(a)*W);g.stroke();}return ctex(c);}
function eyeTex(){const c=cv(64,64),g=c.getContext('2d');g.fillStyle='#6b5634';g.fillRect(0,0,64,64);g.fillStyle='rgba(30,22,10,.7)';for(let x=4;x<64;x+=10)g.fillRect(x,0,4,64);return ctex(c);}
const EYE_M=phys('#ffffff',{map:eyeTex(),roughness:.25,clearcoat:.8});

/* palettes per phase/stage */
const PAL={
  adult:{base:'#d9b62c',dark:'#4a3614',kind:'speckle',teg:'#c9ad6a',spot:'#4a3410',hind:'rgba(240,236,200,.55)',leg:'#d6b030'},
  imm:{base:'#c65a3e',dark:'#5a2414',kind:'speckle',teg:'#c99a7c',spot:'#5a2a16',hind:'rgba(240,220,210,.5)',leg:'#c2563a'},
  fledg:{base:'#d9cdb0',dark:'#8a7a5a',kind:'speckle',teg:'#e6dcc6',spot:'#9a8a6a',hind:'rgba(250,250,240,.5)',leg:'#d8ccb0'},
  sol:{base:'#a99a70',dark:'#5b4f33',kind:'speckle',teg:'#b5a682',spot:'#4e4228',hind:'rgba(240,236,220,.5)',leg:'#b0a070'},
  h1:{base:'#2a2622',dark:'#14110e',kind:'black',leg:'#2c2722'},
  h2:{base:'#2a2622',dark:'#14110e',kind:'black',leg:'#2c2722'},
  h3:{base:'#d9c24a',dark:'#191612',kind:'blackspots',leg:'#2a2520'},
  h4:{base:'#e2c43c',dark:'#191612',kind:'bands',leg:'#3a3020'},
  h5:{base:'#f0d02a',dark:'#191612',kind:'yspots',leg:'#e0c030'},
  hsol:{base:'#86b04c',dark:'#4e7a2c',kind:'speckle',leg:'#7aa244'}};
const MATC={};
function locMats(key){if(MATC[key])return MATC[key];const p=PAL[key],s=key.length*7+3;
  const m={body:keep(phys('#ffffff',{map:skinTex(p.base,p.dark,p.kind,s),roughness:.5,clearcoat:.35,clearcoatRoughness:.5})),
    leg:keep(phys(p.leg,{roughness:.5,clearcoat:.3})),dark:keep(std(p.dark,{roughness:.6})),
    teg:p.teg?keep(std('#ffffff',{map:tegTex(p.teg,p.spot,s+1),alphaTest:.4,side:THREE.DoubleSide,roughness:.7})):null,
    hind:p.hind?keep(std('#ffffff',{map:hindTex(p.hind),transparent:true,depthWrite:false,side:THREE.DoubleSide,roughness:.5})):null};
  return MATC[key]=m;}

/* one locust, built along +z (head) on ground y=0, total length 2 units before scaling.
   o.key: palette key; o.hopper: no wings; o.bud: wing-bud size 0..1; o.fly: spread wings; o.lay: abdomen stretched down */
function makeLocust(len,o={}){const key=o.key||'adult',M=locMats(key),hop=!!o.hopper,g=new THREE.Group(),P={};
  const hs=hop?1.25:1;
  /* abdomen: ringed */
  const AL=hop?1.0:1.22,az=hop?-.12:-.25;
  const ab=shapedBody(AL,.14,.12,t=>{const u=(t+1)/2,ring=1-.06*Math.pow(Math.cos(u*10*Math.PI),2);return{w:endCap(t,2.4)*ring*(t<-.4?.8+.35*(t+1):1),h:endCap(t,2.4)*ring};},{n:2.2,cyl:1});
  const abd=new THREE.Mesh(ab,M.body);abd.position.set(0,.26,az);g.add(abd);
  if(o.lay){/* female laying: abdomen bends down into the soil, telescoped */const curve=new THREE.CatmullRomCurve3([new V3(0,.26,az-AL*.2),new V3(0,.2,az-AL*.5),new V3(0,-.2,az-AL*.6),new V3(0,-1.1,az-AL*.62),new V3(0,-2.2,az-AL*.6)]);
    abd.scale.z=.45;abd.position.z=az+AL*.15;const tube=new THREE.Mesh(taperTube(curve,u=>.12*(1-.35*u),40,14),M.body);g.add(tube);P.ovi=new V3(0,-2.2,az-AL*.6);}
  P.abd=new V3(0,.34,az-AL*.3);P.tip=new V3(0,.26,az-AL/2);
  /* thorax + saddle-shaped pronotum */
  const th=new THREE.Mesh(shapedBody(.42,.15,.15,t=>({w:endCap(t,2),h:endCap(t,2)}),{n:2.2,cyl:1}),M.body);th.position.set(0,.3,.42);g.add(th);
  const pr=new THREE.Mesh(shapedBody(.46,.17,.2,t=>({w:endCap(t,3.2)*(1+.12*t),h:endCap(t,3)*(.9+.1*t)}),{n:2.6,top:1.08,bot:.6,cyl:1}),M.body);pr.position.set(0,.33,.5);g.add(pr);
  const ridge=new THREE.Mesh(new THREE.BoxGeometry(.012,.02,.42),M.dark);ridge.position.set(0,.53,.5);g.add(ridge);
  P.pronotum=new V3(0,.55,.5);
  /* head: hypognathous, face down-forward */
  const head=new THREE.Mesh(new THREE.SphereGeometry(.17,28,20),M.body);head.scale.set(.95*hs,1.15*hs,.95*hs);head.position.set(0,.36,.8+(hs-1)*.1);g.add(head);
  const hz=head.position.z;
  for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.07*hs,16,12),EYE_M);e.scale.set(.75,1.15,1);e.position.set(s*.13*hs,.43,hz+.03);e.rotation.y=s*.4;g.add(e);
    /* antennae: short, filiform, forward-up */const ac=new THREE.CatmullRomCurve3([new V3(s*.05,.44,hz+.14),new V3(s*.08,.56,hz+.26),new V3(s*.12,.64,hz+.4),new V3(s*.16,.68,hz+.54)]);
    const an=new THREE.Mesh(taperTube(ac,u=>(hop?.016:.011)*(1-.4*u),20,5),M.dark);an.userData.ant=s;g.add(an);if(s>0)P.antenna=ac.getPoint(.7);
    /* mandibles */const md=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),M.dark);md.scale.set(1,.8,.7);md.position.set(s*.045,.2,hz+.1);g.add(md);
    /* palps */g.add(seg(new V3(s*.06,.22,hz+.1),new V3(s*.09,.12,hz+.16),.012,M.dark));}
  P.eye=new V3(.13*hs,.43,hz+.03);P.mouth=new V3(0,.18,hz+.12);P.head=new V3(0,.4,hz);
  /* legs */
  for(const s of[-1,1]){
    /* front + middle */[[.58,.12,.12],[.36,.14,-.06]].forEach(([z,sp,fz],k)=>{const hip=new V3(s*.08,.2,z),knee=new V3(s*(.2+k*.02),.28,z+.06+(k?-.04:.04)),foot=new V3(s*(.24+k*.04),0,z+fz);g.add(seg(hip,knee,.024,M.leg),seg(knee,foot,.017,M.leg));});
    /* hind leg: big femur with herringbone, spiny tibia */
    const hip=new V3(s*.13,.24,.22),knee=new V3(s*.24,.62,-.5),ankle=new V3(s*.27,.02,-.06),toe=new V3(s*.27,0,.08);
    const fc=new THREE.CatmullRomCurve3([hip,new V3(s*.2,.45,-.12),knee]);const fem=new THREE.Mesh(taperTube(fc,u=>.075*Math.sin(Math.PI*(.15+.75*u))+.018,18,10),M.leg);g.add(fem);
    const fd=new THREE.Mesh(taperTube(fc,u=>.06*Math.sin(Math.PI*(.15+.75*u))+.012,18,8),M.dark);fd.position.x=s*.022;fd.scale.set(1,1,1);g.add(fd);
    g.add(seg(knee,ankle,.019,M.leg),seg(ankle,toe,.014,M.dark));
    for(let i=1;i<7;i++){const p=knee.clone().lerp(ankle,i/7.5);const sp=new THREE.Mesh(new THREE.ConeGeometry(.008,.05,5),M.dark);sp.position.copy(p).add(new V3(0,0,-.015));sp.rotation.x=-.9;g.add(sp);}
    if(s>0){P.femur=new V3(s*.27,.48,-.18);P.knee=knee.clone();}}
  /* wings */
  if(!hop){const tg=new THREE.PlaneGeometry(1.75,.26,12,2);tg.rotateY(Math.PI/2);tg.translate(0,-.13,-.52);
    if(o.fly){for(const s of[-1,1]){const w=new THREE.Mesh(tg,M.teg);w.position.set(s*.08,.5,.32);w.rotation.set(0,0,0);w.rotation.order='YZX';w.rotation.y=s*1.35;w.rotation.z=s*-.1;g.add(w);
        const hw=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.5),M.hind);hw.geometry.rotateX(-Math.PI/2);hw.position.set(s*.75,.5,.0);hw.rotation.y=s>0?Math.PI*.95:-Math.PI*.05;g.add(hw);}}
    else{for(const s of[-1,1]){const w=new THREE.Mesh(tg,M.teg);w.position.set(s*.02,.6,.32);w.rotation.z=s*.62;w.rotation.x=.06;g.add(w);}}
    P.wing=new V3(.14,.5,-.65);}
  else if(o.bud){const bg=new THREE.PlaneGeometry(.12+o.bud*.22,.08+o.bud*.12);for(const s of[-1,1]){const b=new THREE.Mesh(bg,M.body);b.position.set(s*.155,.32,.3);b.rotation.y=s*Math.PI/2;b.rotation.x=.5;b.material=M.body;g.add(b);}P.bud=new V3(.16,.36,.3);}
  g.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});
  g.scale.setScalar(len/2);g.userData.P=P;
  g.userData.anim=t=>{g.children.forEach(n=>{if(n.userData.ant)n.rotation.x=Math.sin(t*1.7+n.userData.ant)*.05;});abd.scale.y=1+.025*Math.sin(t*2.2);};
  return g;}
const WL=(g,k)=>{g.updateWorldMatrix(true,false);return g.localToWorld(g.userData.P[k].clone());};

/* ---- low-poly swarm locust: two frames (wings up / down), merged with vertex colours ---- */
function swarmGeo(up){const parts=[];const add=(geo,c,m)=>{geo=geo.toNonIndexed();geo.applyMatrix4(m);const n=geo.attributes.position.count,cs=new Float32Array(n*3),cc=col(c);for(let i=0;i<n;i++){cs[i*3]=cc.r;cs[i*3+1]=cc.g;cs[i*3+2]=cc.b;}geo.setAttribute('color',new THREE.BufferAttribute(cs,3));geo.deleteAttribute('uv');parts.push(geo);};
  const M4=()=>new THREE.Matrix4();
  add(new THREE.SphereGeometry(.07,6,4),'#c99a2a',M4().compose(new V3(0,0,0),new THREE.Quaternion(),new V3(1,1,6)));
  add(new THREE.SphereGeometry(.08,6,4),'#8a6a24',M4().makeTranslation(0,0,.42));
  for(const s of[-1,1]){const w=new THREE.PlaneGeometry(.55,.16);const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,s*(up?-.55:.35)));add(w,'#d8c79a',M4().compose(new V3(s*.3,up?.12:-.05,.08),q,new V3(1,1,1)));}
  let n=0;parts.forEach(p=>n+=p.attributes.position.count);const pos=new Float32Array(n*3),nor=new Float32Array(n*3),cl=new Float32Array(n*3);let o=0;
  parts.forEach(p=>{pos.set(p.attributes.position.array,o*3);nor.set(p.attributes.normal.array,o*3);cl.set(p.attributes.color.array,o*3);o+=p.attributes.position.count;});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(cl,3));return keep(g);}
const SWM=keep(std('#ffffff',{vertexColors:true,side:THREE.DoubleSide,roughness:.7}));
function makeSwarm(N,parent){const a=new THREE.InstancedMesh(swarmGeo(true),SWM,N),b=new THREE.InstancedMesh(swarmGeo(false),SWM,N);a.frustumCulled=b.frustumCulled=false;parent.add(a,b);
  const S={a,b,N,items:[],m:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(),s:new V3(1,1,1),scale:1};return S;}
function swarmUpdate(S,t,posFn){let na=0,nb=0;const v=new V3(),v2=new V3();
  for(let i=0;i<S.items.length;i++){const it=S.items[i];posFn(it,t,v);posFn(it,t+.05,v2);const d=v2.sub(v);S.e.set(0,Math.atan2(d.x,d.z),0);S.q.setFromEuler(S.e);S.s.setScalar(it.sc||S.scale);S.m.compose(v,S.q,S.s);
    if(((t*14+it.ph*7)|0)%2){S.a.setMatrixAt(na++,S.m);}else S.b.setMatrixAt(nb++,S.m);}
  S.a.count=na;S.b.count=nb;S.a.instanceMatrix.needsUpdate=true;S.b.instanceMatrix.needsUpdate=true;}

/* ---- people, vehicles and props (field scene, 1 unit = 1 m) ---- */
const FM={white:std('#f2f2ee',{roughness:.45,metalness:.1}),green:std('#1b8354',{roughness:.5}),glass:phys('#2a3a44',{roughness:.1,clearcoat:1}),tyre:std('#1e1e1e',{roughness:.9}),rim:std('#b8bcbf',{metalness:.6,roughness:.35}),
  tank:std('#e8e6df',{roughness:.5}),metal:std('#8a9096',{metalness:.6,roughness:.35}),skin:std('#b07a52',{roughness:.7}),suit:std('#f4f4f0',{roughness:.8}),mask:std('#2c3a3e',{roughness:.5}),
  cloth:std('#c8b48a',{roughness:.9}),wood:std('#a07848',{roughness:.85}),hive:std('#e8d9a8',{roughness:.8}),tent:std('#5a4636',{roughness:.95,side:THREE.DoubleSide}),flag:std('#e2322a',{side:THREE.DoubleSide,roughness:.8}),
  orange:std('#f08a1a',{roughness:.6}),wool:std('#efe8da',{roughness:1}),dark:std('#2a2622',{roughness:.8})};
function makePerson(o={}){const g=new THREE.Group(),c=o.ppe?FM.suit:o.cloth||FM.cloth;
  const legM=o.ppe?FM.suit:FM.cloth;for(const s of[-1,1])g.add(seg(new V3(s*.1,0,0),new V3(s*.1,.85,0),.08,legM));
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.19,.16,.7,12),c);torso.position.y=1.2;g.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.13,16,12),FM.skin);head.position.y=1.7;g.add(head);
  if(o.ppe){const hood=new THREE.Mesh(new THREE.SphereGeometry(.15,16,12,0,Math.PI*2,0,Math.PI*.62),FM.suit);hood.position.y=1.71;g.add(hood);const m=new THREE.Mesh(new THREE.BoxGeometry(.16,.1,.08),FM.mask);m.position.set(0,1.64,.12);g.add(m);
    const gl=new THREE.Mesh(new THREE.BoxGeometry(.2,.06,.04),FM.glass);gl.position.set(0,1.74,.12);g.add(gl);}
  else{const sh=new THREE.Mesh(new THREE.SphereGeometry(.15,16,10,0,Math.PI*2,0,Math.PI*.5),std('#f5f3ee'));sh.position.y=1.72;g.add(sh);}
  for(const s of[-1,1]){const arm=seg(new V3(s*.22,1.5,0),new V3(s*.28,1.05,o.reach?.25:0),.06,c);g.add(arm);}
  g.traverse(n=>{if(n.isMesh)n.castShadow=true;});return g;}
function wheel(){const w=new THREE.Group();const t=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.3,22),FM.tyre);t.rotation.z=Math.PI/2;w.add(t);const r=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.32,14),FM.rim);r.rotation.z=Math.PI/2;w.add(r);return w;}
/* pickup 4x4 (faces +z), optional ULV air-blast sprayer in the bed */
function makePickup(sprayer){const g=new THREE.Group();const P={};
  const body=new THREE.Mesh(new THREE.BoxGeometry(1.9,.7,5.2),FM.white);body.position.y=.95;g.add(body);
  const cab=new THREE.Mesh(new THREE.BoxGeometry(1.8,.75,2.1),FM.white);cab.position.set(0,1.65,.75);g.add(cab);
  const ws=new THREE.Mesh(new THREE.BoxGeometry(1.7,.6,.05),FM.glass);ws.position.set(0,1.68,1.82);ws.rotation.x=-.35;g.add(ws);
  for(const s of[-1,1]){const sw=new THREE.Mesh(new THREE.BoxGeometry(.03,.5,1.7),FM.glass);sw.position.set(s*.91,1.7,.75);g.add(sw);
    const st=new THREE.Mesh(new THREE.BoxGeometry(.02,.16,4.6),FM.green);st.position.set(s*.96,1.0,0);g.add(st);}
  const bed=new THREE.Mesh(new THREE.BoxGeometry(1.8,.5,2.1),FM.dark);bed.position.set(0,1.35,-1.5);bed.scale.y=.2;g.add(bed);
  [[.95,1.6],[-.95,1.6],[.95,-1.7],[-.95,-1.7]].forEach(([x,z])=>{const w=wheel();w.position.set(x,.42,z);g.add(w);});
  const lb=new THREE.Mesh(new THREE.BoxGeometry(1.2,.12,.25),FM.orange);lb.position.set(0,2.08,.6);g.add(lb);
  if(sprayer){const tank=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,1.2,18),FM.tank);tank.rotation.x=Math.PI/2;tank.position.set(0,1.75,-1.3);g.add(tank);
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.3,8),FM.metal);mast.position.set(0,2.2,-2.3);g.add(mast);
    const fan=new THREE.Mesh(new THREE.CylinderGeometry(.32,.25,.5,18),FM.metal);fan.rotation.z=Math.PI/2;fan.position.set(.25,2.85,-2.3);g.add(fan);
    const noz=new THREE.Mesh(new THREE.ConeGeometry(.12,.3,12),FM.green);noz.rotation.z=-Math.PI/2;noz.position.set(.6,2.85,-2.3);g.add(noz);P.nozzle=new V3(.75,2.85,-2.3);P.tank=new V3(0,2.2,-1.3);}
  P.cab=new V3(0,2.2,.7);g.traverse(n=>{if(n.isMesh)n.castShadow=true;});g.userData.P=P;return g;}
/* crop-spraying aircraft (faces +z) */
function makePlane(){const g=new THREE.Group();const fus=new THREE.Mesh(shapedBody(8,.55,.6,t=>({w:endCap(t,2)*(t<0?.4+.6*(t+1):1),h:endCap(t,2)*(t<0?.5+.5*(t+1):1)}),{n:2.2}),FM.white);g.add(fus);
  const wing=new THREE.Mesh(new THREE.BoxGeometry(13,.14,1.6),FM.white);wing.position.set(0,-.1,.8);g.add(wing);
  const tail=new THREE.Mesh(new THREE.BoxGeometry(3.6,.1,.9),FM.white);tail.position.set(0,.2,-3.6);g.add(tail);const fin=new THREE.Mesh(new THREE.BoxGeometry(.1,1.3,1),FM.green);fin.position.set(0,.8,-3.6);g.add(fin);
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(13.05,.16,.3),FM.green);stripe.position.set(0,-.1,1.4);g.add(stripe);
  const prop=new THREE.Mesh(new THREE.BoxGeometry(2.2,.12,.05),FM.dark);prop.position.z=4.05;g.add(prop);g.userData.prop=prop;
  const boom=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,11,8),FM.metal);boom.rotation.z=Math.PI/2;boom.position.set(0,-.4,.3);g.add(boom);
  g.traverse(n=>{if(n.isMesh)n.castShadow=true;});return g;}
function makeFlag(h=2.2,mat=FM.flag){const g=new THREE.Group();const p=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,h,6),FM.metal);p.position.y=h/2;g.add(p);const f=new THREE.Mesh(new THREE.PlaneGeometry(.7,.45,6,1),mat);f.position.set(.37,h-.25,0);g.add(f);g.userData.f=f;return g;}
function makeWindsock(){const g=new THREE.Group();const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,4,8),FM.metal);p.position.y=2;g.add(p);
  const sock=new THREE.Group();for(let i=0;i<5;i++){const r=new THREE.Mesh(new THREE.CylinderGeometry(.3-i*.035,.3-(i+1)*.035,.45,14,1,true),i%2?FM.white:FM.orange);r.material.side=THREE.DoubleSide;r.rotation.z=-Math.PI/2;r.position.x=.25+i*.45;sock.add(r);}sock.position.y=3.85;g.add(sock);g.userData.sock=sock;return g;}
function makeHive(){const g=new THREE.Group();for(let i=0;i<2;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.5,.25,.42),FM.hive);b.position.y=.3+i*.26;g.add(b);}const st=new THREE.Mesh(new THREE.BoxGeometry(.55,.18,.47),FM.wood);st.position.y=.09;g.add(st);const lid=new THREE.Mesh(new THREE.BoxGeometry(.56,.05,.48),FM.metal);lid.position.y=.67;g.add(lid);g.traverse(n=>{if(n.isMesh)n.castShadow=true;});return g;}
function makeSheep(){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.SphereGeometry(.35,12,10),FM.wool);b.scale.set(.8,.75,1.25);b.position.y=.6;g.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),FM.dark);h.scale.set(.8,.9,1.3);h.position.set(0,.72,.5);g.add(h);
  for(const[x,z]of[[.15,.25],[-.15,.25],[.15,-.25],[-.15,-.25]])g.add(seg(new V3(x,.4,z),new V3(x,0,z),.04,FM.dark));g.traverse(n=>{if(n.isMesh)n.castShadow=true;});return g;}
function makeTent(){const g=new THREE.Group();const s=new THREE.Shape();s.moveTo(-2.4,0);s.lineTo(-2,1.5);s.lineTo(0,1.9);s.lineTo(2,1.5);s.lineTo(2.4,0);s.lineTo(-2.4,0);
  const m=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:3,bevelEnabled:false}),FM.tent);m.position.z=-1.5;g.add(m);g.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});return g;}
function makeAcacia(seed){const rnd=mulberry(seed),g=new THREE.Group(),bark=std('#5a4632',{roughness:.95}),leaf=std('#5f7a36',{roughness:.9,flatShading:true});
  const h=2.6+rnd()*1.2;g.add(seg(new V3(0,0,0),new V3(.2,h*.6,0),.13,bark));for(let i=0;i<4;i++){const a=i*1.6+rnd(),e=new V3(Math.cos(a)*1.4,h,Math.sin(a)*1.4);g.add(seg(new V3(.2,h*.6,0),e,.07,bark));}
  for(let i=0;i<6;i++){const c=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),leaf);c.scale.set(1.3+rnd(),.32,1.3+rnd());c.position.set((rnd()-.5)*2.4,h+.1+rnd()*.25,(rnd()-.5)*2.4);g.add(c);}
  g.traverse(n=>{if(n.isMesh)n.castShadow=true;});return g;}
/* grass tuft (spec scene, small) */
function tuft(seed,n,h,c){const rnd=mulberry(seed),g=new THREE.Group(),m=std(c,{side:THREE.DoubleSide,roughness:.7});
  for(let i=0;i<n;i++){const a=rnd()*6.28,lean=.2+rnd()*.5,L=h*(.6+rnd()*.5);const cu=new THREE.QuadraticBezierCurve3(new V3(0,0,0),new V3(Math.cos(a)*L*lean*.3,L*.6,Math.sin(a)*L*lean*.3),new V3(Math.cos(a)*L*lean,L,Math.sin(a)*L*lean));
    g.add(new THREE.Mesh(taperTube(cu,u=>.03*h*(1-u*.9),10,4),m));}g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}

/* ================= scenes ================= */
function mkScene(ext){const s=new THREE.Scene();s.environment=ENV;
  s.add(new THREE.HemisphereLight(0xfaf6ee,0x8a7350,ENV?.55:1));
  const sun=new THREE.DirectionalLight(0xfff1dc,ENV?1.6:1);sun.position.set(6,14,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  const c=sun.shadow.camera;c.left=-ext;c.right=ext;c.top=ext;c.bottom=-ext;c.near=1;c.far=80;sun.shadow.bias=-.0005;sun.shadow.normalBias=.02;s.add(sun);s.add(sun.target);s.userData.sun=sun;return s;}
function skyDome(s,R,top,hor,low){const g=new THREE.SphereGeometry(R,40,20),p=g.attributes.position,cs=[],T=col(top),H=col(hor),Lo=col(low);
  for(let i=0;i<p.count;i++){const y=p.getY(i)/R,c=y>=0?H.clone().lerp(T,Math.min(1,Math.pow(y,.55)*1.1)):H.clone().lerp(Lo,Math.min(1,-y*6));cs.push(c.r,c.g,c.b);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false,toneMapped:false}));m.renderOrder=-1;s.add(m);}

/* ---------- specimen scene (1 unit = 2.5 cm): sand block with a cut face showing the egg pod ---------- */
const spec=mkScene(12);
{const g=new THREE.Mesh(new THREE.CircleGeometry(60,64),new THREE.MeshStandardMaterial({color:col('#f3efe6'),roughness:1}));g.rotation.x=-Math.PI/2;g.position.y=-8.05;g.receiveShadow=true;spec.add(g);}
const SAND=sandMaps(31,'#d9bf8c',{rep:[3,3]});
const SB={x:9,z:6,d:8};/* half sizes x,z; depth */
const sandTop=new THREE.Mesh(new THREE.PlaneGeometry(SB.x*2,SB.z*2,60,40),xrMat(new THREE.MeshStandardMaterial({map:SAND.map,bumpMap:SAND.bump,bumpScale:.6,roughness:1,color:col('#f6e6c4')}),.18));
{sandTop.rotation.x=-Math.PI/2;const p=sandTop.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,.08*Math.sin(x*.7)*Math.cos(y*.5));}sandTop.geometry.computeVertexNormals();sandTop.receiveShadow=true;spec.add(sandTop);}
/* cut face texture: moist layers going darker with depth, with the egg pod drawn by the 3D pod itself */
function cutTex(){const W=512,H=256,c=cv(W,H),g=c.getContext('2d'),rnd=mulberry(77);const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#d6b986');gr.addColorStop(.12,'#b8956a');gr.addColorStop(.5,'#9c7a52');gr.addColorStop(1,'#7e6040');g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<5000;i++){g.fillStyle=`rgba(${rnd()<.5?255:40},${rnd()<.5?240:30},${rnd()<.5?220:20},${rnd()*.12})`;g.fillRect(rnd()*W,rnd()*H,2,2);}
  for(let i=0;i<60;i++){g.fillStyle=`rgba(200,190,170,${.3+rnd()*.3})`;g.beginPath();g.ellipse(rnd()*W,H*.2+rnd()*H*.8,2+rnd()*5,1.5+rnd()*3,rnd()*3,0,7);g.fill();}
  g.strokeStyle='rgba(60,40,20,.15)';for(let y=H*.12;y<H;y+=H/7){g.beginPath();g.moveTo(0,y);for(let x=0;x<=W;x+=16)g.lineTo(x,y+Math.sin(x*.03+y)*3);g.stroke();}return ctex(c);}
const CUT_M=xrMat(new THREE.MeshStandardMaterial({map:cutTex(),roughness:1}),.12);
const sideM=xrMat(new THREE.MeshStandardMaterial({map:cutTex(),roughness:1,color:col('#e8dccb')}),.12);
{const f=new THREE.Mesh(new THREE.PlaneGeometry(SB.x*2,SB.d),CUT_M);f.position.set(0,-SB.d/2,SB.z);f.receiveShadow=true;spec.add(f);
  const r=new THREE.Mesh(new THREE.PlaneGeometry(SB.z*2,SB.d),sideM);r.position.set(SB.x,-SB.d/2,0);r.rotation.y=Math.PI/2;spec.add(r);
  const l=r.clone();l.position.x=-SB.x;l.rotation.y=-Math.PI/2;spec.add(l);const b=f.clone();b.material=sideM;b.position.z=-SB.z;b.rotation.y=Math.PI;spec.add(b);}
const SG={};['locust','life','phase'].forEach(k=>{SG[k]=new THREE.Group();spec.add(SG[k]);});
/* depth scale on the cut face: 0, 5, 10, 15 cm */
function textSprite(txt,o={}){const fs=o.fs||44,c=cv(512,96),g=c.getContext('2d');g.font=`600 ${fs}px "IBM Plex Sans Arabic",Tahoma,sans-serif`;const w=Math.min(500,g.measureText(txt).width+28);
  if(o.bg!==false){g.fillStyle=o.bg||'rgba(255,255,255,.92)';const r=22;g.beginPath();g.roundRect?g.roundRect(256-w/2,48-30,w,60,r):g.rect(256-w/2,18,w,60);g.fill();}
  g.fillStyle=o.color||'#111927';g.textAlign='center';g.textBaseline='middle';g.direction='rtl';g.fillText(txt,256,50);
  const t=ctex(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:o.depthTest??true,transparent:true}));const sc=o.scale||1;s.scale.set(sc*5.3,sc*1,1);s.renderOrder=o.order||5;return s;}
const DEPTH=new THREE.Group();{const lm=new THREE.MeshBasicMaterial({color:0xffffff});for(let cm=0;cm<=15;cm+=5){const y=-cm/2.5;const tick=new THREE.Mesh(new THREE.BoxGeometry(.6,.04,.02),lm);tick.position.set(-SB.x+.5,y,SB.z+.03);DEPTH.add(tick);
    const t=textSprite(cm+' سم',{scale:.32,bg:'rgba(17,25,39,.72)',color:'#fff'});t.position.set(-SB.x+1.6,y,SB.z+.08);DEPTH.add(t);}
  const bar=new THREE.Mesh(new THREE.BoxGeometry(.05,6,.02),lm);bar.position.set(-SB.x+.2,-3,SB.z+.03);DEPTH.add(bar);SG.life.add(DEPTH);}
/* egg pod: curved column of rice-like eggs in a froth plug, 12–15 cm deep */
function makePod(){const g=new THREE.Group();const em=phys('#e3c98e',{roughness:.35,clearcoat:.6}),fm=xrMat(std('#efe6d0',{roughness:1,transparent:true,opacity:.85}),.3);
  const rnd=mulberry(4);const L=2.4;/* pod length ~6 cm */
  const pod=new THREE.Group(),EGG_G=new THREE.SphereGeometry(.065,10,8);for(let i=0;i<70;i++){const k=i/70,ring=(i%7)/7*Math.PI*2,y=-3.6-k*L*.95,r=.13;const e=new THREE.Mesh(EGG_G,em);e.scale.set(1,2.6,1);e.position.set(Math.cos(ring)*r,y,Math.sin(ring)*r);e.rotation.set((rnd()-.5)*.6,0,(rnd()-.5)*.6+Math.cos(ring)*.4);pod.add(e);}
  const sheath=new THREE.Mesh(new THREE.CylinderGeometry(.24,.22,L,16,1,true),xrMat(std('#c2a26e',{roughness:1,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}),.2));sheath.position.y=-3.6-L/2;pod.add(sheath);
  const froth=new THREE.Mesh(new THREE.CylinderGeometry(.2,.24,3.5,14),fm);froth.position.y=-1.75;pod.add(froth);
  g.add(pod);g.traverse(n=>{if(n.isMesh)n.castShadow=true;});g.userData.P={eggs:new V3(.2,-4.8,0),froth:new V3(.2,-1.2,0)};return g;}
const POD=makePod();POD.position.set(-4.2,0,SB.z+.02);SG.life.add(POD);
/* more pods visible only with the inside view (an egg field) */
const PODS=xrGroup(new THREE.Group());{const rnd=mulberry(9);for(let i=0;i<9;i++){const p=makePod();p.position.set(-7.5+rnd()*15,0,-4.5+rnd()*8);p.rotation.y=rnd()*6;p.scale.setScalar(.95+rnd()*.1);PODS.add(p);}spec.add(PODS);}
/* female laying (abdomen down into the pod) */
const LAYER=makeLocust(2.8,{key:'adult',lay:true});LAYER.position.set(-4.2,0,SB.z-1.3);LAYER.rotation.y=Math.PI;SG.life.add(LAYER);
/* hopper instars 1–5 in a line (real lengths ~0.8 to 4.2 cm) */
const HOPS=[];[[.32,'h1',0],[.5,'h2',0],[.74,'h3',.25],[1.1,'h4',.55],[1.66,'h5',1]].forEach(([L,k,b],i)=>{const h=makeLocust(L,{key:k,hopper:true,bud:b});h.position.set(-1.8+i*1.45+i*i*.1,0,2.4);h.rotation.y=-Math.PI/2-.35;SG.life.add(h);HOPS.push(h);});
const FLEDG=makeLocust(2.6,{key:'imm'});FLEDG.position.set(6.9,0,-1.2);FLEDG.rotation.y=-2.3;SG.life.add(FLEDG);
const MATURE=makeLocust(2.8,{key:'adult'});MATURE.position.set(3.2,0,-3.4);MATURE.rotation.y=-.9;SG.life.add(MATURE);
/* hero specimen for "the locust" tab */
const HERO=makeLocust(5.2,{key:'adult'});HERO.position.set(0,0,0);HERO.rotation.y=1.25;SG.locust.add(HERO);
[[3.6,2.2,1],[-3.8,-1.8,2],[5.5,-3,3],[-6,3,4]].forEach(([x,z,s])=>{const t=tuft(s,12,1.6,'#7c9a3e');t.position.set(x,0,z);SG.locust.add(t);});
[[7.2,0,5],[-7.5,1,6],[2,-4.5,7],[-2,4.6,8]].forEach(([x,z,s])=>{const t=tuft(s,9,1.2,'#8aa448');t.position.set(x,0,z);SG.life.add(t);});
/* phase: a lone solitary adult + green hopper vs a gregarious hopper band */
const SOL=makeLocust(2.8,{key:'sol'});SOL.position.set(-4.5,0,-1.5);SOL.rotation.y=-.6;SG.phase.add(SOL);
const SOLH=makeLocust(1.5,{key:'hsol',hopper:true,bud:.8});SOLH.position.set(-6.2,0,2.6);SOLH.rotation.y=.6;SG.phase.add(SOLH);
const GREG=makeLocust(2.8,{key:'adult'});GREG.position.set(4.4,0,-2.6);GREG.rotation.y=-2.4;SG.phase.add(GREG);
const BAND=new THREE.Group();SG.phase.add(BAND);const BANDI=[];{const rnd=mulberry(21);for(let i=0;i<46;i++){const k=['h4','h5','h5','h4','h3'][i%5],L=k==='h3'?.74:k==='h4'?1.1:1.5;const h=makeLocust(L,{key:k,hopper:true,bud:k==='h5'?1:k==='h4'?.55:.25});
  const x=1+rnd()*7,z=-.5+rnd()*5.2;h.position.set(x,0,z);h.rotation.y=Math.PI/2+.5+(rnd()-.5)*.5;h.userData.x0=x;h.userData.sp=.15+rnd()*.1;BAND.add(h);BANDI.push(h);}}
[[-7,-3.5,11],[-2.2,3.5,12],[7.6,3.6,13]].forEach(([x,z,s])=>{const t=tuft(s,10,1.3,'#7c9a3e');t.position.set(x,0,z);SG.phase.add(t);});

/* ---------- field scene (1 unit = 1 m): desert after rain ---------- */
const field=mkScene(70);field.fog=new THREE.Fog(0xf1e6d2,120,520);
skyDome(field,700,'#8cb8de','#f3e7d2','#d8c29a');
const DSAND=sandMaps(5,'#dcc394',{rep:[90,90],n:18});
const groundG=new THREE.PlaneGeometry(1200,1200,160,160);groundG.rotateX(-Math.PI/2);
const DUNE=(x,z)=>{const r=Math.hypot(x,z),k=Math.min(1,Math.max(0,(r-140)/160));return k*(9*Math.sin(x*.012+1)*Math.cos(z*.009)+5*Math.sin(x*.03+z*.02))*1+(r>140?k*6:0);};
{const p=groundG.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,DUNE(p.getX(i),p.getZ(i)));groundG.computeVertexNormals();}
const fGround=new THREE.Mesh(groundG,new THREE.MeshStandardMaterial({map:DSAND.map,bumpMap:DSAND.bump,bumpScale:.5,roughness:1,color:col('#f7e8c8'),envMapIntensity:.5}));fGround.receiveShadow=true;field.add(fGround);
/* green desert vegetation after rain: instanced shrubs */
const VEG=new THREE.Group();field.add(VEG);
{const N=520,geo=new THREE.IcosahedronGeometry(1,1),m=std('#6f8f3a',{roughness:.9,flatShading:true}),im=new THREE.InstancedMesh(geo,m,N),M4=new THREE.Matrix4(),rnd=mulberry(3),q=new THREE.Quaternion(),c=new THREE.Color();
  let n=0;for(let i=0;i<N;i++){const a=rnd()*6.28,r=Math.sqrt(rnd())*130,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.hypot(x,z+0)<4)continue;const s=.25+rnd()*.7;M4.compose(new V3(x,s*.35,z),q,new V3(s*1.3,s*.7,s*1.3));im.setMatrixAt(n,M4);im.setColorAt(n,c.copy(col(['#6f8f3a','#7f9c44','#5d7c30','#8fa64e'][i%4])));n++;}
  im.count=n;im.castShadow=true;im.receiveShadow=true;VEG.add(im);}
[[-38,-30,1],[46,-42,2],[-60,40,3],[70,26,4],[12,-80,5],[-90,-6,6]].forEach(([x,z,s])=>{const a=makeAcacia(s);a.position.set(x,0,z);field.add(a);});
/* moist (darker) soil patch where rain fell */
{const c=cv(256),g=c.getContext('2d'),gr=g.createRadialGradient(128,128,10,128,128,128);gr.addColorStop(0,'rgba(120,90,55,.55)');gr.addColorStop(1,'rgba(120,90,55,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);
  const wet=new THREE.Mesh(new THREE.PlaneGeometry(90,70),new THREE.MeshStandardMaterial({map:ctex(c),transparent:true,depthWrite:false,roughness:.9}));wet.rotation.x=-Math.PI/2;wet.position.set(-12,.03,6);wet.receiveShadow=true;field.add(wet);}
const PG={};['damage','survey','control'].forEach(k=>{PG[k]=new THREE.Group();PG[k].visible=false;field.add(PG[k]);});
const AP={};
/* -- damage: a centre-pivot alfalfa field with a swarm -- */
const FARM=new V3(0,0,-150);
{const c=cv(512),g=c.getContext('2d'),rnd=mulberry(41);g.fillStyle='#5e8f34';g.fillRect(0,0,512,512);for(let i=0;i<9000;i++){g.fillStyle=`rgba(${60+rnd()*60|0},${110+rnd()*70|0},${30+rnd()*40|0},.5)`;g.fillRect(rnd()*512,rnd()*512,3,3);}
  for(let r=20;r<256;r+=9){g.strokeStyle='rgba(40,70,20,.25)';g.lineWidth=2;g.beginPath();g.arc(256,256,r,0,7);g.stroke();}
  /* eaten sector: brown, stripped */g.fillStyle='rgba(170,140,90,.92)';g.beginPath();g.moveTo(256,256);g.arc(256,256,256,-.3,1.25);g.closePath();g.fill();for(let i=0;i<2500;i++){const a=-.3+rnd()*1.55,r=rnd()*250;g.fillStyle=`rgba(${120+rnd()*40|0},${100+rnd()*40|0},60,.6)`;g.fillRect(256+Math.cos(a)*r,256+Math.sin(a)*r,3,3);}
  const disc=new THREE.Mesh(new THREE.CircleGeometry(60,96),new THREE.MeshStandardMaterial({map:ctex(c),roughness:.95}));disc.rotation.x=-Math.PI/2;disc.position.copy(FARM).setY(.06);disc.receiveShadow=true;PG.damage.add(disc);
  /* crop height: instanced tufts on the green part */const N=2200,geo=new THREE.ConeGeometry(.35,.7,5),im=new THREE.InstancedMesh(geo,std('#5f9436',{roughness:.9,flatShading:true}),N),M4=new THREE.Matrix4(),q=new THREE.Quaternion();let n=0;
  for(let i=0;i<N*3&&n<N;i++){const a=rnd()*6.28,r=Math.sqrt(rnd())*58;let ang=Math.atan2(Math.sin(a),Math.cos(a));if(ang>-.3&&ang<1.25)continue;/* texture y flips: keep eaten sector bare */const s=.8+rnd()*.6;M4.compose(new V3(FARM.x+Math.cos(a)*r,.3*s,FARM.z+Math.sin(a)*r),q,new V3(s,s,s));im.setMatrixAt(n++,M4);}
  im.count=n;im.receiveShadow=true;PG.damage.add(im);
  /* pivot arm */const arm=new THREE.Group();const pv=new THREE.Mesh(new THREE.CylinderGeometry(.4,.6,4,10),FM.metal);pv.position.y=2;arm.add(pv);
  for(let i=0;i<5;i++){const tw=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,3.4,6),FM.metal);tw.position.set(12*(i+1),1.7,0);arm.add(tw);const wh=wheel();wh.scale.setScalar(1.3);wh.position.set(12*(i+1),.5,0);arm.add(wh);}
  const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,60,8),FM.metal);pipe.rotation.z=Math.PI/2;pipe.position.set(30,3.4,0);arm.add(pipe);arm.position.copy(FARM);arm.rotation.y=2.2;PG.damage.add(arm);
  arm.traverse(n2=>{if(n2.isMesh)n2.castShadow=true;});}
AP.farm=FARM.clone().add(new V3(-28,1,-14));AP.eaten=FARM.clone().add(new V3(26,1,16));
const SWARM=makeSwarm(1400,PG.damage);SWARM.scale=1.6;{const rnd=mulberry(55);for(let i=0;i<1400;i++)SWARM.items.push({ph:rnd(),r:8+rnd()*42,a0:rnd()*6.28,h:2+rnd()*16,sp:.25+rnd()*.25,w:rnd()*6});}
const SW_C=FARM.clone().add(new V3(18,0,-6));
const swarmPos=(it,t,v)=>{const a=it.a0+t*it.sp*(it.r<25?1:-.7);v.set(SW_C.x+Math.cos(a)*it.r+Math.sin(t*.7+it.w)*3,it.h+Math.sin(t*1.3+it.w)*1.2,SW_C.z+Math.sin(a)*it.r*.7);return v;};
AP.swarm=SW_C.clone().add(new V3(0,12,0));
/* landed locusts on the crop edge */
{const N=600,im=new THREE.InstancedMesh(swarmGeo(false),SWM,N),M4=new THREE.Matrix4(),q=new THREE.Quaternion(),rnd=mulberry(66),e=new THREE.Euler();for(let i=0;i<N;i++){const a=-.35+rnd()*.2+(rnd()<.5?0:1.6),r=10+rnd()*48;q.setFromEuler(e.set(0,rnd()*6.28,0));M4.compose(new V3(FARM.x+Math.cos(a)*r,.75,FARM.z+Math.sin(a)*r),q,new V3(1.4,1.4,1.4));im.setMatrixAt(i,M4);}PG.damage.add(im);}
/* "1 km²" frame is too big to draw; a 100 m reference square instead */
/* -- survey: walking transect, vehicle route, reports from herders and beekeepers -- */
const WALKER=makePerson({reach:true});WALKER.position.set(-6,0,10);WALKER.rotation.y=-Math.PI/2;PG.survey.add(WALKER);
const SURVEY_CAR=makePickup(false);SURVEY_CAR.position.set(14,0,-6);SURVEY_CAR.rotation.y=Math.PI/2;PG.survey.add(SURVEY_CAR);
{/* tablet in hand */const tb=new THREE.Mesh(new THREE.BoxGeometry(.25,.02,.18),FM.dark);tb.position.set(.05,1.05,.28);WALKER.add(tb);}
function dashLine(a,b,c,w=.18,dash=2){const g=new THREE.Group(),d=new V3().subVectors(b,a),L=d.length(),n=Math.floor(L/(dash*2)),m=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.9});
  for(let i=0;i<n;i++){const p0=a.clone().add(d.clone().multiplyScalar(i*dash*2/L)),p1=a.clone().add(d.clone().multiplyScalar((i*dash*2+dash)/L));const s=new THREE.Mesh(new THREE.BoxGeometry(w,.03,1),m);s.position.copy(p0).add(p1).multiplyScalar(.5);s.scale.z=dash;s.lookAt(p1);g.add(s);}return g;}
/* walking transect ~300 m upwind (wind blows towards +x here), 1–4 m band each side */
PG.survey.add(dashLine(new V3(-6,.05,10),new V3(-120,.05,10),0x1b8354,.25,2));
{const band=new THREE.Mesh(new THREE.PlaneGeometry(110,6),new THREE.MeshBasicMaterial({color:0x1b8354,transparent:true,opacity:.12,depthWrite:false}));band.rotation.x=-Math.PI/2;band.position.set(-62,.04,10);PG.survey.add(band);}
PG.survey.add(dashLine(new V3(14,.05,-6),new V3(-160,.05,-6),0x2a6fd6,.3,3));
/* flushed locusts in front of the walker */
const FLUSH=makeSwarm(40,PG.survey);FLUSH.scale=.9;{const rnd=mulberry(77);for(let i=0;i<40;i++)FLUSH.items.push({ph:rnd(),x:-9-rnd()*8,z:10+(rnd()-.5)*7,w:rnd()*6,h:.5+rnd()*1.8});}
const flushPos=(it,t,v)=>v.set(it.x+Math.sin(t*.9+it.w)*1.5,it.h+Math.abs(Math.sin(t*2+it.w))*.8,it.z+Math.cos(t*.7+it.w)*1.5);
/* herders, beekeepers: the people who report sightings */
const CAMP=new V3(30,0,26);{const t=makeTent();t.position.copy(CAMP);t.rotation.y=-.6;PG.survey.add(t);for(let i=0;i<6;i++){const s=makeSheep();s.position.set(CAMP.x-6+i*1.4,0,CAMP.z+5+(i%2)*1.2);s.rotation.y=i;PG.survey.add(s);}
  for(let i=0;i<5;i++){const h=makeHive();h.position.set(CAMP.x+6+i*.9,0,CAMP.z-4+(i%2)*.5);PG.survey.add(h);}const pr=makePerson({});pr.position.set(CAMP.x-2,0,CAMP.z+2.5);pr.rotation.y=2.6;PG.survey.add(pr);}
/* rain cloud in the distance */
const CLOUD=new THREE.Group();{const cm=std('#c9ced6',{roughness:1}),rnd=mulberry(91);for(let i=0;i<14;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),cm);s.scale.setScalar(6+rnd()*6);s.position.set((rnd()-.5)*36,(rnd()-.5)*5,(rnd()-.5)*14);CLOUD.add(s);}
  const rain=new THREE.Mesh(new THREE.CylinderGeometry(16,20,38,20,1,true),new THREE.MeshBasicMaterial({color:0x9aa8b8,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false}));rain.position.y=-20;CLOUD.add(rain);CLOUD.position.set(-140,40,-90);PG.survey.add(CLOUD);}
AP.walker=new V3(-6,1.8,10);AP.car=new V3(14,2.3,-6);AP.camp=CAMP.clone().add(new V3(0,2.4,0));AP.veg=new V3(-30,.8,-18);AP.tablet=new V3(-6,1.2,10.3);AP.rain=new V3(-140,30,-90);
/* -- control: ULV sprayer across the wind, track spacing flags, bystanders upwind -- */
const WIND_DIR=new V3(1,0,0);/* wind blows towards +x */
const CTRL={machine:1,spacing:[10,30,100],rate:['15 هكتار/يوم','100 هكتار/يوم','5000 هكتار/يوم']};
const SPRAY_CAR=makePickup(true);SPRAY_CAR.rotation.y=0;PG.control.add(SPRAY_CAR);
const SPRAY_MAN=makePerson({ppe:true,reach:true});PG.control.add(SPRAY_MAN);{const lance=seg(new V3(.28,1.05,.25),new V3(.5,1.6,1.6),.025,FM.metal);SPRAY_MAN.add(lance);const disc=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.04,16),FM.green);disc.position.set(.5,1.62,1.62);disc.rotation.x=1.2;SPRAY_MAN.add(disc);SPRAY_MAN.userData.noz=new V3(.5,1.62,1.62);}
const PLANE=makePlane();PG.control.add(PLANE);
const FLAGS=new THREE.Group();PG.control.add(FLAGS);
const WSOCK=makeWindsock();PG.control.add(WSOCK);
/* hopper band target on the ground */
const TARGET=new THREE.Group();PG.control.add(TARGET);
/* bystanders and spare vehicle waiting at the upwind edge */
const BYST=new THREE.Group();PG.control.add(BYST);{const car=makePickup(false);car.rotation.y=Math.PI/2;BYST.add(car);for(let i=0;i<2;i++){const p=makePerson({ppe:i===0});p.position.set(2.5,0,-2+i*1.6);p.rotation.y=Math.PI/2;BYST.add(p);}}
/* wind arrow */
const WARROW=new THREE.Group();{const m=new THREE.MeshStandardMaterial({color:col('#2a6fd6'),transparent:true,opacity:.75,roughness:.5});const sh=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,12,12),m);sh.rotation.z=-Math.PI/2;WARROW.add(sh);const hd=new THREE.Mesh(new THREE.ConeGeometry(1.3,3,16),m);hd.rotation.z=-Math.PI/2;hd.position.x=7.5;WARROW.add(hd);
  const t=textSprite('اتجاه الرياح',{scale:1.4,bg:'rgba(42,111,214,.9)',color:'#fff'});t.position.set(0,2.4,0);WARROW.add(t);PG.control.add(WARROW);}
/* ULV droplets drifting downwind */
const DROPS=(()=>{const N=900,g=new THREE.BufferGeometry(),p=new Float32Array(N*3),seed=new Float32Array(N);const rnd=mulberry(13);for(let i=0;i<N;i++){seed[i]=rnd();}g.setAttribute('position',new THREE.BufferAttribute(p,3));
  const c=cv(64),x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
  const pts=new THREE.Points(g,new THREE.PointsMaterial({size:.9,map:ctex(c),transparent:true,depthWrite:false,color:0xdfe9f2,opacity:.75}));pts.frustumCulled=false;PG.control.add(pts);return{pts,seed,N};})();
function layoutControl(){const k=CTRL.machine,sp=CTRL.spacing[k],n=4,W=sp*(n-1);/* tracks at x = +W/2 (downwind edge) ... -W/2 (upwind edge) */
  while(FLAGS.children.length)FLAGS.remove(FLAGS.children[0]);
  const L=k===2?320:k===1?90:28;CTRL.L=L;CTRL.tracks=[];
  for(let i=0;i<n;i++){const x=W/2-i*sp;CTRL.tracks.push(x);for(const z of[-L/2,L/2]){const f=makeFlag(k===2?6:k===1?2.6:1.8);f.scale.setScalar(k===2?3:1);f.position.set(x,0,z);FLAGS.add(f);}
    const ln=dashLine(new V3(x,.06,-L/2),new V3(x,.06,L/2),i===1?0xe2322a:0xffffff,k===2?1.2:.2,k===2?8:1.5);FLAGS.add(ln);}
  /* extra upwind pass */const xe=-W/2-sp;CTRL.extra=xe;FLAGS.add(dashLine(new V3(xe,.06,-L/2),new V3(xe,.06,L/2),0xf7d54d,k===2?1.2:.2,k===2?8:1.5));
  while(TARGET.children.length)TARGET.remove(TARGET.children[0]);
  {const c=cv(256),g=c.getContext('2d'),rnd=mulberry(5);for(let i=0;i<2600;i++){const x=rnd()*256,y=rnd()*256,d=Math.hypot(x-128,y-128)/128;if(d>1||rnd()<d*d)continue;g.fillStyle=rnd()<.5?'rgba(25,20,14,.85)':'rgba(220,190,50,.85)';g.fillRect(x,y,2,1.4);}
    const tw=W*.9+sp*.6,tl=L*.8;const t=new THREE.Mesh(new THREE.PlaneGeometry(tw,tl),new THREE.MeshBasicMaterial({map:ctex(c),transparent:true,depthWrite:false}));t.rotation.x=-Math.PI/2;t.position.set(0,.05,0);TARGET.add(t);}
  const cur=CTRL.tracks[1];SPRAY_CAR.visible=k===1;SPRAY_MAN.visible=k===0;PLANE.visible=k===2;
  SPRAY_CAR.position.set(cur,0,-L*.1);SPRAY_MAN.position.set(cur,0,-L*.1);
  BYST.position.set(-W/2-sp-(k===2?60:k===1?18:8),0,-L*.25);BYST.scale.setScalar(1);
  WSOCK.position.set(-W/2-sp*.6,0,L/2+(k===2?10:4));WSOCK.scale.setScalar(k===2?4:1);
  WARROW.position.set(-W/2-sp*.2,k===2?30:6,L/2+(k===2?40:10));WARROW.scale.setScalar(k===2?4:k===0?.45:1);
  AP.tracks=new V3(W/2,.5,L/2);AP.extra=new V3(xe,.5,L/2*.6);AP.byst=BYST.position.clone().add(new V3(0,2,0));AP.wind=WARROW.position.clone();
  AP.machine=k===1?SPRAY_CAR.position.clone().add(new V3(0,2.6,-1.5)):k===0?SPRAY_MAN.position.clone().add(new V3(0,1.6,0)):new V3(cur,30,0);
  AP.drift=new V3(cur+sp*.5,1,0);AP.ppe=k===0?SPRAY_MAN.position.clone().add(new V3(0,1.7,0)):BYST.position.clone().add(new V3(2.5,1.7,-2));}
layoutControl();

/* ---------- map scene: Saudi Arabia, winter and spring breeding areas ---------- */
const mapS=mkScene(30);skyDome(mapS,300,'#e9f1f6','#f6f3ec','#e7e2d6');
const LL=(lon,lat)=>new V3((lon-45)*1.2,0,-(lat-24)*1.2);
const KSA=[[34.95,29.36],[36.07,29.19],[36.75,29.87],[37.65,30.33],[37.0,31.5],[39.2,32.15],[40.4,31.95],[42.0,31.1],[44.7,29.2],[46.55,29.1],[47.7,28.53],[48.43,28.55],[48.8,27.7],[49.6,27.0],[50.1,26.4],[50.2,25.7],[50.8,24.75],[51.6,24.25],[52.6,22.94],[55.2,22.7],[55.67,22.0],[55.0,20.0],[52.0,19.0],[49.1,18.6],[48.2,18.17],[47.0,16.95],[46.4,17.2],[45.4,17.33],[44.0,17.4],[43.3,17.55],[43.0,16.9],[42.8,16.4],[42.55,16.9],[41.8,17.8],[41.2,18.6],[40.6,19.6],[39.6,20.8],[39.17,21.5],[38.9,22.3],[38.45,23.2],[38.06,24.09],[37.3,25.2],[36.6,25.9],[36.0,26.9],[35.7,27.35],[35.15,28.05],[34.6,28.1],[34.8,28.8]];
{const sh=new THREE.Shape();KSA.forEach(([lo,la],i)=>{const p=LL(lo,la);i?sh.lineTo(p.x,-p.z):sh.moveTo(p.x,-p.z);});
  const geo=new THREE.ExtrudeGeometry(sh,{depth:.6,bevelEnabled:true,bevelThickness:.12,bevelSize:.12,bevelSegments:2});geo.rotateX(-Math.PI/2);
  const MS=sandMaps(8,'#e6cfa0',{rep:[.08,.08],n:14,ripple:false});const land=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:MS.map,bumpMap:MS.bump,bumpScale:.3,roughness:1,color:col('#f3dfb6')}));land.castShadow=true;land.receiveShadow=true;mapS.add(land);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(80,60),new THREE.MeshStandardMaterial({color:col('#a9cfe0'),roughness:.4}));sea.rotation.x=-Math.PI/2;sea.position.y=-.2;sea.receiveShadow=true;mapS.add(sea);
  /* neighbours as flat pale land (rough) */const nb=new THREE.Mesh(new THREE.PlaneGeometry(80,60),new THREE.MeshStandardMaterial({color:col('#ece6da'),roughness:1}));}
const MAPG={winter:new THREE.Group(),spring:new THREE.Group(),arrows:new THREE.Group()};Object.values(MAPG).forEach(g=>mapS.add(g));
const REG={
 winter:[['جازان',42.55,16.89],['عسير',42.5,18.22],['الباحة',41.47,20.0],['مكة المكرمة',39.83,21.42],['المدينة المنورة',39.6,24.47],['تبوك',36.57,28.38]],
 spring:[['الجوف',40.2,29.97],['حائل',41.69,27.52],['القصيم',43.97,26.33],['الرياض',46.72,24.71],['الشرقية',49.6,26.0]]};
function zoneBlob(list,c){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:col(c),transparent:true,opacity:.5,roughness:.8,depthWrite:false});
  const pts=list.map(([n,lo,la])=>LL(lo,la).setY(.78));if(pts.length>1){const cu=new THREE.CatmullRomCurve3(pts);const tb=new THREE.Mesh(new THREE.TubeGeometry(cu,60,1.25,10,false),m);tb.scale.y=.08;tb.position.y=.72;g.add(tb);}
  pts.forEach(p=>{const d=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,.05,28),m);d.position.copy(p);g.add(d);});
  list.forEach(([n,lo,la])=>{const p=LL(lo,la);const pin=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.9,18),std(c,{roughness:.6,emissive:col(c),emissiveIntensity:.25}));pin.position.copy(p).setY(1.2);pin.castShadow=true;pin.userData.pin=1;g.add(pin);const t=textSprite(n,{scale:.85,depthTest:false,order:10});t.position.copy(p).setY(2.6);g.add(t);});return g;}
MAPG.winter.add(zoneBlob(REG.winter,'#2a8fbf'));MAPG.spring.add(zoneBlob(REG.spring,'#5aa83c'));
function flatTube(pts,c){const cu=new THREE.CatmullRomCurve3(pts);const m=new THREE.Mesh(taperTube(cu,u=>.22*(1-.4*u),40,8),std(c,{roughness:.5}));const hd=new THREE.Mesh(new THREE.ConeGeometry(.5,1.2,14),std(c,{roughness:.5}));const e=cu.getPoint(1),d=cu.getTangent(1);hd.position.copy(e);hd.quaternion.setFromUnitVectors(UP,d);const g=new THREE.Group();g.add(m,hd);return g;}
/* winter coast -> north / north-east (spring areas); spring -> neighbouring countries when it dries */
MAPG.arrows.add(flatTube([LL(41.0,20.5).setY(1.4),LL(41.6,23.5).setY(3),LL(42.3,26.6).setY(1.6)],'#d97a1a'));
MAPG.arrows.add(flatTube([LL(38.4,26.5).setY(1.4),LL(39.0,28.4).setY(3),LL(40.0,29.4).setY(1.6)],'#d97a1a'));
const OUTA=new THREE.Group();MAPG.arrows.add(OUTA);
OUTA.add(flatTube([LL(46.6,26.6).setY(1.4),LL(47.6,28.4).setY(3),LL(48.4,29.8).setY(1.4)],'#8a5ad6'));OUTA.add(flatTube([LL(41.0,30.4).setY(1.4),LL(41.5,31.6).setY(3),LL(42.3,32.6).setY(1.4)],'#8a5ad6'));
{const t=textSprite('البحر الأحمر',{scale:.6,bg:false,color:'#2a6f96'});t.position.copy(LL(37.6,22.6)).setY(.6);mapS.add(t);const t2=textSprite('الخليج العربي',{scale:.6,bg:false,color:'#2a6f96'});t2.position.copy(LL(51.6,27.4)).setY(.6);mapS.add(t2);}
const MAPP={winter:LL(40.2,21.8).setY(1.2),spring:LL(43.5,26.8).setY(1.2),arrows:LL(41.6,23.5).setY(3),out:LL(47.6,28.4).setY(3),jazan:LL(42.55,16.89).setY(1),tabuk:LL(36.57,28.38).setY(1),riyadh:LL(46.72,24.71).setY(1),jouf:LL(40.2,29.97).setY(1)};
