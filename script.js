(function(){
  const focusableSelector='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function trapFocus(container,e){
    if(e.key!=='Tab'||!container)return;
    const items=[...container.querySelectorAll(focusableSelector)].filter(el=>el.offsetParent!==null);
    if(!items.length)return;
    const first=items[0],last=items[items.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }

  const root=document.documentElement,body=document.body;
  const panel=document.getElementById('a11y-panel'),overlay=document.getElementById('a11y-overlay'),trigger=document.getElementById('a11y-trigger'),closeBtn=document.getElementById('a11y-close');
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
    try{localStorage.setItem('rightsA11y',JSON.stringify(prefs))}catch(e){}
  }
  function openPanel(){if(!panel)return;panel.classList.add('open');overlay?.classList.add('open');panel.setAttribute('aria-hidden','false');trigger?.setAttribute('aria-expanded','true');closeBtn?.focus();}
  function closePanel(){if(!panel)return;panel.classList.remove('open');overlay?.classList.remove('open');panel.setAttribute('aria-hidden','true');trigger?.setAttribute('aria-expanded','false');trigger?.focus();}
  trigger?.addEventListener('click',openPanel);closeBtn?.addEventListener('click',closePanel);overlay?.addEventListener('click',closePanel);
  document.addEventListener('keydown',e=>{if(panel?.classList.contains('open')){if(e.key==='Escape')closePanel();else trapFocus(panel,e);}});
  document.getElementById('font-plus')?.addEventListener('click',()=>{prefs.font=Math.min(22,prefs.font+1);apply()});
  document.getElementById('font-minus')?.addEventListener('click',()=>{prefs.font=Math.max(14,prefs.font-1);apply()});
  document.querySelectorAll('[data-a11y-toggle]').forEach(btn=>btn.addEventListener('click',()=>{const k=btn.dataset.a11yToggle;prefs[k]=!prefs[k];if(k==='contrast'&&prefs.contrast)prefs.dark=false;if(k==='dark'&&prefs.dark)prefs.contrast=false;apply()}));
  document.getElementById('a11y-reset')?.addEventListener('click',()=>{prefs={...defaults};apply()});
  apply();

  window.showResult=function(){
    const age=document.getElementById('age')?.value||'',child=document.getElementById('child')?.value||'',help=document.getElementById('help')?.value||'',work=document.getElementById('work')?.value||'',study=document.getElementById('study')?.value||'';
    const items=[];
    if(child==='כן'||age==='17–18'||age==='18 ומעלה')items.push('<a href="disability.html">נכות כללית – בדיקת מעבר וזכאות</a>');
    if(help==='כן'||help==='לא בטוח/ה')items.push('<a href="special-services.html">שירותים מיוחדים – בדיקת תלות או השגחה</a>');
    if(study==='כן'||study==='לא בטוח/ה')items.push('<a href="vocational-rehab.html">שיקום מקצועי – לימודים והשתלבות בעבודה</a>');
    if(work||age==='17–18'||age==='18 ומעלה')items.push('<a href="insurance.html">דמי ביטוח – מעמד, חיוב ופטורים</a>');
    if(!items.length)items.push('כדאי להשלים את השאלות כדי לקבל כיוון ראשוני.');
    const r=document.getElementById('result');if(r){r.style.display='block';r.innerHTML='<b>לפי מה שסימנת, כדאי לבדוק:</b><br>• '+items.join('<br>• ');}
  };

  function normalizeSearchText(s){return(s||'').toLowerCase().replace(/[\u05B0-\u05BD\u05BF-\u05C7]/g,'').replace(/[״"'׳’`]/g,'').replace(/[־–—-]/g,' ').replace(/\s+/g,' ').trim();}
  function esc(s){return(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function makeSnippet(text,tokens){const raw=(text||'').replace(/\s+/g,' ').trim(),n=normalizeSearchText(raw);let pos=-1;for(const t of tokens){const p=n.indexOf(t);if(p>=0&&(pos<0||p<pos))pos=p;}if(pos<0)pos=0;const start=Math.max(0,pos-60),end=Math.min(raw.length,pos+210);return(start?'…':'')+raw.slice(start,end)+(end<raw.length?'…':'');}
  const modal=document.getElementById('search-modal'),searchOverlay=document.getElementById('search-overlay'),input=document.getElementById('site-search-input'),results=document.getElementById('search-results'),count=document.getElementById('search-count'),searchClose=document.getElementById('search-close');
  let lastSearchTrigger=null;
  function render(q){
    if(!results||!count)return;const nq=normalizeSearchText(q),tokens=nq.split(' ').filter(Boolean);
    if(!tokens.length){results.innerHTML='<div class="search-empty">כתבו מילה או ביטוי. לדוגמה: שר״ם, עצמאי, גיוס, אי־כושר.</div>';count.textContent='';return;}
    const found=[];for(const item of(window.SITE_SEARCH_INDEX||[])){const titleN=normalizeSearchText(item.title),pageN=normalizeSearchText(item.page),textN=normalizeSearchText(item.text);let score=0,ok=true;for(const t of tokens){const inTitle=titleN.includes(t),inPage=pageN.includes(t),hits=textN.split(t).length-1;if(!inTitle&&!inPage&&!hits){ok=false;break;}if(inTitle)score+=15;if(inPage)score+=6;score+=Math.min(hits,8);}if(ok)found.push({...item,score});}
    found.sort((a,b)=>b.score-a.score);count.textContent=found.length?`נמצאו ${found.length} תוצאות מדויקות`:'';
    if(!found.length){results.innerHTML='<div class="search-empty">לא נמצאו תוצאות. נסו מילה קצרה יותר.</div>';return;}
    results.innerHTML=found.slice(0,12).map(item=>`<a class="search-result" href="${item.url}"><b>${esc(item.title)}</b><small class="search-page">${esc(item.page)}</small><span>${esc(makeSnippet(item.text,tokens))}</span></a>`).join('');
  }
  function openSearch(e){if(!modal)return;lastSearchTrigger=e?.currentTarget||document.activeElement;modal.classList.add('open');searchOverlay?.classList.add('open');modal.setAttribute('aria-hidden','false');setTimeout(()=>input?.focus(),30);render(input?.value||'');}
  function closeSearch(){if(!modal)return;modal.classList.remove('open');searchOverlay?.classList.remove('open');modal.setAttribute('aria-hidden','true');if(lastSearchTrigger?.focus)lastSearchTrigger.focus();}
  document.querySelectorAll('[data-search-trigger]').forEach(b=>b.addEventListener('click',openSearch));searchClose?.addEventListener('click',closeSearch);searchOverlay?.addEventListener('click',closeSearch);input?.addEventListener('input',e=>render(e.target.value));input?.addEventListener('keydown',e=>{if(e.key==='Enter'){const first=results?.querySelector('a.search-result');if(first){e.preventDefault();first.click();}}});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch(e);}if(modal?.classList.contains('open')){if(e.key==='Escape')closeSearch();else trapFocus(modal,e);}});

  const menuTrigger=document.querySelector('[data-mobile-menu-trigger]'),menu=document.getElementById('mobile-menu');
  function closeMenu(){if(!menu||!menuTrigger)return;menu.classList.remove('open');menu.setAttribute('aria-hidden','true');menuTrigger.setAttribute('aria-expanded','false');}
  menuTrigger?.addEventListener('click',()=>{if(!menu)return;const open=menu.classList.toggle('open');menu.setAttribute('aria-hidden',open?'false':'true');menuTrigger.setAttribute('aria-expanded',open?'true':'false');});
  document.querySelector('[data-mobile-search]')?.addEventListener('click',function(){closeMenu();document.querySelector('[data-search-trigger]')?.click();});
  document.addEventListener('click',e=>{if(menu?.classList.contains('open')&&!menu.contains(e.target)&&!menuTrigger?.contains(e.target))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
})();