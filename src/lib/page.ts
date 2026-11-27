// Base CSS and page script shared by every template, verbatim from the hand-off render/common.ts
// (plus .sr-only for the hidden h1 fallback).

export const BASE_CSS = `*{box-sizing:border-box}body{margin:0}img{display:block;max-width:100%}
.site{container:site/inline-size}
.m-only{display:none!important}
@container site (max-width:720px){.d-only{display:none!important}.m-only{display:flex!important}}
.ph{position:relative;overflow:hidden}.ph>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ell{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
details.lang>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:4px}details.lang>summary::-webkit-details-marker{display:none}
.lang-menu{position:absolute;right:0;top:calc(100% + 6px);display:flex;flex-direction:column;min-width:72px;padding:6px;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.15);z-index:10}
.lang-menu a{padding:8px 10px;font-weight:600;text-decoration:none}
.wframe iframe{display:block;width:100%;border:0;min-height:600px}
.mapbox{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:24px}
.mapbox iframe{width:100%;height:100%;min-height:260px;border:0}
[data-day].is-today{font-weight:700}
a:focus-visible,button:focus-visible,summary:focus-visible{outline:2px solid currentColor;outline-offset:3px}
dialog::backdrop{background:rgba(0,0,0,.4)}`;

/** Page script: today's hours, click-to-load map, widget resize, mobile booking overlay. No cookies, no trackers. */
export const SITE_SCRIPT = `(function(){var d=document,t=d.getElementById('tr-hours');
if(t){var H=JSON.parse(t.dataset.hours),C=JSON.parse(t.dataset.closures),L=JSON.parse(t.dataset.labels),n=new Date(),day=(n.getDay()+6)%7,
iso=n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0'),r=C.indexOf(iso)>-1?[]:H[day]||[];
d.querySelectorAll('[data-today-text]').forEach(function(e){e.textContent=r.length?L.todayOpen+' · '+r.map(function(x){return x[0]+'–'+x[1]}).join(' '+L.and+' '):L.todayClosed});
d.querySelectorAll('[data-today-until]').forEach(function(e){e.textContent=r.length?L.openUntil+' '+r[r.length-1][1]:L.todayClosed});
d.querySelectorAll('[data-today-wrap]').forEach(function(e){e.hidden=false});
d.querySelectorAll('[data-day="'+day+'"]').forEach(function(e){e.classList.add('is-today')});}
d.querySelectorAll('[data-map]').forEach(function(b){b.addEventListener('click',function(){var f=d.createElement('iframe');f.src=b.dataset.map;f.title=b.dataset.title;var box=b.closest('.mapbox');box.innerHTML='';box.style.padding='0';box.appendChild(f)})});
addEventListener('message',function(e){if(e.origin!=='https://widget.tallores.com')return;var m=e.data;if(m&&m.type==='tallores:resize'&&m.height>0){d.querySelectorAll('iframe[data-widget]').forEach(function(f){f.style.height=m.height+'px';f.style.minHeight='0'})}});
var dl=d.getElementById('tr-book');if(dl&&dl.showModal){d.querySelectorAll('[data-open-book]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var f=dl.querySelector('iframe');if(!f.src)f.src=f.dataset.src;dl.showModal()})});
dl.querySelector('[data-close-book]').addEventListener('click',function(){dl.close()})}})();`;
