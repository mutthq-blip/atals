const $=s=>document.querySelector(s);
const stageEl=$('#stage'), canvas=$('#gl');
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

if(!window.THREE){ stageEl.insertAdjacentHTML('beforeend','<div class="nogl">تعذّر تحميل المشهد ثلاثي الأبعاد. تحقق من الاتصال ثم أعد فتح الصفحة.</div>'); }
let renderer;
try{ renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true}); }
catch(e){ stageEl.insertAdjacentHTML('beforeend','<div class="nogl">جهازك لا يدعم العرض ثلاثي الأبعاد (WebGL). يمكنك قراءة الدليل في اللوحة.</div>'); }

const V3=THREE.Vector3, UP=new V3(0,1,0), XA=new V3(1,0,0);
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const lerp=THREE.MathUtils.lerp;

/* ---------- realism toolkit ---------- */
if(renderer){renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;}
const col=h=>new THREE.Color(h).convertSRGBToLinear();
const ANISO=renderer?Math.min(8,renderer.capabilities.getMaxAnisotropy()):1;
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h||w;return c;}
function ctex(c,o={}){const t=new THREE.CanvasTexture(c);if(o.srgb!==false)t.encoding=THREE.sRGBEncoding;if(o.rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(o.rep[0],o.rep[1]);}t.anisotropy=ANISO;return t;}
function std(h,o={}){return new THREE.MeshStandardMaterial(Object.assign({color:col(h),roughness:.8},o));}
function phys(h,o={}){return new THREE.MeshPhysicalMaterial(Object.assign({color:col(h),roughness:.5},o));}
function keep(o){o.userData.keep=true;return o;}
function dispose(o){o.traverse(n=>{if(n.geometry&&!n.geometry.userData.keep)n.geometry.dispose();if(n.material){(Array.isArray(n.material)?n.material:[n.material]).forEach(m=>{if(!m.userData.keep)m.dispose()})}})}
function seg(a,b,r,mat,rs=8){const d=new V3().subVectors(b,a);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),rs),mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(UP,d.normalize());m.castShadow=true;return m}
function smoothNormals(g){const p=g.attributes.position,n=g.attributes.normal,map=new Map();
  for(let i=0;i<p.count;i++){const k=Math.round(p.getX(i)*1e4)+'_'+Math.round(p.getY(i)*1e4)+'_'+Math.round(p.getZ(i)*1e4);let e=map.get(k);if(!e){e={v:new V3(),ids:[]};map.set(k,e);}e.v.x+=n.getX(i);e.v.y+=n.getY(i);e.v.z+=n.getZ(i);e.ids.push(i);}
  map.forEach(e=>{e.v.normalize();e.ids.forEach(i=>n.setXYZ(i,e.v.x,e.v.y,e.v.z));});n.needsUpdate=true;return g;}
const endCap=(t,a)=>Math.pow(Math.max(0,1-Math.pow(Math.abs(t),a)),1/a);
/* superellipse body along z; prof(t)->{w,h}, t in [-1 rear, 1 front]; planar top-view UVs */
function shapedBody(L,W,H,prof,o={}){
  const n=o.n||2.4,top=o.top??1,bot=o.bot??1,g=new THREE.SphereGeometry(1,o.ws||56,o.hs||40);g.rotateX(Math.PI/2);
  const p=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),t=Math.max(-1,Math.min(1,p.getZ(i))),r=Math.hypot(x,y);let cx=0,cy=0;if(r>1e-7){cx=x/r;cy=y/r;}
    const s=r>1e-7?Math.pow(Math.pow(Math.abs(cx),n)+Math.pow(Math.abs(cy),n),-1/n):1,f=prof(t),nx=cx*s*W*f.w,ny=cy*s*H*f.h*(cy>0?top:bot);
    p.setXYZ(i,nx,ny,t*L/2);let u=nx/(2*W)+.5;if(o.cyl){const ang=Math.atan2(cy,cx);let d=ang-Math.PI/2;if(d<-Math.PI)d+=2*Math.PI;u=Math.max(0,Math.min(1,.5-d/(Math.PI*o.cyl)));}uv.setXY(i,u,(t+1)/2);}
  g.computeVertexNormals();return smoothNormals(g);}
function taperTube(curve,rf,ts=24,rs=10){const g=new THREE.TubeGeometry(curve,ts,1,rs,false),p=g.attributes.position,c=new V3(),v=new V3();
  for(let i=0;i<=ts;i++){const u=i/ts;curve.getPointAt(u,c);const r=rf(u);for(let j=0;j<=rs;j++){const k=i*(rs+1)+j;v.fromBufferAttribute(p,k).sub(c).multiplyScalar(r).add(c);p.setXYZ(k,v.x,v.y,v.z);}}
  g.computeVertexNormals();return g;}
const UNIT_CYL=keep(new THREE.CylinderGeometry(1,1,1,5,1));
function instSegs(list,mat){const im=new THREE.InstancedMesh(UNIT_CYL,mat,Math.max(1,list.length)),m=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new V3(),pos=new V3(),d=new V3();
  list.forEach(([a,b,r],i)=>{d.subVectors(b,a);const L=d.length();q.setFromUnitVectors(UP,d.normalize());s.set(r,L,r);pos.copy(a).add(b).multiplyScalar(.5);m.compose(pos,q,s);im.setMatrixAt(i,m);});
  im.count=list.length;im.instanceMatrix.needsUpdate=true;im.castShadow=true;return im;}

/* wind: fronds sway from the crown outward; same deformation in the shadow pass */
const WIND={uTime:{value:0},uWind:{value:RM?0:1}};
const WIND_GLSL=`vec4 mvPosition=vec4(transformed,1.0);
#ifdef USE_INSTANCING
mvPosition=instanceMatrix*mvPosition;
#endif
float wd=length(mvPosition.xz);
float ph=dot(mvPosition.xz,vec2(.7,.4))+dot(modelMatrix[3].xz,vec2(.31,.17));
float gust=.65+.35*sin(uTime*.23+modelMatrix[3].x*.05);
float sw=(sin(uTime*1.25+ph*.8)*.6+sin(uTime*2.6+ph*2.1)*.22)*gust;
mvPosition.x+=sw*uWind*wd*wd*.022;
mvPosition.z+=sin(uTime*1.05+ph*1.3)*uWind*wd*wd*.012*gust;
mvPosition.y+=(sin(uTime*7.0+ph*9.0)*.5+sw*.3)*uWind*wd*.01;
mvPosition=modelViewMatrix*mvPosition;
gl_Position=projectionMatrix*mvPosition;`;
function windify(mat){mat.onBeforeCompile=sh=>{sh.uniforms.uTime=WIND.uTime;sh.uniforms.uWind=WIND.uWind;sh.vertexShader='uniform float uTime;\nuniform float uWind;\n'+sh.vertexShader.replace('#include <project_vertex>',WIND_GLSL);};mat.customProgramCacheKey=()=>'wind1';return mat;}
const WDEPTH=windify(new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking}));
function pivot(p){const o=new THREE.Group(),i=new THREE.Group();o.position.copy(p);i.position.copy(p).negate();o.add(i);return{o,i};}
/* image-based light: soft desert sky + sun, prefiltered once */
let ENV=null;
if(renderer){const s=new THREE.Scene(),g=new THREE.SphereGeometry(60,48,24),p=g.attributes.position,cs=[],top=col('#a9c8e8'),hor=col('#f2eadc'),gnd=col('#9c8058');
  for(let i=0;i<p.count;i++){const y=p.getY(i)/60,c=y>=0?hor.clone().lerp(top,Math.pow(y,.5)):hor.clone().lerp(gnd,Math.min(1,-y*4));cs.push(c.r,c.g,c.b);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));s.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
  const sun=new THREE.Mesh(new THREE.SphereGeometry(5,16,8),new THREE.MeshBasicMaterial({color:new THREE.Color(1,.93,.8).multiplyScalar(14)}));sun.position.set(25,40,20);s.add(sun);
  const box=new THREE.Mesh(new THREE.PlaneGeometry(34,22),new THREE.MeshBasicMaterial({color:new THREE.Color(1,1,1).multiplyScalar(2.5),side:THREE.DoubleSide}));box.position.set(-32,22,-26);box.lookAt(0,0,0);s.add(box);
  try{const pm=new THREE.PMREMGenerator(renderer);ENV=pm.fromScene(s,.035).texture;pm.dispose();}catch(e){ENV=null;}}

