/* ================= field kit (1 unit = 1 m): vehicle, people, aircraft, pivot, desert plants ================= */
const PAINT=keep(new THREE.MeshPhysicalMaterial({color:col('#f4f4f1'),roughness:.32,clearcoat:1,clearcoatRoughness:.12,metalness:.05}));
const GLASS=keep(new THREE.MeshPhysicalMaterial({color:col('#1d2a30'),roughness:.05,metalness:.2,clearcoat:1,clearcoatRoughness:.03,reflectivity:.9}));
const TRIM=keep(std('#2a2c2e',{roughness:.6})),CHROME=keep(std('#c9ccce',{metalness:.9,roughness:.22})),RUBBER=keep(std('#191919',{roughness:.92}));
const STRIPE=keep(std('#1b8354',{roughness:.45})),LAMP=keep(new THREE.MeshPhysicalMaterial({color:col('#f6f6f0'),roughness:.05,clearcoat:1,emissive:col('#fff6e0'),emissiveIntensity:.25}));
const BEACON=keep(new THREE.MeshPhysicalMaterial({color:col('#ff8a1c'),roughness:.15,clearcoat:1,transparent:true,opacity:.9,emissive:col('#ff7a00'),emissiveIntensity:.35}));
/* profile in the (z,y) plane, extruded across x */
function sideExtrude(pts,w,mat,bevel=.04){const s=new THREE.Shape();pts.forEach(([z,y],i)=>i?s.lineTo(z,y):s.moveTo(z,y));
  const g=new THREE.ExtrudeGeometry(s,{depth:w-bevel*2,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,steps:1,curveSegments:16});g.translate(0,0,-(w-bevel*2)/2);g.rotateY(-Math.PI/2);/* shape x -> world z, extrude -> world x */g.computeVertexNormals();return new THREE.Mesh(g,mat);}
const arch=(zc,yc,r,n=10)=>{const o=[];for(let i=0;i<=n;i++){const a=Math.PI-i/n*Math.PI;o.push([zc+Math.cos(a)*r,yc+Math.sin(a)*r]);}return o;};
function tyre(R=.4,W=.28){const g=new THREE.Group();const pr=[];const n=14;for(let i=0;i<=n;i++){const a=-Math.PI/2+i/n*Math.PI;pr.push(new THREE.Vector2(R-.07+Math.cos(a)*.07,Math.sin(a)*W/2));}
  pr.unshift(new THREE.Vector2(R*.62,-W/2));pr.push(new THREE.Vector2(R*.62,W/2));const t=new THREE.Mesh(new THREE.LatheGeometry(pr,32),RUBBER);t.rotation.z=Math.PI/2;g.add(t);
  /* tread blocks */const tb=new THREE.InstancedMesh(new THREE.BoxGeometry(W*.8,.035,.07),RUBBER,24),M=new THREE.Matrix4(),q=new THREE.Quaternion();for(let i=0;i<24;i++){const a=i/24*Math.PI*2;q.setFromAxisAngle(XA,a);M.compose(new V3(0,Math.cos(a)*(R+.005),Math.sin(a)*(R+.005)),q,new V3(1,1,1));tb.setMatrixAt(i,M);}g.add(tb);
  const rim=new THREE.Mesh(new THREE.CylinderGeometry(R*.6,R*.6,W*.9,24),CHROME);rim.rotation.z=Math.PI/2;g.add(rim);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(R*.18,R*.22,W*.95,12),TRIM);hub.rotation.z=Math.PI/2;g.add(hub);
  for(let i=0;i<6;i++){const sp=new THREE.Mesh(new THREE.BoxGeometry(W*.96,R*.4,.05),CHROME);sp.rotation.x=i/6*Math.PI;g.add(sp);}
  g.traverse(n=>{if(n.isMesh||n.isInstancedMesh)n.castShadow=true;});return g;}
function wheel(){return tyre(.42,.3);}
/* desert 4x4 pickup, single cab (faces +z); optional ULV air-blast sprayer in the bed */
function makePickup(sprayer){const g=new THREE.Group(),P={};
  const low=[[-2.62,.62],...arch(-1.7,.5,.53),[1.1,.62],...arch(1.62,.5,.53),[2.5,.62],[2.66,.78],[2.66,1.0],[2.56,1.12],[1.4,1.2],[-.3,1.18],[-.3,.92],[-2.62,.92]];
  g.add(sideExtrude(low,1.84,PAINT,.05));
  g.add(sideExtrude([[-.32,1.12],[1.36,1.16],[1.02,1.9],[.92,1.93],[-.18,1.95],[-.3,1.88]],1.74,PAINT,.06));
  /* bed walls and tailgate */for(const s of[-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(.07,.36,2.3),PAINT);w.position.set(s*.885,1.08,-1.47);g.add(w);}
  const tg=new THREE.Mesh(new THREE.BoxGeometry(1.84,.36,.07),PAINT);tg.position.set(0,1.08,-2.59);g.add(tg);const bf=new THREE.Mesh(new THREE.BoxGeometry(1.7,.04,2.3),TRIM);bf.position.set(0,.93,-1.47);g.add(bf);
  /* glass */const ws=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.68),GLASS);ws.position.set(0,1.56,1.25);ws.rotation.x=-Math.atan2(.34,.74);g.add(ws);const bw=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.42),GLASS);bw.position.set(0,1.6,-.37);bw.rotation.y=Math.PI;g.add(bw);
  for(const s of[-1,1]){const sh=new THREE.Shape();sh.moveTo(-.15,1.3);sh.lineTo(1.08,1.3);sh.lineTo(.86,1.83);sh.lineTo(-.1,1.85);sh.lineTo(-.15,1.3);const sg=new THREE.ShapeGeometry(sh);sg.rotateY(-Math.PI/2);const sw=new THREE.Mesh(sg,GLASS);sw.position.x=s*.885;if(s>0)sw.scale.x=-1;g.add(sw);
    /* door line, handle, mirror, green stripe, side step */const dl=new THREE.Mesh(new THREE.BoxGeometry(.012,.62,.012),TRIM);dl.position.set(s*.93,1.0,1.2);g.add(dl);const dl2=dl.clone();dl2.position.z=-.22;g.add(dl2);
    const hd=new THREE.Mesh(new THREE.BoxGeometry(.03,.04,.16),TRIM);hd.position.set(s*.935,1.12,.05);g.add(hd);
    const mr=new THREE.Mesh(new THREE.BoxGeometry(.06,.18,.24),TRIM);mr.position.set(s*1.02,1.42,1.12);g.add(mr);
    const st=new THREE.Mesh(new THREE.BoxGeometry(.012,.1,4.9),STRIPE);st.position.set(s*.928,.86,0);g.add(st);const st2=new THREE.Mesh(new THREE.BoxGeometry(.012,.035,4.9),STRIPE);st2.position.set(s*.928,.77,0);g.add(st2);
    const step=new THREE.Mesh(new THREE.BoxGeometry(.18,.05,1.5),TRIM);step.position.set(s*.98,.5,.45);g.add(step);
    /* fender flares */for(const zc of[-1.7,1.62]){const fl=new THREE.Mesh(new THREE.TorusGeometry(.55,.04,6,20,Math.PI),TRIM);fl.rotation.y=Math.PI/2;fl.position.set(s*.93,.5,zc);g.add(fl);}}
  /* front: grille, lamps, bumper; rear lamps; snorkel; roof beacon */
  const gr=new THREE.Mesh(new THREE.BoxGeometry(1.2,.28,.04),TRIM);gr.position.set(0,.93,2.67);g.add(gr);for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(1.16,.02,.02),CHROME);b.position.set(0,.84+i*.06,2.695);g.add(b);}
  for(const s of[-1,1]){const l=new THREE.Mesh(new THREE.BoxGeometry(.24,.13,.05),LAMP);l.position.set(s*.74,.97,2.665);g.add(l);const rl=new THREE.Mesh(new THREE.BoxGeometry(.1,.26,.04),keep(std('#b3221a',{roughness:.2})));rl.position.set(s*.85,1.0,-2.63);g.add(rl);}
  const bp=new THREE.Mesh(new THREE.BoxGeometry(1.96,.2,.18),TRIM);bp.position.set(0,.66,2.72);g.add(bp);const rb=bp.clone();rb.position.z=-2.68;g.add(rb);
  const sn=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,1.0,10),TRIM);sn.position.set(.9,1.55,1.3);g.add(sn);const sc=new THREE.Mesh(new THREE.BoxGeometry(.14,.12,.2),TRIM);sc.position.set(.9,2.06,1.34);g.add(sc);
  const lb=new THREE.Mesh(new THREE.BoxGeometry(1.1,.08,.18),TRIM);lb.position.set(0,1.99,.35);g.add(lb);for(const s of[-1,1]){const bc=new THREE.Mesh(new THREE.CylinderGeometry(.07,.08,.12,14),BEACON);bc.position.set(s*.4,2.08,.35);g.add(bc);}
  const tow=new THREE.Mesh(new THREE.BoxGeometry(1.7,.25,4.6),TRIM);tow.position.set(0,.5,0);g.add(tow);
  [[.86,1.62],[-.86,1.62],[.86,-1.7],[-.86,-1.7]].forEach(([x,z])=>{const w=wheel();w.position.set(x,.42,z);g.add(w);});
  if(sprayer){/* ULV air-blast sprayer: tank, engine, blower and swivel nozzle */
    const tank=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,1.1,24),keep(phys('#e9e6dc',{roughness:.35,clearcoat:.5})));tank.rotation.x=Math.PI/2;tank.position.set(-.35,1.33,-1.25);g.add(tank);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.08,14),keep(std('#1b8354')));cap.position.set(-.35,1.71,-1.25);g.add(cap);
    const frame=new THREE.Mesh(new THREE.BoxGeometry(1.5,.08,1.9),FM.metal);frame.position.set(0,.98,-1.5);g.add(frame);
    const eng=new THREE.Mesh(new THREE.BoxGeometry(.55,.45,.6),keep(std('#d14b1f',{roughness:.5})));eng.position.set(.42,1.23,-1.95);g.add(eng);
    const blower=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.32,24),FM.metal);blower.position.set(.42,1.62,-1.95);g.add(blower);
    const duct=segTube([new V3(.42,1.75,-1.95),new V3(.42,2.15,-1.95),new V3(.55,2.45,-2.1)],.09,.07,FM.metal,10);g.add(duct);
    const noz=new THREE.Mesh(new THREE.ConeGeometry(.11,.36,16),FM.metal);noz.rotation.z=-Math.PI/2-.25;noz.position.set(.78,2.52,-2.12);g.add(noz);
    P.nozzle=new V3(.95,2.56,-2.12);P.tank=new V3(-.35,1.8,-1.25);}
  P.cab=new V3(0,2.2,.4);g.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});g.userData.P=P;return g;}

/* people: lathe-turned body so the silhouette reads as a person; ppe = white coverall, hood, respirator, goggles, gloves */
const SKIN=keep(std('#a8724c',{roughness:.6})),BOOT=keep(std('#3b2c20',{roughness:.7})),GLOVE=keep(std('#2f6f3e',{roughness:.6}));
function lathe(pts,mat,seg=20){return new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg),mat);}
function limb(a,b,r0,r1,mat){const m=new THREE.Mesh(taperTube(new THREE.LineCurve3(a,b),u=>r0+(r1-r0)*u,4,10),mat);return m;}
function makePerson(o={}){const g=new THREE.Group(),ppe=!!o.ppe;const cl=ppe?keep(std('#f2f1ec',{roughness:.85})):o.cloth||keep(std('#b9a37a',{roughness:.9})),pants=ppe?cl:keep(std('#6b5b45',{roughness:.9}));
  /* legs */for(const s of[-1,1]){g.add(limb(new V3(s*.1,.92,0),new V3(s*.11,.48,.02),.085,.065,pants));g.add(limb(new V3(s*.11,.48,.02),new V3(s*.11,.1,0),.062,.05,pants));
    const bt=new THREE.Mesh(new THREE.BoxGeometry(.11,.11,.27),BOOT);bt.position.set(s*.11,.055,.05);g.add(bt);}
  /* torso and hips */const t=lathe([[0,.86],[.15,.88],[.17,.98],[.155,1.12],[.17,1.3],[.2,1.42],[.17,1.48],[.07,1.53],[0,1.54]],cl);t.scale.z=.72;g.add(t);
  if(!ppe){const vest=lathe([[.0,1.02],[.165,1.02],[.16,1.12],[.175,1.3],[.205,1.42],[.0,1.43]],keep(std('#1b8354',{roughness:.8})));vest.scale.set(1.04,1,.76);g.add(vest);
    const rf=new THREE.Mesh(new THREE.CylinderGeometry(.168,.17,.035,20,1,true),keep(std('#e8eadf',{roughness:.3,metalness:.4})));rf.scale.z=.78;rf.position.y=1.18;g.add(rf);}
  /* neck, head */g.add(lathe([[.05,1.5],[.05,1.6]],SKIN,10));const hd=new THREE.Mesh(new THREE.SphereGeometry(.105,20,16),SKIN);hd.scale.set(.92,1.12,1);hd.position.y=1.7;g.add(hd);
  if(ppe){const hood=new THREE.Mesh(new THREE.SphereGeometry(.125,20,14,0,Math.PI*2,0,Math.PI*.6),cl);hood.scale.set(1,1.15,1.05);hood.position.y=1.71;g.add(hood);
    const rsp=new THREE.Mesh(new THREE.SphereGeometry(.07,16,10),keep(std('#2c3337',{roughness:.5})));rsp.scale.set(1.3,.9,.9);rsp.position.set(0,1.62,.08);g.add(rsp);
    for(const s of[-1,1]){const f=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.04,12),keep(std('#d9a020',{roughness:.5})));f.rotation.x=Math.PI/2;f.position.set(s*.065,1.6,.13);g.add(f);}
    const gg=new THREE.Mesh(new THREE.BoxGeometry(.19,.06,.06),GLASS);gg.position.set(0,1.73,.09);g.add(gg);}
  else{/* cap with peak, shemagh at the neck */const cap=new THREE.Mesh(new THREE.SphereGeometry(.112,20,10,0,Math.PI*2,0,Math.PI*.5),keep(std('#e9e6dc',{roughness:.8})));cap.position.y=1.74;g.add(cap);
    const pk=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.012,16,1,false,-Math.PI/2,Math.PI),cap.material);pk.position.set(0,1.745,.07);pk.scale.z=1.3;g.add(pk);}
  /* arms */const reach=o.reach?.32:0;for(const s of[-1,1]){const sh=new V3(s*.2,1.42,0),el=new V3(s*.25,1.15,reach*.4),wr=new V3(s*.24,.92+reach*.35,reach);g.add(limb(sh,el,.06,.05,cl),limb(el,wr,.05,.04,cl));
    const hn=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),ppe?GLOVE:SKIN);hn.scale.set(.8,1.2,1);hn.position.copy(wr).add(new V3(0,-.04,0));g.add(hn);}
  g.traverse(n=>{if(n.isMesh)n.castShadow=true;});return g;}

/* crop-spraying aircraft, low wing (faces +z) */
function makePlane(){const g=new THREE.Group(),W=keep(new THREE.MeshPhysicalMaterial({color:col('#f2efe6'),roughness:.35,clearcoat:.8})),Y=keep(new THREE.MeshPhysicalMaterial({color:col('#1b8354'),roughness:.35,clearcoat:.8}));
  const fus=new THREE.Mesh(shapedBody(9.6,.62,.78,t=>{const u=(t+1)/2;return{w:endCap(t,2.2)*(u<.55?.32+.68*Math.pow(u/.55,.8):1-.18*(u-.55)/.45),h:endCap(t,2.2)*(u<.55?.38+.62*Math.pow(u/.55,.9):1)};},{n:2.3}),W);fus.position.set(0,1.95,-.6);g.add(fus);
  const cowl=new THREE.Mesh(new THREE.CylinderGeometry(.6,.66,1.4,24),Y);cowl.rotation.x=Math.PI/2;cowl.position.set(0,1.95,3.6);g.add(cowl);
  const spin=new THREE.Mesh(new THREE.ConeGeometry(.22,.45,20),TRIM);spin.rotation.x=Math.PI/2;spin.position.set(0,1.95,4.55);g.add(spin);
  const prop=new THREE.Group();for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.16,1.35,.04),TRIM);b.position.y=.7;const h=new THREE.Group();h.add(b);h.rotation.z=i/3*Math.PI*2;prop.add(h);}
  const disc=new THREE.Mesh(new THREE.CircleGeometry(1.4,40),keep(new THREE.MeshBasicMaterial({color:0x222222,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide})));prop.add(disc);prop.position.set(0,1.95,4.4);g.add(prop);g.userData.prop=prop;
  const can=new THREE.Mesh(new THREE.SphereGeometry(.5,24,16,0,Math.PI*2,0,Math.PI/2),GLASS);can.scale.set(.9,.9,1.9);can.position.set(0,2.55,.9);g.add(can);
  /* hopper and wings: tapered, slight dihedral */const wingS=new THREE.Shape();wingS.moveTo(0,0);wingS.lineTo(7.6,.25);wingS.lineTo(7.6,1.45);wingS.lineTo(0,2.1);wingS.lineTo(0,0);
  for(const s of[-1,1]){const wg=new THREE.ExtrudeGeometry(wingS,{depth:.1,bevelEnabled:true,bevelThickness:.05,bevelSize:.04,bevelSegments:2});wg.rotateX(Math.PI/2);const w=new THREE.Mesh(wg,W);w.scale.x=s;w.position.set(s*.4,1.5,1.35);w.rotation.z=s*.06;w.rotation.y=0;g.add(w);
    const tip=new THREE.Mesh(new THREE.BoxGeometry(.06,.14,1.25),Y);tip.position.set(s*8.0,1.95,.45);g.add(tip);
    const tp=new THREE.Mesh(new THREE.BoxGeometry(2.0,.08,.95),W);tp.position.set(s*1.05,2.35,-4.6);g.add(tp);
    /* landing gear */const lg=limb(new V3(s*.35,1.5,2.2),new V3(s*1.3,.45,2.4),.05,.04,TRIM);g.add(lg);const wl=tyre(.4,.2);wl.position.set(s*1.38,.4,2.4);g.add(wl);}
  const fin=new THREE.Shape();fin.moveTo(0,0);fin.lineTo(1.6,0);fin.lineTo(1.1,1.5);fin.lineTo(.4,1.5);fin.lineTo(0,0);const fg=new THREE.ExtrudeGeometry(fin,{depth:.06,bevelEnabled:false});fg.rotateY(Math.PI/2);const fm=new THREE.Mesh(fg,Y);fm.position.set(-.03,2.3,-3.8);g.add(fm);
  const tw=tyre(.16,.08);tw.position.set(0,.6,-4.8);g.add(tw);
  /* spray boom with nozzles along the trailing edge */const boom=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,14,8),CHROME);boom.rotation.z=Math.PI/2;boom.position.set(0,1.3,.1);g.add(boom);
  for(let i=-6;i<=6;i++){if(Math.abs(i)<1)continue;const n=new THREE.Mesh(new THREE.CylinderGeometry(.035,.02,.16,8),TRIM);n.position.set(i*1.1,1.2,.1);g.add(n);}
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(.02,.16,6),Y);for(const s of[-1,1]){const st=stripe.clone();st.position.set(s*.6,2.05,-.2);g.add(st);}
  g.traverse(n=>{if(n.isMesh){n.castShadow=true;}});g.position.y=0;
  /* model origin at the wheels; lift so callers that place it at flying height keep the old meaning */g.children.forEach(c=>c.position.y-=1.95);return g;}

/* desert plants for the 1 m scale: instanced copies of a few clump shapes */
function instancedPlants(parent,o){const geos=o.geos,rnd=mulberry(o.seed||1),per=Math.ceil(o.n/geos.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new V3(),p=new V3(),c=new THREE.Color();const out=[];
  geos.forEach(geo=>{const im=new THREE.InstancedMesh(geo,o.mat||GRASS_M,per);let k=0;for(let t=0;t<per*6&&k<per;t++){const r=(o.r0||0)+((o.r1||100)-(o.r0||0))*Math.sqrt(rnd()),a=rnd()*6.283,x=(o.cx||0)+Math.cos(a)*r,z=(o.cz||0)+Math.sin(a)*r;if(o.avoid&&o.avoid(x,z))continue;
      const sc=o.s0+(o.s1-o.s0)*rnd();q.setFromAxisAngle(UP,rnd()*6.28);s.set(sc,sc*(.8+rnd()*.4),sc);p.set(x,(o.h?o.h(x,z):0)-.02,z);M.compose(p,q,s);im.setMatrixAt(k,M);c.setRGB(1,1,1).multiplyScalar(.85+rnd()*.3);if(o.tint)c.lerp(o.tint,rnd()*.5);im.setColorAt(k,c);k++;}
    im.count=k;im.castShadow=true;im.receiveShadow=true;parent.add(im);out.push(im);});return out;}
function mergeGroup(gr){const parts=[];gr.updateMatrixWorld(true);gr.traverse(n=>{if(n.isMesh&&!n.isInstancedMesh){let g2=n.geometry.index?n.geometry.toNonIndexed():n.geometry.clone();g2.applyMatrix4(n.matrixWorld);
      if(!g2.attributes.color){const cc=n.material.color||new THREE.Color(1,1,1),a=new Float32Array(g2.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=cc.r;a[i+1]=cc.g;a[i+2]=cc.b;}g2.setAttribute('color',new THREE.BufferAttribute(a,3));}
      const out=new THREE.BufferGeometry();['position','normal','color'].forEach(k=>out.setAttribute(k,g2.attributes[k]));parts.push(out);}
    if(n.isInstancedMesh){const m=new THREE.Matrix4(),cc=new THREE.Color();for(let i=0;i<n.count;i++){n.getMatrixAt(i,m);m.premultiply(n.matrixWorld);const g2=(n.geometry.index?n.geometry.toNonIndexed():n.geometry.clone());g2.applyMatrix4(m);
      if(n.instanceColor){cc.fromArray(n.instanceColor.array,i*3);}else cc.set(1,1,1);const mc=n.material.color||new THREE.Color(1,1,1);const a=new Float32Array(g2.attributes.position.count*3);for(let j=0;j<a.length;j+=3){a[j]=cc.r*mc.r;a[j+1]=cc.g*mc.g;a[j+2]=cc.b*mc.b;}g2.setAttribute('color',new THREE.BufferAttribute(a,3));
      const out=new THREE.BufferGeometry();['position','normal','color'].forEach(k=>out.setAttribute(k,g2.attributes[k]));parts.push(out);}}});
  let n=0;parts.forEach(p=>n+=p.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
  parts.forEach(p=>{P.set(p.attributes.position.array,o*3);N.set(p.attributes.normal.array,o*3);C.set(p.attributes.color.array,o*3);o+=p.attributes.position.count;});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setAttribute('color',new THREE.BufferAttribute(C,3));return g;}
/* acacia: twisted trunk, spreading branches, flat umbrella of small leaf clusters */
function makeAcacia(seed){const rnd=mulberry(seed),g=new THREE.Group(),bark=keep(std('#5b4733',{roughness:.95})),H=4+rnd()*2;
  const trunk=[new V3(0,0,0),new V3((rnd()-.5)*.4,H*.35,(rnd()-.5)*.4),new V3((rnd()-.5)*.6,H*.62,(rnd()-.5)*.6)];g.add(segTube(trunk,.28,.16,bark,10));
  const leafG=new THREE.IcosahedronGeometry(1,0),lm=keep(std('#ffffff',{roughness:.85,flatShading:true})),L=[];
  for(let i=0;i<6;i++){const a=i/6*6.283+rnd()*.5,len=1.6+rnd()*1.6,b0=trunk[2].clone(),b1=b0.clone().add(new V3(Math.cos(a)*len*.5,H*.18,Math.sin(a)*len*.5)),b2=b0.clone().add(new V3(Math.cos(a)*len,H*.3+rnd()*.4,Math.sin(a)*len));
    g.add(segTube([b0,b1,b2],.12,.05,bark,7));for(let j=0;j<26;j++){const r=rnd()*1.3,aa=rnd()*6.28;L.push(new V3(b2.x+Math.cos(aa)*r,H*.95+(rnd()-.3)*.35,b2.z+Math.sin(aa)*r));}}
  const im=new THREE.InstancedMesh(leafG,lm,L.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),c=new THREE.Color();
  L.forEach((p,i)=>{q.setFromAxisAngle(UP,rnd()*6);M.compose(p,q,new V3(.5+rnd()*.35,.16+rnd()*.1,.5+rnd()*.35));im.setMatrixAt(i,M);c.copy(col(['#5d7434','#6c823d','#4f6630','#7a8c48'][i%4]));im.setColorAt(i,c);});
  g.add(im);g.traverse(n=>{if(n.isMesh||n.isInstancedMesh){n.castShadow=true;n.receiveShadow=true;}});return g;}
/* centre pivot: towers on wheels carrying an arched pipe with a truss underneath (arm along +x) */
function makePivot(R,spans){const g=new THREE.Group(),M=keep(std('#a9b0b4',{metalness:.7,roughness:.35})),L=R/spans;
  const tower=new THREE.Mesh(new THREE.CylinderGeometry(.35,.6,4.2,12),M);tower.position.y=2.1;g.add(tower);
  for(let i=0;i<spans;i++){const x0=i*L,x1=(i+1)*L;const pts=[];for(let k=0;k<=12;k++){const u=k/12;pts.push(new V3(x0+u*L,3.9+Math.sin(u*Math.PI)*.9,0));}
    g.add(new THREE.Mesh(taperTube(new THREE.CatmullRomCurve3(pts),()=>.1,24,8),M));
    for(let k=0;k<6;k++){const u0=k/6,u1=(k+1)/6,a=pts[Math.round(u0*12)],b=new V3(x0+(u0+u1)/2*L,3.6,0);for(const s of[-1,1]){g.add(seg(a,b.clone().setZ(s*.5),.025,M));}}
    for(const s of[-1,1])g.add(seg(new V3(x0,3.7,s*.5),new V3(x1,3.7,s*.5),.025,M));
    /* A-frame tower with two wheels */for(const s of[-1,1]){g.add(seg(new V3(x1,3.9,0),new V3(x1,.55,s*1.4),.06,M));const w=tyre(.55,.32);w.rotation.y=Math.PI/2;w.position.set(x1,.55,s*1.5);g.add(w);}
    g.add(seg(new V3(x1,.6,-1.4),new V3(x1,.6,1.4),.06,M));
    for(let k=1;k<5;k++){const d=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,1.6,4),M);d.position.set(x0+k*L/5,3.1,0);g.add(d);}}
  g.traverse(n=>{if(n.isMesh)n.castShadow=true;});return g;}
