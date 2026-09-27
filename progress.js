'use strict';
let STORAGE_KEY = gameStorageKey(activeGame);
const LEGACY_STORAGE_KEY = 'wayfinder-kh2fm-v1';
const STATUSES = ['planned', 'recording', 'recorded', 'published'];
const defaults = (gameId=activeGame) => ({version:2,gameId,statuses:gameId==='kh2fm'?{1:'recorded',2:'recorded',3:'recorded',4:'recorded'}:{},objectives:{},notes:{},bosses:{}});
function checkpointKeys(e) {
  return [...e.objectives.map((_,i)=>`${e.id}-${i}`), ...e.prep.map((_,i)=>`prep-${e.id}-${i}`), ...e.cutscenes.map((_,i)=>`scene-${e.id}-${i}`), ...(e.keyEncountersOrActivities||[]).map((_,i)=>`activity-${e.id}-${i}`)];
}
function validateState(value,gameId=activeGame) {
  if (!value || typeof value !== 'object' || ![1,2].includes(value.version)) throw new Error('Unsupported backup');
  if(value.gameId && value.gameId!==gameId)throw new Error('Wrong game');
  if (value.version===1) {if(gameId!=='kh2fm')throw new Error('KH-only legacy backup');return migrateLegacy(value);}
  const result={version:2,gameId,statuses:{},objectives:{},notes:{},bosses:{}};
  for(const e of GAMES[gameId].episodes) {
    if(STATUSES.includes(value.statuses?.[e.id])) result.statuses[e.id]=value.statuses[e.id];
    if(typeof value.notes?.[e.id]==='string') result.notes[e.id]=value.notes[e.id].slice(0,20000);
    for(const key of checkpointKeys(e)) if(value.objectives?.[key]===true) result.objectives[key]=true;
  }
  for(const b of GAMES[gameId].checklist) if(value.bosses?.[b.id]===true) result.bosses[b.id]=true;
  if(gameId==='kh2fm' && value.legacyProgress?.version===1) result.legacyProgress=cleanLegacy(value.legacyProgress);
  return result;
}
function cleanLegacy(value) {
  const result={version:1,statuses:{},objectives:{},notes:{},bosses:{}};
  for(const e of ORIGINAL_EPISODES) {
    if(STATUSES.includes(value.statuses?.[e.id]))result.statuses[e.id]=value.statuses[e.id];
    if(typeof value.notes?.[e.id]==='string')result.notes[e.id]=value.notes[e.id].slice(0,20000);
    e.objectives.forEach((_,i)=>{const key=`${e.id}-${i}`;if(value.objectives?.[key]===true)result.objectives[key]=true;});
  }
  for(const b of KH_BOSSES)if(value.bosses?.[b.id]===true)result.bosses[b.id]=true;
  return result;
}
function migrateLegacy(value) {
  const legacy=cleanLegacy(value);
  const result={version:2,gameId:'kh2fm',statuses:{},objectives:{},notes:{},bosses:{...legacy.bosses},legacyProgress:legacy};
  for(const e of KH_EPISODES.filter(e=>e.kind!=='watch')) {
    const oldIds=Object.keys(LEGACY_EPISODE_MAP).map(Number).filter(old=>LEGACY_EPISODE_MAP[old]===e.id);
    // Combined chapters only inherit a status achieved by every source episode.
    const rank=Math.min(...oldIds.map(old=>STATUSES.indexOf(legacy.statuses[old]||'planned')));
    result.statuses[e.id]=STATUSES[rank];
    const notes=oldIds.filter(old=>legacy.notes[old]).map(old=>oldIds.length>1?`[Original Part ${old}]\n${legacy.notes[old]}`:legacy.notes[old]);
    if(notes.length)result.notes[e.id]=notes.join('\n\n').slice(0,20000);
    // Existing checkmarks cannot safely be applied to newly expanded instructions.
    // The exact previous checklist remains in legacyProgress and in every export.
  }
  return result;
}
