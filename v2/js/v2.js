/* Maximum Studio — v2. Плавный скролл (Lenis) + таймлайны (GSAP/ScrollTrigger), всё лежит на сайте: внешних запросов нет. */
(function(){'use strict';
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
var lang=document.documentElement.lang||'ru',root=lang==='en'?'../../':'../',html=document.documentElement;
var calm=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))};
var G=window.gsap,ST=window.ScrollTrigger,L=window.Lenis,FX=!calm&&G&&ST&&L,lenis=null;
if(!FX)html.classList.remove('js');          /* нет движка или reduced-motion: всё показывается сразу */
var T=function(ru,en){return lang==='en'?en:ru};

/* ---------- язык ---------- */
function langClose(){$$('.lang.open').forEach(function(b){b.classList.remove('open');$('.lang-cur',b).setAttribute('aria-expanded','false')})}
$$('.lang').forEach(function(box){var btn=$('.lang-cur',box),li=$$('li a',box);
 function open(o){langClose();if(o){box.classList.add('open');btn.setAttribute('aria-expanded','true')}}
 btn.addEventListener('click',function(e){e.stopPropagation();open(!box.classList.contains('open'))});
 btn.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();open(true);li[0].focus()}});
 li.forEach(function(x,i){x.addEventListener('keydown',function(e){if(e.key==='ArrowDown'&&li[i+1]){e.preventDefault();li[i+1].focus()}if(e.key==='ArrowUp'){e.preventDefault();(li[i-1]||btn).focus()}if(e.key==='Escape'){langClose();btn.focus()}})})});
document.addEventListener('click',langClose);



/* ---------- меню ---------- */
var menu=$('#menu'),burger=$('#burger'),menuLinks=$$('nav a',menu);
function menuToggle(o){if(menu.classList.contains('open')===!!o)return;menu.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);document.body.classList.toggle('lock',o);
 if(lenis)o?lenis.stop():lenis.start();
 if(FX&&o)G.fromTo(menuLinks,{y:60,opacity:0},{y:0,opacity:1,duration:.9,ease:'expo.out',stagger:.07,delay:.25,overwrite:true})}
burger.addEventListener('click',function(){menuToggle(true)});$('#menu-x').addEventListener('click',function(){menuToggle(false)});

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
window.confetti=function(){if(calm)return;var cv=document.createElement('canvas');cv.className='confetti';cv.width=innerWidth;cv.height=innerHeight;document.body.appendChild(cv);var g=cv.getContext('2d'),col=['#b44cff','#fff','#d08bff','#8f2bff','#e6c4ff'],P=[];
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

/* =====================================================================
   ДВИЖОК АНИМАЦИЙ
   ===================================================================== */
if(FX){
G.registerPlugin(ST);
G.defaults({ease:'expo.out'});
G.config({nullTargetWarn:false});

/* ---------- плавный скролл ---------- */
lenis=new Lenis({lerp:.085,wheelMultiplier:.95,smoothWheel:true,anchors:false});
lenis.on('scroll',ST.update);G.ticker.add(function(t){lenis.raf(t*1000)});G.ticker.lagSmoothing(0);
lenis.stop();
var pgY=0,navEl=$('#nav'),navLive=false,lastS=0,navHidden=false;
lenis.on('scroll',function(e){pgY=e.progress;var y=e.scroll;navEl.classList.toggle('stuck',y>40);
 if(navLive){var hide=y>lastS+2&&y>320&&!menu.classList.contains('open');if(y<lastS-2||y<320)hide=false;if(hide!==navHidden&&Math.abs(y-lastS)>2){navHidden=hide;G.to(navEl,{yPercent:hide?-110:0,duration:.6,ease:'power3.out',overwrite:true})}}lastS=y});
var progEl=$('#prog');G.ticker.add(function(){progEl.style.transform='scaleX('+pgY+')'});

/* ---------- утилиты: разбиение текста ---------- */
function splitChars(el){var out=[];(function walk(n){$$(':scope',n);Array.prototype.slice.call(n.childNodes).forEach(function(c){
  if(c.nodeType===3){var f=document.createDocumentFragment();c.nodeValue.split('').forEach(function(ch){var s=document.createElement('span');s.className='c';s.textContent=ch;s.setAttribute('aria-hidden','true');f.appendChild(s);out.push(s)});c.parentNode.replaceChild(f,c)}
  else if(c.nodeType===1&&c.tagName!=='BR')walk(c)})})(el);return out}
function splitWords(el){var out=[];el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());
 (function walk(n){Array.prototype.slice.call(n.childNodes).forEach(function(c){
  if(c.nodeType===3){var f=document.createDocumentFragment();c.nodeValue.split(/(\s+)/).forEach(function(w){if(!w)return;if(/^\s+$/.test(w)){f.appendChild(document.createTextNode(' '));return}
   var a=document.createElement('span'),b=document.createElement('span');a.className='wd';b.className='wi';a.setAttribute('aria-hidden','true');b.textContent=w;a.appendChild(b);f.appendChild(a);out.push(b)});c.parentNode.replaceChild(f,c)}
  else if(c.nodeType===1&&c.tagName!=='BR')walk(c)})})(el);return out}

/* ---------- бегущие ленты: бесшовная петля + скорость и наклон от прокрутки ---------- */
var tracks=[];
function buildMarquees(){$$('.mq-t').forEach(function(t){
 var orig=$$(':scope > *',t),need=Math.max(innerWidth,screen.width||0)*1.1,n=0;
 while(t.scrollWidth<need&&n++<8)orig.forEach(function(e){t.appendChild(e.cloneNode(true))});
 var all=$$(':scope > *',t);all.forEach(function(e){e.setAttribute('aria-hidden','true')});all.forEach(function(e){t.appendChild(e.cloneNode(true))});
 tracks.push({el:t,half:0,x:0,rev:!!t.closest('.rev')||t.closest('.rib')&&false,base:t.closest('.mq-chip')?50:t.closest('.mq-big')?70:90})});
 $$('.rib-t').forEach(function(t,i){tracks.push({el:t,half:0,x:0,rev:false,base:46})});
 tracks.forEach(function(k){k.half=k.el.scrollWidth/2});
 /* фото-ленты: у ленты-дубля противоположное направление */
}
var sv=0,dir=1;
G.ticker.add(function(time,dt){dt=Math.min(dt,50)/1000;var v=lenis.velocity||0;sv+=(v-sv)*.08;
 if(Math.abs(v)>.2)dir+=((v>0?1:-1)-dir)*.06;
 tracks.forEach(function(k){if(!k.half)return;var s=(k.base*dir*(k.rev?-1:1))+sv*22*(k.rev?-1:1);k.x-=s*dt;
  if(k.x<=-k.half)k.x+=k.half;if(k.x>0)k.x-=k.half;
  k.el.style.transform='translate3d('+k.x.toFixed(1)+'px,0,0) skewX('+clamp(-sv*.5,-9,9).toFixed(2)+'deg)'})});

/* ---------- кастомный курсор ---------- */
if(fine){html.classList.add('has-cur');var cur=$('#cur'),dot=$('i',cur),ring=$('span',cur),qx=G.quickTo(ring,'x',{duration:.55,ease:'power3'}),qy=G.quickTo(ring,'y',{duration:.55,ease:'power3'});
 var LAB={view:T('Смотреть','View'),drag:T('Тяни','Drag')};
 addEventListener('pointermove',function(e){cur.classList.remove('out');dot.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)';qx(e.clientX);qy(e.clientY)},{passive:true});
 document.addEventListener('pointerleave',function(){cur.classList.add('out')});
 document.addEventListener('pointerover',function(e){var d=e.target.closest&&e.target.closest('[data-cursor]');
  if(d){ring.textContent=LAB[d.dataset.cursor]||'';cur.classList.add('lab');cur.classList.remove('hov')}
  else{cur.classList.remove('lab');ring.textContent='';cur.classList.toggle('hov',!!(e.target.closest&&e.target.closest('a,button,.sel li,label')))}});
 /* магнитные кнопки */
 $$('[data-mag],.nav .btn').forEach(function(b){var xt=G.quickTo(b,'x',{duration:.6,ease:'power3'}),yt=G.quickTo(b,'y',{duration:.6,ease:'power3'});
  b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();xt((e.clientX-r.left-r.width/2)*.3);yt((e.clientY-r.top-r.height/2)*.4)});
  b.addEventListener('pointerleave',function(){xt(0);yt(0)})});
 /* ролл текста */
 $$('.links a,.btn>span:not(.rl),.fl a').forEach(function(a){var tn=a.tagName==='SPAN'?a:null;
  function wrap(node){var txt=node.nodeValue;if(!txt.trim())return;var r=document.createElement('span');r.className='rl';r.innerHTML='<span></span><span aria-hidden="true"></span>';r.children[0].textContent=txt;r.children[1].textContent=txt;node.parentNode.replaceChild(r,node)}
  if(tn){if(tn.children.length===0&&tn.firstChild&&tn.firstChild.nodeType===3)wrap(tn.firstChild)}
  else Array.prototype.slice.call(a.childNodes).forEach(function(c){if(c.nodeType===3)wrap(c)})})}

/* ---------- переходы по якорям: жёлтая шторка ---------- */
var wipe=$('#wipe'),busy=false;
G.set(wipe,{yPercent:100});
function goTo(target){if(busy)return;busy=true;var closing=menu.classList.contains('open');
 G.timeline({defaults:{ease:'power3.inOut'}})
  .set(wipe,{yPercent:100})
  .to(wipe,{yPercent:0,duration:.6})
  .add(function(){if(closing)menuToggle(false);lenis.scrollTo(target,{immediate:true,force:true});ST.update()})
  .to(wipe,{yPercent:-100,duration:.65,delay:.08})
  .add(function(){G.set(wipe,{yPercent:100});busy=false})}
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var h=a.getAttribute('href');if(h==='#'||h.length<2||h==='#cookie-settings')return;
 var el=$(h);if(!el)return;e.preventDefault();goTo(h==='#top'?0:el)});
var tt=$('#totop');if(tt)lenis.on('scroll',function(e){tt.classList.toggle('show',e.scroll>innerHeight*.8)});if(tt)tt.addEventListener('click',function(){lenis.scrollTo(0,{duration:2.2,easing:function(t){return 1-Math.pow(1-t,4)}})});

/* ---------- заголовки по словам ---------- */
var heads=$$('.big-h,.fb-h').filter(function(h){return!h.closest('.hs')});
heads.forEach(function(h){var w=splitWords(h);G.set(w,{yPercent:115,rotate:4});
 ST.create({trigger:h,start:'top 88%',once:true,onEnter:function(){G.to(w,{yPercent:0,rotate:0,duration:1.25,stagger:.09})}})});

/* ---------- прочие появления ---------- */
G.set('.rv',{opacity:0,y:50});
ST.batch('.rv',{start:'top 90%',once:true,onEnter:function(b){G.to(b,{opacity:1,y:0,duration:1.2,stagger:.1,overwrite:true})}});

/* ---------- ТЕКСТ «О студии»: слова зажигаются по скроллу ---------- */
var ap=$('#about-p');
if(ap){var wr=[],txt=ap.textContent.trim().split(/\s+/);ap.setAttribute('aria-label',ap.textContent.trim());ap.textContent='';
 txt.forEach(function(w,i){var s=document.createElement('span');s.className='w';s.setAttribute('aria-hidden','true');s.textContent=w+(i<txt.length-1?' ':'');ap.appendChild(s);wr.push(s)});
 G.fromTo(wr,{opacity:.14},{opacity:1,ease:'none',stagger:.12,scrollTrigger:{trigger:ap,start:'top 82%',end:'bottom 48%',scrub:.4}})}
$$('[data-count]').forEach(function(e){var n=+e.dataset.count,o={v:0};e.textContent='0+';
 ST.create({trigger:e,start:'top 85%',once:true,onEnter:function(){G.to(o,{v:n,duration:2.2,ease:'power4.out',onUpdate:function(){e.textContent=Math.round(o.v)+'+'}})}})});
G.utils.toArray('.st b').forEach(function(b){G.fromTo(b,{yPercent:18},{yPercent:-10,ease:'none',scrollTrigger:{trigger:b,start:'top bottom',end:'bottom top',scrub:true}})});
var bars=$('#bars');if(bars)ST.create({trigger:bars,start:'top 85%',once:true,onEnter:function(){bars.classList.add('in')}});

/* ---------- HERO ---------- */
var hero=$('#hero'),h1=$('.hero-h'),fig=$('.hero-fig'),heroPh=$('#hero-ph'),bob=$('.hero-bob'),glows=$$('.hero-glow'),lns=$$('.ln-i',h1),lnBox=$$('.ln',h1),chars=[];
h1.setAttribute('aria-label',h1.textContent.replace(/\s+/g,' ').trim());
lns.forEach(function(l){chars=chars.concat(splitChars(l))});
G.set(chars,{yPercent:118,rotate:7});h1.classList.add('split');
G.set(heroPh,{opacity:0,y:90,scale:1.12,transformPerspective:1300});G.set(glows,{opacity:0,scale:.35});
G.set('#nav',{yPercent:-110});
function heroIn(){
 var tl=G.timeline();
 tl.to(glows,{opacity:1,scale:1,duration:2.6,ease:'expo.out',stagger:.15},0)
   .to(heroPh,{opacity:1,y:0,scale:1,duration:2.2,ease:'expo.out'},.1)
   .to(chars,{yPercent:0,rotate:0,duration:1.25,stagger:{each:.035,from:'start'}},.25)
   .to('#nav',{yPercent:0,duration:1,ease:'power3.out',onComplete:function(){navLive=true}},.5)
   .add(function(){h1.classList.add('free');heroLive()},'>-.2');
}
function heroLive(){
 /* дыхание портрета */
 G.to(bob,{y:-9,rotation:.25,duration:3.6,ease:'sine.inOut',yoyo:true,repeat:-1});
 /* прокрутка: портрет приближается, строки расходятся */
 G.timeline({scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.5}})
  .to(fig,{scale:1.22,yPercent:10,transformOrigin:'50% 100%',ease:'none'},0)
  .to(glows[0],{scale:1.5,opacity:.35,ease:'none'},0)
  .to(lns[0],{xPercent:-22,ease:'none'},0).to(lns[1],{xPercent:22,ease:'none'},0)
  .to('.hero-top,.hero-bot',{opacity:0,y:-60,ease:'none'},0);
 /* курсор двигает вырезанного героя: сдвиг, наклон, свет, противоход текста и свечения */
 var D=1.1,px=G.quickTo(heroPh,'x',{duration:D,ease:'power3'}),py=G.quickTo(heroPh,'y',{duration:D,ease:'power3'}),
  pry=G.quickTo(heroPh,'rotationY',{duration:D,ease:'power3'}),prx=G.quickTo(heroPh,'rotationX',{duration:D,ease:'power3'}),
  g0x=G.quickTo(glows[0],'x',{duration:1.6,ease:'power3'}),g0y=G.quickTo(glows[0],'y',{duration:1.6,ease:'power3'}),
  g1x=G.quickTo(glows[1],'x',{duration:2,ease:'power3'}),g1y=G.quickTo(glows[1],'y',{duration:2,ease:'power3'}),
  l0=G.quickTo(lnBox[0],'x',{duration:1.4,ease:'power3'}),l1=G.quickTo(lnBox[1],'x',{duration:1.4,ease:'power3'}),
  ly0=G.quickTo(lnBox[0],'y',{duration:1.4,ease:'power3'}),ly1=G.quickTo(lnBox[1],'y',{duration:1.4,ease:'power3'});
 function aim(nx,ny){px(nx*90);py(ny*46);pry(nx*13);prx(-ny*8);g0x(-nx*130);g0y(-ny*90);g1x(nx*190);g1y(ny*70);l0(nx*-70);l1(nx*90);ly0(ny*-22);ly1(ny*26)}
 if(fine){var cs=chars.filter(function(c){return c.textContent.trim()}).map(function(c){return{el:c,y:G.quickTo(c,'y',{duration:.6,ease:'power3'}),s:G.quickTo(c,'scale',{duration:.6,ease:'power3'})}});
  hero.addEventListener('pointermove',function(e){var nx=e.clientX/innerWidth-.5,ny=e.clientY/innerHeight-.5;aim(nx,ny);
   var r=heroPh.getBoundingClientRect();heroPh.style.setProperty('--lx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');heroPh.style.setProperty('--ly',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
   cs.forEach(function(c){var rr=c.el.getBoundingClientRect(),d=Math.hypot(e.clientX-(rr.left+rr.width/2),e.clientY-(rr.top+rr.height/2)),k=clamp(1-d/240,0,1);c.y(-k*20);c.s(1+k*.1)})});
  hero.addEventListener('pointerleave',function(){aim(0,0);cs.forEach(function(c){c.y(0);c.s(1)})})}
 else{ /* тач: герой мягко «ходит» сам */
  G.ticker.add(function(t){if(scrollY>innerHeight)return;aim(Math.sin(t*.7)*.32,Math.cos(t*.55)*.22)})}
}

/* ---------- ОСНОВАТЕЛЬ: карточка выезжает и крутится ---------- */
var card=$('#fo-card');
if(card){G.set(card,{transformPerspective:1100});
 G.fromTo(card,{rotationY:-75,y:120,opacity:.2},{rotationY:0,y:0,opacity:1,ease:'none',scrollTrigger:{trigger:'#founder',start:'top 95%',end:'top 35%',scrub:.6}});
 G.fromTo($('.fo-photo img',card),{yPercent:-8,scale:1.18},{yPercent:8,scale:1.18,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'bottom top',scrub:true}});
 if(fine){var rx=G.quickTo(card,'rotationX',{duration:.7,ease:'power3'}),ry=G.quickTo(card,'rotationY',{duration:.7,ease:'power3'});
  card.addEventListener('pointermove',function(e){var r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;card.style.setProperty('--mx',x*100+'%');card.style.setProperty('--my',y*100+'%');
   if(ST.isInViewport(card,.6)){ry((x-.5)*16);rx((.5-y)*14)}});
  card.addEventListener('pointerleave',function(){rx(0);ry(0)})}}

/* ---------- ПРОЕКТЫ: сетка крупных плиток ---------- */
var work=$('#work'),pcs=$$('.pcard'),mm=G.matchMedia();
pcs.forEach(function(c){var im=$('.pcard-im',c),img=$('img',c);
 G.fromTo(c,{y:90,opacity:0},{y:0,opacity:1,duration:1.3,scrollTrigger:{trigger:c,start:'top 92%',once:true}});
 G.fromTo(im,{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:1.5,ease:'expo.inOut',scrollTrigger:{trigger:c,start:'top 90%',once:true}});
 G.fromTo(img,{yPercent:-6,scale:1.18},{yPercent:6,scale:1.18,ease:'none',scrollTrigger:{trigger:c,start:'top bottom',end:'bottom top',scrub:true}});
 if(fine){G.set(c,{transformPerspective:1000});var rx=G.quickTo(c,'rotationX',{duration:.7,ease:'power3'}),ry=G.quickTo(c,'rotationY',{duration:.7,ease:'power3'});
  c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%');ry((x-.5)*10);rx((.5-y)*10)});
  c.addEventListener('pointerleave',function(){rx(0);ry(0)})}});
var he=$('.hs-end');if(he)G.from(he,{y:50,opacity:0,duration:1.2,scrollTrigger:{trigger:he,start:'top 94%',once:true}});

/* ---------- УСЛУГИ: стопка карточек (без затемнения, текст всегда читается) ---------- */
$$('.sv').forEach(function(s,i){s.style.setProperty('--i',i);var img=$('.sv-im img',s);
 G.fromTo(img,{yPercent:-9},{yPercent:9,ease:'none',scrollTrigger:{trigger:s,start:'top bottom',end:'bottom top',scrub:true}})});

/* ---------- ПОДХОД: шаги зажигаются ---------- */
$$('.steps li').forEach(function(li){G.fromTo(li,{opacity:.18,x:-18},{opacity:1,x:0,ease:'none',scrollTrigger:{trigger:li,start:'top 88%',end:'top 58%',scrub:true}})});

/* ---------- ОТЗЫВЫ: перетаскиваемый слайдер ---------- */
var sl=$('#slider'),slt=$('#sl-track');
if(sl){var slides=$$('.slide',slt),idx=0,x=0,minX=0,sn=$('#sl-n'),sb=$('#sl-b'),offs=[];
 sl.setAttribute('role','region');sl.setAttribute('aria-roledescription','carousel');sl.tabIndex=0;
 function measure(){offs=slides.map(function(s){return s.offsetLeft-slides[0].offsetLeft});minX=-Math.max(0,slt.scrollWidth-sl.clientWidth+parseFloat(getComputedStyle(sl).paddingLeft)*2)}
 function ui(){var i=clamp(Math.round(-x/(offs[1]||1)),0,slides.length-1);sn.textContent='0'+(i+1);sb.style.transform='scaleX('+((i+1)/slides.length)+')'}
 function go(i,d){idx=clamp(i,0,slides.length-1);var tx=Math.max(minX,-offs[idx]);G.to(slt,{x:tx,duration:d||1.1,ease:'expo.out',overwrite:true,onUpdate:function(){x=+G.getProperty(slt,'x');ui()}});x=tx;ui()}
 measure();addEventListener('resize',function(){measure();go(idx,.01)});
 var down=false,sx=0,x0=0,lastX=0,vel=0,moved=0;
 sl.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;down=true;moved=0;sx=lastX=e.clientX;x0=+G.getProperty(slt,'x')||0;vel=0;G.killTweensOf(slt);sl.classList.add('drag');sl.setPointerCapture&&sl.setPointerCapture(e.pointerId)});
 sl.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));vel=e.clientX-lastX;lastX=e.clientX;
  var nx=x0+dx;if(nx>0)nx*=.35;if(nx<minX)nx=minX+(nx-minX)*.35;x=nx;G.set(slt,{x:nx});ui()});
 function up(){if(!down)return;down=false;sl.classList.remove('drag');var cur=-x,t=cur-vel*9,best=0,bd=1e9;offs.forEach(function(o,i){var d=Math.abs(o-t);if(d<bd){bd=d;best=i}});go(best)}
 sl.addEventListener('pointerup',up);sl.addEventListener('pointercancel',up);
 sl.addEventListener('dragstart',function(e){e.preventDefault()});
 sl.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(idx+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(idx-1)}});
 $('#sl-x').addEventListener('click',function(){go(idx+1)});$('#sl-p').addEventListener('click',function(){go(idx-1)});ui()}

/* ---------- ПАНЕЛИ: секция «вырастает» на весь экран ---------- */
mm.add('(min-width:768px)',function(){$$('[data-panel]').forEach(function(p){
 G.fromTo(p,{clipPath:'inset(9% 5% 0% 5% round 56px)'},{clipPath:'inset(0% 0% 0% 0% round 0px)',ease:'none',scrollTrigger:{trigger:p,start:'top 98%',end:'top 22%',scrub:.5}})});
 return function(){G.set('[data-panel]',{clearProps:'clipPath'})}});

/* ---------- ПОДВАЛ: слово MAXIMUM собирается по буквам ---------- */
var wm=$('.wm');if(wm){wm.setAttribute('aria-label','MAXIMUM');var wc=splitChars(wm);G.set(wc,{yPercent:110});
 ST.create({trigger:wm,start:'top 92%',once:true,onEnter:function(){G.to(wc,{yPercent:0,duration:1.4,stagger:.07})}})}

/* ---------- индикатор секций ---------- */
var secs=[[hero,'Maximum Studio'],[$('#about'),null],[$('#founder'),null],[work,null],[$('#services'),null],[$('#approach'),null],[$('#reviews'),null],[$('#instagram'),null],[$('#feedback'),T('Заявка','Request')],[$('#contacts'),null]],sn2=$('#side-n'),st2=$('#side-t'),sbar=$('#side-b');
secs.forEach(function(p,i){var el=p[0];if(!el)return;var eb=$('.eyebrow',el),name=p[1]||(eb?eb.textContent.replace(/^\(\d+\)\s*/,''):el.id);
 ST.create({trigger:el,start:'top 55%',end:'bottom 55%',onToggle:function(s){if(s.isActive){sn2.textContent=('0'+(i+1)).slice(-2);st2.textContent=name}}})});
sn2.textContent='01';st2.textContent='Maximum Studio';
G.ticker.add(function(){sbar.style.transform='scaleX('+pgY+')'});

/* ---------- ПРЕЛОАДЕР 0 → 100 % ---------- */
var pre=$('#pre'),skip=html.classList.contains('nopre');
buildMarquees();
function begin(){html.classList.add('ready');lenis.start();heroIn();afterFonts(function(){buildMarqueesSizes();ST.refresh()})}
function buildMarqueesSizes(){tracks.forEach(function(k){k.half=k.el.scrollWidth/2})}
function afterFonts(f){if(document.fonts&&document.fonts.ready)document.fonts.ready.then(f);else f()}
var ready=new Promise(function(res){var done=0,go=function(){if(++done>=2)res()};afterFonts(go);var im=$('.hero-ph img');if(im&&!im.complete)im.addEventListener('load',go);else go();setTimeout(res,3500)});
if(pre&&!skip){try{sessionStorage.setItem('v2pre','1')}catch(e){}
 var nEl=$('#pre-n'),bar=$('#pre-b'),o={p:0},t0=performance.now(),pc=$('.pre-n'),finished=false;
 G.to(o,{p:1,duration:2.1,ease:'power2.inOut',onUpdate:function(){var v=Math.round(o.p*100);nEl.textContent=v;bar.style.transform='scaleX('+o.p+')'},
  onComplete:function(){ready.then(function(){
   G.timeline().to(pc,{scale:1.06,duration:.3,ease:'power2.in'}).to('.pre-l,.pre-t',{opacity:0,duration:.25},0)
    .add(function(){pre.classList.add('done');setTimeout(begin,420);setTimeout(function(){pre.remove()},1300)},'>')})}})}
else{if(pre)pre.remove();G.delayedCall(.05,begin)}
addEventListener('load',function(){ST.refresh()});
}else{
 /* без движка: простые якоря, а скролл — нативный */
 $$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(){menuToggle(false)})});
 var nv=$('#nav');if(nv)addEventListener('scroll',function(){nv.classList.toggle('stuck',scrollY>40)},{passive:true});
 var pr=$('#pre');if(pr)pr.remove();
}

window.__v2=1;
})();
