'use strict';
const STORAGE_KEY = 'wayfinder-kh2fm-v1';
const STATUSES = ['planned', 'recording', 'recorded', 'published'];
const defaults = () => ({version:1, statuses:{1:'recorded',2:'recorded',3:'recorded',4:'recorded'}, objectives:{}, notes:{}, bosses:{}});
function validateState(value) {
  if (!value || value.version !== 1 || typeof value !== 'object') throw new Error('Unsupported backup');
  const result = {version:1,statuses:{},objectives:{},notes:{},bosses:{}};
  for (const e of EPISODES) {
    if (STATUSES.includes(value.statuses?.[e.id])) result.statuses[e.id] = value.statuses[e.id];
    if (typeof value.notes?.[e.id] === 'string') result.notes[e.id] = value.notes[e.id].slice(0,20000);
    for (let i=0;i<e.objectives.length;i++) {
      const key = `${e.id}-${i}`;
      if (value.objectives?.[key] === true) result.objectives[key] = true;
    }
  }
  for (const b of BOSSES) if (value.bosses?.[b.id] === true) result.bosses[b.id] = true;
  return result;
}
let state = defaults();
let storageAvailable = true;
try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) state = validateState(JSON.parse(saved)); } catch { storageAvailable = false; }
let currentId = parseHash() || 5;
let currentFilter = 'all';
let currentView = 'roadmap';
let toastTimer;
const $ = selector => document.querySelector(selector);
const escapeHTML = str => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusOf = id => state.statuses[id] || 'planned';
const isRecorded = id => ['recorded','published'].includes(statusOf(id));
const editedTime = e => `${e.timing.editedMin}–${e.timing.editedMax} min`;
const recordingTime = e => `${e.timing.recordingMin}–${e.timing.recordingMax} min`;
function timingNote(e) {
  if (e.id <= 4) return 'Planning estimate for your existing recordings; use the actual footage length when editing.';
  if (e.id >= 38 || e.id === 33) return 'Allows for setup and learning attempts. A first clear can take longer or span multiple sessions; trim retries to reach the edited target. Grinding is extra.';
  if (e.id === 30) return 'Recording includes the ending and credits. Shorten credits and transitions to reach the edited target.';
  if (e.id === 37) return 'Allows for navigation and gauntlet retries. First-time attempts may exceed this range; Form training is extra.';
  return 'Planning estimate including commentary, cutscenes, and some retries. Trim travel and repeated attempts for the finished episode. Grinding is extra.';
}
function parseHash() { const match = location.hash.match(/^#episode-(\d+)$/); const id = match ? Number(match[1]) : 0; return id >= 1 && id <= 45 ? id : null; }
function toast(message) { $('#toast').textContent=message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000); }
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable=true; } catch { storageAvailable=false; toast('Browser storage is unavailable. Export a backup to keep your progress.'); }
  $('#save-label').textContent=storageAvailable ? 'Saved on this device' : 'Not saved — export a backup';
}
function renderStats() {
  const count=EPISODES.filter(e=>isRecorded(e.id)).length;
  const percent=Math.round(count/45*100);
  $('#recorded-count').textContent=count;
  $('#boss-count').textContent=BOSSES.filter(b=>state.bosses[b.id]).length;
  $('#progress-percent').textContent=`${percent}%`;
  $('#progress-fill').style.width=`${percent}%`;
  $('#progress-caption').textContent=count===45 ? 'The entire journey, captured.' : `${45-count} episodes still to capture`;
  $('#continue-button').innerHTML=count===45 ? 'Revisit your journey <span>↗</span>' : 'Continue your journey <span>↗</span>';
}
function chapter(id) { return id<=4 ? '01 / THE OPENING CHAPTER' : id<=17 ? '02 / WORLDS BEYOND' : id<=30 ? '03 / THE ROAD TO XEMNAS' : id<=37 ? '04 / BEYOND THE ENDING' : '05 / THE FINAL CHALLENGES'; }
function renderList() {
  const query=$('#search').value.trim().toLowerCase();
  const episodes=EPISODES.filter(e=>{
    const filterMatch=currentFilter==='all' || currentFilter==='story'&&e.id<=30 || currentFilter==='endgame'&&e.id>30 || currentFilter==='recorded'&&isRecorded(e.id);
    return filterMatch && (!query || `${e.id} ${String(e.id).padStart(2,'0')} part ${e.id} episode ${e.id} ${e.title} ${e.world} ${e.encounters} ${e.objectives.join(' ')} ${e.stop}`.toLowerCase().includes(query));
  });
  let lastChapter='';
  $('#episode-list').innerHTML=episodes.map(e=>{
    const group=chapter(e.id);
    const heading=group!==lastChapter ? `<div class="chapter-label"><span>◇</span>${group}</div>` : '';
    lastChapter=group;
    const selected=e.id===currentId;
    return `${heading}<button class="episode-card ${selected?'selected':''}" data-episode="${e.id}" ${selected?'aria-current="true"':''} aria-label="Part ${e.id}: ${escapeHTML(e.title)}, ${statusOf(e.id)}"><span class="episode-number">${String(e.id).padStart(2,'0')}</span><div class="episode-card-body">${selected?'<span class="episode-tag">CURRENT EPISODE</span>':''}<h3>${escapeHTML(e.title)}</h3><p>${escapeHTML(e.world)}</p><span class="episode-runtime">Est. ${editedTime(e)} edited</span></div>${isRecorded(e.id)?'<span class="card-check" aria-hidden="true">✓</span>':selected?'<span class="card-arrow" aria-hidden="true">↗</span>':''}</button>`;
  }).join('');
  $('#empty-state').hidden=episodes.length!==0;
}
function renderDetail() {
  const e=EPISODES[currentId-1];
  const status=statusOf(e.id);
  $('#episode-detail').innerHTML=`<div class="detail-banner"><div class="detail-meta"><span>EPISODE ${String(e.id).padStart(2,'0')} <span style="opacity:.4">/</span> 45</span><span class="status-pill status-${status}">${status.toUpperCase()}</span></div><h2>${escapeHTML(e.title)}</h2><div class="detail-location"><span>⌖</span>${escapeHTML(e.world)}</div><div class="detail-submeta"><span>◷ Est. ${editedTime(e)} edited</span><span>◇ ${e.id<=4?'Previously recorded':e.id<=30?'Main story':'Endgame & superbosses'}</span></div></div><div class="detail-content"><section class="timing-box" aria-label="Episode time estimates"><div class="timing-values"><div><span>EST. EDITED RUNTIME</span><strong>${editedTime(e)}</strong></div><div><span>RECORDING BUDGET</span><strong>${recordingTime(e)}</strong></div></div><p>${timingNote(e)}</p></section><section class="detail-section"><h3><span>☷</span> OBJECTIVES & STORY BEATS</h3>${e.objectives.map((o,i)=>`<label class="objective"><input type="checkbox" data-objective="${e.id}-${i}" ${state.objectives[`${e.id}-${i}`]?'checked':''}><span>${escapeHTML(o)}</span></label>`).join('')}</section><section class="detail-section"><h3><span>♧</span> BOSSES & ENCOUNTERS</h3><p class="encounter-text">${escapeHTML(e.encounters)}</p></section><section class="stop-box"><h3>⚑ &nbsp; WRAP THE RECORDING HERE</h3><p>${escapeHTML(e.stop)}</p></section><label class="notes-label" for="episode-notes">PRODUCTION NOTES <span class="muted">/ saved as you type</span></label><textarea id="episode-notes" class="notes" maxlength="20000" placeholder="Timestamps, commentary ideas, reminders for the edit…">${escapeHTML(state.notes[e.id]||'')}</textarea><div class="detail-actions"><label class="status-control" for="episode-status">STATUS<select id="episode-status">${STATUSES.map(s=>`<option value="${s}" ${status===s?'selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}</select></label><button class="copy-button" id="copy-title">Copy YouTube title ↗</button></div></div><div class="detail-footer"><button id="previous-episode" ${e.id===1?'disabled':''}>← Previous episode</button><span>${String(e.id).padStart(2,'0')} / 45</span><button id="next-episode" ${e.id===45?'disabled':''}>Next episode →</button></div>`;
  $('#episode-notes').addEventListener('input',event=>{state.notes[e.id]=event.target.value;save();});
  $('#episode-status').addEventListener('change',event=>{state.statuses[e.id]=event.target.value;save();renderStats();renderList();const pill=$('.status-pill');pill.className=`status-pill status-${event.target.value}`;pill.textContent=event.target.value.toUpperCase();toast(`Part ${e.id} marked ${event.target.value}.`);});
  $('#previous-episode').addEventListener('click',()=>selectEpisode(e.id-1));
  $('#next-episode').addEventListener('click',()=>selectEpisode(e.id+1));
  $('#copy-title').addEventListener('click',async()=>{
    const title=`Kingdom Hearts II Final Mix | Part ${e.id} — ${e.title}`;
    try { if (!navigator.clipboard) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(title); toast('YouTube title copied.'); }
    catch { const temp=document.createElement('textarea');temp.value=title;temp.style.position='fixed';temp.style.opacity='0';document.body.append(temp);temp.select();const copied=document.execCommand('copy');temp.remove();toast(copied?'YouTube title copied.':'Clipboard unavailable in this browser.'); }
  });
}
function selectEpisode(id, scroll=false) {
  if (id<1||id>45) return;
  currentId=id;
  if(currentView!=='roadmap') switchView('roadmap');
  if(location.hash!==`#episode-${id}`) location.hash=`episode-${id}`;
  renderList();renderDetail();
  if(scroll) $('#episode-detail').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderBosses() {
  $('#boss-grid').innerHTML=['Absent Silhouettes','Data Organization XIII','Final challenges'].map(group=>{
    const bosses=BOSSES.filter(b=>b.group===group);
    return `<article class="boss-group"><h3>${group}</h3><p>${bosses.filter(b=>state.bosses[b.id]).length} of ${bosses.length} cleared</p>${bosses.map(b=>`<div class="boss-row"><label class="boss-check"><input type="checkbox" data-boss="${b.id}" ${state.bosses[b.id]?'checked':''}><span>${b.name}</span></label><button class="episode-link" data-boss-episode="${b.episode}" aria-label="Open Part ${b.episode} for ${b.name}">Part ${b.episode} ↗</button></div>`).join('')}</article>`;
  }).join('');
}
function switchView(view) {
  currentView=view;
  for(const name of ['roadmap','bosses','prep']) $(`#${name}-view`).hidden=name!==view;
  document.querySelectorAll('[data-view]').forEach(button=>{button.classList.toggle('active',button.dataset.view===view);button.setAttribute('aria-pressed',String(button.dataset.view===view));});
  $('#view-label').textContent={roadmap:'Episode roadmap',bosses:'Boss checklist',prep:'Recording essentials'}[view];
  if(view==='bosses')renderBosses();
}
function resetFilters(){currentFilter='all';$('#search').value='';document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter==='all');b.setAttribute('aria-pressed',String(b.dataset.filter==='all'));});renderList();}
document.addEventListener('click',event=>{
  const episode=event.target.closest('[data-episode]');if(episode)selectEpisode(Number(episode.dataset.episode),innerWidth<=650);
  const nav=event.target.closest('[data-view]');if(nav)switchView(nav.dataset.view);
  const filter=event.target.closest('[data-filter]');if(filter){currentFilter=filter.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===filter);b.setAttribute('aria-pressed',String(b===filter));});renderList();}
  const bossLink=event.target.closest('[data-boss-episode]');if(bossLink){resetFilters();selectEpisode(Number(bossLink.dataset.bossEpisode),true);}
});
document.addEventListener('change',event=>{
  if(event.target.matches('[data-objective]')){state.objectives[event.target.dataset.objective]=event.target.checked;save();}
  if(event.target.matches('[data-boss]')){state.bosses[event.target.dataset.boss]=event.target.checked;save();renderStats();const group=event.target.closest('.boss-group');const inputs=[...group.querySelectorAll('input')];group.querySelector('p').textContent=`${inputs.filter(i=>i.checked).length} of ${inputs.length} cleared`;}
});
$('#search').addEventListener('input',renderList);
$('#clear-search').addEventListener('click',resetFilters);
$('#continue-button').addEventListener('click',()=>{resetFilters();selectEpisode(EPISODES.find(e=>!isRecorded(e.id))?.id||45,true);});
$('#export-button').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`wayfinder-progress-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Progress backup exported.');
});
$('#import-button').addEventListener('click',()=>$('#import-file').click());
$('#import-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try { if(file.size>2000000)throw new Error('Too large');const incoming=validateState(JSON.parse(await file.text()));if(!confirm('Replace this device’s progress with the selected backup? Export your current progress first if you want to keep it.'))return;state=incoming;save();renderStats();renderList();renderDetail();renderBosses();toast('Progress backup restored.'); }
  catch {toast('Could not import this file. Choose a Wayfinder JSON backup.');}
  finally {event.target.value='';}
});
window.addEventListener('hashchange',()=>{const id=parseHash();if(id&&id!==currentId){resetFilters();selectEpisode(id);}});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){event.preventDefault();switchView('roadmap');$('#search').focus();}});
renderStats();renderList();renderDetail();switchView('roadmap');
document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter==='all')));
if(!storageAvailable)$('#save-label').textContent='Storage unavailable — export a backup';
