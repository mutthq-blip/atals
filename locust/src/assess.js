/* ---- pre/post assessment: desert intro -> pre-test -> atlas -> "finish" -> post-test -> before/after comparison ----
   Results stay on this device (localStorage) and are announced to a host page so Weqaa's site can record them:
   window event 'atlas-assessment' and parent.postMessage({type:'weqaa-atlas-assessment',atlas:'locust',...}). */
const AS_KEY='weqaa-locust-assess-v1',AS_ITEMS=[0,1,3,5,7];
const AS={phase:null,i:0,picks:[],t0:0,el:null,rec:null};
function asLoad(){try{return JSON.parse(localStorage.getItem(AS_KEY)||'null');}catch(e){return null;}}
function asSave(){try{localStorage.setItem(AS_KEY,JSON.stringify(AS.rec));}catch(e){}}
function asNew(){AS.rec={sid:Date.now().toString(36)+Math.random().toString(36).slice(2,8),pre:null,post:null};asSave();}
AS.rec=asLoad();if(!AS.rec||AS.rec.post)asNew();
function asEmit(phase,r){const detail={atlas:'locust',phase,session:AS.rec.sid,lang:'ar',score:r?r.score:null,total:AS_ITEMS.length,answers:r?r.answers:null,seconds:r?r.sec:null,
  pre:AS.rec.pre?AS.rec.pre.score:null,post:AS.rec.post?AS.rec.post.score:null,at:new Date().toISOString()};
  try{window.dispatchEvent(new CustomEvent('atlas-assessment',{detail}));}catch(e){}
  try{if(window.parent&&window.parent!==window)window.parent.postMessage(Object.assign({type:'weqaa-atlas-assessment'},detail),'*');}catch(e){}}
/* intro scene: dunes after rain, green shrubs, a swarm crossing the sky, and the guide's locust photo landing */
function asDesertSVG(){const R=n=>+n.toFixed(1),rnd=mulberry(2026);
  let shrubs='';for(let i=0;i<9;i++){const x=30+i*38+rnd()*14,y=236+rnd()*22,s=.7+rnd()*.6;shrubs+=`<g transform="translate(${R(x)} ${R(y)}) scale(${R(s)})"><g class="shr" style="animation-delay:${R(.6+i*.08)}s"><ellipse cx="0" cy="0" rx="12" ry="6" fill="#6f8f3a"/><ellipse cx="-6" cy="-3" rx="7" ry="5" fill="#86a64a"/><ellipse cx="6" cy="-4" rx="6" ry="4" fill="#7f9c44"/></g></g>`;}
  let swarm='';for(let i=0;i<46;i++){const y=40+rnd()*110,d=(7+rnd()*5).toFixed(1),b=(rnd()*7).toFixed(1),s=(.5+rnd()*.7).toFixed(2);
    swarm+=`<g class="sw" style="--y:${R(y)}px;--s:${s};animation-duration:${d}s;animation-delay:-${b}s"><path d="M-6 0 C-2 -1 4 -1 7 0 C4 1 -2 1 -6 0Z" fill="#6b5326"/><path class="wg" d="M-1 0 L-7 -6 L3 -1Z" fill="#c9b27a"/></g>`;}
  let motes='';for(let i=0;i<10;i++)motes+=`<circle class="mote" cx="${R(40+rnd()*280)}" cy="${R(150+rnd()*100)}" r="${R(.8+rnd()*1.2)}" style="animation-delay:${R(rnd()*6)}s"/>`;
  return `<div class="as-scene" aria-hidden="true"><svg class="as-desert" viewBox="0 0 360 280">
 <defs><radialGradient id="lSun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff6d6"/><stop offset=".4" stop-color="#ffe7a3" stop-opacity=".85"/><stop offset="1" stop-color="#ffe7a3" stop-opacity="0"/></radialGradient>
  <linearGradient id="lSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3f1"/><stop offset="1" stop-color="#f6efe2"/></linearGradient>
  <linearGradient id="lSand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ead4a6"/><stop offset="1" stop-color="#d2b47e"/></linearGradient></defs>
 <rect width="360" height="280" fill="url(#lSky)"/>
 <circle cx="290" cy="70" r="56" fill="url(#lSun)"/><circle cx="290" cy="70" r="16" fill="#fff4cf"/>
 <path class="dn d1" d="M0 206 C70 180 140 194 200 204 C260 214 310 186 360 194 L360 280 L0 280Z" fill="#e3c897"/>
 <path class="dn d2" d="M0 230 C80 214 150 224 220 228 C280 232 320 220 360 226 L360 280 L0 280Z" fill="url(#lSand)"/>
 ${shrubs}${motes}<g class="swarm">${swarm}</g></svg>
 ${typeof LOCUST_CUT!=='undefined'?`<img class="as-loc" src="${LOCUST_CUT}" alt="">`:''}</div>`;}
const AS_ART=asDesertSVG();
function asOpen(){if(!AS.el){AS.el=document.createElement('div');AS.el.className='as';AS.el.setAttribute('role','dialog');AS.el.setAttribute('aria-modal','true');AS.el.setAttribute('dir','rtl');AS.el.setAttribute('lang','ar');document.body.appendChild(AS.el);
  AS.el.addEventListener('click',asClick);}
  AS.el.hidden=false;document.documentElement.style.overflow='hidden';try{voStop();}catch(e){}asRender();}
function asClose(){AS.phase=null;if(AS.el)AS.el.hidden=true;document.documentElement.style.overflow='';}
function asLogo(){const o=document.querySelector('.org img');return o?`<div class="as-brand"><img src="${o.src}" alt=""><b>وقاء</b></div>`:'';}
function asRender(){const el=AS.el,N=AS_ITEMS.length;let h='';
  if(AS.phase==='intro'){const resume=AS.rec.pre&&!AS.rec.post;
    h=`${AS_ART}<h2>أطلس الجراد الصحراوي</h2>
    <p class="as-sub">${resume?'أهلاً بعودتك. كمّل استكشاف الأطلس، وفي النهاية اضغط «أنهِ التجربة» لتشوف كم تعلّمت.':'قبل ما تبدأ، جاوب على 5 أسئلة سريعة نعرف فيها معلوماتك الحالية. ما فيه صح وغلط الحين، جاوب باللي تعرفه.'}</p>
    <button type="button" class="as-btn" data-as="${resume?'close':'start'}">${resume?'كمّل التجربة':'ابدأ'}</button>
    ${resume?'':`<button type="button" class="as-link" data-as="skip">ادخل الأطلس مباشرة</button>`}`;}
  else if(AS.phase==='pre'||AS.phase==='post'){const k=AS_ITEMS[AS.i],q=QUIZ[k],pick=AS.picks[AS.i];
    h=`<div class="as-step"><span>${AS.phase==='pre'?'قبل التجربة':'بعد التجربة'}</span><b>سؤال ${AS.i+1} من ${N}</b></div>
    <div class="as-prog">${AS_ITEMS.map((_,j)=>`<i class="${j<=AS.i?'done':''}"></i>`).join('')}</div>
    <div class="as-q"><h3>${q.q}</h3>${q.o.map((o,j)=>`<button type="button" class="as-opt" data-pick="${j}" aria-pressed="${pick===j}"><i></i><span>${o}</span></button>`).join('')}
      <button type="button" class="as-opt idk" data-pick="-1" aria-pressed="${pick===-1}"><i></i><span>لا أعرف</span></button></div>
    <div class="as-nav">${AS.i>0?`<button type="button" class="as-link" data-as="back">السابق</button>`:'<span></span>'}
      <button type="button" class="as-btn" data-as="next" ${pick===undefined?'disabled':''}>${AS.i<N-1?'التالي':'اعرض النتيجة'}</button></div>
    ${AS.phase==='pre'?`<button type="button" class="as-link" data-as="skip">تخطَّ الأسئلة</button>`:`<button type="button" class="as-link" data-as="close">ارجع للأطلس</button>`}`;}
  else if(AS.phase==='ready'){h=`${AS_ART}<h2>جاهز للاستكشاف</h2>
    <p class="as-sub">تجوّل في أقسام الأطلس وحرّك المجسمات. ولما تخلص اضغط «أنهِ التجربة» في شريط الأقسام، وجاوب نفس الأسئلة لتشوف الفرق.</p>
    <button type="button" class="as-btn" data-as="close">ادخل الأطلس</button>`;}
  else if(AS.phase==='result'){const pre=AS.rec.pre,post=AS.rec.post,d=pre?post.score-pre.score:null;
    const msg=d===null?'هذي نتيجتك بعد التجربة.':d>0?`تحسّنت ${d===1?'إجابة واحدة':d===2?'إجابتين':d+' إجابات'}`:d===0?'نفس النتيجة':`${-d} أقل من القبلي`;
    const arrow='<svg class="as-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    h=`<h2>${post.score===N?'ممتاز!':'نتيجتك'}</h2>
    <div class="as-res"><div class="as-sc"><span>قبل</span><b>${pre?pre.score:'–'}</b><small>من ${N}</small></div>${arrow}<div class="as-sc post"><span>بعد</span><b>${post.score}</b><small>من ${N}</small></div></div>
    <div class="as-delta${d>0?'':' flat'}">${msg}</div>
    <div class="as-rev">${AS_ITEMS.map((k,j)=>{const q=QUIZ[k],a=post.answers[j],ok=a===q.a,b=pre?pre.answers[j]:null;
      return `<div class="as-ri"><b>${q.q}</b><span class="${ok?'ok':'no'}">${ok?'✓':'✗'} ${q.o[q.a]}</span><span>${q.e}</span>${pre?`<span class="mk">قبل: ${b===q.a?'✓':'✗'} · بعد: ${ok?'✓':'✗'}</span>`:''}</div>`;}).join('')}</div>
    <div class="as-row"><button type="button" class="as-btn" data-as="close">ارجع للأطلس</button><button type="button" class="as-ghost" data-as="again">تجربة جديدة</button></div>`;}
  el.innerHTML=`<div class="as-card">${AS.phase==='pre'||AS.phase==='post'?'':asLogo()}${h}</div>`;
  const f=el.querySelector('.as-btn:not([disabled])')||el.querySelector('button');if(f)f.focus({preventScroll:true});}
function asStartQuiz(phase){AS.phase=phase;AS.i=0;AS.picks=[];AS.t0=Date.now();asRender();}
function asFinishQuiz(){const answers=AS.picks.slice(),score=AS_ITEMS.reduce((s,k,j)=>s+(answers[j]===QUIZ[k].a?1:0),0),r={score,answers,sec:Math.round((Date.now()-AS.t0)/1000),at:Date.now()};
  if(AS.phase==='pre'){AS.rec.pre=r;asSave();asEmit('pre',r);AS.phase='ready';}else{AS.rec.post=r;asSave();asEmit('post',r);AS.phase='result';}
  asRender();renderTabs();}
function asClick(e){const p=e.target.closest('[data-pick]');if(p){AS.picks[AS.i]=+p.dataset.pick;asRender();return;}
  const b=e.target.closest('[data-as]');if(!b)return;const a=b.dataset.as;
  if(a==='start')asStartQuiz('pre');
  else if(a==='skip'){asEmit('skip',null);asClose();}
  else if(a==='close')asClose();
  else if(a==='back'){AS.i=Math.max(0,AS.i-1);asRender();}
  else if(a==='next'){if(AS.picks[AS.i]===undefined)return;if(AS.i<AS_ITEMS.length-1){AS.i++;asRender();}else asFinishQuiz();}
  else if(a==='again'){asNew();AS.phase='intro';asRender();}}
function asIntro(){AS.phase='intro';asOpen();}
function asFinish(){asStartQuiz('post');asOpen();}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&AS.phase&&AS.phase!=='pre'&&AS.phase!=='post'&&AS.phase!=='intro')asClose();});
/* finish entry points: last pill in the section bar, and the next-button of the last section */
const FIN_ICON='<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>';
{const _rt=renderTabs;renderTabs=function(){_rt();tabsEl.insertAdjacentHTML('beforeend',`<button class="tab finish" type="button" data-finish><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${FIN_ICON}</svg><span>أنهِ التجربة</span></button>`);};}
{const _rp=renderPanel;renderPanel=function(){_rp();const nav=content.querySelector('.chap-nav');if(nav&&!nav.querySelector('.nx'))nav.insertAdjacentHTML('beforeend',`<button type="button" class="fin" data-finish>أنهِ التجربة وقِس ما تعلّمت${CHEV}</button>`);};}
document.addEventListener('click',e=>{if(e.target.closest('[data-finish]'))asFinish();});
/* exhibition kiosk: each new visitor who wakes the screen gets a fresh intro + pre-test */
{const _sa=stopAttract;stopAttract=function(){_sa();asNew();asIntro();};}
{const _st=startAttract;startAttract=function(){if(AS.phase)asClose();_st();};}
/* section views for engagement reporting: window event 'atlas-view' and parent.postMessage({type:'weqaa-atlas-view',...}); no personal data */
{const _sv=setTab;setTab=function(id,quiet){_sv(id,quiet);const d={atlas:'locust',session:AS.rec?AS.rec.sid:null,tab:id,lang:'ar',kiosk:!!expo,at:new Date().toISOString()};
  try{window.dispatchEvent(new CustomEvent('atlas-view',{detail:d}));}catch(e){}try{if(window.parent!==window)window.parent.postMessage(Object.assign({type:'weqaa-atlas-view'},d),'*');}catch(e){}};}
renderTabs();renderPanel();
if(!/expo/.test(location.hash)&&!/[?&]intro=0/.test(location.search))asIntro();
requestAnimationFrame(frame);
