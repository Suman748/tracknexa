// SKS TrackNexa: pages, sign in/sign up, dashboard and live map
(function(){
var NS='http://www.w3.org/2000/svg',$=function(s){return document.querySelector(s)};
var mem={};function ld(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}}function sv(k,v){try{localStorage.setItem(k,v)}catch(e){mem[k]=v}}function rm(k){try{localStorage.removeItem(k)}catch(e){delete mem[k]}}
function users(){try{return JSON.parse(ld('tn_users'))||{}}catch(e){return {}}}
function hash(s){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')})}
function me(){var e=ld('tn_session'),u=users();return e&&u[e]?{e:e,n:u[e].n}:null}
function say(f,t,ok){var m=f.querySelector('.msg');m.className='msg'+(ok?' ok':'');m.textContent=t}
function go(h){location.hash=h}
/* auth */
$('#fu').onsubmit=function(ev){ev.preventDefault();var f=ev.target,e=f.e.value.trim().toLowerCase(),u=users();
 if(f.p.value.length<8)return say(f,'Use at least 8 characters for your password.');
 if(u[e])return say(f,'That email already has an account. Sign in instead.');
 hash(f.p.value).then(function(h){u[e]={n:f.n.value.trim(),h:h};sv('tn_users',JSON.stringify(u));sv('tn_session',e);f.reset();go('dashboard')})};
$('#fi').onsubmit=function(ev){ev.preventDefault();var f=ev.target,e=f.e.value.trim().toLowerCase(),u=users();
 hash(f.p.value).then(function(h){if(!u[e]||u[e].h!==h)return say(f,'Email or password is incorrect.');sv('tn_session',e);f.reset();go('dashboard')})};
$('#ff').onsubmit=function(ev){ev.preventDefault();var f=ev.target,e=f.e.value.trim().toLowerCase(),u=users();
 if(!u[e])return say(f,'No account found for that email.');
 if(f.p.value.length<8)return say(f,'Use at least 8 characters for your password.');
 hash(f.p.value).then(function(h){u[e].h=h;sv('tn_users',JSON.stringify(u));say(f,'Password updated. You can sign in now.',1);f.reset()})};
/* demo access */
document.addEventListener('click',function(ev){var b=ev.target.closest('[data-demo]');if(!b)return;ev.preventDefault();
 hash('demo-account-only').then(function(p){var u=users();u['demo@tracknexa.com']={n:'Demo User',h:p};sv('tn_users',JSON.stringify(u));sv('tn_session','demo@tracknexa.com');go('dashboard')})});
/* data */
var C={Chennai:[366,47],Vellore:[264,61],Salem:[175,175],Coimbatore:[68,233],Erode:[137,203],Trichy:[225,252],Thanjavur:[265,253],Madurai:[173,330],Rameswaram:[280,387],Tirunelveli:[135,439],Kanyakumari:[122,490]};
var OUT='369,9 366,47 340,110 323,150 327,255 330,297 290,360 279,388 237,380 176,431 124,497 97,477 88,423 97,360 88,297 70,277 35,243 18,203 27,155 125,98 141,70 205,62 253,26 306,35';
var V=[{n:'Van 12',d:'Arun K.',r:['Chennai','Vellore','Salem','Coimbatore'],sp:48},{n:'Truck 07',d:'Meena R.',r:['Chennai','Thanjavur','Madurai','Tirunelveli'],sp:31,late:1},{n:'Van 03',d:'Karthik S.',r:['Coimbatore','Erode','Salem','Trichy'],sp:55},{n:'Bus 21',d:'Divya P.',r:['Madurai','Rameswaram'],sp:44}];
var sel=0,km=0;
function el(t,a,p){var x=document.createElementNS(NS,t);for(var k in a)x.setAttribute(k,a[k]);if(p)p.appendChild(x);return x}
function build(svg,interactive){
 el('polygon',{points:OUT,class:'land'},svg);
 for(var c in C){el('circle',{cx:C[c][0],cy:C[c][1],r:3,class:'cn'},svg);var t=el('text',{x:C[c][0]+6,y:C[c][1]+4,class:'cl'},svg);t.textContent=c}
 var m=el('text',{x:300,y:470,class:'cl'},svg);m.textContent='Bay of Bengal';m.style.opacity=.6
 V.forEach(function(v,i){var pts=v.r.map(function(c){return C[c].join(',')}).join(' ');
  if(!v.path){v.path=document.createElementNS(NS,'path');v.path.setAttribute('d','M'+pts.replace(/ /g,' L'));v.len=v.path.getTotalLength();v.t=(i*.23)%1;v.dir=1}
  el('path',{d:v.path.getAttribute('d'),class:'rt'},svg);
  var g=el('g',{class:'sg'+(v.late?' late':''),tabindex:interactive?0:-1,role:'button','aria-label':v.n},svg);el('circle',{r:16,class:'p'},g);el('circle',{r:8,class:'c'},g);
  g.onclick=function(){pick(i)};g.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(i)}};
  (v.gs=v.gs||[]).push(g)})}
build($('#hmap'),false);build($('#lmap'),true);
function place(){V.forEach(function(v,i){var p=v.path.getPointAtLength(v.t*v.len);v.gs.forEach(function(g){g.setAttribute('transform','translate('+p.x+' '+p.y+')');g.classList.toggle('sel',i===sel)})})}
function pick(i){sel=i;side();place()}
function side(){var s=$('#side'),h='';V.forEach(function(v,i){h+='<button class="vb'+(i===sel?' sel':'')+'" data-i="'+i+'"><span><b>'+v.n+'</b><br><small>'+v.r[0]+' to '+v.r[v.r.length-1]+'</small></span><span class="tag'+(v.late?' late':'')+'">'+(v.late?'Delayed':'On route')+'</span></button>'});
 h+='<div class="det" id="det"></div>';s.innerHTML=h;s.querySelectorAll('.vb').forEach(function(b){b.onclick=function(){pick(+b.dataset.i)}});det()}
function det(){var v=V[sel],d=$('#det');if(!d)return;var rem=(v.dir>0?1-v.t:v.t)*v.len*1.23,eta=Math.round(rem/v.sp*60);
 d.innerHTML='<b>'+v.n+'</b> driven by '+v.d+'<br>Speed: <b>'+v.sp+' km/h</b><br>Remaining: <b>'+Math.round(rem)+' km</b><br>ETA: <b>'+eta+' min</b>'}
function table(){$('#tb').innerHTML=V.map(function(v){return '<tr><td><b>'+v.n+'</b></td><td>'+v.d+'</td><td>'+v.r[0]+' to '+v.r[v.r.length-1]+'</td><td>'+v.sp+' km/h</td><td><span class="tag'+(v.late?' late':'')+'">'+(v.late?'Delayed':'On route')+'</span></td></tr>'}).join('');
 $('#s3').textContent=Math.round(km);$('#s4').textContent=Math.round(V.reduce(function(a,v){return a+v.sp},0)/V.length)}
(function chart(){var d=[['Mon',12],['Tue',15],['Wed',11],['Thu',18],['Fri',16],['Sat',9],['Sun',5]],s=$('#ch');d.forEach(function(x,i){var h=x[1]*8,xx=14+i*40;el('rect',{x:xx,y:150-h,width:26,height:h,rx:3,fill:'var(--ac)'},s);var t=el('text',{x:xx+13,y:168,'text-anchor':'middle',fill:'var(--mu)','font-size':11},s);t.textContent=x[0];var n=el('text',{x:xx+13,y:144-h,'text-anchor':'middle',fill:'var(--ink)','font-size':11},s);n.textContent=x[1]})})();
/* sim */
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,last=performance.now(),acc=0;
function tick(now){var dt=(now-last)/1000;last=now;acc+=dt;
 V.forEach(function(v){v.t+=v.dir*(v.sp*.012*dt)/(v.len/100);if(v.t>=1){v.t=1;v.dir=-1}if(v.t<=0){v.t=0;v.dir=1}km+=v.sp*dt/3600*60});
 place();if(acc>1){acc=0;det();if($('[data-v=dashboard]').classList.contains('show'))table()}
 if(!reduce)requestAnimationFrame(tick)}
place();requestAnimationFrame(tick);
/* routing */
function route(){var h=location.hash.slice(1)||'home',u=me();
 if((h==='dashboard'||h==='live')&&!u){return go('signin')}
 if((h==='signin'||h==='signup'||h==='forgot')&&u){return go('dashboard')}
 if(!document.querySelector('[data-v='+h+']'))h='home';
 document.querySelectorAll('.v').forEach(function(x){x.classList.toggle('show',x.dataset.v===h)});
 var n='<a href="#home" class="'+(h==='home'?'on':'')+'">Home</a>';
 if(u){n+='<a href="#dashboard" class="'+(h==='dashboard'?'on':'')+'">Dashboard</a><a href="#live" class="'+(h==='live'?'on':'')+'">Live map</a><a href="#home" id="out" class="btn alt">Sign out</a>';$('#hi').textContent='Signed in as '+u.n}
 else n+='<a href="#signin">Sign in</a><a href="#signup" class="btn">Sign up</a>';
 $('#nav').innerHTML=n;var o=$('#out');if(o)o.onclick=function(ev){ev.preventDefault();rm('tn_session');if(location.hash==='#home')route();else go('home')};
 document.title='SKS TrackNexa – '+h.charAt(0).toUpperCase()+h.slice(1);
 if(h==='dashboard')table();if(h==='live')side();window.scrollTo(0,0)}
addEventListener('hashchange',route);route();
})();
