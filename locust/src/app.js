/* ================= camera, orbit, pointer ================= */
const cam=new THREE.PerspectiveCamera(40,1,.05,2500);
const state={xray:false,tab:'locust',active:null,life:'egg',phase:'greg',season:'winter',seen:new Set(),qz:{i:0,score:0,picked:null},rep:new Set()};
let attract=false;
class Orbit{
  constructor(v,lim){this.yaw=v.yaw;this.pitch=v.pitch;this.dist=v.dist;this.target=new V3(...v.tgt);this.lim=lim;this.goal=null;this.idle=0}
  to(v){this.goal={yaw:v.yaw??this.yaw,pitch:v.pitch??this.pitch,dist:v.dist??this.dist,target:v.target?v.target.clone():(v.tgt?new V3(...v.tgt):this.target.clone())};this.idle=0;
    if(RM){Object.assign(this,{yaw:this.goal.yaw,pitch:this.goal.pitch,dist:this.goal.dist});this.target.copy(this.goal.target);this.goal=null;}}
  update(dt){if(this.goal){const k=1-Math.exp(-dt*4.2);let dy=this.goal.yaw-this.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));
      this.yaw+=dy*k;this.pitch+=(this.goal.pitch-this.pitch)*k;this.dist+=(this.goal.dist-this.dist)*k;this.target.lerp(this.goal.target,k);
      if(Math.abs(dy)<.002&&Math.abs(this.goal.dist-this.dist)<this.dist*.002&&this.target.distanceTo(this.goal.target)<this.dist*.001)this.goal=null;}
    else{this.idle+=dt;if(attract&&this.idle>4&&!RM&&state.active===null)this.yaw+=dt*this.lim.spin;}}
  apply(c){const cp=Math.cos(this.pitch),d=this.dist;c.position.set(this.target.x+d*cp*Math.sin(this.yaw),this.target.y+d*Math.sin(this.pitch),this.target.z+d*cp*Math.cos(this.yaw));
    if(this===oField){const gy=DUNE(c.position.x,c.position.z)+1.2;if(c.position.y<gy)c.position.y=gy;}
    c.lookAt(this.target);}
}
const VIEWS={
  locust:()=>({yaw:-.75,pitch:.32,dist:10.5,target:new V3(0,1.3,0)}),
  life_over:()=>({yaw:.1,pitch:.42,dist:25,target:new V3(0,-1.6,1.5)}),
  life_egg:()=>({yaw:.22,pitch:.08,dist:11,target:new V3(-3.4,-3,SB.z)}),
  life_hopper:()=>({yaw:.08,pitch:.5,dist:8.5,target:new V3(1.7,.3,2.4)}),
  life_imm:()=>({yaw:.35,pitch:.35,dist:7,target:new V3(6.7,.8,-1.2)}),
  life_adult:()=>({yaw:.6,pitch:.25,dist:11,target:new V3(-3.8,-.8,SB.z-.6)}),
  phase:()=>state.phase==='sol'?{yaw:-.5,pitch:.42,dist:11,target:new V3(-5,.6,.3)}:{yaw:.35,pitch:.55,dist:13,target:new V3(4.6,.4,1.2)},
  seasons:()=>({yaw:0,pitch:1.05,dist:36,target:LL(44.6,23.4)}),
  damage:()=>({yaw:.65,pitch:.2,dist:135,target:FARM.clone().add(new V3(12,8,0))}),
  survey:()=>({yaw:.4,pitch:.2,dist:34,target:new V3(2,1.5,8)}),
  control:()=>{const k=CTRL.machine;return k===2?{yaw:.95,pitch:.42,dist:380,target:new V3(0,8,0)}:k===1?{yaw:.95,pitch:.42,dist:118,target:new V3(0,2,0)}:{yaw:.95,pitch:.42,dist:44,target:new V3(0,1,0)};},
  quiz:()=>({yaw:-.75,pitch:.32,dist:10.5,target:new V3(0,1.3,0)})};
const oSpec=new Orbit({yaw:-.75,pitch:.32,dist:10.5,tgt:[0,1.3,0]},{pitch:[.02,1.45],dist:[2.5,45],spin:.1});
const oField=new Orbit({yaw:.55,pitch:.22,dist:46,tgt:[0,1,0]},{pitch:[.03,1.3],dist:[6,700],spin:.05});
const oMap=new Orbit({yaw:0,pitch:1.05,dist:36,tgt:[0,0,0]},{pitch:[.35,1.5],dist:[10,70],spin:.04});
let scene=spec,orbit=oSpec;
const ptrs=new Map();let pinch0=0,dist0=0;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch0=Math.hypot(a.x-b.x,a.y-b.y);dist0=orbit.dist;}});
canvas.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;const L2=orbit.lim;orbit.goal=null;orbit.idle=0;
  if(ptrs.size===1){orbit.yaw-=dx*.006;orbit.pitch=Math.min(L2.pitch[1],Math.max(L2.pitch[0],orbit.pitch+dy*.005));}
  else if(ptrs.size===2){const[a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(d>0)orbit.dist=Math.min(L2.dist[1],Math.max(L2.dist[0],dist0*pinch0/d));}});
['pointerup','pointercancel','pointerleave'].forEach(t=>canvas.addEventListener(t,e=>ptrs.delete(e.pointerId)));
canvas.addEventListener('wheel',e=>{e.preventDefault();const L2=orbit.lim;orbit.goal=null;orbit.idle=0;orbit.dist=Math.min(L2.dist[1],Math.max(L2.dist[0],orbit.dist*Math.exp(e.deltaY*.0012)));},{passive:false});
function resize(){if(!renderer)return;const w=stageEl.clientWidth,h=stageEl.clientHeight;renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(w,h,false);
  cam.aspect=w/h;const hf=Math.tan(THREE.MathUtils.degToRad(23));cam.fov=Math.max(40,THREE.MathUtils.radToDeg(2*Math.atan(hf/cam.aspect)));cam.updateProjectionMatrix();}
if(renderer){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;new ResizeObserver(resize).observe(stageEl);resize();}

/* ================= content ================= */
const L=x=>Array.isArray(x)?x[0]:x;
const SRC='الدليل الإجرائي لاستكشاف ومكافحة الجراد الصحراوي';
const TABS=[['locust','الجرادة'],['life','دورة الحياة'],['phase','المظهران'],['seasons','مواسم التكاثر'],['damage','الأضرار'],['survey','الرصد والمسح'],['control','المكافحة'],['quiz','اختبر نفسك']];
const W=(o,v)=>{o.updateWorldMatrix(true,false);return o.localToWorld(v.clone());};
const HS={
 locust:[
  {t:'عين مركبة تحكي عمر الجرادة',b:'في العين المركبة خطوط تزيد مع كل انسلاخ، ومنها يعرف المختص كم انسلاخاً مرت به الجرادة وأي مظهر هي: خمسة أطوار للحوريات في المظهر التجمعي، وستة في المظهر الانفرادي.',p:()=>WL(HERO,'eye'),yaw:-1.2,pitch:.25,dist:5,ph:'cover'},
  {t:'فم قارض يأكل كل شيء أخضر',b:'تأكل الجرادة كل يوم ما يعادل وزنها (2–3 غرامات)، ولا تقتصر على نبات معين: محاصيل الحبوب والأعلاف والخضار والمراعي وأوراق الأشجار.',p:()=>WL(HERO,'mouth'),yaw:-.9,pitch:.05,dist:4.6,ph:'crop'},
  {t:'قرون استشعار قصيرة',b:'تتحسس بها الجرادة طريقها وغذاءها وما حولها من جراد. هي قصيرة وخيطية، وهذا من الفروق بين الجراد والجنادب ذات القرون الطويلة.',p:()=>WL(HERO,'antenna'),yaw:-.3,pitch:.45,dist:5},
  {t:'أجنحة للطيران مع الرياح',b:'جناحان أماميان طويلان مرقطان يغطيان جناحين خلفيين شفافين. تطير الأسراب بمساعدة الرياح بين مناطق التكاثر وتعبر الحدود بين الدول، لذلك يُعد من أخطر الآفات العابرة للحدود.',p:()=>WL(HERO,'wing'),yaw:-2.2,pitch:.45,dist:6.5},
  {t:'أرجل خلفية للقفز',b:'الفخذ العريض يخزن قوة القفز. الحوريات بلا أجنحة، فتنتقل بالمشي والقفز في مجموعات تسمى بقع الحوريات أو «الدبا».',p:()=>WL(HERO,'femur'),yaw:-1.7,pitch:.2,dist:6}],
 phase:[
  {t:'الجراد الانفرادي',g:'sol',b:'يعيش منفرداً في أعداد قليلة ولا يسبب ضرراً يذكر. لونه أخضر أو رمادي يشبه البيئة حوله، وتمر حورياته بستة أطوار.',p:()=>WL(SOL,'pronotum'),yaw:-.6,pitch:.3,dist:6},
  {t:'حورية انفرادية',g:'sol',b:'تتحرك بمجرد فقسها منفردة بحثاً عن الطعام، ولونها أخضر.',p:()=>WL(SOLH,'pronotum'),yaw:-.2,pitch:.4,dist:4.5},
  {t:'الجراد التجمعي المهاجر',g:'greg',b:'عندما تتحسن البيئة بعد الأمطار ويتكاثر الجراد أجيالاً متتالية تزيد أعداده فيتحول إلى المظهر التجمعي: ألوان صفراء وسوداء، وسلوك جماعي، وأسراب تهاجر مع الرياح.',p:()=>WL(GREG,'pronotum'),yaw:-.1,pitch:.3,dist:6},
  {t:'بقع الدبا',g:'greg',b:'حوريات المظهر التجمعي تتجمع عند فتحة كيس البيض حتى يكتمل الفقس، ثم تتحرك وتتغذى معاً ككتلة واحدة، وتمر بخمسة أطوار. مكافحتها وهي على الأرض أسهل بكثير من مطاردة الأسراب.',p:()=>new V3(4.6,.6,2.2),yaw:.4,pitch:.6,dist:9}],
 seasons:[
  {t:'الموسم الشتوي',g:'winter',b:'من منتصف أكتوبر حتى نهاية فبراير، مع الأمطار الشتوية على سواحل البحر الأحمر: جازان وعسير والباحة ومكة المكرمة والمدينة المنورة وتبوك.',p:()=>MAPP.winter,yaw:-.25,pitch:.9,dist:24},
  {t:'الهجرة شمالاً',b:'إذا تحسنت الظروف يتكاثر الجراد على الساحل ثم يهاجر شمالاً وشمالاً شرقياً إلى مناطق التكاثر الربيعي، وتحمله الرياح.',p:()=>MAPP.arrows,yaw:.1,pitch:.8,dist:26},
  {t:'الموسم الربيعي',g:'spring',b:'من أوائل فبراير حتى أوائل يوليو، مع الأمطار الربيعية في الجوف وحائل والقصيم والرياض وصولاً إلى المنطقة الشرقية.',p:()=>MAPP.spring,yaw:.25,pitch:.9,dist:24},
  {t:'الخروج إلى الدول المجاورة',g:'spring',b:'عندما تجف الظروف البيئية في الصيف يهاجر الجراد إلى الدول المجاورة. لذلك تتبادل الدول بيانات الجراد عبر الهيئة الإقليمية ومنظمة الأغذية والزراعة (FAO) للإنذار المبكر.',p:()=>MAPP.out,yaw:.5,pitch:.8,dist:26}],
 damage:[
  {t:'سرب صغير = 50 مليون جرادة',b:'سرب مساحته كيلومتر مربع واحد فيه نحو 50 مليون جرادة، وقد تمتد الأسراب من 1 إلى 300 كيلومتر مربع.',p:()=>AP.swarm,yaw:.9,pitch:.15,dist:70},
  {t:'حقل يُؤكل في ساعات',b:'يأكل سرب مساحته 1 كم² نحو 100 طن من الأوراق في اليوم، وهذا يعادل إنتاج 70 هكتاراً من البرسيم، أو 50 هكتاراً من القمح، أو 30 هكتاراً من الذرة.',p:()=>AP.eaten,yaw:.3,pitch:.35,dist:60,ph:'crop'},
  {t:'الجراد الأحمر أشد ضرراً',b:'الأسراب غير الناضجة جنسياً (الجراد الأحمر) شرهة جداً للأكل، وتسبب أضراراً جسيمة للمحاصيل والمراعي والغطاء النباتي.',p:()=>AP.farm,yaw:1.2,pitch:.25,dist:40,ph:'red'},
  {t:'تهديد للأمن الغذائي',b:'ما يأكله السرب الصغير في يوم واحد يعادل طعام 35 ألف شخص. وقد سبب الجراد مجاعات في بعض الدول، لذلك تتطلب مكافحته استجابة سريعة وشاملة.',p:()=>FARM.clone().add(new V3(-30,2,-25)),yaw:.6,pitch:.3,dist:90}],
 survey:[
  {t:'بلاغات الأهالي',b:'تبدأ خطة المسح من البلاغات: الأهالي ورعاة الماشية والنحالون، مع بيانات الأمطار وبيئة الجراد. بلاغك يحدد أين تذهب الفرق ومتى.',p:()=>AP.camp,yaw:.3,pitch:.25,dist:24},
  {t:'أين ومتى يكون المسح؟',b:'في المناطق الرملية ذات النبات الأخضر، والتي هطلت فيها أمطار مؤخراً، والتي سبقت إصابتها أو يحتمل وصول الجراد إليها من الدول المجاورة. ويبدأ بعد نحو أسبوعين من المطر حتى يخضر النبات، والحرارة بين 20 و38°م.',p:()=>AP.veg,yaw:.9,pitch:.3,dist:40},
  {t:'المسح سيراً على الأقدام',b:'يمشي الفني نحو 300 متر عكس اتجاه الرياح أو متعامداً عليها، ويتوقف ليختبر رطوبة التربة، ويعد الجراد الذي يتطاير في نطاق 1–4 أمتار على جانبيه، ويلاحظ لونه وسلوكه ونضجه.',p:()=>AP.walker,yaw:.25,pitch:.18,dist:16},
  {t:'المسح بالسيارة',b:'قيادة بطيئة بالدفع الرباعي مسافة كيلومتر على الأقل عكس الرياح أو عمودياً عليها، مع عد الحشرات التي تتطاير أمام السيارة. يكون العد فقط عندما تزيد الحرارة على 20°م وتقل الرياح عن 6 م/ث.',p:()=>AP.car,yaw:.9,pitch:.2,dist:18},
  {t:'التسجيل والإرسال',b:'تُسجل البيانات في نظام eLocust3 أو التطبيق الرقمي مع إحداثيات GPS: الموقع، والمطر، والنبات، ورطوبة التربة، ومظهر الجراد وسلوكه ونضجه وكثافته. وتُرفع النتائج للإدارة نهاية يوم العمل كحد أقصى.',p:()=>AP.tablet,yaw:.4,pitch:.3,dist:7,ph:'app'}],
 control:[
  {t:'الرش متعامد مع الرياح',b:'يبدأ الرش من الحافة البعيدة التي تتجه إليها الرياح، ثم يتحرك الفريق عكس الرياح بعد كل مسار. المسافة بين المسارات 10 م للرشاشة اليدوية، و30 م للمحمولة على سيارة، و100 م للطائرة.',p:()=>AP.tracks},
  {t:'مسار إضافي',b:'مسار رش إضافي عند الحافة التي تأتي منها الرياح، يعوّض الجرعة الناقصة في نهاية المنطقة المصابة.',p:()=>AP.extra},
  {t:'رش بالحجوم المتناهية في الصغر (ULV)',b:'مبيد مركز جاهز في قاعدة زيتية لا يُخلط بالماء، بمعدل 0.5–1 لتر للهكتار. تحمل الرياح القطيرات وتوزعها، لذلك تُعاير الآلة قبل كل حملة بالمبيد نفسه، والتفاوت المسموح 5% فقط.',p:()=>AP.machine},
  {t:'متى يتوقف الرش؟',b:'إذا قلت الرياح عن 1 م/ث أو زادت على 10 م/ث، أو تغير اتجاهها أكثر من 45 درجة، أو بدأ المطر. ولا يُرش من 11 صباحاً إلى 4 عصراً، لأن تيارات الحرارة ترفع القطيرات بدل أن تسقط على الجراد.',p:()=>AP.wind},
  {t:'السلامة أولاً',b:'يُبلَّغ الأهالي بموعد ومكان المكافحة لينقلوا عائلاتهم وماشيتهم وخلايا النحل. الملابس الواقية كاملة لكل من يتعامل مع المبيد، ومن لا يشارك في الرش يقف عند الحافة التي تأتي منها الرياح.',p:()=>AP.byst}]
};
const LIFE=[
  {k:'egg',t:'البيض',d:'10–30 يوماً',sz:'كيس على عمق 12–15 سم',dmin:10,dmax:30,ph:['egg'],b:'تضع الأنثى البيض في مجموعة تسمى كيس البيض، على عمق 12–15 سم في تربة رطبة، وتغطيه بمادة رغوية تحميه. البيضة تشبه حبة الأرز. تستمر الحضانة 10–14 يوماً في مناطق التكاثر الدافئة مثل سواحل البحر الأحمر، و25–30 يوماً في مناطق التكاثر الربيعي في شمال ووسط المملكة، وقد تصل إلى 70 يوماً في البرد.'},
  {k:'hopper',t:'الحوريات (الدبا)',d:'32–40 يوماً',sz:'5 أطوار',dmin:32,dmax:40,ph:['h1','h2','h3','h4','h5'],b:'تخرج الحوريات عبر المادة الرغوية، لونها سمني عند الفقس ثم يسودّ بعد ساعات. تمر بخمسة أطوار في المظهر التجمعي، بين كل طور وآخر انسلاخ، ويستمر كل طور 5–7 أيام والخامس 9–12 يوماً. من الطور الثالث تظهر نتوءات الأجنحة، والخامس أصفر فاقع مع بقع سوداء.'},
  {k:'imm',t:'الجراد الأحمر',d:'10–21 يوماً',sz:'غير ناضج جنسياً',dmin:10,dmax:21,ph:['fledg','red'],b:'بعد آخر انسلاخ يسمى جراداً حديث الانسلاخ، ويمشي ويقفز مثل الحوريات 3–5 أيام، ثم يطير حول بقع الدبا حتى تكتمل بقية الحوريات فيتكون السرب. يكون أحمر اللون وشرهاً جداً للأكل. ينضج جنسياً بعد 10–21 يوماً في الظروف المناسبة، وقد يحتاج 3–6 أشهر في غيرها.'},
  {k:'adult',t:'الجراد الناضج',d:'يعيش حتى 6 أشهر',sz:'2–3 غرامات',ph:['yellow','lay'],b:'يصفر لونه بعد النضج الجنسي، وتبحث الإناث عن تربة رطبة مناسبة في أرض مفتوحة خالية من النبات، ثم يتزاوج الجراد وتضع الإناث البيض في ما يعرف بحقول البيض، فيبدأ جيل جديد.'}];
const SEGS={life:LIFE.map(s=>[s.k,s.t]),phase:[['sol','انفرادي'],['greg','تجمعي']],seasons:[['winter','الموسم الشتوي'],['spring','الموسم الربيعي']],control:[['0','رشاشة يدوية'],['1','على سيارة'],['2','بالطائرة']]};
const QUIZ=[
 {q:'كم يأكل الجراد في اليوم الواحد؟',o:['ما يعادل وزنه تقريباً','عُشر وزنه فقط','لا يأكل أثناء الهجرة'],a:0,e:'الجرادة تأكل مثل وزنها يومياً (2–3 غرامات)، لذلك يلتهم السرب الصغير نحو 100 طن من النبات في يوم.'},
 {q:'أين تضع أنثى الجراد البيض؟',o:['في تربة رطبة على عمق 12–15 سم','على أوراق النباتات','داخل جذوع الأشجار'],a:0,e:'تضع البيض في كيس داخل تربة رطبة وتغطيه بمادة رغوية، لذلك يتكاثر الجراد بعد الأمطار.'},
 {q:'كم طوراً تمر به حوريات المظهر التجمعي؟',o:['خمسة أطوار','ثلاثة أطوار','ثمانية أطوار'],a:0,e:'خمسة أطوار في المظهر التجمعي، وستة في المظهر الانفرادي.'},
 {q:'ماذا يُسمى الجراد البالغ غير الناضج جنسياً؟',o:['الجراد الأحمر','الدبا','الجراد الانفرادي'],a:0,e:'الجراد الأحمر شره جداً للأكل وأسرابه تسبب أضراراً جسيمة. أما الدبا فهي الحوريات.'},
 {q:'متى يبدأ موسم التكاثر الشتوي في المملكة؟',o:['منتصف أكتوبر','أوائل يوليو','بداية أغسطس'],a:0,e:'يمتد من منتصف أكتوبر حتى نهاية فبراير على سواحل البحر الأحمر.'},
 {q:'كيف يكون اتجاه مسار الرش؟',o:['متعامداً مع اتجاه الرياح','مع اتجاه الرياح','لا يهم الاتجاه'],a:0,e:'يُرش متعامداً مع الرياح بدءاً من الحافة التي تتجه إليها الرياح، فتحمل الرياح القطيرات فوق الجراد.'},
 {q:'متى يجب إيقاف الرش؟',o:['إذا زادت الرياح على 10 م/ث','إذا كانت الحرارة 25°م','في الصباح الباكر'],a:0,e:'يتوقف الرش إذا قلت الرياح عن 1 م/ث أو زادت على 10 م/ث، أو تغير اتجاهها أكثر من 45 درجة، أو بدأ المطر.'},
 {q:'ما الذي يحوّل الجراد إلى المظهر التجمعي؟',o:['زيادة أعداده بعد أمطار وتكاثر متتالٍ','لدغة حشرة أخرى','البرد الشديد'],a:0,e:'غزوات الجراد لا تحدث فجأة: الأمطار تحسن البيئة فيتكاثر الجراد أجيالاً وتزيد أعداده حتى يصبح تجمعياً مهاجراً.'}];
/* shuffle answer positions deterministically so the right answer is not always first */
QUIZ.forEach((q,i)=>{const r=i%3;if(!r)return;const o=q.o.slice();const c=o.splice(0,1)[0];o.splice(r,0,c);q.o=o;q.a=r;});

/* ================= UI ================= */
const tabsEl=$('#tabs'),content=$('#content'),segEl=$('#seg'),badge=$('#badge'),pinsEl=$('#pins'),hint=$('#hint'),xrayBtn=$('#xrayBtn'),appEl=document.querySelector('.app');
const PL=$('#pinlines');let curHS=[],pins=[];
const GP=k=>(typeof GUIDE_PH!=='undefined'&&GUIDE_PH[k])||null;
const gcap=g=>(g.cap?g.cap+' · ':'')+'المصدر: '+SRC;
const gfig=(k,cls='gfig')=>{const g=GP(k);return g?`<figure class="${cls}"><img src="${g.img}" alt="${g.cap}" loading="lazy" data-zoom><figcaption>${gcap(g)}</figcaption></figure>`:''};
function renderTabs(){tabsEl.innerHTML=TABS.map(([id,n])=>`<button class="tab" role="tab" type="button" data-tab="${id}" aria-selected="${state.tab===id}">${n}</button>`).join('');}
function spotList(list){return `<ol class="spots">${list.map((h,i)=>{const open=state.active===i,g=h.ph&&GP(h.ph);
  const fig=g?`<figure class="ph"><img src="${g.img}" alt="${h.t}" loading="lazy" data-zoom><figcaption>${gcap(g)}</figcaption></figure>`:'';
  return `<li class="acc${open?' open':''}"><button class="spot${open?' on':''}" type="button" data-i="${i}" aria-expanded="${open}"><span class="num">${i+1}</span><span class="stx"><strong>${h.t}</strong></span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="acc-body"><div class="acc-in">${fig}<p>${h.b}</p></div></div></li>`}).join('')}</ol>`;}
const src=s=>`<p class="src">المصدر: ${SRC}${s?' ('+s+')':''} <span dir="ltr">(WEQAA-600.4-M-001 · V02-05/26)</span>.</p>`;
function lifeBars(){const mx=45;return `<div class="bars" role="img" aria-label="مدة كل طور بالأيام">${LIFE.filter(s=>s.dmin).map(s=>`<div class="bar${state.life===s.k?' on':''}"><span class="bl">${s.t}</span><span class="bt"><i style="inset-inline-start:${s.dmin/mx*100}%;width:${Math.max(2,(s.dmax-s.dmin)/mx*100)}%"></i></span><span class="bv">${s.d}</span></div>`).join('')}<p class="bnote">المدة بالأيام، وتطول في البرد والظروف غير المناسبة</p></div>`;}
function hopStrip(){return `<div class="hopstrip">${['h1','h2','h3','h4','h5'].map((k,i)=>{const g=GP(k);return g?`<figure><img src="${g.img}" alt="${g.cap}" loading="lazy" data-zoom><figcaption>الطور ${['الأول','الثاني','الثالث','الرابع','الخامس'][i]}</figcaption></figure>`:''}).join('')}</div><p class="src">الصور: ${SRC}.</p>`;}
const CTRL_TX=[['رشاشة يدوية أو ظهرية','15 هكتار/يوم','مساحات صغيرة وصخور وتلال، لمجموعات الحوريات فقط'],['على سيارة','100 هكتار/يوم','مساحات متوسطة على الرمال، لمجموعات الحوريات'],['بالطائرة','5000 هكتار/يوم','مساحات كبيرة، وهي الأنسب لمكافحة الأسراب']];
function panelBody(){const t=state.tab;
  if(t==='locust')return `<p class="lede">الجراد الصحراوي من أخطر الآفات العابرة للحدود على المحاصيل في العالم. يتكيف مع الظروف القاسية وينتشر بسرعة في المناطق شبه الصحراوية عندما تتحسن البيئة بعد الأمطار.</p>
    <dl class="label"><span class="lh">بطاقة تعريف</span>
      <div><dt>الاسم العلمي</dt><dd><span class="sci" dir="ltr" lang="la">Schistocerca gregaria</span></dd></div>
      <div><dt>الوزن</dt><dd>2–3 غرامات للحشرة الكاملة</dd></div>
      <div><dt>العمر</dt><dd>نحو 6 أشهر للحشرة الكاملة</dd></div>
      <div><dt>الغذاء</dt><dd>أنواع كثيرة من النباتات الخضراء</dd></div></dl>
    ${spotList(HS.locust)}
    <section class="act"><h2>لماذا هو خطير؟</h2><ol>
      <li>سرب مساحته كيلومتر مربع واحد فيه نحو 50 مليون جرادة.</li>
      <li>يأكل السرب في يوم واحد ما يأكله 35 ألف شخص.</li>
      <li>يطير مع الرياح ويعبر الحدود، فلا تكفي مكافحته في مكان واحد.</li></ol></section>${src('مقدمة الدليل')}`;
  if(t==='life'){const s=LIFE.find(x=>x.k===state.life);return `<p class="lede">الجراد ناقص التطور: بيضة ثم حورية ثم حشرة كاملة، بلا طور عذراء. اختر الطور من أعلى المشهد، وشغّل «الرؤية تحت التربة» لترى أكياس البيض.</p>
    <div class="facts"><div class="fact"><b>3 أشهر</b><span>من الفقس إلى النضج الجنسي</span></div><div class="fact"><b>12–15 سم</b><span>عمق كيس البيض في التربة</span></div></div>
    ${lifeBars()}
    <ol class="cycle">${LIFE.map((s2,i)=>`<li><button class="cyc${state.life===s2.k?' on':''}" type="button" data-life="${s2.k}"><span class="cyc-h"><span class="n">${i+1}</span><strong>${s2.t}</strong><span class="chip">${s2.d}</span><span class="chip alt">${s2.sz}</span></span><span>${s2.b}</span></button>${state.life===s2.k?(s2.k==='hopper'?hopStrip():s2.ph.map(k=>gfig(k,'gfig in')).join('')):''}</li>`).join('')}</ol>${src('دورة الحياة')}`;}
  if(t==='phase')return `<p class="lede">للجراد الصحراوي مظهران يختلفان كثيراً في الشكل والسلوك، حتى ظنهما العلماء نوعين مختلفين، إلى أن أثبت العالم الروسي يوفاروف عام 1921م نظرية المظهر. بدّل بين المظهرين من أعلى المشهد.</p>
    ${spotList(HS.phase)}
    <section class="act"><h2>كيف يتحول الجراد إلى سرب؟</h2><ol>
      <li>أمطار تحيي النبات وترطب التربة في مناطق التكاثر.</li>
      <li>يتكاثر الجراد الانفرادي وتزيد أعداده جيلاً بعد جيل.</li>
      <li>يتزاحم فيمر بمرحلة انتقالية تسمى المظهر الانتقالي.</li>
      <li>يصبح تجمعياً مهاجراً، وتتحرك أسرابه بين مناطق التكاثر.</li></ol></section>${src('مظاهر وسلوك الجراد الصحراوي')}`;
  if(t==='seasons')return `<p class="lede">يحتاج الجراد تربة رطبة لوضع البيض ونباتاً أخضر لغذاء الحوريات، لذلك لا يتكاثر إلا بعد الأمطار. في المملكة موسمان للتكاثر، ويهاجر الجراد بينهما مع الرياح.</p>
    <div class="facts"><div class="fact"><b>أكتوبر–فبراير</b><span>الموسم الشتوي على ساحل البحر الأحمر</span></div><div class="fact"><b>فبراير–يوليو</b><span>الموسم الربيعي في الشمال والوسط والشرق</span></div></div>
    ${spotList(HS.seasons)}${src('مواسم ومناطق التكاثر')}`;
  if(t==='damage')return `<p class="lede">الجراد يأكل مثل وزنه كل يوم ويتغذى على أنواع كثيرة من النباتات، فيلتهم المحاصيل والمراعي في ساعات.</p>
    <div class="facts"><div class="fact"><b>100 طن</b><span>نبات أخضر يأكلها سرب مساحته 1 كم² في يوم</span></div><div class="fact"><b>35,000</b><span>شخص يعادل طعامهم أكل هذا السرب في يوم</span></div></div>
    ${spotList(HS.damage)}
    <section class="act"><h2>ماذا يأكل سرب مساحته 1 كم² في يوم؟</h2>
      <div class="bars eat" role="img" aria-label="المساحة المزروعة التي يعادلها أكل السرب في يوم">${[['البرسيم',70],['القمح',50],['الذرة',30]].map(([n,v])=>`<div class="bar on"><span class="bl">${n}</span><span class="bt"><i style="inset-inline-start:0;width:${v/70*100}%"></i></span><span class="bv">${v} هكتاراً</span></div>`).join('')}</div></section>
    ${src('الأثر الاقتصادي للجراد الصحراوي')}`;
  if(t==='survey')return `<p class="lede">الرصد المبكر أساس المكافحة الوقائية: إيقاف الغزو قبل انطلاقه أسهل بكثير من مكافحته بعد ذلك. تمسح فرق وقاء المناطق المحتملة وترسل بياناتها في يومها.</p>
    <div class="facts"><div class="fact"><b>أسبوعان</b><span>بعد المطر يبدأ المسح</span></div><div class="fact"><b>300 م</b><span>مسار المشي عكس اتجاه الرياح</span></div></div>
    ${spotList(HS.survey)}
    <section class="act"><h2>نوعان من المسح</h2><ol>
      <li><b>تقييمي:</b> أول مسح في المنطقة، لمعرفة هل يوجد جراد ونبات أخضر.</li>
      <li><b>بحثي:</b> إذا وُجدت أعداد كبيرة، مسح مكثف لتقدير المساحة المصابة وحدود منطقة المكافحة.</li></ol></section>${src('أعمال المسح والاستكشاف')}`;
  if(t==='control'){const k=CTRL.machine,c=CTRL_TX[k];return `<p class="lede">المكافحة تنفذها فرق وقاء المدربة فقط. الهدف: الكمية الصحيحة من المبيد على الهدف الصحيح، بأقل ضرر على الناس والبيئة. غيّر آلة الرش من أعلى المشهد.</p>
    <div class="facts f3"><div class="fact"><b>${CTRL.spacing[k]} م</b><span>بين مسارات الرش</span></div><div class="fact"><b>${c[1]}</b><span>${c[0]}</span></div><div class="fact"><b>1–10 م/ث</b><span>سرعة الرياح المناسبة للرش</span></div></div>
    <p class="note-sm">${c[0]}: ${c[2]}.</p>
    ${spotList(HS.control)}
    <section class="act"><h2>بعد المكافحة</h2><ol>
      <li>سجّل كل تفاصيل العملية في نظام eLocust3 أو التطبيق الرقمي.</li>
      <li>أعد المبيد المتبقي إلى عبوته الأصلية، ونظّف الرشاشة بقليل من الكيروسين أو الديزل يُرش فوق المنطقة المعالجة، لا في حفرة.</li>
      <li>اغسل العبوات الفارغة 3 مرات، ثم اثقبها وهشّمها وسلّمها للجهات المعنية، ولا تستعملها لأي غرض آخر.</li>
      <li>اغتسل واغسل الملابس الواقية بأسرع ما يمكن.</li></ol></section>
    <p class="foot" style="margin-top:14px">المبيدات المعتمدة فقط، وبإشراف فرق وقاء المختصة.</p>${src('الدليل الإجرائي لعملية المكافحة الأرضية')}`;}
  const z=state.qz,N=QUIZ.length;
  if(z.i>=N){const msg=z.score===N?'ممتاز! أنت جاهز تساعد في حماية المزارع من الجراد.':z.score>=Math.ceil(N*.6)?'جيد جداً. راجع قسمي الرصد والمكافحة.':'تصفّح الأقسام وأعد المحاولة.';
    return `<div class="quiz"><span class="eyebrow">نتيجتك</span><div class="score" dir="ltr">${z.score} / ${N}</div><p class="q-text">${msg}</p><button class="btn-main" type="button" data-qz="again">أعد الاختبار</button></div>`;}
  const Q=QUIZ[z.i],done=z.picked!==null;
  return `<div class="quiz"><div class="q-prog">${QUIZ.map((_,k)=>`<i class="${k<z.i||(k===z.i&&done)?'done':''}"></i>`).join('')}</div><span class="eyebrow">سؤال ${z.i+1} من ${N}</span><p class="q-text">${Q.q}</p>
    ${Q.o.map((o,k)=>`<button class="opt${!done?'':k===Q.a?' ok':k===z.picked?' no':''}" type="button" data-opt="${k}" ${done?'disabled':''}>${o}</button>`).join('')}
    ${done?`<p class="q-fb${z.picked===Q.a?'':' bad'}"><b>${z.picked===Q.a?'إجابة صحيحة.':'إجابة غير صحيحة.'}</b> ${Q.e}</p><button class="btn-main" type="button" data-qz="next">${z.i+1<N?'السؤال التالي':'اعرض النتيجة'}</button>`:''}</div>`;}
const CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',CHEVB='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>';
function renderPanel(){const i=TABS.findIndex(x=>x[0]===state.tab),N=TABS.length,pv=TABS[i-1],nx=TABS[i+1];
  content.innerHTML=`<div class="chap-h"><h2>${TABS[i][1]}</h2><span>القسم ${i+1} من ${N}</span></div>`+panelBody()+
   `<nav class="chap-nav" aria-label="الأقسام">${pv?`<button type="button" class="pv" data-go-tab="${pv[0]}">${CHEVB}السابق</button>`:''}${nx?`<button type="button" class="nx" data-go-tab="${nx[0]}">التالي: ${nx[1]}${CHEV}</button>`:''}</nav>`;}
function segCur(){const t=state.tab;return t==='life'?state.life:t==='phase'?state.phase:t==='seasons'?state.season:t==='control'?String(CTRL.machine):null;}
function renderSeg(){const t=state.tab,opts=SEGS[t]||null,cur=segCur();let b='';
  if(t==='life')b={egg:'مقطع في التربة · كيس البيض على عمق 12–15 سم',hopper:'الأطوار الخمسة للحوريات في المظهر التجمعي',imm:'الجراد الأحمر غير الناضج جنسياً',adult:'أنثى ناضجة تضع البيض في التربة'}[state.life];
  else if(t==='control')b='منطقة مصابة بالدبا · المسارات من حافة اتجاه الرياح';
  else b={locust:'نموذج مكبّر للجرادة البالغة · وزنها الحقيقي 2–3 غرامات',phase:state.phase==='sol'?'المظهر الانفرادي · أفراد متفرقة':'المظهر التجمعي · بقعة دبا تتحرك معاً',seasons:state.season==='winter'?'الموسم الشتوي · منتصف أكتوبر إلى نهاية فبراير':'الموسم الربيعي · أوائل فبراير إلى أوائل يوليو',damage:'سرب فوق حقل برسيم · الجراد مكبّر للتوضيح',survey:'منطقة رملية بعد المطر · فريق المسح',quiz:QUIZ.length+' أسئلة · اختبر ما تعلمته'}[t]||'';
  if(state.xray)b=t==='locust'?'الرؤية الداخلية · الجهاز الهضمي وعضلات الطيران والبيض داخل الأنثى':'الرؤية الداخلية · حقل بيض فيه أكياس كثيرة متجاورة تحت التربة';
  segEl.hidden=!opts;if(opts)segEl.innerHTML=opts.map(([k,n])=>`<button type="button" data-seg="${k}" aria-pressed="${k===cur}">${n}</button>`).join('');badge.hidden=!b;badge.textContent=b;}
function buildPins(){curHS=HS[state.tab]||[];pinsEl.innerHTML='';pinSig='';
  pins=curHS.map((h,i)=>{const el=document.createElement('button');el.type='button';el.className='pin';el.textContent=i+1;el.setAttribute('aria-label',h.t);el.hidden=true;el.addEventListener('click',()=>select(i));pinsEl.appendChild(el);return el;});}
function renderActive(){const i=state.active;pins.forEach((p,k)=>{p.classList.toggle('on',k===i);if(k===i)p.dataset.t=curHS[k].t;});hint.hidden=i!==null;
  content.querySelectorAll('.acc').forEach(li=>{const b=li.querySelector('.spot'),on=+b.dataset.i===i;li.classList.toggle('open',on);b.classList.toggle('on',on);b.setAttribute('aria-expanded',String(on));});}
const viewOf=()=>VIEWS[state.tab==='life'?'life_'+state.life:state.tab]();
function select(i){const h=curHS[i];if(!h)return;if(state.active===i){state.active=null;renderActive();voStop();orbit.to(viewOf());return;}
  if(state.xray)setXrayUI(false);
  if(h.g&&state.tab==='phase'&&state.phase!==h.g){state.phase=h.g;applyPhase();renderSeg();}
  if(h.g&&state.tab==='seasons'&&state.season!==h.g){state.season=h.g;applySeason();renderSeg();}
  state.active=i;const p=h.p().clone();
  const dflt=state.tab==='control'?{dist:[30,80,300][CTRL.machine],pitch:.35}:{};
  orbit.to({yaw:h.yaw??orbit.yaw,pitch:h.pitch??dflt.pitch??.3,dist:h.dist??dflt.dist??6,target:p});renderActive();
  const li=content.querySelector(`.spot[data-i="${i}"]`);if(li)setTimeout(()=>{const acc=li.closest('.acc'),r=acc.getBoundingClientRect(),pnl=content.closest('.panel'),desk=matchMedia('(min-width:900px)').matches,box=desk&&pnl?pnl.getBoundingClientRect():{top:stageEl.getBoundingClientRect().bottom,bottom:innerHeight};if(r.top<box.top+8||r.bottom>box.bottom-8)acc.scrollIntoView({block:'start',behavior:RM?'auto':'smooth'});},360);
  voSpeakNow();}
function applyPhase(){const s=state.phase==='sol';[SOL,SOLH].forEach(o=>o.visible=s);[GREG,BAND].forEach(o=>o.visible=!s);}
function applySeason(){const w=state.season==='winter';mapSeason(w);MAPG.winter.traverse(n=>{if(n.material&&!n.isSprite&&!n.userData.pin)n.material.opacity=w?.5:.15;});MAPG.spring.traverse(n=>{if(n.material&&!n.isSprite&&!n.userData.pin)n.material.opacity=w?.15:.5;});
  MAPG.winter.children[0].children.forEach(c=>{if(c.isSprite)c.visible=w;});MAPG.spring.children[0].children.forEach(c=>{if(c.isSprite)c.visible=!w;});OUTA.visible=!w;}
function setLife(k){state.life=k;orbit.to(viewOf());renderPanel();renderSeg();voSpeakNow();}
const SCN={locust:'spec',life:'spec',phase:'spec',quiz:'spec',seasons:'map',damage:'field',survey:'field',control:'field'};
function setTab(id,quiet){if(state.xray)setXrayUI(false);state.tab=id;state.active=null;state.seen.add(id);
  setTrench(id==='life');xrayBtn.hidden=!(id==='locust'||id==='life');
  const sc=SCN[id];scene=sc==='field'?field:sc==='map'?mapS:spec;orbit=sc==='field'?oField:sc==='map'?oMap:oSpec;
  for(const k in SG)SG[k].visible=k===id||(id==='quiz'&&k==='locust');for(const k in PG)PG[k].visible=k===id;VEG.visible=id!=='damage';
  if(id==='phase')applyPhase();if(id==='seasons')applySeason();
  field.fog.far=id==='control'&&CTRL.machine===2?1400:520;
  orbit.to(id==='life'?VIEWS.life_over():viewOf());
  renderTabs();renderPanel();renderSeg();buildPins();renderActive();
  content.classList.remove('enter');void content.offsetWidth;if(!RM)content.classList.add('enter');
  const pnl=content.closest('.panel');if(pnl&&matchMedia('(min-width:900px)').matches)pnl.scrollTo({top:0});
  if(!quiet)voSpeakNow();}
tabsEl.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b&&b.dataset.tab!==state.tab)setTab(b.dataset.tab);});
content.addEventListener('click',e=>{const g=e.target.closest('[data-go-tab]');if(g){setTab(g.dataset.goTab);return;}
  const op=e.target.closest('[data-opt]');if(op&&state.qz.picked===null){state.qz.picked=+op.dataset.opt;if(state.qz.picked===QUIZ[state.qz.i].a)state.qz.score++;renderPanel();voSpeakNow();return;}
  const qb=e.target.closest('[data-qz]');if(qb){if(qb.dataset.qz==='next'){state.qz.i++;state.qz.picked=null;}else state.qz={i:0,score:0,picked:null};renderPanel();voSpeakNow();return;}
  const s=e.target.closest('.spot');if(s){select(+s.dataset.i);return;}
  const c=e.target.closest('[data-life]');if(c)setLife(c.dataset.life);});
segEl.addEventListener('click',e=>{const b=e.target.closest('[data-seg]');if(!b)return;const v=b.dataset.seg,t=state.tab;
  if(t==='life')return setLife(v);
  if(t==='phase'){state.phase=v;applyPhase();}
  else if(t==='seasons'){state.season=v;applySeason();}
  else if(t==='control'){CTRL.machine=+v;layoutControl();field.fog.far=CTRL.machine===2?1400:520;}
  state.active=null;orbit.to(viewOf());renderPanel();renderSeg();buildPins();renderActive();voSpeakNow();});
function setXrayUI(on){const body=state.tab==='locust';state.xray=on;setXray(on,body?'body':'soil');xrayBtn.setAttribute('aria-pressed',String(on));
  if(on){state.active=null;renderActive();voStop();
    if(body)orbit.to({yaw:-.42,pitch:.22,dist:6.6,target:WL(HERO,'abd').setY(1.0)});
    else{if(state.life!=='egg'){state.life='egg';renderPanel();}orbit.to({yaw:.5,pitch:.42,dist:22,target:new V3(0,-3.5,0)});}}
  renderSeg();}
xrayBtn.addEventListener('click',()=>setXrayUI(!state.xray));
$('#resetBtn').addEventListener('click',()=>{if(state.xray)setXrayUI(false);state.active=null;renderActive();voStop();orbit.to(state.tab==='life'?VIEWS.life_over():viewOf());});

/* ================= pins with short white leader lines ================= */
let pinSig='',pinStill=0,pinLast=null,pinT=performance.now(),pinDt=.016;const pv=new V3();
function pinLayout(vis,w,h){const big=document.documentElement.classList.contains('expo'),Lr=big?58:44,Dmin=big?56:44;if(!vis.length)return;
  let cx=0,cy=0;vis.forEach(v=>{cx+=v.ax;cy+=v.ay;});cx/=vis.length;cy/=vis.length;
  vis.forEach((v,k)=>{let dx=v.ax-cx,dy=v.ay-cy,l=Math.hypot(dx,dy);if(l<8){const a=-Math.PI/2+k*2.4;dx=Math.cos(a);dy=Math.sin(a);l=1;}v.x=v.ax+dx/l*Lr;v.y=v.ay+dy/l*Lr-6;});
  const tb=$('#tools'),sr=stageEl.getBoundingClientRect(),tr=tb?tb.getBoundingClientRect():null,box=tr&&tr.width?{l:tr.left-sr.left-22,r:tr.right-sr.left+22,t:tr.top-sr.top-22,b:tr.bottom-sr.top+22}:null;
  for(let it=0;it<14;it++){for(let a=0;a<vis.length;a++)for(let b=a+1;b<vis.length;b++){const A=vis[a],B=vis[b];let dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy)||.01;if(d<Dmin){const m=(Dmin-d)/2;dx/=d;dy/=d;A.x-=dx*m;A.y-=dy*m;B.x+=dx*m;B.y+=dy*m;}}
    vis.forEach(A=>{vis.forEach(B=>{if(A===B)return;let dx=A.x-B.ax,dy=A.y-B.ay,d=Math.hypot(dx,dy)||.01;if(d<26){A.x+=dx/d*(26-d)*.5;A.y+=dy/d*(26-d)*.5;}});
      A.x=Math.min(w-24,Math.max(24,A.x));A.y=Math.min(h-24,Math.max(118,A.y));
      if(box&&A.x>box.l&&A.x<box.r&&A.y>box.t&&A.y<box.b){const dl=A.x-box.l,dr=box.r-A.x,dt=A.y-box.t,m=Math.min(dl,dr,dt);if(m===dt)A.y=box.t;else if(m===dl)A.x=box.l;else A.x=box.r;}});}
  vis.forEach(v=>{v.el._tox=v.x-v.ax;v.el._toy=v.y-v.ay;});}
const XL=$('#xl');let xlEls=[];
function xLabels(){if(!state.xray||scene!==spec)return[];
  if(state.tab==='locust')return[['الحوصلة: مخزن الطعام',()=>WL(HERO,'crop')],['المعي الأوسط: هضم النبات',()=>WL(HERO,'midgut')],['بيض ينمو داخل الأنثى',()=>WL(HERO,'eggs')],['عضلات الطيران',()=>WL(HERO,'muscle')]];
  return[['كيس البيض على عمق 12–15 سم',()=>POD.localToWorld(POD.userData.P.eggs.clone())],['مادة رغوية تحمي البيض',()=>POD.localToWorld(POD.userData.P.froth.clone())],['حقل بيض: أكياس كثيرة متجاورة',()=>{const p=PODS.children[3];return p.localToWorld(new V3(0,-4.6,0));}]];}
function updatePins(){const nt=performance.now();pinDt=Math.min(.1,(nt-pinT)/1000);pinT=nt;const w=stageEl.clientWidth,h=stageEl.clientHeight,R0=document.documentElement.classList.contains('expo')?21:15;const vis=[];
  pins.forEach((el,i)=>{const hs=curHS[i];let ok=!state.xray&&!(hs.g&&((state.tab==='phase'&&hs.g!==state.phase)));if(ok){pv.copy(hs.p()).project(cam);ok=!(pv.z>1||pv.z<-1||Math.abs(pv.x)>1.05||Math.abs(pv.y)>1.05);}
    el.hidden=!ok;if(ok)vis.push({el,i,ax:(pv.x+1)/2*w,ay:(1-pv.y)/2*h});});
  const sig=state.tab+'|'+state.phase+'|'+state.season+'|'+CTRL.machine+'|'+w+'x'+h+'|'+vis.map(v=>v.i).join(','),cp=cam.position,cur=[cp.x,cp.y,cp.z,orbit.target.x,orbit.target.y,orbit.target.z];
  const moving=pinLast&&cur.some((x,k)=>Math.abs(x-pinLast[k])>1e-3*Math.max(1,orbit.dist/10));pinLast=cur;const fresh=vis.some(v=>v.el._ox===undefined);
  if(sig!==pinSig||fresh){pinSig=sig;pinLayout(vis,w,h);vis.forEach(v=>{v.el._ox=v.el._tox;v.el._oy=v.el._toy;});pinStill=0;}
  else if(moving)pinStill=0;else if((pinStill+=pinDt)>=.35&&pinStill-pinDt<.35)pinLayout(vis,w,h);
  let html='';vis.forEach(v=>{const el=v.el;if(el._tox!==undefined&&!moving){const kx=el._tox-el._ox,ky=el._toy-el._oy;if(Math.abs(kx)+Math.abs(ky)<.6){el._ox=el._tox;el._oy=el._toy;}else{const k=Math.min(1,pinDt*7);el._ox+=kx*k;el._oy+=ky*k;}}
    const x=v.ax+el._ox,y=Math.min(h-24,Math.max(118,v.ay+el._oy));el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    const dx=x-v.ax,dy=y-v.ay,d=Math.hypot(dx,dy);if(d>R0+4){const ex=x-dx/d*R0,ey=y-dy/d*R0;html+=`<g${state.active===v.i?' class="on"':''}><line x1="${v.ax.toFixed(1)}" y1="${v.ay.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}"/><circle cx="${v.ax.toFixed(1)}" cy="${v.ay.toFixed(1)}" r="4.5"/></g>`;}});
  const xl=xLabels();while(xlEls.length<xl.length){const d=document.createElement('div');d.className='xlab';d.style.setProperty('--c','#1b8354');XL.appendChild(d);xlEls.push(d);}
  xlEls.forEach((d,i)=>{const it=xl[i];if(!it){d.hidden=true;return;}pv.copy(it[1]()).project(cam);if(pv.z>1||Math.abs(pv.x)>1.05||Math.abs(pv.y)>1.05){d.hidden=true;return;}
    const ax=(pv.x+1)/2*w,ay=(1-pv.y)/2*h,side=ax<w/2?-1:1,lx=Math.min(w-20,Math.max(20,ax+side*80)),ly=Math.max(118,ay-30-i*6);d.hidden=false;d.textContent=it[0];
    const r=d.getBoundingClientRect();const tx=side<0?lx-r.width:lx;d.style.transform=`translate(${Math.max(6,Math.min(w-r.width-6,tx)).toFixed(0)}px,${(ly-r.height/2).toFixed(0)}px)`;
    html+=`<g class="on"><line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${lx.toFixed(1)}" y2="${ly.toFixed(1)}"/><circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="4.5"/></g>`;});
  XL.hidden=!xl.length;PL.innerHTML=html;}

/* ================= voice-over with read-along (device voice) ================= */
const VO={on:false,voice:null,seq:0,btn:$('#voBtn'),toast:$('#voToast')};
function voPickVoice(){try{const vs=speechSynthesis.getVoices().filter(v=>/^ar/i.test(v.lang));if(!vs.length)return null;
  const sc=v=>(/ar[-_]SA/i.test(v.lang)?4:0)+(/natural|online|neural|premium|enhanced/i.test(v.name)?3:0)+(v.localService?0:.5);return vs.sort((a,b)=>sc(b)-sc(a))[0];}catch(e){return null;}}
try{if('speechSynthesis' in window){VO.voice=voPickVoice();speechSynthesis.addEventListener&&speechSynthesis.addEventListener('voiceschanged',()=>{VO.voice=voPickVoice();});}}catch(e){}
const UNITS={'سم':'سنتيمتر','م':'متر','كم':'كيلومتر','كم²':'كيلومتر مربع','م/ث':'متر في الثانية'};
function voWord(w,prev){const m=w.match(/^([(«"]*)(.*?)([).,،؛:؟!»"]*)$/);let[,pre,c,post]=m;const pc=(prev||'').replace(/^[(«"]+|[).,،؛:؟!»"]+$/g,'');
  if(/^\d+(?:\.\d+)?[–-]\d+(?:\.\d+)?%?$/.test(c)){const pct=c.endsWith('%');const[a,b]=c.replace('%','').split(/[–-]/);c='من '+a+' إلى '+b+(pct?' بالمئة':'');}
  else if(/^\d+(?:\.\d+)?%$/.test(c))c=c.slice(0,-1)+' بالمئة';else if(/°/.test(c))c=c.replace(/°م?/,' درجة مئوية');else if(UNITS[c]&&/\d$/.test(pc))c=UNITS[c];
  if(/^[·•]$/.test(c))return'،';return(pre+c+post).replace(/[«»"]/g,'');}
function voWrap(el){const out=[];if(!el)return out;if(el.__vw)return el.__vw;const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];while(tw.nextNode())nodes.push(tw.currentNode);
  nodes.forEach(n=>{if(!n.nodeValue.trim())return;const f=document.createDocumentFragment();n.nodeValue.split(/(\s+)/).forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(p));return;}const s=document.createElement('span');s.className='vw';s.textContent=p;f.appendChild(s);out.push(s);});n.parentNode.replaceChild(f,n);});el.__vw=out;return out;}
function voBuild(segs){const words=[];segs.forEach((g,gi)=>{let ws=g.el?voWrap(g.el).map(s=>({w:s.textContent,span:s})):(g.text||'').split(/\s+/).filter(Boolean).map(w=>({w,span:null}));
  if(ws.length&&!g.lead&&gi<segs.length-1&&!/[.؟!:،?]$/.test(ws[ws.length-1].w))ws[ws.length-1].tail='.';words.push(...ws);});
  let str='',prev='';words.forEach(o=>{o.say=voWord(o.w,prev)+(o.tail||'');prev=o.w;o.at=str.length;str+=o.say+' ';});return{words,str:str.trim()};}
let voCur=null,voKeep=null;
function voMark(i){if(!voCur||i===voCur.i)return;voCur.i=i;voCur.words.forEach((o,k)=>{if(!o.span)return;o.span.classList.toggle('now',k===i);o.span.classList.toggle('done',k<i);});
  const s=voCur.words[i]&&voCur.words[i].span;if(s){const box=s.closest('.panel');if(box){const r=s.getBoundingClientRect(),b=box.getBoundingClientRect();if(r.bottom>b.bottom-8||r.top<b.top+8)s.scrollIntoView({block:'nearest',behavior:'smooth'});}}}
function voClear(){if(!voCur)return;voCur.words.forEach(o=>{if(o.span)o.span.classList.remove('now','done');});clearInterval(voCur.tm);voCur=null;}
const voIdxAt=c=>{const W2=voCur.words;let lo=0,hi=W2.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(W2[m].at<=c)lo=m;else hi=m-1;}return lo;};
function voState(sp){VO.btn.classList.toggle('speaking',!!sp);if(!sp)voClear();}
function voStop(){VO.seq++;clearInterval(voKeep);try{speechSynthesis.cancel();}catch(e){}voState(false);}
let voToastT=null;function voToast(m){VO.toast.textContent=m;VO.toast.hidden=false;clearTimeout(voToastT);voToastT=setTimeout(()=>VO.toast.hidden=true,6000);}
function voSay(key,segs){if(!VO.on||!segs||!segs.length)return;voStop();const seq=VO.seq,b=voBuild(segs.filter(g=>g.el||g.text));if(!b.str)return;voCur={...b,i:-1,tm:0};
  if(!('speechSynthesis' in window)||!VO.voice){voToast('لا يتوفر صوت عربي في هذا الجهاز أو المتصفح. جرّب متصفح Edge أو Chrome أو Safari.');voState(false);return;}
  const cur=voCur,u=new SpeechSynthesisUtterance(cur.str);u.voice=VO.voice;u.lang=VO.voice.lang;u.rate=/natural|online|neural/i.test(VO.voice.name)?1:.95;
  let gotB=false,t0=0;const done=()=>{clearInterval(voKeep);if(seq===VO.seq)voState(false);};u.onend=done;u.onerror=done;
  u.onboundary=e=>{if(seq!==VO.seq||e.name&&e.name!=='word')return;gotB=true;clearInterval(cur.tm);voMark(voIdxAt(e.charIndex));};
  u.onstart=()=>{t0=performance.now();voMark(0);const est=cur.str.length/(13.5*u.rate)*1000;cur.tm=setInterval(()=>{if(gotB||seq!==VO.seq){clearInterval(cur.tm);return;}if(performance.now()-t0<700)return;voMark(voIdxAt(Math.min(cur.str.length-1,(performance.now()-t0)/est*cur.str.length)));},120);};
  voState(true);setTimeout(()=>{if(seq!==VO.seq)return;try{speechSynthesis.speak(u);}catch(e){done();return;}clearInterval(voKeep);if(/google/i.test(VO.voice.name))voKeep=setInterval(()=>{try{if(speechSynthesis.speaking){speechSynthesis.pause();speechSynthesis.resume();}}catch(e){}},9000);},80);}
const Q1=s=>content.querySelector(s);
function voCurrent(){const t=state.tab;
  if(t==='quiz'){const z=state.qz;if(z.i>=QUIZ.length)return[[{text:'نتيجتك '+z.score+' من '+QUIZ.length},{el:Q1('.q-text')}]];
    if(z.picked===null){const segs=[{text:'سؤال '+(z.i+1)},{el:Q1('.q-text')}];content.querySelectorAll('.opt').forEach((o,k)=>segs.push({text:'الخيار '+(k+1)+':'},{el:o}));return[segs];}
    return[[{el:Q1('.q-fb')}]];}
  if(t==='life'){const c=Q1('.cyc.on');if(!c)return[[]];const ch=c.querySelectorAll('.chip');return[[{el:c.querySelector('strong')},{text:'المدة',lead:1},{el:ch[0]},{el:ch[1]},{el:c.querySelector(':scope > span:not(.cyc-h)')}]];}
  if(state.active!==null){const a=Q1('.acc.open');if(a)return[[{el:a.querySelector('.spot strong')},{el:a.querySelector('.acc-in p')}]];}
  return[[{el:Q1('.chap-h h2')},{el:Q1('.lede')}]];}
function voSpeakNow(){if(!VO.on)return;const[segs]=voCurrent();voSay('x',segs);}
VO.btn.addEventListener('click',()=>{VO.on=!VO.on;VO.btn.setAttribute('aria-pressed',String(VO.on));if(VO.on){if(!VO.voice)VO.voice=voPickVoice();voSpeakNow();}else voStop();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)voStop();});

/* ================= lightbox ================= */
{const lb=$('#lb'),li=lb.querySelector('img'),lc=lb.querySelector('figcaption');const close=()=>{lb.hidden=true;li.removeAttribute('src');};
 document.addEventListener('click',e=>{const im=e.target.closest('img[data-zoom]');if(im&&!lb.contains(im)){const f=im.closest('figure');li.src=im.src;lc.textContent=f&&f.querySelector('figcaption')?f.querySelector('figcaption').textContent:'';lb.hidden=false;lb.querySelector('button').focus();return;}
   if(!lb.hidden&&(e.target===lb||e.target.closest('#lb button')))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lb.hidden)close();});}

/* ================= report box: what did you see? ================= */
const REPORT_URL='https://weqaa.gov.sa/helpdesk/lmrkz-lryysy-khdmt-lmstfydyn-1',REPORT_TEL='8002470000';
const REP_SIGNS=['سرب جراد يطير','حوريات (دبا) تمشي على الأرض','جراد على المزروعات أو المراعي','إناث تضع البيض في الرمل'];
const REP_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>';
function repHTML(){const n=state.rep.size;
  return `<section class="rep${n?' alert':''}" aria-live="polite"><h2>${REP_IC}شفت جراد؟</h2><p>اختر اللي شفته:</p>
  <div class="rep-list">${REP_SIGNS.map((t,i)=>`<button type="button" class="rep-chk" data-rep="${i}" aria-pressed="${state.rep.has(i)}"><i></i><span>${t}</span></button>`).join('')}</div>
  <p class="rep-msg">${n?`<b>بلّغ وقاء الآن</b>بلاغك يوصل فريق المسح للمكان قبل ما تتكون الأسراب. لا ترش مبيداً بنفسك، وابعد ماشيتك وخلايا النحل عن المكان.`:`<b>بلاغك يفرق</b>خطة المسح تبدأ من بلاغات الأهالي ورعاة الماشية والنحالين. إذا شفت جراداً بلّغ وقاء فوراً.`}</p>
  <div class="rep-acts"><a class="rep-go" href="${REPORT_URL}" target="_blank" rel="noopener" data-rep-go>${n?'بلّغ عن الجراد الآن':'بلّغ وقاء عبر خدمة المستفيدين'}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a>
  <a class="rep-call" href="tel:${REPORT_TEL}" data-rep-go><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>اتصل بوقاء <bdi dir="ltr">${REPORT_TEL}</bdi></a></div>
  <p class="rep-how">يفتح الزر مركز خدمة المستفيدين في موقع وقاء. اكتب الموقع (أو إحداثياته) وما شفته، وأرفق صوراً إن أمكن.</p></section>`;}
{const _rp=renderPanel;renderPanel=function(){_rp();if(!['survey','damage','phase'].includes(state.tab))return;const nav=content.querySelector('.chap-nav');if(nav)nav.insertAdjacentHTML('beforebegin',repHTML());};}
content.addEventListener('click',e=>{const b=e.target.closest('[data-rep]');if(b){const i=+b.dataset.rep;state.rep.has(i)?state.rep.delete(i):state.rep.add(i);const old=content.querySelector('.rep');if(old)old.outerHTML=repHTML();return;}
  const g=e.target.closest('[data-rep-go]');if(g){const d={session:AS.rec?AS.rec.sid:null,kind:g.classList.contains('rep-call')?'call':'online',signs:[...state.rep],tab:state.tab,at:new Date().toISOString()};try{window.dispatchEvent(new CustomEvent('atlas-report',{detail:d}));}catch(_){}try{if(window.parent!==window)window.parent.postMessage(Object.assign({type:'weqaa-atlas-report',atlas:'locust'},d),'*');}catch(_){}}});

/* ================= exhibition mode ================= */
let expo=false,idleT=null,tourT=null,tourI=0,swallow=false;const IDLE_MS=45000,STEP_MS=7000,attEl=$('#attract'),expoBtn=$('#expoBtn');
{const lg=document.querySelector('.org img'),al=$('#attLogo');if(lg&&al)al.src=lg.src;}
const TOUR=[['locust',0],['x',1],['x',0],['locust',3],['life','egg'],['x',1],['x',0],['life','hopper'],['life','imm'],['phase',3],['phase',0],['seasons',0],['seasons',2],['damage',0],['damage',1],['survey',2],['survey',3],['control',0],['control',4]];
function tourStep(){if(!attract)return;const[tab,arg]=TOUR[tourI%TOUR.length];tourI++;if(tab==='x'){setXrayUI(!!arg);tourT=setTimeout(tourStep,STEP_MS);return;}
  if(state.tab!==tab)setTab(tab,true);if(tab==='life')setLife(arg);else select(arg);tourT=setTimeout(tourStep,STEP_MS);}
function startAttract(){if(attract)return;attract=true;attEl.hidden=false;document.documentElement.classList.add('attracting');tourI=0;tourStep();}
function stopAttract(){attract=false;attEl.hidden=true;document.documentElement.classList.remove('attracting');clearTimeout(tourT);setXrayUI(false);state.life='egg';state.qz={i:0,score:0,picked:null};setTab('locust',true);}
function bump(){clearTimeout(idleT);if(expo)idleT=setTimeout(startAttract,IDLE_MS);}
document.addEventListener('pointerdown',e=>{if(attract){e.preventDefault();e.stopPropagation();swallow=true;stopAttract();}bump();},true);
document.addEventListener('click',e=>{if(swallow){e.preventDefault();e.stopPropagation();swallow=false;}},true);
document.addEventListener('keydown',()=>{if(attract)stopAttract();bump();},true);
function setExpo(on){expo=on;document.documentElement.classList.toggle('expo',on);expoBtn.setAttribute('aria-pressed',String(on));$('#expoBtn .el').textContent=on?'إنهاء وضع المعرض':'وضع المعرض';
  try{if(on&&document.documentElement.requestFullscreen&&!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{});else if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});}catch(e){}setTimeout(resize,200);bump();}
expoBtn.addEventListener('click',()=>setExpo(!expo));

/* ================= photographic finish: depth of field for the close-up scenes (desktop only) ================= */
const HQ=!!(renderer&&THREE.EffectComposer&&renderer.capabilities.isWebGL2&&matchMedia('(pointer:fine)').matches&&!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)&&!/lq/.test(location.hash));
let COMP=null,BOKEH=null,RPASS=null;
if(HQ){try{const rt=new THREE.WebGLMultisampleRenderTarget(4,4,{format:THREE.RGBAFormat,type:THREE.HalfFloatType});rt.samples=4;
  COMP=new THREE.EffectComposer(renderer,rt);RPASS=new THREE.RenderPass(spec,cam);COMP.addPass(RPASS);
  BOKEH=new THREE.BokehPass(spec,cam,{focus:10,aperture:.0009,maxblur:.0065,width:4,height:4});COMP.addPass(BOKEH);
  COMP.addPass(new THREE.ShaderPass(THREE.GammaCorrectionShader));
  const rs=()=>{COMP.setPixelRatio(renderer.getPixelRatio());COMP.setSize(stageEl.clientWidth,stageEl.clientHeight);};new ResizeObserver(rs).observe(stageEl);rs();}
  catch(e){console.warn('composer',e);COMP=null;}}
const fx=()=>COMP&&scene===spec;

/* ================= loop ================= */
let last=performance.now(),clock=0;const dv=new V3();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;clock+=dt;
  orbit.update(dt);orbit.apply(cam);
  if(!RM){const t=clock;
    if(scene===spec){HERO.userData.anim(t);MATURE.userData.anim(t+1);
      if(SG.phase.visible&&BAND.visible)BANDI.forEach((h,i)=>{const u=((t*h.userData.sp+i*.37)%1);h.position.x=h.userData.x0-u*1.2;h.position.y=Math.max(0,Math.sin(u*Math.PI*6+i))*.12;});}
    else if(scene===field){
      if(PG.damage.visible)swarmUpdate(SWARM,t,swarmPos);
      if(PG.survey.visible)swarmUpdate(FLUSH,t,flushPos);
      if(PG.control.visible){const k=CTRL.machine,Lc=CTRL.L,sp=CTRL.spacing[k],x0=CTRL.tracks[1];const zc=-Lc/2+((t*(k===2?18:k===1?3:.9))%Lc);
        let noz;if(k===1){SPRAY_CAR.position.z=zc;noz=SPRAY_CAR.localToWorld(SPRAY_CAR.userData.P.nozzle.clone());}else if(k===0){SPRAY_MAN.position.z=zc;SPRAY_MAN.position.y=Math.abs(Math.sin(t*5))*.04;noz=SPRAY_MAN.localToWorld(SPRAY_MAN.userData.noz.clone());}
        else{PLANE.position.set(x0,10+Math.sin(t*.5),zc);PLANE.userData.prop.rotation.z+=dt*40;noz=PLANE.position.clone().add(new V3(0,-.5,0));}
        const p=DROPS.pts.geometry.attributes.position,s=DROPS.seed,H=noz.y,drift=sp*1.15;
        for(let i=0;i<DROPS.N;i++){const a=(t*.35+s[i])%1,sp2=(s[i]*7.3)%1;p.setXYZ(i,noz.x+a*drift+(sp2-.5)*sp*.15,Math.max(.05,H*(1-a*a)+(sp2-.5)*.6*(1-a)),noz.z-a*(k===2?30:k===1?6:2)+(sp2-.5)*(k===2?14:3));}
        p.needsUpdate=true;DROPS.pts.material.size=k===2?2.4:k===1?.7:.25;
        WSOCK.userData.sock.rotation.z=Math.sin(t*3)*.05;WSOCK.userData.sock.rotation.y=Math.sin(t*1.7)*.08;}}}
  if(renderer){renderer.toneMappingExposure=scene===spec?.82:scene===mapS?.9:.95;
    const sun=scene.userData.sun;if(sun&&scene===field){sun.position.copy(orbit.target).add(new V3(40,90,30));sun.target.position.copy(orbit.target);const e=Math.min(400,Math.max(60,orbit.dist*1.1)),c=sun.shadow.camera;if(c.right!==e){c.left=-e;c.right=e;c.top=e;c.bottom=-e;c.far=400;c.updateProjectionMatrix();}}
    if(sun&&scene===spec){sun.position.copy(orbit.target).setY(0).add(new V3(10,11,6));sun.target.position.copy(orbit.target).setY(0);const e=Math.min(26,Math.max(7,orbit.dist*1.05)),c=sun.shadow.camera;if(Math.abs(c.right-e)>.5){c.left=-e;c.right=e;c.top=e;c.bottom=-e;c.far=60;c.updateProjectionMatrix();}}
    if(fx()){const f=cam.position.distanceTo(orbit.target);BOKEH.uniforms.focus.value=f;BOKEH.uniforms.aperture.value=.009/Math.max(4,f);RPASS.scene=BOKEH.scene=scene;COMP.render(dt);}
    else renderer.render(scene,cam);updatePins();}
  requestAnimationFrame(frame);}
setTab('locust',true);
if(/expo/.test(location.hash)){setExpo(true);startAttract();}
if(/dbg/.test(location.hash))window.__A={fx:()=>!!COMP,orbit:()=>orbit,V3,HERO,setXrayUI,state,VIEWS,cam};
