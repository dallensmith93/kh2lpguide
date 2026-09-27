'use strict';
function renderGuide(e,status) {
  const checkList=(items,prefix,numbered=false)=>items.map((text,i)=>{
    const key=`${prefix}${e.id}-${i}`;
    return `<label class="objective ${numbered?'route-objective':''}"><input type="checkbox" data-objective="${key}" ${state.objectives[key]?'checked':''}><span>${numbered?`<span class="step-number">${String(i+1).padStart(2,'0')}.</span>`:''}${escapeHTML(text)}</span></label>`;
  }).join('');
  const section=(title,contents,count,open=false)=>`<details class="guide-section" ${open?'open':''}><summary>${title}<span class="section-count">${count}</span></summary>${contents}</details>`;
  const mode=e.kind==='watch'?'358/2 Days · movie watch':e.id<=4?'Previously recorded':e.kind==='story'?'KH2FM · main story':'KH2FM · optional bosses';
  const references=e.kind==='watch'
    ? '<a href="https://www.khwiki.com/Theater_Mode/Kingdom_Hearts_358/2_Days" target="_blank" rel="noreferrer">HD movie chapter order ↗</a>'
    : e.id===31?'<a href="https://www.khwiki.com/Absent_Silhouette" target="_blank" rel="noreferrer">Silhouette locations ↗</a>'
    : e.id===34?'<a href="https://www.khwiki.com/Hades_Paradox_Cup" target="_blank" rel="noreferrer">Tournament rounds and rules ↗</a>'
    : e.id===43?'<a href="https://www.khwiki.com/Game:Lingering_Will" target="_blank" rel="noreferrer">Lingering Will reference ↗</a>':'';
  return `<div class="detail-banner ${e.kind==='watch'?'movie-banner':''}">
    <div class="detail-meta"><span>PART ${String(e.id).padStart(2,'0')} / 45</span><span class="status-pill status-${status}">${status.toUpperCase()}</span></div>
    <h2>${escapeHTML(e.title)}</h2><div class="detail-location"><span>⌖</span>${escapeHTML(e.world)}</div>
    <div class="detail-submeta"><span>◷ ${editedTime(e)} with full scenes</span><span>◇ ${mode}</span></div>
  </div>
  <div class="detail-content">
    <section class="timing-box" aria-label="Episode time estimates"><div class="timing-values"><div><span>VIDEO · FULL CUTSCENES</span><strong>${editedTime(e)}</strong></div><div><span>RECORDING SESSION</span><strong>${recordingTime(e)}</strong></div></div><p>${timingNote(e)}</p></section>
    <section class="start-box"><span>${e.kind==='watch'?'RESUME THE WATCH':'START THE RECORDING HERE'}</span><p>${escapeHTML(e.start)}</p></section>
    ${section('PRE-RECORDING CHECK',checkList(e.prep,'prep-'),`${e.prep.length} checks`)}
    ${section(e.kind==='watch'?'WATCH ORDER & CHAPTER BOUNDARY':'STEP-BY-STEP RECORDING ROUTE',checkList(e.objectives,'',true),`${e.objectives.length} steps`,true)}
    ${section('CUTSCENES · KEEP EVERY SCENE',`<p class="scene-note">These are checkpoints, not a skip list. Watch every intervening scene and text transition too.</p>${checkList(e.cutscenes,'scene-')}`,`${e.cutscenes.length} checkpoints`,true)}
    ${section(e.kind==='watch'?'ON-SCREEN ENCOUNTERS':'BOSS FIELD NOTES',e.tactics.map(([name,advice])=>`<div class="tactic-card"><h4>${escapeHTML(name)}</h4><p>${escapeHTML(advice)}</p></div>`).join(''),e.kind==='watch'?'cinematics':`${e.tactics.length} briefings`,true)}
    ${section('COMMENTARY CUES',`<ul class="commentary-list">${e.commentary.map(text=>`<li>${escapeHTML(text)}</li>`).join('')}</ul>`,'between scenes')}
    <section class="pickup-box"><h3>${e.kind==='watch'?'WATCH CHECKPOINT':'KEY PICKUPS & UNLOCKS'}</h3><p>${escapeHTML(e.pickups)}</p></section>
    <section class="stop-box"><h3>⚑ WRAP THE RECORDING HERE</h3><p>${escapeHTML(e.stop)}</p></section>
    ${references?`<p class="guide-reference">Reference: ${references}</p>`:''}
    <label class="notes-label" for="episode-notes">PRODUCTION NOTES <span class="muted">/ saved as you type</span></label>
    <textarea id="episode-notes" class="notes" maxlength="20000" placeholder="Timestamps, retry lessons, chapter bookmark, commentary ideas…">${escapeHTML(state.notes[e.id]||'')}</textarea>
    <div class="detail-actions"><label class="status-control" for="episode-status">STATUS<select id="episode-status">${STATUSES.map(s=>`<option value="${s}" ${status===s?'selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}</select></label><button class="copy-button" id="copy-title">Copy YouTube title ↗</button></div>
  </div><div class="detail-footer"><button id="previous-episode" ${e.id===1?'disabled':''}>← Previous episode</button><span>${String(e.id).padStart(2,'0')} / 45</span><button id="next-episode" ${e.id===45?'disabled':''}>Next episode →</button></div>`;
}
