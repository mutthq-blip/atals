/* ================= realistic desert ground: sky panorama, macro sand, gravel, plants ================= */
/* value noise: periodic (for tiling textures) and free (for terrain) */
function pnoise(P,seed){const r=mulberry(seed),v=new Float32Array(P*P);for(let i=0;i<P*P;i++)v[i]=r();
  return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),m=a=>((a%P)+P)%P;
    const a=v[m(yi)*P+m(xi)],b=v[m(yi)*P+m(xi+1)],c=v[m(yi+1)*P+m(xi)],d=v[m(yi+1)*P+m(xi+1)];return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy;};}
function fbm(n,x,y,o=4){let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*n(x*f,y*f);a*=.5;f*=2;}return s;}
const TN=pnoise(256,901);const tnoise=(x,z,o=4)=>fbm(TN,x,z,o);

/* sand seen close up: grains, wind ripples, a few dark and bright grains; tile = 4 units (10 cm) */
function macroSand(seed,o={}){const S=512,c=cv(S),h=cv(S),g=c.getContext('2d'),k=h.getContext('2d'),ci=g.createImageData(S,S),hi=k.createImageData(S,S),rnd=mulberry(seed);
  const n1=pnoise(8,seed+1),n2=pnoise(32,seed+2),n3=pnoise(128,seed+3),b=col(o.base||'#d8b47e');
  const lin=x=>Math.pow(x,1/2.2)*255,R=lin(b.r),G=lin(b.g),B=lin(b.b),rip=o.ripple??1;
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=x/S,v=y/S;
    const w=(u*2+.18*fbm(n1,u*8,v*8,2))%1;const rp=(w<.7?w/.7:(1-w)/.3);/* asymmetric ripple: long windward, short lee slope */
    const lo=fbm(n2,u*32,v*32,3),gr=n3(u*128,v*128)*.6+rnd()*.4;
    const hv=rip*rp*.55+lo*.3+gr*.45;const j=(y*S+x)*4;hi.data[j]=hi.data[j+1]=hi.data[j+2]=Math.max(0,Math.min(255,hv*170));hi.data[j+3]=255;
    let t=.86+lo*.18+(gr-.5)*.22+rip*(rp-.5)*.06;ci.data[j]=R*t;ci.data[j+1]=G*t;ci.data[j+2]=B*t;ci.data[j+3]=255;}
  g.putImageData(ci,0,0);k.putImageData(hi,0,0);
  /* individual coloured grains */
  for(let i=0;i<S*S*.035;i++){const x=rnd()*S,y=rnd()*S,r=.6+rnd()*1.3,q=rnd();
    g.fillStyle=q<.25?`rgba(70,48,30,${.5+rnd()*.4})`:q<.45?`rgba(255,250,236,${.5+rnd()*.4})`:q<.6?`rgba(176,92,44,${.35+rnd()*.3})`:q<.7?`rgba(40,36,34,${.5+rnd()*.4})`:`rgba(${R*1.05|0},${G*1.0|0},${B*.9|0},.6)`;
    g.beginPath();g.arc(x,y,r,0,7);g.fill();k.fillStyle=`rgba(255,255,255,${.25+rnd()*.3})`;k.beginPath();k.arc(x,y,r,0,7);k.fill();}
  const rep=o.rep||[60,60];const map=ctex(c,{rep}),nm=normalFromHeight(h,o.nrm||2.2);nm.wrapS=nm.wrapT=THREE.RepeatWrapping;nm.repeat.set(rep[0],rep[1]);nm.anisotropy=ANISO;return{map,normal:nm};}

/* sky: the real HDR panorama, with the ground below the horizon warmed to Arabian sand and a soft haze band */
function hdrDome(s,R,o={}){if(!ENV_BG){skyDome(s,R,'#9fc2e2','#f1e7d6','#d9c49a');return null;}
  const m=new THREE.ShaderMaterial({uniforms:{map:{value:ENV_BG},rot:{value:o.rot||0},expo:{value:o.expo||1},gnd:{value:col(o.gnd||'#ffe2b0')},sky:{value:col(o.sky||'#ffffff')},haze:{value:col(o.haze||'#efe2cc')},hz:{value:o.hz||.06},hzk:{value:o.hzk??.85}},
    vertexShader:'varying vec3 vD;void main(){vD=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}',
    fragmentShader:`uniform sampler2D map;uniform float rot,expo,hz,hzk;uniform vec3 gnd,sky,haze;varying vec3 vD;
void main(){vec3 d=normalize(vD);float u=fract(atan(d.z,d.x)/6.2831853+.5+rot);float v=asin(clamp(d.y,-1.,1.))/3.14159265+.5;
vec3 c=min(texture2D(map,vec2(u,v)).rgb,vec3(6.));c*=d.y<0.?gnd:sky;c=mix(c,haze,hzk*exp(-abs(d.y)/hz));
gl_FragColor=vec4(c*expo,1.);
#include <tonemapping_fragment>
#include <encodings_fragment>
}`,side:THREE.BackSide,depthWrite:false,fog:false});
  const d=new THREE.Mesh(new THREE.SphereGeometry(R,64,32),m);d.renderOrder=-1;d.frustumCulled=false;s.add(d);s.userData.dome=d;return d;}

/* gravel: a few irregular stone shapes, instanced, half buried */
function stoneGeo(seed,det=2){const g=new THREE.IcosahedronGeometry(1,det),p=g.attributes.position,n=pnoise(16,seed),v=new V3(),rnd=mulberry(seed);const sx=.7+rnd()*.6,sz=.7+rnd()*.6;
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const a=Math.atan2(v.z,v.x),e=Math.asin(Math.max(-1,Math.min(1,v.y)));const f=.78+.32*fbm(n,a*2.5+8,e*2.5+8,3)+.06*Math.sin(a*3+seed);v.multiplyScalar(f);v.x*=sx;v.z*=sz;v.y*=.55;if(v.y<0)v.y*=.6;p.setXYZ(i,v.x,v.y,v.z);}
  g.computeVertexNormals();return smoothNormals(g);}
const STONE_PAL=['#9a8466','#b49c78','#7a6a58','#c8b08a','#8c6a4c','#5e5248','#a8795a','#d6c4a2','#6e5a46'];
function scatterStones(parent,o){const rnd=mulberry(o.seed||1),geos=[0,1,2,3].map(i=>stoneGeo(31+i*17+(o.seed||0)));
  const mat=keep(new THREE.MeshStandardMaterial({roughness:.82,metalness:0,normalMap:NRM.plain,normalScale:new THREE.Vector2(.6,.6)}));
  const per=Math.ceil(o.n/geos.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),s=new V3(),p=new V3(),c=new THREE.Color();const out=[];
  geos.forEach((geo,gi)=>{const im=new THREE.InstancedMesh(geo,mat,per);let k=0;
    for(let t=0;t<per*8&&k<per;t++){const r=o.r0+(o.r1-o.r0)*Math.sqrt(rnd()),a=rnd()*6.283,x=(o.cx||0)+Math.cos(a)*r,z=(o.cz||0)+Math.sin(a)*r;if(o.avoid&&o.avoid(x,z))continue;
      const big=rnd()<o.big,sz=big?o.s1*(.5+rnd()*.5):o.s0*(.4+rnd()*.9);const y=(o.h?o.h(x,z):0)-sz*.18;
      e.set((rnd()-.5)*.5,rnd()*6.3,(rnd()-.5)*.5);q.setFromEuler(e);s.set(sz,sz*(.7+rnd()*.6),sz);p.set(x,y,z);M.compose(p,q,s);im.setMatrixAt(k,M);
      c.copy(col(STONE_PAL[(rnd()*STONE_PAL.length)|0])).multiplyScalar(.8+rnd()*.35);im.setColorAt(k,c);k++;}
    im.count=k;im.castShadow=true;im.receiveShadow=true;parent.add(im);out.push(im);});return out;}

/* grass clump (e.g. Panicum turgidum after rain): folded, tapering blades, green at the base fading to straw at the tips */
function grassClump(seed,o={}){const rnd=mulberry(seed),n=o.n||70,H=o.h||5,pos=[],cols=[],idx=[];let vi=0;
  const gB=col(o.base||'#4f6b2a'),gM=col(o.mid||'#7d9440'),gT=col(o.tip||'#c9b77a'),dry=col('#b89f6c'),dryT=col('#e0cfa0');
  for(let b=0;b<n;b++){const isDry=rnd()<(o.dry??.25),a=rnd()*6.283,lean=.15+rnd()*.75*(o.spread||1),L=H*(.45+rnd()*.6),w=(o.w||.11)*(.7+rnd()*.6),r0=rnd()*(o.r||.6),droop=rnd()*.6*(o.droop??1);
    const bx=Math.cos(a)*r0,bz=Math.sin(a)*r0,dx=Math.cos(a),dz=Math.sin(a),px=-dz,pz=dx,SEG=o.seg||9;
    for(let i=0;i<=SEG;i++){const t=i/SEG,hor=lean*L*t*(1+droop*t),y=L*t*(1-droop*t*t*.85);const cx=bx+dx*hor,cz=bz+dz*hor,ww=w*(1-Math.pow(t,1.4)*.95),fold=ww*.35;
      for(const[sx,up]of[[-1,0],[0,fold],[1,0]]){pos.push(cx+px*ww*sx*.5,y+up,cz+pz*ww*sx*.5);const cc=isDry?dry.clone().lerp(dryT,t):t<.5?gB.clone().lerp(gM,t*2):gM.clone().lerp(gT,(t-.5)*2*(o.tipk??.8));const sh=.75+.25*(sx===0?1:.85);cols.push(cc.r*sh,cc.g*sh,cc.b*sh);}
      if(i<SEG){const a0=vi+i*3,a1=a0+3;idx.push(a0,a1,a0+1,a0+1,a1,a1+1,a0+1,a1+1,a0+2,a0+2,a1+1,a1+2);}}
    vi+=(SEG+1)*3;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,GRASS_M);m.castShadow=true;m.receiveShadow=true;return m;}
const GRASS_M=keep(new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.62,metalness:0}));

/* a small desert herb: branching stems with fleshy oval leaves */
function herb(seed,o={}){const rnd=mulberry(seed),g=new THREE.Group(),H=o.h||3,stem=keep(std(o.stem||'#7b8a4a',{roughness:.7})),leaf=keep(std(o.leaf||'#ffffff',{roughness:.55,side:THREE.DoubleSide}));
  const LG=o.low?new THREE.IcosahedronGeometry(1,0):new THREE.SphereGeometry(1,10,6);const L=[];
  for(let i=0;i<(o.n||7);i++){const a=rnd()*6.283,l=H*(.5+rnd()*.6),p0=new V3(0,0,0),p1=new V3(Math.cos(a)*l*.3,l*.55,Math.sin(a)*l*.3),p2=new V3(Math.cos(a)*l*.55,l*(.85+rnd()*.2),Math.sin(a)*l*.55);
    const cu=new THREE.QuadraticBezierCurve3(p0,p1,p2);g.add(new THREE.Mesh(taperTube(cu,u=>.07*(1-u*.6)*H/3,o.low?5:10,o.low?4:5),stem));
    const NL=o.low?7:12;for(let j=0;j<NL;j++){const t=.2+j*(.84/NL);const p=cu.getPoint(Math.min(1,t)),s=(.12+rnd()*.08)*H/3;L.push([p,s,rnd()*6.28,rnd()]);}}
  const im=new THREE.InstancedMesh(LG,leaf,L.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),c=new THREE.Color();
  L.forEach(([p,s,a,r],i)=>{e.set(.9+r*.5,a,0);q.setFromEuler(e);M.compose(p,q,new V3(s*.45,s*.12,s));im.setMatrixAt(i,M);c.copy(col(r<.2?'#a8a070':'#7f9458')).multiplyScalar(.8+r*.4);im.setColorAt(i,c);});
  g.add(im);g.traverse(n=>{if(n.isMesh||n.isInstancedMesh){n.castShadow=true;n.receiveShadow=true;}});return g;}

/* dry twigs and seed husks lying on the sand */
function litter(parent,o){const rnd=mulberry(o.seed||3),list=[],tw=keep(std('#8a6f4c',{roughness:.85})),hk=keep(std('#c9ad78',{roughness:.8,side:THREE.DoubleSide}));
  for(let i=0;i<o.n;i++){const r=o.r0+(o.r1-o.r0)*Math.sqrt(rnd()),a=rnd()*6.283,x=(o.cx||0)+Math.cos(a)*r,z=(o.cz||0)+Math.sin(a)*r;if(o.avoid&&o.avoid(x,z))continue;
    const L=o.L*(.4+rnd()),d=rnd()*6.283,y=(o.h?o.h(x,z):0)+.03;const a0=new V3(x,y,z),a2=new V3(x+Math.cos(d)*L,y,z+Math.sin(d)*L),a1=a0.clone().lerp(a2,.5).add(new V3((rnd()-.5)*L*.2,.04,(rnd()-.5)*L*.2));
    const m=new THREE.Mesh(taperTube(new THREE.QuadraticBezierCurve3(a0,a1,a2),u=>o.w*(1-u*.5),8,5),tw);m.castShadow=m.receiveShadow=true;parent.add(m);
    if(rnd()<.6){const hs=new THREE.Mesh(new THREE.CircleGeometry(o.w*3,8),hk);hs.scale.set(1,.45,1);hs.rotation.set(-Math.PI/2+(rnd()-.5)*.4,0,rnd()*6);hs.position.set(x+(rnd()-.5)*L,y+.01,z+(rnd()-.5)*L);hs.receiveShadow=true;parent.add(hs);}}}
