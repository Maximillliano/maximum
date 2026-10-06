(function(){'use strict';
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
var lang=document.documentElement.lang||'ru';

/* ---------- переключатель языка: выпадающий список со ссылками на отдельные страницы RU / EN ---------- */
function langClose(){$$('.lang.open').forEach(function(b){b.classList.remove('open');$('.lang-cur',b).setAttribute('aria-expanded','false')})}
$$('.lang').forEach(function(box){var btn=$('.lang-cur',box),li=$$('li a',box);
 function open(o){langClose();if(o){box.classList.add('open');btn.setAttribute('aria-expanded','true')}}
 btn.addEventListener('click',function(e){e.stopPropagation();open(!box.classList.contains('open'))});
 btn.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();open(true);li[0].focus()}});
 li.forEach(function(x,i){x.addEventListener('keydown',function(e){if(e.key==='ArrowDown'&&li[i+1]){e.preventDefault();li[i+1].focus()}if(e.key==='ArrowUp'){e.preventDefault();(li[i-1]||btn).focus()}if(e.key==='Escape'){langClose();btn.focus()}})})});
document.addEventListener('click',langClose);

/* ---------- меню-бургер ---------- */
var menu=$('#menu'),burger=$('#burger');
function menuToggle(o){menu.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);document.body.classList.toggle('lock',o)}
burger.addEventListener('click',function(){menuToggle(true)});$('#menu-x').addEventListener('click',function(){menuToggle(false)});
$$('a',menu).forEach(function(a){a.addEventListener('click',function(){menuToggle(false)})});

/* ---------- появление блоков + счётчики ---------- */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
var calm=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(hover:hover)').matches,intro=$('#intro');
if(store.get('intro')||calm){intro&&intro.remove();intro=null}else store.set('intro','1');
/* анимация букв в hero */
if(!calm)$$('.big>span').forEach(function(s,k){var t=s.textContent;s.className=(s.classList.contains('a')?'a ':'')+'split';s.style.setProperty('--d',(.12*k)+'s');
 s.innerHTML=t.split('').map(function(c,i){return'<span class="ch" style="--c:'+i+'"><i>'+c+'</i></span>'}).join('')});
setTimeout(function(){$$('.rv,.split,.im').forEach(function(e){io.observe(e)})},intro?1000:0);
var co=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;co.unobserve(e.target);
 var n=+e.target.dataset.count,t=performance.now();(function f(now){var p=Math.min((now-t)/1600,1);e.target.textContent=Math.round(n*(1-Math.pow(1-p,3)))+'+';if(p<1)requestAnimationFrame(f)})(t)})},{threshold:.5});
if(!matchMedia('(prefers-reduced-motion:reduce)').matches)$$('[data-count]').forEach(function(e){e.textContent='0+';co.observe(e)});

/* ---------- hover по цифрам: картинка следует за курсором (гайд) ---------- */
if(matchMedia('(hover:hover)').matches){var fol=document.createElement('div');fol.className='follow';fol.innerHTML='<img alt="" src="">';document.body.appendChild(fol);
 $$('.stat').forEach(function(s){s.addEventListener('mouseenter',function(){$('img',fol).src=s.dataset.img;fol.classList.add('show')});
  s.addEventListener('mouseleave',function(){fol.classList.remove('show')});
  s.addEventListener('mousemove',function(e){fol.style.transform='translate('+(e.clientX+20)+'px,'+(e.clientY+20)+'px)'+(fol.classList.contains('show')?'':' scale(.8)')})})}

/* ---------- карточки портфолио на тач-устройствах: 1-й тап — описание, 2-й — переход ---------- */
$$('.pc').forEach(function(c){c.addEventListener('click',function(e){if(matchMedia('(hover:none)').matches&&!c.classList.contains('open')){e.preventDefault();$$('.pc.open').forEach(function(o){o.classList.remove('open')});c.classList.add('open')}})});

/* ---------- кастомный select (гайд: Dropdown / Dropdown Open) ---------- */
var ru0=$('#sel-v').textContent,sel=$('#sel'),sb=$('.sel-btn',sel),sv2=$('#sel-v'),sh=$('input[name=service]',sel),opts=$$('li',sel);
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

/* ---------- форма ---------- */
var form=$('#form'),ferr=$('#ferr');
function bad(el,on){var f=el.closest('.fld');if(f)f.classList.toggle('err',on);return on}
form.addEventListener('submit',function(e){e.preventDefault();ferr.classList.remove('show');
 var d=new FormData(form),name=(d.get('name')||'').trim(),phone=(d.get('phone')||'').trim(),
  b1=bad(form.name,name.length<2),b2=bad(sel,!d.get('service')),b3=bad(form.phone,!/^\+?[\d\s()\-]{7,}$/.test(phone)||phone.replace(/\D/g,'').length<7),b4=bad(form.agree,!form.agree.checked);
 if(b1||b2||b3||b4){var f=$('.err input,.err .sel-btn',form);if(f)f.focus();return}
 if(d.get('website'))return;                      /* honeypot: боты заполняют скрытое поле */
 var payload={_subject:'Новая заявка с сайта Maximum Studio',name:name,phone:phone,service:d.get('service'),lang:lang,page:location.href,time:new Date().toISOString()};
 var btn=$('.btn-send',form),ep=form.dataset.endpoint;btn.disabled=true;
 function done(){btn.disabled=false;form.reset();sv2.textContent=ru0;sv2.classList.add('ph');modalOpen();window.confetti&&window.confetti()}
 if(!ep){console.warn('[form] data-endpoint не задан — демо-режим, заявка НЕ отправлена:',payload);setTimeout(done,400);return}
 fetch(ep,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)})
  .then(function(r){if(!r.ok)throw new Error(r.status);done()})
  .catch(function(err){console.error('[form]',err);btn.disabled=false;ferr.classList.add('show')})});
$$('input',form).forEach(function(i){i.addEventListener('input',function(){bad(i,false)})});

/* ---------- cookies ---------- */
var ck=$('#cookie');if(!store.get('cookies'))setTimeout(function(){ck.classList.add('show')},1200);
function ckSet(v){store.set('cookies',v);ck.classList.remove('show');document.dispatchEvent(new CustomEvent('cookies:'+v))}
$('#ck-yes').addEventListener('click',function(){ckSet('accepted')});$('#ck-no').addEventListener('click',function(){ckSet('refused')});
/* Подключайте счётчики (Метрика/GA) только после: document.addEventListener('cookies:accepted',...) */

$$('img').forEach(function(i){function hide(){i.style.opacity=0;var f=i.closest('.fo-photo');if(f)f.parentNode.classList.add('no-photo')}if(i.complete&&!i.naturalWidth)hide();i.addEventListener('error',hide)});
$('#year').textContent=new Date().getFullYear();
/* прогресс прокрутки */
var prog=$('#prog');function onScroll(){var m=document.documentElement.scrollHeight-innerHeight;prog.style.transform='scaleX('+(m>0?scrollY/m:0)+')'}
addEventListener('scroll',onScroll,{passive:true});onScroll();
if(fine&&!calm){
 /* мягкая подсветка за курсором */
 var sp=document.createElement('div');sp.className='spot';document.body.appendChild(sp);var tx=0,ty=0,cx=0,cy=0;
 addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;sp.classList.add('on')});document.addEventListener('mouseleave',function(){sp.classList.remove('on')});
 (function loop(){cx+=(tx-cx)*.12;cy+=(ty-cy)*.12;sp.style.transform='translate('+cx+'px,'+cy+'px)';requestAnimationFrame(loop)})();
 /* параллакс фонового фото в hero */
 var hi=$('.heroimg'),hx=0,hy=0,hcx=0,hcy=0;
 if(hi){addEventListener('mousemove',function(e){hx=(e.clientX/innerWidth-.5)*-44;hy=(e.clientY/innerHeight-.5)*-32});
  (function hl(){if(scrollY<innerHeight*1.3){hcx+=(hx-hcx)*.07;hcy+=(hy-hcy)*.07;hi.style.setProperty('--px',hcx.toFixed(2)+'px');hi.style.setProperty('--py',hcy.toFixed(2)+'px')}requestAnimationFrame(hl)})()}
 /* магнитные кнопки */
 $$('.btn-lg,.btn-send,.nav .btn').forEach(function(b){b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.28)+'px)'});b.addEventListener('mouseleave',function(){b.style.transform=''})});
 /* 3D-наклон карточек портфолио */
 $$('.pc').forEach(function(c){c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(900px) rotateY('+(x*8)+'deg) rotateX('+(-y*8)+'deg) scale(1.02)'});c.addEventListener('mouseleave',function(){c.style.transform=''})})}
/* конфетти после успешной заявки */
window.confetti=function(){if(calm)return;var cv=document.createElement('canvas');cv.className='confetti';cv.width=innerWidth;cv.height=innerHeight;document.body.appendChild(cv);var g=cv.getContext('2d'),col=['#ffda66','#fff','#ffda66','#ff5e8a','#5b3df5'],P=[];
 for(var i=0;i<120;i++)P.push({x:innerWidth/2,y:innerHeight*.45,vx:(Math.random()-.5)*16,vy:-Math.random()*14-4,s:4+Math.random()*6,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:col[i%5]});
 var t=0;(function f(){g.clearRect(0,0,cv.width,cv.height);P.forEach(function(p){p.vy+=.35;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);g.restore()});
  if(++t<130)requestAnimationFrame(f);else cv.remove()})()};
/* hero: подгонка слов STUDIO / MAXIMUM / DESIGN под ширину экрана (любой шрифт, без переноса букв) */
var big=$('.big');
function fitBig(){if(!big)return;big.style.fontSize='';var w=0,reserve=matchMedia('(max-width:1100px)').matches?0:150;
 $$('.big>span').forEach(function(s){w=Math.max(w,s.getBoundingClientRect().width+(s.classList.contains('a')?0:reserve))});
 var av=big.clientWidth;if(w>av){big.style.fontSize=(parseFloat(getComputedStyle(big).fontSize)*av/w*.97).toFixed(1)+'px'}}
fitBig();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitBig);
var ft;addEventListener('resize',function(){clearTimeout(ft);ft=setTimeout(fitBig,120)});addEventListener('load',fitBig);
window.__mx=1;
})();
