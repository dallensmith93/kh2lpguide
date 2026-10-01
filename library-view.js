'use strict';
function renderRoadmapGuide(e,status) {
  const list=(items,prefix)=>items.map((text,i)=>`<label class="objective route-objective"><input type="checkbox" data-objective="${prefix}${e.id}-${i}" ${state.objectives[`${prefix}${e.id}-${i}`]?'checked':''}><span><span class="step-number">${String(i+1).padStart(2,'0')}.</span>${escapeHTML(text)}</span></label>`).join('');
  return `<div class="detail-banner"><div class="detail-meta"><span>PART ${String(e.id).padStart(2,'0')} / ${EPISODES.length} · ${escapeHTML(e.arcOrAct)}</span><span class="status-pill status-${status}">${status.toUpperCase()}</span></div><h2>${escapeHTML(e.title)}</h2><div class="detail-location">⌖ ${escapeHTML(e.world)}</div></div>
  <div class="detail-content"><section class="timing-box"><div class="timing-values"><div><span>ESTIMATED VIDEO</span><strong>${editedTime(e)}</strong></div><div><span>RECORDING BUDGET</span><strong>${recordingTime(e)}${activeGame==='spiderman-ctns'?'+':''}</strong></div></div><p>${escapeHTML(e.runtimeNote)}</p></section>
  <section class="start-box"><span>START THE RECORDING HERE</span><p>${escapeHTML(e.start)}</p></section>
  <details class="guide-section" open><summary>STORY & RECORDING ROUTE<span class="section-count">${e.storyBeats.length} steps</span></summary>${list(e.storyBeats,'')}</details>
  <details class="guide-section" open><summary>ENCOUNTERS & ACTIVITIES<span class="section-count">${e.keyEncountersOrActivities.length} briefings</span></summary>${list(e.keyEncountersOrActivities,'activity-')}</details>
  <section class="stop-box"><h3>⚑ WRAP THE RECORDING HERE</h3><p>${escapeHTML(e.stop)}</p></section>
  <p class="guide-reference">Reference desk: ${GAMES[activeGame].sources.map(([label,url])=>`<a href="${url}" target="_blank" rel="noreferrer">${escapeHTML(label)} ↗</a>`).join(' · ')}</p>
  <label class="notes-label" for="episode-notes">PRODUCTION NOTES <span class="muted">/ saved for this game</span></label><textarea id="episode-notes" class="notes" maxlength="20000" placeholder="Timestamps, district counters, save slot, retry lessons…">${escapeHTML(state.notes[e.id]||'')}</textarea>
  <div class="detail-actions"><label class="status-control" for="episode-status">STATUS<select id="episode-status">${STATUSES.map(s=>`<option value="${s}" ${status===s?'selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}</select></label><button class="copy-button" id="copy-title">Copy YouTube title ↗</button></div></div>
  <div class="detail-footer"><button id="previous-episode" ${e.id===1?'disabled':''}>← Previous episode</button><span>${String(e.id).padStart(2,'0')} / ${EPISODES.length}</span><button id="next-episode" ${e.id===EPISODES.length?'disabled':''}>Next episode →</button></div>`;
}
let kingdomShell;
function renderGameShell() {
  const selectors=['.series-name','.edition','.hero .eyebrow','.game-title','.hero-subtitle','.hero-copy>p','.route-banner','#prep-view','#bosses-view .section-heading','.command-label','#roadmap-view .section-heading h2','#roadmap-view .section-heading .eyebrow'];
  if(!kingdomShell)kingdomShell=Object.fromEntries(selectors.map(s=>[s,$(s).innerHTML]));
  const game=GAMES[activeGame],kh=activeGame==='kh2fm';
  document.body.dataset.game=activeGame;
  document.querySelector('meta[name="theme-color"]').content=activeGame==='ff9'?'#172650':activeGame==='spiderman-ctns'?'#cf283b':'#10151e';
  document.querySelector('link[rel="icon"]').href=activeGame==='ff9'?'assets/gaia-crystal.svg':activeGame==='spiderman-ctns'?'assets/spider-emblem.svg':'assets/heart-crest.svg';
  document.title=`Wayfinder — ${game.name} Recording Journal`;
  $('#game-select').value=activeGame;
  if(kh)for(const s of selectors)$(s).innerHTML=kingdomShell[s];
  else {
    $('.series-name').textContent=activeGame==='ff9'?'Final Fantasy IX':'Spider-Man';
    $('.command-label').textContent=activeGame==='ff9'?'JOURNAL MENU':'MISSION CONTROL';
    $('#roadmap-view .section-heading h2').textContent=activeGame==='ff9'?'Chronicles of Gaia':'Mission dossier';
    $('#roadmap-view .section-heading .eyebrow').textContent=activeGame==='ff9'?'YOUR ADVENTURE, ONE CHAPTER AT A TIME':'CITYWIDE OPERATIONS / EPISODE INTEL';
    $('.edition').textContent=`${game.short} · ${EPISODES.length}-PART SERIES`;
    $('.hero .eyebrow').textContent=activeGame==='ff9'?'A PLACE TO CALL HOME':'YOUR FRIENDLY NEIGHBORHOOD RECORDING JOURNAL';
    $('.game-title').textContent=activeGame==='ff9'?'Final Fantasy IX':'Marvel’s Spider-Man';
    $('.hero-subtitle').textContent=game.subtitle;
    $('.hero-copy>p').textContent=game.description;
    $('.route-banner').innerHTML=`<span aria-hidden="true">◇</span><div><strong>${escapeHTML(game.scope)}</strong><p>${escapeHTML(game.pacing)}</p><div class="route-counts">${activeGame==='ff9'?'STORY FOCUSED · OPTIONAL GRINDS OMITTED':'100% OF ALL THREE DLC CHAPTERS'} · ${game.target}</div></div>`;
    $('#bosses-view .section-heading').innerHTML='<div><div class="eyebrow">VERIFY BEFORE MOVING ON</div><h2>Completion checklist<span>.</span></h2></div><span class="muted">Manual checks; recording status does not mark gameplay complete.</span>';
    $('#prep-view').innerHTML=`<div class="section-heading"><h2>Before you hit record<span>.</span></h2></div><div class="prep-grid">${game.essentials.map(([title,body])=>`<article class="prep-card"><h3>${escapeHTML(title)}</h3><p>${escapeHTML(body)}</p></article>`).join('')}</div>`;
  }
  $('[data-view="roadmap"] .nav-count').textContent=EPISODES.length;
  $('[data-view="bosses"]').innerHTML=`<span>♧</span> ${kh?'Boss checklist':'Completion checklist'} <span class="nav-count">${BOSSES.length}</span>`;
  $('.stats>div:first-child p').innerHTML=`${EPISODES.length} <small>episodes</small>`;
  $('.stats>div:nth-child(3) .stat-label').textContent=kh?'OPTIONAL CHALLENGES':'COMPLETION CHECKS';
  $('.stat-total').textContent=` / ${BOSSES.length}`;
  $('[data-filter="all"] span').textContent=EPISODES.length;
  for(const filter of ['endgame','watch'])$(`[data-filter="${filter}"]`).hidden=!kh;
  $('.runtime-label').textContent=kh?'◷ FULL CUTSCENES · FLEXIBLE LENGTH':`◷ ${game.target}`;
  $('#download-roadmap').hidden=kh;
  $('#migration-notice').hidden=!(kh&&state.legacyProgress);
  let atlantica=$('#atlantica-route');
  if(!atlantica){
    atlantica=document.createElement('section');
    atlantica.id='atlantica-route';atlantica.className='atlantica-route';
    atlantica.setAttribute('aria-label','Atlantica visits and unlock requirements');
    $('.route-banner').after(atlantica);
    atlantica.innerHTML=`<div class="atlantica-heading"><div><span class="eyebrow">WORLD ROUTE · ALL FIVE SONGS</span><h2>Atlantica: Ariel’s complete story</h2></div><a href="https://www.khwiki.com/Atlantica" target="_blank" rel="noreferrer">World reference ↗</a></div><div class="atlantica-visits">
      <button data-route-episode="16"><strong>PART 16 · FIRST VISIT ↗</strong><span>Swim This Way → Part of Your World → Under the Sea</span><small>After Space Paranoids I. Bring Magnet from Oogie Boogie (Part 13) and a maximum Drive Gauge of at least 5 after Hostile Program. This means gauge capacity, not a Form’s level.</small></button>
      <button data-route-episode="22"><strong>PART 22 · URSULA ↗</strong><span>Ursula’s Revenge</span><small>Return with Magnera from Port Royal II (Part 20). Keep Ariel’s bargain, the rhythm boss encounter, and its aftermath. Receive Mysterious Abyss.</small></button>
      <button data-route-episode="26"><strong>PART 26 · WORLD FINALE ↗</strong><span>A New Day Is Dawning</span><small>Return with Thundaga from Pride Lands II (Part 23). Finish the last song and all ending scenes before the KH2 finale. No journal-score grind required.</small></button>
    </div><p>Parts 16 and 22 finish at the Undersea Courtyard save point. Part 26 continues to Twilight Town after Atlantica’s ending.</p>`;
  }
  atlantica.hidden=!kh;
}
function switchGame(id,episode) {
  if(!Object.hasOwn(GAMES,id))return;
  save();
  activeGame=id;EPISODES=GAMES[id].episodes;BOSSES=GAMES[id].checklist;
  STORAGE_KEY=gameStorageKey(id);
  state=defaults(id);
  try {
    let data=localStorage.getItem(STORAGE_KEY);
    if(!data&&id==='kh2fm')data=localStorage.getItem(LEGACY_STORAGE_KEY);
    if(data)state=validateState(JSON.parse(data),id);
    localStorage.setItem('wayfinder-active-game',id);
  } catch {toast('Could not load this game’s saved progress. Import a backup if needed.');}
  currentId=episode||GAMES[id].initial;
  renderGameShell();resetFilters();renderStats();renderBosses();selectEpisode(currentId);save();
}
function libraryBackup() {
  const games={};
  for(const id of Object.keys(GAMES)) {
    if(id===activeGame){games[id]=state;continue;}
    const raw=localStorage.getItem(gameStorageKey(id)) || (id==='kh2fm'?localStorage.getItem(LEGACY_STORAGE_KEY):null);
    games[id]=raw?validateState(JSON.parse(raw),id):defaults(id);
  }
  return {version:3,activeGame,games};
}
function validateLibrary(value) {
  if(value?.version!==3||!value.games||typeof value.games!=='object')throw new Error('Unsupported library');
  const games={};
  for(const id of Object.keys(GAMES)) {
    if(!Object.hasOwn(value.games,id))throw new Error('Incomplete library');
    games[id]=validateState(value.games[id],id);
  }
  return {version:3,activeGame:Object.hasOwn(GAMES,value.activeGame)?value.activeGame:'kh2fm',games};
}
