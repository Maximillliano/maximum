(function(){'use strict';
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
var lang=document.documentElement.lang||'ru',root=lang==='en'?'../../':'../',html=document.documentElement;
var calm=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))};

/* ---------- язык ---------- */
function langClose(){$$('.lang.open').forEach(function(b){b.classList.remove('open');$('.lang-cur',b).setAttribute('aria-expanded','false')})}
$$('.lang').forEach(function(box){var btn=$('.lang-cur',box),li=$$('li a',box);
 function open(o){langClose();if(o){box.classList.add('open');btn.setAttribute('aria-expanded','true')}}
 btn.addEventListener('click',function(e){e.stopPropagation();open(!box.classList.contains('open'))});
 btn.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();open(true);li[0].focus()}});
 li.forEach(function(x,i){x.addEventListener('keydown',function(e){if(e.key==='ArrowDown'&&li[i+1]){e.preventDefault();li[i+1].focus()}if(e.key==='ArrowUp'){e.preventDefault();(li[i-1]||btn).focus()}if(e.key==='Escape'){langClose();btn.focus()}})})});
document.addEventListener('click',langClose);

/* ---------- меню ---------- */
var menu=$('#menu'),burger=$('#burger');
function menuToggle(o){menu.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);document.body.classList.toggle('lock',o)}
burger.addEventListener('click',function(){menuToggle(true)});$('#menu-x').addEventListener('click',function(){menuToggle(false)});
$$('a[href^="#"]',menu).forEach(function(a){a.addEventListener('click',function(){menuToggle(false)})});

/* ---------- бегущие ленты: дублируем содержимое до бесшовной петли ---------- */
function marquees(){$$('.mq-t').forEach(function(t){
 var orig=$$(':scope > *',t),need=Math.max(innerWidth,screen.width||0)*1.05,n=0;
 while(t.scrollWidth<need&&n++<8)orig.forEach(function(e){t.appendChild(e.cloneNode(true))});
 $$(':scope > *',t).forEach(function(e){e.setAttribute('aria-hidden','true')});
 var all=$$(':scope > *',t);all.forEach(function(e){t.appendChild(e.cloneNode(true))});
 var dur=t.scrollWidth/2/(innerWidth<700?55:80);t.style.setProperty('--sp',dur.toFixed(1)+'s')})}
function afterFonts(f){if(document.fonts&&document.fonts.ready)document.fonts.ready.then(f);else f()}
afterFonts(marquees);

/* ---------- прелоадер 0 → 100 % ---------- */
var pre=$('#pre');
function ready(){html.classList.add('ready')}
if(pre&&!html.classList.contains('nopre')&&!calm){
 try{sessionStorage.setItem('v2pre','1')}catch(e){}
 var n=$('#pre-n'),bar=$('#pre-b'),t0=performance.now(),D=1900;
 (function tick(now){var p=clamp((now-t0)/D,0,1),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;   /* ease-in-out */
  n.textContent=Math.round(e*100);bar.style.transform='scaleX('+e+')';
  if(p<1)requestAnimationFrame(tick);else setTimeout(function(){pre.classList.add('done');setTimeout(ready,380);setTimeout(function(){pre.remove()},1200)},260)})(t0);
}else{if(pre)pre.remove();requestAnimationFrame(function(){requestAnimationFrame(ready)})}

/* ---------- reveal ---------- */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.14,rootMargin:'0px 0px -4% 0px'});
$$('.rv,.ruler').forEach(function(e){io.observe(e)});
var co=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;co.unobserve(e.target);
 var n=+e.target.dataset.count,t=performance.now();(function f(now){var p=Math.min((now-t)/1800,1);e.target.textContent=Math.round(n*(1-Math.pow(1-p,4)))+'+';if(p<1)requestAnimationFrame(f)})(t)})},{threshold:.5});
if(!calm)$$('[data-count]').forEach(function(e){e.textContent='0+';co.observe(e)});

/* ---------- текст «О студии»: слова проявляются по мере прокрутки ---------- */
var ap=$('#about-p'),words=[];
if(ap&&!calm){var txt=ap.textContent.trim().split(/\s+/);ap.setAttribute('aria-label',ap.textContent.trim());ap.textContent='';
 txt.forEach(function(w,i){var s=document.createElement('span');s.className='w';s.setAttribute('aria-hidden','true');s.textContent=w+(i<txt.length-1?' ':'');s.style.setProperty('--o',.18);ap.appendChild(s);words.push(s)})}
var apOn=-1;
function aboutScrub(){if(!words.length)return;var r=ap.getBoundingClientRect(),p=clamp((innerHeight*.88-r.top)/(r.height+innerHeight*.3),0,1),k=Math.round(p*words.length*1.08);
 if(k===apOn)return;apOn=k;words.forEach(function(w,i){w.style.setProperty('--o',i<k?1:.18)})}

/* ---------- прокрутка: прогресс, шапка, параллакс ---------- */
var nav=$('#nav'),prog=$('#prog'),ph=$('.hero-ph'),lastY=0,tick=false;
function onScroll(){tick=false;var y=scrollY,m=document.documentElement.scrollHeight-innerHeight;
 prog.style.transform='scaleX('+(m>0?y/m:0)+')';
 nav.classList.toggle('stuck',y>40);nav.classList.toggle('hide',y>lastY+4&&y>260&&!menu.classList.contains('open'));if(y<lastY-4||y<260)nav.classList.remove('hide');lastY=y;
 if(!calm){if(ph&&y<innerHeight*1.2)ph.style.translate='0 '+(y*.16).toFixed(1)+'px';aboutScrub()}}
addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();

/* ---------- карточки: наклон + блик ---------- */
if(fine&&!calm)$$('.pcard,.fo-card').forEach(function(c){var tilt=c.classList.contains('fo-card')?7:6;
 c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  c.style.setProperty('--mx',(x*100)+'%');c.style.setProperty('--my',(y*100)+'%');
  c.style.transform='perspective(1000px) rotateY('+((x-.5)*tilt*2)+'deg) rotateX('+((.5-y)*tilt*2)+'deg) translateZ(0)'});
 c.addEventListener('pointerleave',function(){c.style.transform=''})});
/* тач: 1-й тап по карточке — не нужен, ссылки ведут сразу */

/* ---------- услуги: картинка следует за курсором ---------- */
var fl=$('#sv-float');
if(fine&&!calm&&fl){var fi=$('img',fl),fx=0,fy=0,tx=0,ty=0,on=false,raf=0;
 function loop(){fx+=(tx-fx)*.14;fy+=(ty-fy)*.14;fl.style.transform='translate('+(fx+28)+'px,'+(fy-fl.offsetHeight/2)+'px) scale('+(on?1:.8)+') rotate('+(on?(tx-fx)*.04:-4)+'deg)';raf=on||Math.abs(tx-fx)>.5?requestAnimationFrame(loop):0}
 $$('.sv').forEach(function(s){s.addEventListener('mouseenter',function(e){fi.src=s.dataset.img;on=true;fl.classList.add('show');tx=fx=e.clientX;ty=fy=e.clientY;if(!raf)loop()});
  s.addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;if(!raf)loop()});
  s.addEventListener('mouseleave',function(){on=false;fl.classList.remove('show')})})}

/* ---------- select ---------- */
var sel=$('#sel'),sb=$('.sel-btn',sel),sv2=$('#sel-v'),sh=$('input[name=service]',sel),opts=$$('li',sel),ph0=sv2.textContent;
function selOpen(o){sel.classList.toggle('open',o);sb.setAttribute('aria-expanded',o)}
sb.addEventListener('click',function(){selOpen(!sel.classList.contains('open'))});
opts.forEach(function(li,i){li.tabIndex=-1;li.addEventListener('click',function(){pick(li)});li.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(li)}if(e.key==='ArrowDown'&&opts[i+1])opts[i+1].focus();if(e.key==='ArrowUp')(opts[i-1]||sb).focus()})});
sb.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){selOpen(true);opts[0].focus();e.preventDefault()}});
function pick(li){sh.value=li.textContent;sv2.textContent=li.textContent;sv2.classList.remove('ph');selOpen(false);sel.parentNode.classList.remove('err');sb.focus()}
document.addEventListener('click',function(e){if(!sel.contains(e.target))selOpen(false)});

/* ---------- модалка ---------- */
var modal=$('#modal'),lastFocus;
function modalOpen(){lastFocus=document.activeElement;modal.classList.add('open');modal.setAttribute('aria-hidden','false');$('#m-x').focus()}
function modalClose(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');if(lastFocus)lastFocus.focus()}
$('#m-x').addEventListener('click',modalClose);modal.addEventListener('click',function(e){if(e.target===modal)modalClose()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){langClose();modalClose();menuToggle(false);selOpen(false)}});

/* ---------- форма (та же логика и тот же адрес приёма, что в основной версии) ---------- */
var form=$('#form'),ferr=$('#ferr');
function bad(el,on){var f=el.closest('.fld');if(f)f.classList.toggle('err',on);return on}
form.addEventListener('submit',function(e){e.preventDefault();ferr.classList.remove('show');
 var d=new FormData(form),name=(d.get('name')||'').trim(),phone=(d.get('phone')||'').trim(),
  b1=bad(form.name,name.length<2),b2=bad(sel,!d.get('service')),b3=bad(form.phone,!/^\+?[\d\s()\-]{7,}$/.test(phone)||phone.replace(/\D/g,'').length<7),b4=bad(form.agree,!form.agree.checked);
 if(b1||b2||b3||b4){var f=$('.err input,.err .sel-btn',form);if(f)f.focus();return}
 if(d.get('website'))return;
 var payload={_subject:'Новая заявка с сайта Maximum Studio (v2)',name:name,phone:phone,service:d.get('service'),lang:lang,page:location.href,time:new Date().toISOString()};
 var btn=$('.btn-send',form),ep=form.dataset.endpoint;btn.disabled=true;
 function done(){btn.disabled=false;form.reset();sv2.textContent=ph0;sv2.classList.add('ph');modalOpen();window.confetti&&window.confetti()}
 if(!ep){console.warn('[form] data-endpoint не задан — демо-режим',payload);setTimeout(done,400);return}
 fetch(ep,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)})
  .then(function(r){if(!r.ok)throw new Error(r.status);done()})
  .catch(function(err){console.error('[form]',err);btn.disabled=false;ferr.classList.add('show')})});
$$('input',form).forEach(function(i){i.addEventListener('input',function(){bad(i,false)})});

/* ---------- cookies: как в основной версии. Выбор хранится 12 месяцев; аналитика грузится только после «Принять» ---------- */
var ck=$('#cookie'),CK_TTL=365*864e5,anLoaded=false;
var ANALYTICS={ym:'113723367',ga:'G-MGN5GMJS69'};
function ckGet(){try{var o=JSON.parse(store.get('cookies')||'null');if(o&&o.v&&Date.now()-o.t<CK_TTL)return o.v}catch(e){}return null}
function ckShow(o){ck.classList.toggle('show',o)}
function loadAnalytics(){
 if(ANALYTICS.ym){anLoaded=true;(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t);a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');window.ym(ANALYTICS.ym,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true})}
 if(ANALYTICS.ga){anLoaded=true;var s=document.createElement('script');s.async=1;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(ANALYTICS.ga);document.head.appendChild(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',ANALYTICS.ga)}}
function ckSet(v){store.set('cookies',JSON.stringify({v:v,t:Date.now()}));ckShow(false);
 if(v==='accepted')loadAnalytics();else if(anLoaded)location.reload();
 document.dispatchEvent(new CustomEvent('cookies:'+v))}
var ck0=ckGet();
if(ck0==='accepted')loadAnalytics();
if(!ck0)setTimeout(function(){ckShow(true)},calm?1200:4200);
if(location.hash==='#cookie-settings')ckShow(true);
$('#ck-yes').addEventListener('click',function(){ckSet('accepted')});$('#ck-no').addEventListener('click',function(){ckSet('refused')});
var cko=$('#ck-open');if(cko)cko.addEventListener('click',function(){ckShow(true);$('#ck-yes').focus()});

/* ---------- мелочи ---------- */
$$('footer img,.reviews img').forEach(function(i){i.addEventListener('error',function(){i.style.display='none'})});
var yr=$('#year');if(yr)yr.textContent=new Date().getFullYear();
window.confetti=function(){if(calm)return;var cv=document.createElement('canvas');cv.className='confetti';cv.width=innerWidth;cv.height=innerHeight;document.body.appendChild(cv);var g=cv.getContext('2d'),col=['#ffda66','#fff','#ffda66','#ffe9a3','#ffc93a'],P=[];
 for(var i=0;i<120;i++)P.push({x:innerWidth/2,y:innerHeight*.45,vx:(Math.random()-.5)*16,vy:-Math.random()*14-4,s:4+Math.random()*6,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:col[i%5]});
 var t=0;(function f(){g.clearRect(0,0,cv.width,cv.height);P.forEach(function(p){p.vy+=.35;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);g.restore()});
  if(++t<130)requestAnimationFrame(f);else cv.remove()})()};

/* ---------- Instagram-лента (data-feed → JSON; нет данных — остаются заглушки) ---------- */
(function(){var g=$('#ig-grid');if(!g||!window.fetch)return;var url=g.dataset.feed,max=+g.dataset.max||3;if(!url)return;
 function src(u){if(typeof u!=='string')return'';if(/^https:\/\//.test(u))return u;return(/^[\w\-.\/%]+$/.test(u)&&u.indexOf('..')<0&&u.charAt(0)!=='/')?root+u:''}
 function norm(p){var s=p.sizes||{},img=p.thumbnailUrl||p.thumbnail_url||(s.medium&&s.medium.mediaUrl)||p.mediaUrl||p.media_url||p.image||'';
  var t=(p.mediaType||p.media_type||'').toUpperCase();return{link:p.permalink||p.link||'',img:img,cap:(p.prunedCaption||p.caption||'').replace(/\s+/g,' ').trim(),ts:p.timestamp||p.date||'',type:t}}
 fetch(url,{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
  var list=(Array.isArray(d)?d:(d.posts||d.data||[])).map(norm).map(function(p){p.img=src(p.img);return p}).filter(function(p){return p.img&&/^https:\/\/(www\.)?instagram\.com\//.test(p.link)}).slice(0,max);
  if(!list.length)return;g.textContent='';
  list.forEach(function(p){var a=document.createElement('a');a.className='ig-card';a.href=p.link;a.target='_blank';a.rel='noopener';
   var im=document.createElement('img');im.src=p.img;im.alt=p.cap.slice(0,100)||'Instagram';im.loading='lazy';im.referrerPolicy='no-referrer';a.appendChild(im);
   if(p.type==='VIDEO'||p.type==='CAROUSEL_ALBUM'){var t=document.createElement('span');t.className='ig-type';t.textContent=p.type==='VIDEO'?'▶':'❐';a.appendChild(t)}
   var o=document.createElement('span');o.className='ig-o';
   if(p.cap){var c=document.createElement('span');c.className='ig-cap';c.textContent=p.cap;o.appendChild(c)}
   var dt=p.ts&&new Date(p.ts);if(dt&&!isNaN(dt)){var e=document.createElement('span');e.className='ig-d';e.textContent=dt.toLocaleDateString(lang==='en'?'en-US':'ru-RU',{day:'numeric',month:'long',year:'numeric'});o.appendChild(e)}
   a.appendChild(o);g.appendChild(a)})}).catch(function(){})})();
window.__v2=1;
})();
