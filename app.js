'use strict';
let state = defaults();
let storageAvailable = true;
let routeMigrated = false;
try {
  const current = localStorage.getItem(STORAGE_KEY);
  const legacy = current || activeGame!=='kh2fm' ? null : localStorage.getItem(LEGACY_STORAGE_KEY);
  if (current || legacy) state = validateState(JSON.parse(current || legacy));
  if (legacy) { routeMigrated = true; localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
} catch { storageAvailable = false; }
let currentId = parseHash() || GAMES[activeGame].initial;
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
  if (e.id <= 4) return 'Existing recording: keep your actual edit and duration. This estimate is a reconstruction, not a request to re-record.';
  if (e.kind === 'watch') return 'Movie footage, text bridges, credits where scheduled, and commentary are included. Pause for discussion; keep every scene. Chapter boundaries take priority over the estimate.';
  if (e.kind === 'endgame') return 'Includes introductions, complete winning fights, and useful learning attempts. First clears may need several sessions and exceed this budget. Repetitive grinding is additional.';
  return 'Includes all cutscenes and commentary. Episode length is flexible: finish the listed story chapter without skipping scenes. Recording allows extra retries; repetitive grinding is additional.';
}
function parseHash() { return hashRoute()?.id || null; }
function toast(message) { $('#toast').textContent=message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000); }
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable=true; } catch { storageAvailable=false; toast('Browser storage is unavailable. Export a backup to keep your progress.'); }
  $('#save-label').textContent=storageAvailable ? 'Saved on this device' : 'Not saved — export a backup';
}
function renderStats() {
  const count=EPISODES.filter(e=>isRecorded(e.id)).length;
  const percent=Math.round(count/EPISODES.length*100);
  $('#recorded-count').textContent=count;
  $('#boss-count').textContent=BOSSES.filter(b=>state.bosses[b.id]).length;
  $('#progress-percent').textContent=`${percent}%`;
  $('#progress-fill').style.width=`${percent}%`;
  $('#progress-caption').textContent=count===EPISODES.length ? 'The entire journey, captured.' : `${EPISODES.length-count} episodes still to capture`;
  $('#continue-button').innerHTML=count===EPISODES.length ? 'Revisit your journey <span>↗</span>' : 'Continue your journey <span>↗</span>';
}
function chapter(id) {
  if(activeGame!=='kh2fm')return EPISODES[id-1].arcOrAct.toUpperCase();
  return id<=4 ? '01 / ROXAS’S SUMMER' : id<=17 ? '02 / THE WORLDS BETWEEN' : id<=30 ? '03 / THE ROAD TO XEMNAS' : id<=35 ? '04 / THE OPTIONAL CHALLENGES' : id<=43 ? '05 / THE LAST BATTLES' : '06 / 358/2 DAYS · THE WATCH';
}
function renderList() {
  const query=$('#search').value.trim().toLowerCase();
  const episodes=EPISODES.filter(e=>{
    const filterMatch=currentFilter==='all' || currentFilter==='story'&&e.kind==='story' || currentFilter==='endgame'&&e.kind==='endgame' || currentFilter==='watch'&&e.kind==='watch' || currentFilter==='recorded'&&isRecorded(e.id);
    return filterMatch && (!query || `${e.id} ${String(e.id).padStart(2,'0')} part ${e.id} episode ${e.id} ${e.title} ${e.world} ${e.encounters} ${e.objectives.join(' ')} ${e.prep.join(' ')} ${e.cutscenes.join(' ')} ${e.commentary.join(' ')} ${e.pickups} ${e.stop}`.toLowerCase().includes(query));
  });
  let lastChapter='';
  $('#episode-list').innerHTML=episodes.map(e=>{
    const group=chapter(e.id);
    const heading=group!==lastChapter ? `<div class="chapter-label"><span>◇</span>${escapeHTML(group)}</div>` : '';
    lastChapter=group;
    const selected=e.id===currentId;
    return `${heading}<button class="episode-card type-${e.kind} ${selected?'selected':''}" data-episode="${e.id}" ${selected?'aria-current="true"':''} aria-label="Part ${e.id}: ${escapeHTML(e.title)}, ${statusOf(e.id)}"><span class="episode-number">${String(e.id).padStart(2,'0')}</span><div class="episode-card-body">${selected?'<span class="episode-tag">CURRENT EPISODE</span>':''}<h3>${escapeHTML(e.title)}</h3><p>${escapeHTML(e.world)}</p><span class="episode-runtime">Est. ${editedTime(e)} · story & commentary</span></div>${isRecorded(e.id)?'<span class="card-check" aria-hidden="true">✓</span>':selected?'<span class="card-arrow" aria-hidden="true">↗</span>':''}</button>`;
  }).join('');
  $('#empty-state').hidden=episodes.length!==0;
}
function renderDetail() {
  const e=EPISODES[currentId-1];
  const status=statusOf(e.id);
  $('#episode-detail').innerHTML=activeGame==='kh2fm'?renderGuide(e,status):renderRoadmapGuide(e,status);
  $('#episode-notes').addEventListener('input',event=>{state.notes[e.id]=event.target.value;save();});
  $('#episode-status').addEventListener('change',event=>{state.statuses[e.id]=event.target.value;save();renderStats();renderList();const pill=$('.status-pill');pill.className=`status-pill status-${event.target.value}`;pill.textContent=event.target.value.toUpperCase();toast(`Part ${e.id} marked ${event.target.value}.`);});
  $('#previous-episode').addEventListener('click',()=>selectEpisode(e.id-1));
  $('#next-episode').addEventListener('click',()=>selectEpisode(e.id+1));
  $('#copy-title').addEventListener('click',async()=>{
    const title=`${e.kind==='watch'?'Kingdom Hearts 358/2 Days Movie Watch':GAMES[activeGame].name} | Part ${e.id} — ${e.title}`;
    try { if (!navigator.clipboard) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(title); toast('YouTube title copied.'); }
    catch { const temp=document.createElement('textarea');temp.value=title;temp.style.position='fixed';temp.style.opacity='0';document.body.append(temp);temp.select();const copied=document.execCommand('copy');temp.remove();toast(copied?'YouTube title copied.':'Clipboard unavailable in this browser.'); }
  });
}
function selectEpisode(id, scroll=false) {
  if (id<1||id>EPISODES.length) return;
  currentId=id;
  if(currentView!=='roadmap') switchView('roadmap');
  const route=activeGame==='kh2fm'?`episode-${id}`:`${activeGame}/episode-${id}`;
  if(location.hash!==`#${route}`) location.hash=route;
  renderList();renderDetail();
  if(scroll) $('#episode-detail').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderBosses() {
  $('#boss-grid').innerHTML=[...new Set(BOSSES.map(b=>b.group))].map(group=>{
    const bosses=BOSSES.filter(b=>b.group===group);
    return `<article class="boss-group"><h3>${group}</h3><p>${bosses.filter(b=>state.bosses[b.id]).length} of ${bosses.length} cleared</p>${bosses.map(b=>`<div class="boss-row"><label class="boss-check"><input type="checkbox" data-boss="${b.id}" ${state.bosses[b.id]?'checked':''}><span>${b.name}</span></label><button class="episode-link" data-boss-episode="${b.episode}" aria-label="Open Part ${b.episode} for ${b.name}">Part ${b.episode} ↗</button></div>`).join('')}</article>`;
  }).join('');
}
function switchView(view) {
  currentView=view;
  for(const name of ['roadmap','bosses','prep']) $(`#${name}-view`).hidden=name!==view;
  document.querySelectorAll('[data-view]').forEach(button=>{button.classList.toggle('active',button.dataset.view===view);button.setAttribute('aria-pressed',String(button.dataset.view===view));});
  $('#view-label').textContent={roadmap:'Episode roadmap',bosses:activeGame==='kh2fm'?'Boss checklist':'Completion checklist',prep:'Recording essentials'}[view];
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
$('#continue-button').addEventListener('click',()=>{resetFilters();selectEpisode(EPISODES.find(e=>!isRecorded(e.id))?.id||EPISODES.length,true);});
$('#export-button').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(libraryBackup(),null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`wayfinder-progress-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Progress backup exported.');
});
$('#import-button').addEventListener('click',()=>$('#import-file').click());
$('#import-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try {
    if(file.size>4000000)throw new Error('Too large');
    const parsed=JSON.parse(await file.text());
    const incoming=parsed.version===3?validateLibrary(parsed):{version:3,activeGame:parsed.gameId||'kh2fm',games:{[parsed.gameId||'kh2fm']:validateState(parsed,parsed.gameId||'kh2fm')}};
    if(!confirm(parsed.version===3?'Replace all three games’ progress with this library backup?':'Replace only the backup’s game progress? Other games will be preserved.'))return;
    for(const [id,data] of Object.entries(incoming.games))localStorage.setItem(gameStorageKey(id),JSON.stringify(data));
    // Do not save the old in-memory slice over the imported one during switching.
    state=incoming.games[activeGame]||state;
    const target=incoming.activeGame;
    switchGame(target,target===activeGame?currentId:GAMES[target].initial);
    toast('Progress backup restored.');
  }
  catch {toast('Could not import this file. Choose a Wayfinder JSON backup.');}
  finally {event.target.value='';}
});
window.addEventListener('hashchange',()=>{const route=hashRoute();if(!route)return;if(route.gameId!==activeGame)switchGame(route.gameId,route.id);else if(route.id!==currentId){resetFilters();selectEpisode(route.id);}});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){event.preventDefault();switchView('roadmap');$('#search').focus();}});
renderGameShell();renderStats();renderList();renderDetail();switchView('roadmap');
document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter==='all')));
if(routeMigrated)$('#migration-notice').hidden=false;
if(!storageAvailable)$('#save-label').textContent='Storage unavailable — export a backup';

$('#game-select').addEventListener('change',event=>switchGame(event.target.value));
$('#download-roadmap').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(GAMES[activeGame].raw,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=`${activeGame}-episodes.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
