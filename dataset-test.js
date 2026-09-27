'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const context=vm.createContext({});
for(const file of ['ff9-roadmap.js','spiderman-roadmap.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const datasets=vm.runInContext('[FF9_EPISODES,SPIDERMAN_EPISODES]',context);
for(const [rows,count,game] of [[datasets[0],45,'ff9'],[datasets[1],20,'spiderman-ctns']]) {
  assert.equal(rows.length,count);
  rows.forEach((e,i)=>{
    assert.equal(e.episodeNumber,i+1);assert.equal(e.gameId,game);
    for(const key of ['suggestedTitle','arcOrAct','location','stoppingPoint'])assert.ok(typeof e[key]==='string'&&e[key].length>5,key);
    for(const key of ['storyBeats','keyEncountersOrActivities'])assert.ok(Array.isArray(e[key])&&e[key].length>=1&&e[key].every(s=>typeof s==='string'&&s.trim()),key);
    assert.ok(e.estimatedMinutes[0]>0&&e.estimatedMinutes[1]>=e.estimatedMinutes[0]);
    assert.equal(e.arcOrAct,game==='ff9'?(i<11?'Disc 1':i<23?'Disc 2':i<35?'Disc 3':'Disc 4'):(i<7?'The Heist':i<13?'Turf Wars':'Silver Lining'));
  });
}
// Every DLC main mission and completion-dependent follow-up must be routed.
const chapters=[
  ['The Maria','The Trouble with Arson','Long Lost Loot','Like Old Times','Something is Screwy','Trail of the Cat','Pursuing the Truth','Newsflash','Cover for the Cat','Follow the Money','Like a Fiddle'],
  ['Blindsided','The Bar With No Name','Jury Rigging','Last Stand','Season Two','Lockup','Yuri’s Revenge','Bring the Hammer Down','Season Finale'],
  ['Old Friends','Season 3','Rio Bravo','Together But Alone','Humanitarian Aid','Trust Issues','Getting Deep','One Plus One Equals Win','Wrap Party','Aiding a Human','Scales of Justice']
];
for(const [i,names] of chapters.entries()) {
  const rows=datasets[1].filter(e=>e.arcOrAct===['The Heist','Turf Wars','Silver Lining'][i]);
  const beats=rows.flatMap(e=>e.storyBeats).join('\n');
  for(const name of names)assert.ok(beats.includes(name),`Missing mission: ${name}`);
  assert.ok(rows.at(-1).stoppingPoint.includes('100%'));
}
console.log('PASS: 65 canonical episodes, exact arc bands, valid estimates, and all DLC missions/follow-ups.');
