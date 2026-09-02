
(function(){
  const root=document.documentElement, body=document.body;
  const panel=document.getElementById('a11y-panel'), overlay=document.getElementById('a11y-overlay'),
        trigger=document.getElementById('a11y-trigger'), closeBtn=document.getElementById('a11y-close');
  const defaults={font:16,contrast:false,dark:false,links:false,readable:false,spacing:false,motion:false};
  let prefs={...defaults};
  try{prefs={...defaults,...JSON.parse(localStorage.getItem('rightsA11y')||'{}')}}catch(e){}
  function apply(){
    root.style.setProperty('--base-font-size',prefs.font+'px');
    body.classList.toggle('a11y-contrast',!!prefs.contrast);
    body.classList.toggle('a11y-dark',!!prefs.dark&&!prefs.contrast);
    body.classList.toggle('a11y-links',!!prefs.links);
    body.classList.toggle('a11y-readable',!!prefs.readable);
    body.classList.toggle('a11y-spacing',!!prefs.spacing);
    body.classList.toggle('a11y-no-motion',!!prefs.motion);
    document.querySelectorAll('[data-a11y-toggle]').forEach(b=>b.setAttribute('aria-pressed',prefs[b.dataset.a11yToggle]?'true':'false'));
    localStorage.setItem('rightsA11y',JSON.stringify(prefs));
  }
  function openPanel(){panel?.classList.add('open');overlay?.classList.add('open');panel?.setAttribute('aria-hidden','false');trigger?.setAttribute('aria-expanded','true');closeBtn?.focus()}
  function closePanel(){panel?.classList.remove('open');overlay?.classList.remove('open');panel?.setAttribute('aria-hidden','true');trigger?.setAttribute('aria-expanded','false');trigger?.focus()}
  trigger?.addEventListener('click',openPanel);closeBtn?.addEventListener('click',closePanel);overlay?.addEventListener('click',closePanel);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel?.classList.contains('open'))closePanel()});
  document.getElementById('font-plus')?.addEventListener('click',()=>{prefs.font=Math.min(22,prefs.font+1);apply()});
  document.getElementById('font-minus')?.addEventListener('click',()=>{prefs.font=Math.max(14,prefs.font-1);apply()});
  document.querySelectorAll('[data-a11y-toggle]').forEach(btn=>btn.addEventListener('click',()=>{const k=btn.dataset.a11yToggle;prefs[k]=!prefs[k];if(k==='contrast'&&prefs.contrast)prefs.dark=false;if(k==='dark'&&prefs.dark)prefs.contrast=false;apply()}));
  document.getElementById('a11y-reset')?.addEventListener('click',()=>{prefs={...defaults};apply()});
  apply();
})();
function showResult(){
  const age=document.getElementById('age')?.value||'',child=document.getElementById('child')?.value||'',help=document.getElementById('help')?.value||'',work=document.getElementById('work')?.value||'',study=document.getElementById('study')?.value||'';
  let items=[];if(child==="כן"||age==="17–18"||age==="18 ומעלה")items.push('<a href="disability.html">נכות כללית – בדיקת מעבר וזכאות</a>');
  if(help==="כן"||help==="לא בטוח/ה")items.push('<a href="special-services.html">שירותים מיוחדים – בדיקת תלות או השגחה</a>');
  if(study==="כן"||study==="לא בטוח/ה")items.push('<a href="vocational-rehab.html">שיקום מקצועי – לימודים והשתלבות בעבודה</a>');
  if(work||age==="17–18"||age==="18 ומעלה")items.push('<a href="insurance.html">דמי ביטוח – מעמד, חיוב ופטורים</a>');
  if(!items.length)items.push('כדאי להשלים את השאלות כדי לקבל כיוון ראשוני.');
  const r=document.getElementById('result');if(r){r.style.display='block';r.innerHTML="<b>לפי מה שסימנת, כדאי לבדוק:</b><br>• "+items.join("<br>• ")}
}



(function(){
  function normalizeSearchText(s){
    return (s||"").toLowerCase()
      .replace(/[\u05B0-\u05BD\u05BF-\u05C7]/g,"")
      .replace(/[״"'׳’`]/g,"")
      .replace(/[־–—-]/g," ")
      .replace(/\s+/g," ").trim();
  }
  function esc(s){return (s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function makeSnippet(text,tokens){
    const raw=(text||"").replace(/\s+/g," ").trim();
    const n=normalizeSearchText(raw);
    let pos=-1;
    for(const t of tokens){const p=n.indexOf(t);if(p>=0&&(pos<0||p<pos))pos=p;}
    if(pos<0)pos=0;
    const start=Math.max(0,pos-60),end=Math.min(raw.length,pos+210);
    return (start?"…":"")+raw.slice(start,end)+(end<raw.length?"…":"");
  }
  const modal=document.getElementById('search-modal'),overlay=document.getElementById('search-overlay'),
        input=document.getElementById('site-search-input'),results=document.getElementById('search-results'),
        count=document.getElementById('search-count'),closeBtn=document.getElementById('search-close');
  const triggers=document.querySelectorAll('[data-search-trigger]');
  function openSearch(){modal?.classList.add('open');overlay?.classList.add('open');modal?.setAttribute('aria-hidden','false');setTimeout(()=>input?.focus(),30);render(input?.value||"");}
  function closeSearch(){modal?.classList.remove('open');overlay?.classList.remove('open');modal?.setAttribute('aria-hidden','true');}
  function render(q){
    if(!results||!count)return;
    const nq=normalizeSearchText(q),tokens=nq.split(" ").filter(Boolean);
    if(!tokens.length){results.innerHTML='<div class="search-empty">כתבו מילה או ביטוי. לדוגמה: שר״ם, עצמאי, גיוס, אי־כושר.</div>';count.textContent='';return;}
    let found=[];
    for(const item of (window.SITE_SEARCH_INDEX||[])){
      const titleN=normalizeSearchText(item.title),pageN=normalizeSearchText(item.page),textN=normalizeSearchText(item.text);
      let score=0,ok=true;
      for(const t of tokens){
        const inTitle=titleN.includes(t),inPage=pageN.includes(t),hits=(textN.split(t).length-1);
        if(!inTitle&&!inPage&&!hits){ok=false;break;}
        if(inTitle)score+=15;if(inPage)score+=6;score+=Math.min(hits,8);
      }
      if(ok)found.push({...item,score});
    }
    found.sort((a,b)=>b.score-a.score);
    count.textContent=found.length?`נמצאו ${found.length} תוצאות מדויקות`:'';
    if(!found.length){results.innerHTML='<div class="search-empty">לא נמצאו תוצאות. נסו מילה קצרה יותר.</div>';return;}
    results.innerHTML=found.slice(0,12).map(item=>`
      <a class="search-result" href="${item.url}">
        <b>${esc(item.title)}</b>
        <small class="search-page">${esc(item.page)}</small>
        <span>${esc(makeSnippet(item.text,tokens))}</span>
      </a>`).join("");
  }
  triggers.forEach(b=>b.addEventListener('click',openSearch));
  closeBtn?.addEventListener('click',closeSearch);overlay?.addEventListener('click',closeSearch);
  input?.addEventListener('input',e=>render(e.target.value));
  input?.addEventListener('keydown',e=>{if(e.key==='Enter'){const first=results?.querySelector('a.search-result');if(first){e.preventDefault();first.click();}}});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}if(e.key==='Escape'&&modal?.classList.contains('open'))closeSearch();});
})();
