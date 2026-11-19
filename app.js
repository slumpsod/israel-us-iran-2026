// interactive shell for the 2026 Israel / America / Iran report
const S=window.SITE, $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const SRC={}; S.sources.forEach(s=>SRC[s[0]]={name:s[1],url:s[2],date:s[3]});
const body=document.body, pop=$('#pop');
let one=false, current=null, tags=new Set(), months=new Set(), q='', results=[];
const slug=t=>t.toLowerCase().replace(/[^a-z]+/g,'-');

/* ---- nav rail ---- */
const rail=$('nav');
S.sections.forEach((sec,i)=>{
  if(i===0||S.sections[i-1].part!==sec.part){const h=document.createElement('h2');h.textContent=sec.part;rail.appendChild(h);}
  const b=document.createElement('button');b.dataset.id=sec.id;b.textContent=sec.title.replace(/^\d+\.\s*/,'');
  b.onclick=()=>setOne(sec.id);
  b.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();setOne(sec.id);}};
  rail.appendChild(b);
});

/* ---- the document ---- */
const doc=$('#doc');
S.sections.forEach((sec,i)=>{
  const a=document.createElement('article');a.id='art-'+sec.id;a.dataset.id=sec.id;
  const head=document.createElement('div');head.className='head';
  const h=document.createElement('h2');h.textContent=sec.title;head.appendChild(h);
  const nv=document.createElement('div');nv.className='navi';
  const mk=txt=>{const x=document.createElement('button');x.textContent=txt;x.setAttribute('aria-label',txt+' '+sec.title);nv.appendChild(x);return x;};
  mk('share #').onclick=()=>copy(location.origin+location.pathname+'#'+sec.id+'  -  '+sec.title);
  mk('top').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
  if(i>0)mk('prev').onclick=()=>setOne(S.sections[i-1].id);
  if(i<S.sections.length-1)mk('next').onclick=()=>setOne(S.sections[i+1].id);
  head.appendChild(nv);a.appendChild(head);
  const b=document.createElement('div');b.innerHTML=sec.html;a.appendChild(b);
  doc.appendChild(a);
});

/* ---- table scrollers (no horizontal page overflow on phones) ---- */
function wrapTables(root){for(const t of [...root.querySelectorAll('table')].filter(t=>!t.closest('.tw'))){const w=document.createElement('div');w.className='tw';t.parentNode.insertBefore(w,t);w.appendChild(t);}}
wrapTables(doc); wrapTables($('#foot')); wrapTables($('#dash'));

/* ---- source popovers ---- */
function openPop(code,anchor){
  const s=SRC[code]; if(!s)return;
  pop.innerHTML='<b>'+code+' - '+s.name+'</b><div style="color:var(--dim);margin:2px 0 6px">'+s.date+'</div>'+
    '<a href="'+s.url+'" target="_blank" rel="noopener" style="word-break:break-all">'+s.url+'</a>'+
    '<button class="btn" id="pclose" style="position:absolute;top:6px;right:8px" aria-label="close source">close</button>';
  pop.style.display='block';
  const r=anchor.getBoundingClientRect();
  pop.style.top=Math.min(window.innerHeight-150,r.bottom+8)+'px';
  pop.style.left=Math.max(8,Math.min(window.innerWidth-380,r.left-30))+'px';
  $('#pclose').onclick=()=>pop.style.display='none';
}
document.addEventListener('click',e=>{
  const t=e.target;
  if(t.classList&&t.classList.contains('cite')){openPop(t.textContent.trim(),t);}
  else if(!t.closest||!t.closest('#pop')){pop.style.display='none';}
});

/* ---- routing: deep links + one-section mode ---- */
function setOne(id){
  one=true;current=id;body.dataset.one='1';
  $$('#doc article').forEach(a=>a.classList.toggle('current',a.dataset.id===id));
  const el=$('#art-'+id); if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
  rail.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.id===id));
}
function setAll(){one=false;current=null;body.dataset.one='0';rail.querySelectorAll('button').forEach(b=>b.classList.remove('on'));}
window.addEventListener('hashchange',route);
function route(){const h=decodeURIComponent(location.hash.slice(1));
  if(!h||h==='all')setAll(); else if(S.sections.some(s=>s.id===h))setOne(h);}

/* ---- keyboard ---- */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){pop.style.display='none';return;}
  if(e.key==='/'){e.preventDefault();$('#q').focus();}
  if(e.key==='?'){e.preventDefault();help();}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    e.preventDefault();
    const ids=S.sections.map(x=>x.id);
    let i=current?ids.indexOf(current):0;
    i=Math.max(0,Math.min(ids.length-1,i+(e.key==='ArrowDown'?1:-1)));
    setOne(ids[i]);
  }
});
function help(){
  pop.innerHTML='<b>How this page works</b><div style="margin-top:6px">'+
   '<kbd>?</kbd> this help &middot; <kbd>/</kbd> search &middot; <kbd>Up</kbd>/<kbd>Down</kbd> jump sections &middot; <kbd>Esc</kbd> close cards<br>'+
   'Citation chips S1-S43 open the source card with its date and link. The four evidence chips dim everything except claims at that evidence level. '+
   '&quot;One section: on&quot; turns the address bar into a shareable deep link (#section-id). Print with the Print button, or append <code>?print=1</code> to the URL.</div>';
  pop.style.display='block';pop.style.top='84px';pop.style.left='14px';
}

/* ---- search ---- */
$('#q').addEventListener('input',e=>{q=e.target.value;runSearch();});
$('#q').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(results.length)setOne(results[0].id);}});
function runSearch(){
  const box=$('#results');box.innerHTML='';q=q.trim();results=[];
  if(q.length<2){box.style.display='none';return;}
  S.sections.forEach(sec=>{
    const low=sec.text.toLowerCase(); const t=q.toLowerCase(); let pos=low.indexOf(t),n=0;
    while(pos>=0&&n<2){const a=Math.max(0,pos-70);
      results.push({id:sec.id,title:sec.title,snip:(a?'... ':'')+sec.text.slice(a,pos+130)+'...'});
      pos=low.indexOf(t,pos+t.length);n++;}
  });
  results=results.slice(0,10);
  box.style.display='flex';
  if(!results.length){const b=document.createElement('button');b.textContent='no match for "'+q+'" - try: 47.1 / 445 / PLC / El-Sayed / 67 / memorandum / $35.7m';box.appendChild(b);}
  results.forEach(r=>{const b=document.createElement('button');
    b.innerHTML='<b>'+r.title+'</b><br><span style="color:var(--dim)">'+r.snip+'</span>';
    b.onclick=()=>{setOne(r.id);highlight(r.id,q);};box.appendChild(b);});
}
function highlight(id,term){
  const art=$('#art-'+id); if(!art)return;
  const w=document.createTreeWalker(art,NodeFilter.SHOW_TEXT); let node, targets=[];
  while(node=w.nextNode()) if(node.nodeValue.toLowerCase().includes(term.toLowerCase())) targets.push(node);
  targets.forEach(n=>{
    const frag=document.createDocumentFragment(); let s=n.nodeValue, low=s.toLowerCase(), t=term.toLowerCase(), last=0, i=low.indexOf(t);
    while(i>=0){frag.appendChild(document.createTextNode(s.slice(last,i)));
      const m=document.createElement('mark');m.textContent=s.slice(i,i+t.length);frag.appendChild(m);
      last=i+t.length;i=low.indexOf(t,last);}
    frag.appendChild(document.createTextNode(s.slice(last)));
    n.parentNode.replaceChild(frag,n);
  });
}

/* ---- evidence-tag filter ---- */
$$('.tools .chip').forEach(c=>c.onclick=()=>{
  const t=c.dataset.t; if(tags.has(t))tags.delete(t); else tags.add(t);
  c.dataset.on=tags.has(t)?'1':'0'; applyTags();
});
function applyTags(){
  $$('.tag').forEach(t=>{
    const key=t.dataset.tag||'';
    const hit=[...tags].some(x=>key.toLowerCase().startsWith(slug(x)));
    t.classList.toggle('hl',hit); t.classList.toggle('dim',!hit);
  });
}
$('#mode').onclick=()=>{ if(one){setAll();$('#mode').textContent='One section: off';} else {setOne(current||'1-the-one-page-answer');$('#mode').textContent='One section: on';} };

/* ---- sharing ---- */
function pageUrl(){return location.origin+location.pathname+(one&&current?'#'+current:'');}
function copy(text){
  const done=()=>{pop.innerHTML='<b>Share</b><div style="margin-top:4px">'+text.replace(/[<>&]/g,'').slice(0,160)+'</div>';
    pop.style.display='block';pop.style.top='80px';pop.style.left='14px';};
  try{navigator.clipboard.writeText(text).then(done,()=>fallback(text,done));}catch(err){fallback(text,done);}
}
function fallback(text,done){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();
  try{document.execCommand('copy');done();}catch(e2){done();}}
$('#copylink').onclick=()=>copy(pageUrl());
$('#copycite').onclick=()=>copy('"Israel, America, Iran - the 2026 elections, war, economy, cyber" (written 18 Nov 2026, 43 dated sources), section: '+(current||'all')+'. Retrieved 18 Nov 2026: '+pageUrl());
$('#sharex').onclick=()=>window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent('Israel, America, Iran 2026: the elections, the war on Iran, who profits, how to prepare - 43 dated sources, filterable by evidence')+'&url='+encodeURIComponent(pageUrl()),'_blank','noopener');
$('#shareb').onclick=()=>window.open('https://bsky.app/intent/compose?text='+encodeURIComponent('Sourced, filterable explainer of the 2026 Israel and US elections, the war on Iran, its economy and cyber dimensions '+pageUrl()),'_blank','noopener');
$('#sharet').onclick=()=>window.open('https://wa.me/?text='+encodeURIComponent('Sourced explainer: 2026 Israel + US elections, war on Iran, economy, cyber '+pageUrl()),'_blank','noopener');
$('#print').onclick=()=>window.print();

/* ---- dashboard ---- */
const sc=$('#score');
[[S.us.house.D+'/435','House of Representatives','first Democratic control since 2020; largest Democratic majority since 1990; 40+ flips; 56% vs 42% of the two-party vote'],
 [S.us.senate.D+' / '+S.us.senate.R,'Senate','Democratic Caucus 56 - largest since 2008; 22 of 35 contested seats won; '+S.us.senate.flips.length+' seats left Republican hands'],
 [S.us.governors.flipped+' flipped','Governorships','a Democratic majority of governorships for the first time since 2010 (39 statewide races contested)'],
 ['53 of 120','The incumbent Knesset bloc','8 short of the 61 needed for a majority; Likud alone holds 27, the largest list'],
 ['$47.1bn','US war cost, Pentagon','through 16 Oct 2026 - plus $5-15bn of base damage excluded; CBO: at least $38bn and about $3bn a month more'],
 ['~65%','Strait of Hormuz','commercial shipping still ~65% below pre-war with 136 maritime security incidents logged as of 17 Nov 2026']]
 .forEach(x=>{const c=document.createElement('div');c.style.cssText='padding:8px 0;border-top:1px solid var(--line)';
   c.innerHTML='<div style="font-size:24px;font-weight:700;color:var(--accent)">'+x[0]+'</div><b>'+x[1]+'</b><div style="color:var(--dim);font-size:13.5px">'+x[2]+'</div>';
   sc.appendChild(c);});

const kEl=$('#knesset'), max=Math.max(...S.knesset.map(x=>x[3]));
kEl.innerHTML='<h3 style="margin:16px 0 6px">The 26th Knesset - 120 seats, 61 for a majority, turnout 77.98% (+7.35pp)</h3>';
S.knesset.forEach(p=>{const row=document.createElement('div');row.className='bar';
  const delta=p[4]===null?'new':(p[4]>0?'<span class="up">+'+p[4]+'</span>':(p[4]<0?'<span class="down">'+p[4]+'</span>':'0'));
  row.innerHTML='<b title="click for the seat math">'+p[0]+'</b><i style="width:'+(p[3]/max*100).toFixed(1)+'%"></i><s>'+delta+'</s>';
  row.onclick=()=>{pop.innerHTML='<b>'+p[0]+' - '+(p[1]||'')+'</b><div>'+p[2].toFixed(2)+'% of the vote - '+p[3]+' seats '+(p[4]===null?'(new list)':(p[4]>0?'(+'+p[4]+')':'('+p[4]+')'))+'</div><div style="margin-top:6px">'+p[5]+'</div><div style="margin-top:6px;color:var(--dim)">S2 (Wikipedia, 2026 Israeli legislative election, retrieved 18 Nov 2026), with S5 (BBC partial results) for corroboration</div>';
    pop.style.display='block';pop.style.top='45%';pop.style.right='16px';pop.style.left='auto';};
  kEl.appendChild(row);});
const fl=$('#flip');
fl.innerHTML='<h3 style="margin:16px 0 6px">The seats that left Republican hands</h3><div style="display:flex;gap:6px;flex-wrap:wrap">'+
  S.us.senate.flips.map(s=>'<span class="cite" title="'+(S.us.names[s]||'')+'">'+s+'</span>').join('')+'</div>'+
  '<div style="color:var(--dim);font-size:13px;margin-top:8px">'+S.us.senate.note+'</div>';
const tl=$('#tl'), tf=$('#tfilter');
S.timeline.forEach(e=>{const d=document.createElement('div');d.dataset.t=e[0];
  d.innerHTML='<time>'+e[0]+'</time><p>'+e[1]+' <span class="cite">'+e[2]+'</span></p>';tl.appendChild(d);});
['2025','2026','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov'].forEach(m=>{const b=document.createElement('button');
  b.className='chip';b.dataset.m=m;b.textContent=m;b.style.fontSize='12px';
  b.onclick=()=>{months.has(m)?months.delete(m):months.add(m);b.dataset.on=months.has(m)?'1':'0';
    $$('.tl div').forEach(d=>{const show=months.size===0||[...months].some(x=>d.dataset.t.includes(x));d.classList.toggle('off',!show);});};
  tf.appendChild(b);});
const led=$('#led');
led.innerHTML='<div><h3 style="margin:0 0 6px">Who profits</h3><ul>'+S.ledger.profiting.map(r=>'<li><b>'+r[0]+'</b><span>'+r[1]+' <span class="cite">'+r[2]+'</span></span></li>').join('')+'</ul></div>'+
  '<div><h3 style="margin:0 0 6px">Who pays</h3><ul>'+S.ledger.paying.map(r=>'<li><b>'+r[0]+'</b><span>'+r[1]+' <span class="cite">'+r[2]+'</span></span></li>').join('')+'</ul></div>';
const pr=$('#prep');
pr.innerHTML='<h3 style="margin:0 0 8px">Preparation checklist - tick what you have done</h3>';
S.prepare.forEach((p,i)=>{const lab=document.createElement('label');
  lab.innerHTML='<input type="checkbox" id="ck'+i+'" aria-label="'+p[0]+'"><span><b>'+p[0]+'</b> <span style="color:var(--dim)">'+p[1]+' <span class="cite">'+p[2]+'</span></span></span>';
  pr.appendChild(lab);});

/* ---- footer ---- */
$('#foot').innerHTML='<h3 style="margin:0 0 6px">How this was built</h3>'+
 '<div style="color:var(--dim);font-size:13.5px;max-width:78ch">19 sections, '+S.sources.length+' sources, all read on 18 November 2026. The eleven Wikipedia items are living articles updated as these events run, so claims attributed to officials are labelled REPORTED, contested ones DISPUTED, and anything unconfirmed NOT FOUND. Nothing here is dated after 17 November 2026. The markdown original: <a href="israel_us_report.md">israel_us_report.md</a>.</div>'+
 '<details style="margin-top:10px"><summary style="cursor:pointer">all '+S.sources.length+' sources (code - name - URL - date)</summary>'+
 '<table><thead><tr><th>Code</th><th>Source</th><th>URL</th><th>Date / note</th></tr><tbody>'+
 S.sources.map(s=>'<tr><td>'+s[0]+'</td><td>'+s[1]+'</td><td><a href="'+s[2]+'" target="_blank" rel="noopener">'+s[2]+'</a></td><td>'+s[3]+'</td></tr>').join('')+
 '</tbody></table></details>'+
 '<div style="margin-top:10px;color:var(--nf);font-size:13.5px;max-width:78ch"><b>What these sources do not establish:</b> that the war was a false flag; that Likud\'s "stolen election" claim has evidence; that Iranian missiles reached Diego Garcia; a final US-Iran deal; the true severity of the Iranian cyber damage; or that either election will change either country\'s approach to the war.</div>';

route(); if(!location.hash&&one) setAll();
wrapTables($('#foot'));   // footer tables exist only after its innerHTML is set
