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

/* ---- low-poly swarm locust: two frames (wings up / down), merged with vertex colours ---- */
function swarmGeo(up){const parts=[];const add=(geo,c,m)=>{geo=geo.toNonIndexed();geo.applyMatrix4(m);const n=geo.attributes.position.count,cs=new Float32Array(n*3),cc=col(c);for(let i=0;i<n;i++){cs[i*3]=cc.r;cs[i*3+1]=cc.g;cs[i*3+2]=cc.b;}geo.setAttribute('color',new THREE.BufferAttribute(cs,3));geo.deleteAttribute('uv');parts.push(geo);};
  const M4=()=>new THREE.Matrix4();
  add(new THREE.SphereGeometry(.07,6,4),'#c99a2a',M4().compose(new V3(0,0,0),new THREE.Quaternion(),new V3(1,1,6)));
  add(new THREE.SphereGeometry(.08,6,4),'#8a6a24',M4().makeTranslation(0,0,.42));
  for(const s of[-1,1]){const w=new THREE.PlaneGeometry(.55,.16);const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,s*(up?-.55:.35)));add(w,'#a8956a',M4().compose(new V3(s*.3,up?.12:-.05,.08),q,new V3(1,1,1)));}
  let n=0;parts.forEach(p=>n+=p.attributes.position.count);const pos=new Float32Array(n*3),nor=new Float32Array(n*3),cl=new Float32Array(n*3);let o=0;
  parts.forEach(p=>{pos.set(p.attributes.position.array,o*3);nor.set(p.attributes.normal.array,o*3);cl.set(p.attributes.color.array,o*3);o+=p.attributes.position.count;});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(cl,3));return keep(g);}
/* low-poly gregarious hopper (length 1, faces +z) for big bands seen from afar */
function hopperGeo(adult){const parts=[],Q=new THREE.Quaternion(),E=(x,y,z)=>new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z));
  const add=(geo,c,p,q,sc)=>{geo=geo.toNonIndexed();geo.applyMatrix4(new THREE.Matrix4().compose(p,q||Q,sc||new V3(1,1,1)));const n=geo.attributes.position.count,cs=new Float32Array(n*3),cc=col(c);for(let i=0;i<n;i++){cs[i*3]=cc.r;cs[i*3+1]=cc.g;cs[i*3+2]=cc.b;}geo.setAttribute('color',new THREE.BufferAttribute(cs,3));parts.push(geo);};
  const S=()=>new THREE.SphereGeometry(.5,10,6);
  add(S(),'#e9c32b',new V3(0,.12,-.12),Q,new V3(.2,.2,.62));/* abdomen */
  if(adult){for(const s of[-1,1])add(new THREE.BoxGeometry(.11,.02,.95),'#b9a274',new V3(s*.05,.27,-.25),E(-.08,s*.04,s*.25));}
  else add(S(),'#1e1a14',new V3(0,.2,-.1),Q,new V3(.1,.08,.55));/* dark dorsal band */
  add(S(),'#e2b52a',new V3(0,.17,.22),Q,new V3(.24,.24,.3));/* pronotum */
  if(!adult)add(S(),'#1e1a14',new V3(0,.22,.22),Q,new V3(.25,.13,.18));
  add(S(),'#e6bd2c',new V3(0,.16,.42),Q,new V3(.2,.25,.18));/* head */
  for(const s of[-1,1]){add(S(),'#151310',new V3(s*.08,.21,.46),Q,new V3(.07,.1,.08));
    add(new THREE.BoxGeometry(.04,.05,.45),'#dcb02a',new V3(s*.14,.25,-.1),E(-.55,s*.12,0));/* hind femur */
    add(new THREE.BoxGeometry(.03,.03,.42),'#2a241c',new V3(s*.16,.12,-.2),E(.45,s*.12,0));/* hind tibia */
    add(new THREE.BoxGeometry(.025,.12,.025),'#d4aa28',new V3(s*.13,.06,.3),E(0,0,s*.4));add(new THREE.BoxGeometry(.025,.12,.025),'#d4aa28',new V3(s*.13,.06,.12),E(0,0,s*.4));
    add(new THREE.BoxGeometry(.012,.012,.3),'#2a241c',new V3(s*.06,.3,.62),E(-.5,s*.25,0));}
  let n=0;parts.forEach(p=>n+=p.attributes.position.count);const pos=new Float32Array(n*3),nor=new Float32Array(n*3),cl=new Float32Array(n*3);let o=0;
  parts.forEach(p=>{pos.set(p.attributes.position.array,o*3);nor.set(p.attributes.normal.array,o*3);cl.set(p.attributes.color.array,o*3);o+=p.attributes.position.count;});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(cl,3));return keep(g);}
const HOPG=hopperGeo(),ADG=hopperGeo(true);
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
function makeFlag(h=2.2,mat=FM.flag){const g=new THREE.Group();const p=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,h,6),FM.metal);p.position.y=h/2;g.add(p);const f=new THREE.Mesh(new THREE.PlaneGeometry(.7,.45,6,1),mat);f.position.set(.37,h-.25,0);g.add(f);g.userData.f=f;return g;}
function makeWindsock(){const g=new THREE.Group();const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,4,8),FM.metal);p.position.y=2;g.add(p);
  const sock=new THREE.Group();for(let i=0;i<5;i++){const r=new THREE.Mesh(new THREE.CylinderGeometry(.3-i*.035,.3-(i+1)*.035,.45,14,1,true),i%2?FM.white:FM.orange);r.material.side=THREE.DoubleSide;r.rotation.z=-Math.PI/2;r.position.x=.25+i*.45;sock.add(r);}sock.position.y=3.85;g.add(sock);g.userData.sock=sock;return g;}
function makeHive(){const g=new THREE.Group();for(let i=0;i<2;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.5,.25,.42),FM.hive);b.position.y=.3+i*.26;g.add(b);}const st=new THREE.Mesh(new THREE.BoxGeometry(.55,.18,.47),FM.wood);st.position.y=.09;g.add(st);const lid=new THREE.Mesh(new THREE.BoxGeometry(.56,.05,.48),FM.metal);lid.position.y=.67;g.add(lid);g.traverse(n=>{if(n.isMesh)n.castShadow=true;});return g;}
function makeSheep(){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.SphereGeometry(.35,12,10),FM.wool);b.scale.set(.8,.75,1.25);b.position.y=.6;g.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),FM.dark);h.scale.set(.8,.9,1.3);h.position.set(0,.72,.5);g.add(h);
  for(const[x,z]of[[.15,.25],[-.15,.25],[.15,-.25],[-.15,-.25]])g.add(seg(new V3(x,.4,z),new V3(x,0,z),.04,FM.dark));g.traverse(n=>{if(n.isMesh)n.castShadow=true;});return g;}
function makeTent(){const g=new THREE.Group();const s=new THREE.Shape();s.moveTo(-2.4,0);s.lineTo(-2,1.5);s.lineTo(0,1.9);s.lineTo(2,1.5);s.lineTo(2.4,0);s.lineTo(-2.4,0);
  const m=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:3,bevelEnabled:false}),FM.tent);m.position.z=-1.5;g.add(m);g.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});return g;}
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
const spec=mkScene(14);hdrDome(spec,2000,{rot:.01});spec.fog=new THREE.Fog(col('#efe2cc'),40,260);
{const sun=spec.userData.sun;sun.position.set(10,11,6);sun.intensity=ENV?2.1:1.2;}
const SB={x:9,z:6,d:8,t:24};/* sand block half sizes x,z; depth; trench runs from the cut face (z=SB.z) to z=SB.t */
/* ground height: almost flat where the specimens stand, gentle undulation further out, low dunes on the horizon */
const SH=(x,z)=>{const r=Math.hypot(x,z),near=Math.min(1,Math.max(0,(r-9)/30));const dx=Math.max(-SB.x-x,x-SB.x,0),dz=Math.max(SB.z-z,z-SB.t,0),e=Math.min(1,Math.hypot(dx,dz)/4);
  return(.06*(tnoise(x*.4,z*.4,2)-.5)+near*1.6*(tnoise(x*.03+5,z*.03,3)-.5)+Math.pow(Math.min(1,Math.max(0,(r-60)/140)),1.5)*14*tnoise(x*.012,z*.012,3))*e;};
const MS=macroSand(31,{rep:[1,1],base:'#d3a468'});
const GROUND_M=xrMat(new THREE.MeshStandardMaterial({map:MS.map,normalMap:MS.normal,normalScale:new THREE.Vector2(1.1,1.1),roughness:.97,vertexColors:true}),.18);
const GROUND=(()=>{const xs=[];for(let x=-36;x<=36.001;x+=.75)xs.push(+x.toFixed(3));let x=36;for(let st=1;x<500;st*=1.12){x+=st;xs.push(x);xs.unshift(-x);}
  const N=xs.length,pos=new Float32Array(N*N*3),uv=new Float32Array(N*N*2),cl=new Float32Array(N*N*3);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,X=xs[i],Z=xs[j];pos[k*3]=X;pos[k*3+1]=SH(X,Z);pos[k*3+2]=Z;uv[k*2]=X/4;uv[k*2+1]=-Z/4;
    const t=.88+.2*tnoise(X*.05+30,Z*.05,3)+.06*(tnoise(X*.6,Z*.6,2)-.5);cl[k*3]=t*1.02;cl[k*3+1]=t;cl[k*3+2]=t*.96;}
  const full=[],hole=[];for(let j=0;j<N-1;j++)for(let i=0;i<N-1;i++){const a=j*N+i,b=a+1,c=a+N,d=c+1,q=[a,c,b,b,c,d];full.push(...q);
    const cx=(xs[i]+xs[i+1])/2,cz=(xs[j]+xs[j+1])/2;if(!(Math.abs(cx)<SB.x&&cz>SB.z&&cz<SB.t))hole.push(...q);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('color',new THREE.BufferAttribute(cl,3));
  g.setIndex(full);g.computeVertexNormals();g.userData.idx={full:new THREE.Uint32BufferAttribute(full,1),hole:new THREE.Uint32BufferAttribute(hole,1)};
  const m=new THREE.Mesh(g,GROUND_M);m.receiveShadow=true;spec.add(m);return m;})();
/* trench dug in front of the cut face (only in the life cycle tab) */
function cutTex(seed,W=1024,H=512,face=true){const c=cv(W,H),g=c.getContext('2d'),h=cv(W,H),k=h.getContext('2d'),rnd=mulberry(seed),n=pnoise(16,seed),n2=pnoise(64,seed+1);
  const id=g.createImageData(W,H),hd=k.createImageData(W,H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=y/H,u=x/W,j=(y*W+x)*4;const strata=Math.sin((v+.03*fbm(n,u*6,v*3,2))*Math.PI*14)*.5+.5;
    const moist=Math.min(1,v*1.25+.08*fbm(n,u*4,v*4,3));const gr=n2(u*64,v*32)*.5+rnd()*.5;
    let r=226-moist*78,G=196-moist*72,B=150-moist*60;const t=.9+(gr-.5)*.28+(strata-.5)*.07;id.data[j]=r*t;id.data[j+1]=G*t;id.data[j+2]=B*t;id.data[j+3]=255;
    const hv=110+gr*90+strata*30;hd.data[j]=hd.data[j+1]=hd.data[j+2]=hv;hd.data[j+3]=255;}
  g.putImageData(id,0,0);k.putImageData(hd,0,0);
  /* embedded pebbles and grit */
  for(let i=0;i<260;i++){const x=rnd()*W,y=H*.04+rnd()*H*.96,rx=1.5+rnd()*(rnd()<.1?14:4),ry=rx*(.5+rnd()*.4),a=rnd()*3;const cc=STONE_PAL[(rnd()*STONE_PAL.length)|0];
    g.fillStyle=cc;g.beginPath();g.ellipse(x,y,rx,ry,a,0,7);g.fill();g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(x-rx*.25,y-ry*.3,rx*.5,ry*.4,a,0,7);g.fill();
    k.fillStyle='#ffffff';k.beginPath();k.ellipse(x,y,rx,ry,a,0,7);k.fill();}
  /* fine roots near the surface */
  if(face){g.lineCap='round';for(let i=0;i<26;i++){let x=rnd()*W,y=0;g.strokeStyle=`rgba(${70+rnd()*40|0},${50+rnd()*30|0},30,${.35+rnd()*.35})`;g.lineWidth=.8+rnd()*1.8;g.beginPath();g.moveTo(x,y);const L=H*(.1+rnd()*.35);
    while(y<L){x+=(rnd()-.5)*14;y+=4+rnd()*10;g.lineTo(x,y);}g.stroke();}}
  /* surface lip lighter, dry */
  const lip=g.createLinearGradient(0,0,0,H*.05);lip.addColorStop(0,'rgba(240,220,180,.7)');lip.addColorStop(1,'rgba(240,220,180,0)');g.fillStyle=lip;g.fillRect(0,0,W,H*.05);
  return{map:ctex(c),normal:normalFromHeight(h,2.4)};}
const CUTT=cutTex(77),SIDET=cutTex(78,1024,512,false);
const CUT_M=xrMat(new THREE.MeshStandardMaterial({map:CUTT.map,normalMap:CUTT.normal,roughness:1}),.12);
const sideM=xrMat(new THREE.MeshStandardMaterial({map:SIDET.map,normalMap:SIDET.normal,roughness:1,color:col('#f4ece0')}),.12);
const TRENCH=new THREE.Group();spec.add(TRENCH);
{const f=new THREE.Mesh(new THREE.PlaneGeometry(SB.x*2,SB.d),CUT_M);f.position.set(0,-SB.d/2,SB.z);f.receiveShadow=true;TRENCH.add(f);
  const TL=SB.t-SB.z;for(const sx of[-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(TL,SB.d),sideM);w.position.set(sx*SB.x,-SB.d/2,SB.z+TL/2);w.rotation.y=-sx*Math.PI/2;w.receiveShadow=true;TRENCH.add(w);}
  const e=new THREE.Mesh(new THREE.PlaneGeometry(SB.x*2,SB.d),sideM);e.position.set(0,-SB.d/2,SB.t);e.rotation.y=Math.PI;e.receiveShadow=true;TRENCH.add(e);
  const fm=new THREE.MeshStandardMaterial({map:MS.map,normalMap:MS.normal,roughness:1,color:col('#c9b08a')});const fl=new THREE.Mesh(new THREE.PlaneGeometry(SB.x*2,TL),fm);fl.rotation.x=-Math.PI/2;fl.position.set(0,-SB.d,SB.z+TL/2);fl.receiveShadow=true;TRENCH.add(fl);
  /* spoil heap from digging */
  const hp=new THREE.Mesh(new THREE.SphereGeometry(1,40,20,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({map:MS.map,normalMap:MS.normal,roughness:1,color:col('#e6d3b4')}));hp.scale.set(5,1.6,3.2);hp.position.set(SB.x+5.5,0,SB.z+9);hp.receiveShadow=hp.castShadow=true;TRENCH.add(hp);}
function setTrench(on){TRENCH.visible=on;GROUND.geometry.setIndex(GROUND.geometry.userData.idx[on?'hole':'full']);}
setTrench(false);
/* surface detail shared by every tab: grit, pebbles, dry litter, grass and herbs */
const CLUT=new THREE.Group();spec.add(CLUT);
const inTrench=(x,z,m=0)=>Math.abs(x)<SB.x+m&&z>SB.z-m&&z<SB.t+m+6;
scatterStones(CLUT,{seed:5,n:1600,r0:0,r1:34,s0:.07,s1:.07,big:0,h:SH,avoid:(x,z)=>inTrench(x,z,.3)});
scatterStones(CLUT,{seed:9,n:420,r0:8,r1:70,s0:.16,s1:.75,big:.25,h:SH,avoid:(x,z)=>inTrench(x,z,1)});
litter(CLUT,{seed:4,n:46,r0:6,r1:40,L:1.8,w:.045,h:SH,avoid:(x,z)=>inTrench(x,z,1)});
{const rnd=mulberry(66);for(let i=0;i<46;i++){const r=22+Math.sqrt(rnd())*70,a=rnd()*6.283,x=Math.cos(a)*r,z=Math.sin(a)*r;if(inTrench(x,z,3))continue;
  const p=rnd()<.75?grassClump(100+i,{h:4+rnd()*4,n:50+(rnd()*50|0),dry:.15+rnd()*.4}):herb(200+i,{h:2+rnd()*2});p.position.set(x,SH(x,z)-.05,z);p.rotation.y=rnd()*6;CLUT.add(p);}}
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
function foamTex(){const c=cv(256,512),g=c.getContext('2d'),rnd=mulberry(12);g.fillStyle='#cdb68c';g.fillRect(0,0,256,512);
  for(let i=0;i<2600;i++){const x=rnd()*256,y=rnd()*512,r=1+rnd()*5;g.fillStyle=`rgba(${235+rnd()*20|0},${222+rnd()*20|0},${190+rnd()*20|0},${.35+rnd()*.4})`;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.strokeStyle='rgba(120,95,60,.35)';g.lineWidth=.6;g.stroke();}
  for(let i=0;i<500;i++){g.fillStyle=`rgba(110,85,55,${rnd()*.5})`;g.fillRect(rnd()*256,rnd()*512,2,2);}return ctex(c);}
const FOAM=foamTex();
/* egg pod: slightly curved column of 60–80 rice-like eggs in a sheath of hardened froth, topped by a froth plug */
function makePod(){const g=new THREE.Group();const em=keep(phys('#e8cf94',{roughness:.3,clearcoat:.7,clearcoatRoughness:.2}));
  const fm=xrMat(keep(new THREE.MeshStandardMaterial({map:FOAM,roughness:.75,transparent:true,opacity:.97})),.35);
  const rnd=mulberry(4);const L=2.4;
  const cu=new THREE.CatmullRomCurve3([new V3(0,0,0),new V3(.05,-1.2,0),new V3(.18,-2.6,0),new V3(.32,-3.8,0),new V3(.42,-6.0,0)]);
  const plug=new THREE.Mesh(taperTube(new THREE.CatmullRomCurve3(cu.points.slice(0,4)),u=>.2+.04*u,24,14),fm);g.add(plug);
  const pod=new THREE.Group(),EGG_G=new THREE.SphereGeometry(.065,12,8);
  for(let i=0;i<76;i++){const k=i/76,ring=(i%6)/6*Math.PI*2+(i/6|0)*.5,t=.6+k*.38;const c=cu.getPoint(t),r=.12+.02*Math.sin(i);const e=new THREE.Mesh(EGG_G,em);e.scale.set(1,2.7,1);
    e.position.set(c.x+Math.cos(ring)*r,c.y,c.z+Math.sin(ring)*r);e.rotation.set((rnd()-.5)*.5+Math.sin(ring)*.35,0,(rnd()-.5)*.5-Math.cos(ring)*.35);pod.add(e);}
  const sh=new THREE.Mesh(taperTube(new THREE.CatmullRomCurve3(cu.points.slice(2)),u=>.27-.05*u*u,24,16),xrMat(keep(new THREE.MeshStandardMaterial({map:FOAM,color:col('#b89c70'),roughness:.9,transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false})),.25));
  pod.add(sh);g.add(pod);g.traverse(n=>{if(n.isMesh)n.castShadow=true;});g.userData.P={eggs:cu.getPoint(.82).add(new V3(.25,0,0)),froth:new V3(.2,-1.2,0)};return g;}
const POD=makePod();POD.position.set(-4.2,0,SB.z+.02);SG.life.add(POD);
/* more pods visible only with the inside view (an egg field) */
const PODS=xrGroup(new THREE.Group());{const rnd=mulberry(9);for(let i=0;i<9;i++){const p=makePod();p.position.set(-7.5+rnd()*15,0,-4.5+rnd()*8);p.rotation.y=rnd()*6;p.scale.setScalar(.95+rnd()*.1);PODS.add(p);}SG.life.add(PODS);}
/* female laying (abdomen down into the pod) */
const LAYER=makeLocust(2.8,{key:'adult',lay:110});LAYER.position.set(-1.6,0,SB.z-1.24);LAYER.rotation.y=Math.PI;SG.life.add(LAYER);
/* hopper instars 1–5 in a line (real lengths ~0.8 to 4.2 cm) */
const HOPS=[];[[.32,'h1',0],[.5,'h2',0],[.74,'h3',.25],[1.1,'h4',.55],[1.66,'h5',1]].forEach(([L,k,b],i)=>{const h=makeLocust(L,{key:k,hopper:true,bud:b});h.position.set(-1.8+i*1.45+i*i*.1,0,2.4);h.rotation.y=-Math.PI/2-.35;SG.life.add(h);HOPS.push(h);});
const FLEDG=makeLocust(2.6,{key:'imm'});FLEDG.position.set(6.9,0,-1.2);FLEDG.rotation.y=-2.3;SG.life.add(FLEDG);
const MATURE=makeLocust(2.8,{key:'adult'});MATURE.position.set(3.2,0,-3.4);MATURE.rotation.y=-.9;SG.life.add(MATURE);
/* hero specimen for "the locust" tab */
const HERO=makeLocust(5.2,{key:'adult',inside:true});HERO.position.set(0,0,0);HERO.rotation.y=1.25;SG.locust.add(HERO);
[[6.2,2.4,1,5],[-5.6,-4.2,2,6],[7.5,-5.6,3,4.5],[-1.5,-8,4,5.5]].forEach(([x,z,s,h])=>{const t=grassClump(s,{h,n:80});t.position.set(x,0,z);t.rotation.y=s;SG.locust.add(t);});{const hb=herb(9,{h:2.6});hb.position.set(3.8,0,-5.4);SG.locust.add(hb);}
[[9.5,1,5,4],[-8.5,-2,6,5],[1,-6.5,7,4],[10,-5,8,3.5]].forEach(([x,z,s,h])=>{const t=grassClump(s+20,{h,n:70});t.position.set(x,0,z);t.rotation.y=s;SG.life.add(t);});
/* phase: a lone solitary adult + green hopper vs a gregarious hopper band */
const SOL=makeLocust(2.8,{key:'sol'});SOL.position.set(-4.5,0,-1.5);SOL.rotation.y=-.6;SG.phase.add(SOL);
const SOLH=makeLocust(1.5,{key:'hsol',hopper:true,bud:.8});SOLH.position.set(-6.2,0,2.6);SOLH.rotation.y=.6;SG.phase.add(SOLH);
const GREG=makeLocust(2.8,{key:'adult'});GREG.position.set(4.4,0,-2.6);GREG.rotation.y=-2.4;SG.phase.add(GREG);
const BAND=new THREE.Group();SG.phase.add(BAND);const BANDI=[];{const rnd=mulberry(21);for(let i=0;i<46;i++){const k=['h4','h5','h5','h4','h3'][i%5],L=k==='h3'?.74:k==='h4'?1.1:1.5;const h=makeLocust(L,{key:k,hopper:true,bud:k==='h5'?1:k==='h4'?.55:.25});
  const x=1+rnd()*7,z=-.5+rnd()*5.2;h.position.set(x,0,z);h.rotation.y=Math.PI/2+.5+(rnd()-.5)*.5;h.userData.x0=x;h.userData.sp=.15+rnd()*.1;BAND.add(h);BANDI.push(h);}}
[[-8,-4.5,11,5],[-2.2,4.5,12,3.5],[9.6,4.6,13,4.5]].forEach(([x,z,s,h])=>{const t=grassClump(s+40,{h,n:70});t.position.set(x,0,z);t.rotation.y=s;SG.phase.add(t);});

/* ---------- field scene (1 unit = 1 m): desert after rain ---------- */
const field=mkScene(70);hdrDome(field,2200,{rot:.01,hz:.05});field.fog=new THREE.Fog(col('#ecdcc2'),180,900);
{const sun=field.userData.sun;sun.intensity=ENV?2.3:1.2;}
const DUNE=(x,z)=>{const r=Math.hypot(x,z),k=Math.min(1,Math.max(0,(r-120)/220));
  return .3*(tnoise(x*.02,z*.02,3)-.5)*Math.min(1,r/30)+k*(26*Math.pow(tnoise(x*.004+3,z*.004,4),1.6)+6*tnoise(x*.015,z*.015,3));};
const FSAND=macroSand(5,{rep:[1,1],base:'#d6aa6c',nrm:1.6});
const fGround=(()=>{const xs=[];let x=0;xs.push(0);for(let st=1;x<1200;st*=1.045){x+=st;xs.push(x);xs.unshift(-x);}
  const N=xs.length,pos=new Float32Array(N*N*3),uv=new Float32Array(N*N*2),cl=new Float32Array(N*N*3);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,X=xs[i],Z=xs[j];pos[k*3]=X;pos[k*3+1]=DUNE(X,Z);pos[k*3+2]=Z;uv[k*2]=X/1.6;uv[k*2+1]=-Z/1.6;
    const t=.86+.22*tnoise(X*.01+40,Z*.01,4)+.05*(tnoise(X*.15,Z*.15,2)-.5);cl[k*3]=t*1.03;cl[k*3+1]=t;cl[k*3+2]=t*.95;}
  const idx=[];for(let j=0;j<N-1;j++)for(let i=0;i<N-1;i++){const a=j*N+i;idx.push(a,a+N,a+1,a+1,a+N,a+N+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('color',new THREE.BufferAttribute(cl,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:FSAND.map,normalMap:FSAND.normal,normalScale:new THREE.Vector2(.8,.8),roughness:.97,vertexColors:true}));m.receiveShadow=true;field.add(m);return m;})();
/* green desert vegetation after rain: instanced grass clumps, herbs, gravel, a few acacias */
const VEG=new THREE.Group();field.add(VEG);
const F_GRASS=[1,2,3].map(i=>grassClump(500+i,{h:1,n:30,w:.035,r:.15,dry:.2+i*.08,seg:5}).geometry);
const F_HERB=[1,2].map(i=>mergeGroup(herb(600+i,{h:1,n:6,low:1})));
const F_DRY=[grassClump(700,{h:1,n:24,w:.025,r:.12,dry:.95,seg:5}).geometry];
instancedPlants(VEG,{geos:F_GRASS,n:2600,r0:3,r1:240,s0:.5,s1:1.25,seed:3,h:DUNE});
instancedPlants(VEG,{geos:F_HERB,n:420,r0:3,r1:200,s0:.7,s1:1.6,seed:4,h:DUNE,mat:keep(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7,side:THREE.DoubleSide}))});
instancedPlants(VEG,{geos:F_DRY,n:400,r0:3,r1:300,s0:.3,s1:.7,seed:5,h:DUNE});
scatterStones(field,{seed:8,n:1400,r0:2,r1:160,s0:.05,s1:.35,big:.08,h:DUNE});
[[-38,-30,1],[46,-42,2],[-60,40,3],[70,26,4],[12,-80,5],[-90,-6,6],[120,-120,7],[-140,90,8]].forEach(([x,z,s])=>{const a=makeAcacia(s);a.position.set(x,DUNE(x,z),z);field.add(a);});
/* moist (darker) soil patch where rain fell */
{const c=cv(256),g=c.getContext('2d'),gr=g.createRadialGradient(128,128,10,128,128,128);gr.addColorStop(0,'rgba(110,78,45,.45)');gr.addColorStop(1,'rgba(110,78,45,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);
  const wet=new THREE.Mesh(new THREE.PlaneGeometry(90,70),new THREE.MeshStandardMaterial({map:ctex(c),transparent:true,depthWrite:false,roughness:.9}));wet.rotation.x=-Math.PI/2;wet.position.set(-12,.05,6);wet.receiveShadow=true;field.add(wet);}
const PG={};['damage','survey','control'].forEach(k=>{PG[k]=new THREE.Group();PG[k].visible=false;field.add(PG[k]);});
const AP={};
/* -- damage: a centre-pivot alfalfa field with a swarm -- */
const FARM=new V3(0,0,-150);
{const rnd=mulberry(41),EA=[-.3,1.25];/* eaten sector, angles in the ground plane (x=cos a, z=sin a) */
  const inEaten=a=>{a=Math.atan2(Math.sin(a),Math.cos(a));return a>EA[0]&&a<EA[1];};
  /* irrigated soil disc: dark moist rows, lighter bare soil where the crop was eaten */
  const c=cv(1024),g=c.getContext('2d');g.fillStyle='#4c7a2a';g.fillRect(0,0,1024,1024);for(let i=0;i<60000;i++){const l=rnd();g.fillStyle=`rgba(${50+l*70|0},${95+l*80|0},${25+l*35|0},.45)`;g.fillRect(rnd()*1024,rnd()*1024,2+rnd()*3,2+rnd()*3);}
  for(let r=10;r<512;r+=7){g.strokeStyle='rgba(30,50,15,.28)';g.lineWidth=2;g.beginPath();g.arc(512,512,r,0,7);g.stroke();}
  /* eaten sector: bare irrigated soil with a few stalks */g.save();g.beginPath();g.moveTo(512,512);g.arc(512,512,512,EA[0],EA[1]);g.closePath();g.clip();g.fillStyle='#8a6a44';g.fillRect(0,0,1024,1024);
  for(let i=0;i<30000;i++){g.fillStyle=`rgba(${90+rnd()*70|0},${65+rnd()*50|0},${40+rnd()*25|0},.45)`;g.fillRect(rnd()*1024,rnd()*1024,3,3);}for(let r=10;r<512;r+=7){g.strokeStyle='rgba(60,40,20,.35)';g.lineWidth=2.5;g.beginPath();g.arc(512,512,r,0,7);g.stroke();}
  for(let i=0;i<4000;i++){g.fillStyle=`rgba(${120+rnd()*40|0},${130+rnd()*40|0},60,.6)`;g.fillRect(rnd()*1024,rnd()*1024,2,2);}g.restore();
  /* ragged edge of the eaten zone */for(let i=0;i<500;i++){const a=EA[rnd()<.5?0:1]+(rnd()-.5)*.08,r=rnd()*512;g.fillStyle=rnd()<.5?'rgba(138,106,68,.9)':'rgba(76,122,42,.9)';g.beginPath();g.arc(512+Math.cos(a)*r,512+Math.sin(a)*r,3+rnd()*6,0,7);g.fill();}
  const disc=new THREE.Mesh(new THREE.CircleGeometry(60,128),new THREE.MeshStandardMaterial({map:ctex(c),roughness:.95}));disc.rotation.x=-Math.PI/2;disc.position.copy(FARM).setY(.04);disc.receiveShadow=true;PG.damage.add(disc);
  /* alfalfa: dense small clumps; only stubble in the eaten sector */
  const alf=[1,2].map(i=>grassClump(800+i,{h:.42,n:10,w:.06,r:.12,seg:4,dry:0,base:'#4d7a2a',mid:'#6f9a3a',tip:'#8fb04c',tipk:.6,droop:1.4}).geometry);
  instancedPlants(PG.damage,{geos:alf,n:5500,r0:0,r1:59,cx:FARM.x,cz:FARM.z,s0:.8,s1:1.25,seed:42,avoid:(x,z)=>inEaten(Math.atan2(z-FARM.z,x-FARM.x))});
  const stub=[grassClump(810,{h:.12,n:12,w:.012,r:.05,dry:.6,base:'#6f7f3a'}).geometry];
  instancedPlants(PG.damage,{geos:stub,n:2500,r0:2,r1:59,cx:FARM.x,cz:FARM.z,s0:.8,s1:1.4,seed:43,avoid:(x,z)=>!inEaten(Math.atan2(z-FARM.z,x-FARM.x))});
  const arm=makePivot(58,5);arm.position.copy(FARM);arm.rotation.y=2.2;PG.damage.add(arm);}
AP.farm=FARM.clone().add(new V3(-28,1,-14));AP.eaten=FARM.clone().add(new V3(26,1,16));
const SWARM=makeSwarm(1400,PG.damage);SWARM.scale=1.6;{const rnd=mulberry(55);for(let i=0;i<1400;i++)SWARM.items.push({ph:rnd(),r:8+rnd()*42,a0:rnd()*6.28,h:2+rnd()*16,sp:.25+rnd()*.25,w:rnd()*6});}
const SW_C=FARM.clone().add(new V3(18,0,-6));
const swarmPos=(it,t,v)=>{const a=it.a0+t*it.sp*(it.r<25?1:-.7);v.set(SW_C.x+Math.cos(a)*it.r+Math.sin(t*.7+it.w)*3,it.h+Math.sin(t*1.3+it.w)*1.2,SW_C.z+Math.sin(a)*it.r*.7);return v;};
AP.swarm=SW_C.clone().add(new V3(0,12,0));
/* landed locusts on the crop edge */
{const N=600,im=new THREE.InstancedMesh(ADG,SWM,N),M4=new THREE.Matrix4(),q=new THREE.Quaternion(),rnd=mulberry(66),e=new THREE.Euler();for(let i=0;i<N;i++){const a=-.35+rnd()*.2+(rnd()<.5?0:1.6),r=10+rnd()*48;q.setFromEuler(e.set(0,rnd()*6.28,0));M4.compose(new V3(FARM.x+Math.cos(a)*r,.3,FARM.z+Math.sin(a)*r),q,new V3(1.4,1.4,1.4));im.setMatrixAt(i,M4);}PG.damage.add(im);}
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
const FLUSH=makeSwarm(40,PG.survey);FLUSH.scale=.45;{const rnd=mulberry(77);for(let i=0;i<40;i++)FLUSH.items.push({ph:rnd(),x:-9-rnd()*8,z:10+(rnd()-.5)*7,w:rnd()*6,h:.5+rnd()*1.8});}
const flushPos=(it,t,v)=>v.set(it.x+Math.sin(t*.9+it.w)*1.5,it.h+Math.abs(Math.sin(t*2+it.w))*.8,it.z+Math.cos(t*.7+it.w)*1.5);
/* herders, beekeepers: the people who report sightings */
const CAMP=new V3(30,0,26);{const t=makeTent();t.position.copy(CAMP);t.rotation.y=-.6;PG.survey.add(t);for(let i=0;i<6;i++){const s=makeSheep();s.position.set(CAMP.x-6+i*1.4,0,CAMP.z+5+(i%2)*1.2);s.rotation.y=i;PG.survey.add(s);}
  for(let i=0;i<5;i++){const h=makeHive();h.position.set(CAMP.x+6+i*.9,0,CAMP.z-4+(i%2)*.5);PG.survey.add(h);}const pr=makePerson({});pr.position.set(CAMP.x-2,0,CAMP.z+2.5);pr.rotation.y=2.6;PG.survey.add(pr);}
/* rain cloud in the distance */
const CLOUD=new THREE.Group();{const rnd=mulberry(91),cm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}),G=new THREE.IcosahedronGeometry(1,3);
  {const p=G.attributes.position,c=[];for(let i=0;i<p.count;i++){const y=p.getY(i),k=Math.max(0,Math.min(1,(y+.3)/1.1));const a=col('#8d97a6'),b=col('#f6f6f4');a.lerp(b,k);c.push(a.r,a.g,a.b);}G.setAttribute('color',new THREE.Float32BufferAttribute(c,3));}
  for(let i=0;i<34;i++){const s=new THREE.Mesh(G,cm),r=5+rnd()*9,x=(rnd()-.5)*60,z=(rnd()-.5)*24;s.scale.set(r*1.2,r*.8,r);s.position.set(x,Math.max(0,(rnd()*.6)*r+(1-Math.abs(x)/30)*8),z);CLOUD.add(s);}
  /* rain shaft: soft vertical streaks fading towards the ground */
  const c=cv(256,256),g=c.getContext('2d');for(let i=0;i<500;i++){const x=rnd()*256;g.strokeStyle=`rgba(120,132,148,${.05+rnd()*.12})`;g.lineWidth=1+rnd()*2;g.beginPath();g.moveTo(x,0);g.lineTo(x-6,256);g.stroke();}
  const fade=g.createLinearGradient(0,0,0,256);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,1)');g.globalCompositeOperation='destination-out';g.fillStyle=fade;g.fillRect(0,0,256,256);
  const rain=new THREE.Mesh(new THREE.CylinderGeometry(22,28,46,24,1,true),new THREE.MeshBasicMaterial({map:ctex(c,{rep:[4,1]}),transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false,fog:true}));rain.position.y=-22;CLOUD.add(rain);
  CLOUD.position.set(-160,48,-110);PG.survey.add(CLOUD);}
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
  {const tw=W*.9+sp*.6,tl=L*.8,c=cv(256),g=c.getContext('2d'),gr=g.createRadialGradient(128,128,8,128,128,128);gr.addColorStop(0,'rgba(120,100,40,.28)');gr.addColorStop(1,'rgba(120,100,40,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);
    const t=new THREE.Mesh(new THREE.PlaneGeometry(tw,tl),new THREE.MeshStandardMaterial({map:ctex(c),transparent:true,depthWrite:false,roughness:1}));t.rotation.x=-Math.PI/2;t.position.set(0,.06,0);t.receiveShadow=true;TARGET.add(t);
    /* the band itself: thousands of hoppers marching, drawn a few times larger than life so they read at this distance */
    const N=k===2?2600:1600,hs=k===2?2.2:k===1?.55:.28,im=new THREE.InstancedMesh(HOPG,SWM,N),M=new THREE.Matrix4(),q=new THREE.Quaternion(),rnd=mulberry(5+k);let m=0;
    for(let i=0;i<N*3&&m<N;i++){const x=(rnd()-.5)*tw,z=(rnd()-.5)*tl,d=Math.hypot(x/(tw/2),z/(tl/2));if(d>1||rnd()<d*d*.9)continue;q.setFromAxisAngle(UP,Math.PI*.5+(rnd()-.5)*.8);const sc=hs*(.8+rnd()*.4);M.compose(new V3(x,DUNE(x,z),z),q,new V3(sc,sc,sc));im.setMatrixAt(m++,M);}
    im.count=m;im.castShadow=true;im.receiveShadow=true;TARGET.add(im);}
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
/* real region boundaries; breeding regions take the season colour */
const MAP_SAND=macroSand(8,{rep:[.35,.35],base:'#e2c08a',ripple:0,nrm:1.2});
const mapShape=ring=>{const sh=new THREE.Shape();ring.forEach(([lo,la],i)=>{const p=LL(lo,la);i?sh.lineTo(p.x,-p.z):sh.moveTo(p.x,-p.z);});return sh;};
const MAP_BASE=col('#f0d9ac'),MAP_W=col('#8fc6e3'),MAP_S=col('#a9d47e');
const MAPR=KSA_REG.map(r=>{const m=new THREE.MeshStandardMaterial({map:MAP_SAND.map,normalMap:MAP_SAND.normal,roughness:.95,color:MAP_BASE.clone()}),g=new THREE.Group();
  r.p.forEach(ring=>{const geo=new THREE.ExtrudeGeometry(mapShape(ring),{depth:.6,bevelEnabled:false});geo.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geo,m);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);
    const lp=ring.map(([lo,la])=>LL(lo,la).setY(.615));g.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(lp),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.85})));});
  mapS.add(g);return{r,m,g};});
function mapSeason(w){MAPR.forEach(({r,m,g})=>{const on=w?r.s==='w':r.s==='s';m.color.copy(on?(w?MAP_W:MAP_S):MAP_BASE);g.scale.y=on?1.5:1;});}
{const nm=new THREE.MeshStandardMaterial({color:col('#e6dfd1'),roughness:1});NEIGH.forEach(c=>c.p.forEach(ring=>{const geo=new THREE.ExtrudeGeometry(mapShape(ring),{depth:.3,bevelEnabled:false});geo.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geo,nm);mesh.receiveShadow=true;mapS.add(mesh);}));
  const show={'اليمن':1,'سلطنة عمان':1,'الإمارات العربية المتحدة':1,'الكويت':1,'العراق':1,'الأردن':1,'مصر':1,'السودان':1,'إريتريا':1,'قطر':1};
  NEIGH.forEach(c=>{if(!show[c.n])return;const t=textSprite(c.n==='الإمارات العربية المتحدة'?'الإمارات':c.n,{scale:.5,bg:false,color:'#8b8170'});t.position.copy(LL(c.lx,c.ly)).setY(.6);mapS.add(t);});
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:col('#9ccbe0'),roughness:.3,metalness:0}));sea.rotation.x=-Math.PI/2;sea.position.y=-.05;sea.receiveShadow=true;mapS.add(sea);}
const MAPG={winter:new THREE.Group(),spring:new THREE.Group(),arrows:new THREE.Group()};Object.values(MAPG).forEach(g=>mapS.add(g));
const REG={
 winter:[['جازان',42.55,16.89],['عسير',42.5,18.22],['الباحة',41.47,20.0],['مكة المكرمة',39.83,21.42],['المدينة المنورة',39.6,24.47],['تبوك',36.57,28.38]],
 spring:[['الجوف',40.2,29.97],['حائل',41.69,27.52],['القصيم',43.97,26.33],['الرياض',46.72,24.71],['الشرقية',49.6,26.0]]};
function zoneBlob(list,c){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:col(c),transparent:true,opacity:.5,roughness:.8,depthWrite:false});
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
