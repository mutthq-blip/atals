const XR={mats:[],groups:[],on:false};
/* see-through materials and hidden groups for the inside view; tag 'soil' = under the ground (life cycle), 'body' = inside the locust */
function xrMat(m,op=.16,tag='soil'){m.userData.xr={op0:m.opacity,t0:m.transparent,dw:m.depthWrite,op,tag};XR.mats.push(m);return m;}
function xrGroup(g,tag='soil'){g.visible=false;g.userData.xrTag=tag;XR.groups.push(g);return g;}
function setXray(on,tag='soil'){XR.on=on;XR.mats.forEach(m=>{const d=m.userData.xr,a=on&&d.tag===tag;m.transparent=a?true:d.t0;m.opacity=a?d.op:d.op0;m.depthWrite=a?false:d.dw;m.needsUpdate=true;});XR.groups.forEach(g=>g.visible=on&&g.userData.xrTag===tag);}
