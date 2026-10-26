const XR={mats:[],groups:[],on:false};
function xrMat(m,op=.16){m.userData.xr={op0:m.opacity,t0:m.transparent,dw:m.depthWrite,op};XR.mats.push(m);return m;}
function xrGroup(g){g.visible=XR.on;XR.groups.push(g);return g;}
function setXray(on){XR.on=on;XR.mats.forEach(m=>{const d=m.userData.xr;m.transparent=on?true:d.t0;m.opacity=on?d.op:d.op0;m.depthWrite=on?false:d.dw;m.needsUpdate=true;});XR.groups.forEach(g=>g.visible=on);}
