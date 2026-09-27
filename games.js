'use strict';
function adaptRoadmap(rows) {
  return rows.map((e,i) => ({...e, id:e.episodeNumber, title:e.suggestedTitle,
    world:e.location, objectives:e.storyBeats, encounters:e.keyEncountersOrActivities.join(' '),
    stop:e.stoppingPoint, kind:'story', prep:[], cutscenes:[], commentary:[], pickups:'',
    start:i ? rows[i-1].stoppingPoint : e.gameId==='ff9' ? 'Start a new Final Fantasy IX game; record from the opening.' : 'Load your existing Marvel’s Spider-Man save and select The Heist in the DLC menu.',
    timing:{editedMin:e.estimatedMinutes[0], editedMax:e.estimatedMinutes[1],
      recordingMin:e.gameId==='ff9'?e.estimatedMinutes[0]+5:40,
      recordingMax:e.gameId==='ff9'?e.estimatedMinutes[1]+20:75}
  }));
}
const GAMES = {
  kh2fm:{name:'Kingdom Hearts II Final Mix', short:'KH2FM', subtitle:'FINAL MIX + 358/2 DAYS',
    episodes:KH_EPISODES, checklist:KH_BOSSES, initial:5},
  ff9:{name:'Final Fantasy IX', short:'FF9', subtitle:'A STORY ACROSS FOUR DISCS',
    episodes:adaptRoadmap(FF9_EPISODES), raw:FF9_EPISODES, initial:1, target:'30–40 MIN TARGET',
    description:'A story-focused journey through Gaia. Every essential character moment, without a completionist grind.',
    scope:'Exactly 45 parts. Disc 1: 1–11 · Disc 2: 12–23 · Disc 3: 24–35 · Disc 4: 36–45.',
    pacing:'30–40 minutes is the target, not a hard cap. Full story chapters can run longer; the ten-part Disc 4 band contains shorter episodes. Parts 43–45 are recorded continuously and split in the edit.',
    checklist:[11,23,35,45].map((episode,i)=>({id:`disc-${i+1}`,name:`Disc ${i+1} story captured`,group:'Story milestones',episode})),
    sources:[['Story order and dungeon reference','https://jegged.com/Games/Final-Fantasy-IX/Walkthrough/'],['Memoria save points and finale','https://www.ffexodus.com/ff9/walkthrough41.php']],
    essentials:[['Story first','Keep the main dialogue, cinematics, and character sequences. No full card collection, dig-site clearing, Friendly Monsters list, treasure sweep, or superboss preparation. Ozma and Hades are omitted.'],['Equipment and recovery','Learn useful abilities from gear as you travel. Restock at story towns, keep a healer and revival items available, and cap optional steal attempts. No rare item is required by this route.'],['Save versus editing cut','Named moogles and orbs are real save stops. Clearly labeled transition boundaries are cuts within a continuous recording. Keep the previous save; do not assume a cinematic transition saves the game.'],['Pacing','The requested disc bands take priority. Do not pad shorter Memoria chapters with random battles. Longer early chapters include story scenes and may exceed the target. Estimates assume normal speed and are editorial budgets, not measured timings.']]},
  'spiderman-ctns':{name:'Marvel’s Spider-Man: The City That Never Sleeps',short:'SPIDER-MAN CTNS',subtitle:'THREE CHAPTERS · EVERY DISTRICT',
    episodes:adaptRoadmap(SPIDERMAN_EPISODES),raw:SPIDERMAN_EPISODES,initial:1,target:'25–35 MIN TARGET',
    description:'Black Cat. Hammerhead. Silver Sable. A complete 20-part route through all three DLC chapters.',
    scope:'The Heist: 1–7 · Turf Wars: 8–13 · Silver Lining: 14–20. Each chapter reaches 100% before moving on.',
    pacing:'Videos target 25–35 minutes. Budget 40–75+ minutes to record activity-heavy chapters; crime spawns and challenge retries vary. Keep unique clears and cutscenes, and trim empty patrol time.',
    checklist:[
      ['heist-story','Story and ending','The Heist',7],['heist-art','10/10 art + Like a Fiddle','The Heist',5],['heist-crimes','Every Maggia crime counter full','The Heist',6],['heist-challenges','5 challenges at Spectacular+','The Heist',6],['heist-100','Chapter menu shows 100%','The Heist',7],
      ['turf-story','Story and Hammerhead defeated','Turf Wars',13],['turf-fronts','4/4 Hammerhead Fronts','Turf Wars',12],['turf-crimes','All 4 crime districts at 5/5','Turf Wars',12],['turf-challenges','5 challenges + Season Finale','Turf Wars',12],['turf-100','Chapter menu shows 100%','Turf Wars',13],
      ['silver-story','Story and mech Hammerhead defeated','Silver Lining',20],['silver-hideouts','3/3 hideouts + Aiding a Human','Silver Lining',18],['silver-recordings','9/9 recordings + Scales of Justice','Silver Lining',19],['silver-crimes','Every chapter crime counter full','Silver Lining',19],['silver-challenges','5 challenges + Wrap Party','Silver Lining',17],['silver-100','Chapter menu shows 100%','Silver Lining',20]
    ].map(([id,name,group,episode])=>({id,name,group,episode})),
    sources:[['The Heist mission order','https://holdtoreset.com/the-heist-dlc-guide-spider-man-ps4/'],['Turf Wars mission reference','https://marvels-spider-man.fandom.com/wiki/Blindsided'],['The Heist completion requirements','https://platget.com/guides/marvels-spider-man-the-heist-trophy-guide/'],['Turf Wars completion requirements','https://platget.com/guides/marvels-spider-man-turf-wars-trophy-guide/'],['Silver Lining completion requirements','https://platget.com/guides/marvels-spider-man-silver-lining-trophy-guide/']],
    essentials:[['A separate map for every chapter','DLC district counters are chapter-specific. Heist progress does not satisfy Turf Wars or Silver Lining. Read every district panel before leaving a chapter; the DLC menu’s 100% is the final authority.'],['A repeatable patrol order','Order eligible district centers and activity icons north to south; use west to east for ties. Log the district names and counters in production notes. Only count unique cleared activities. Never farm a completed district while another has an empty crime counter.'],['Challenge ratings','Complete every challenge for map progress. This route additionally targets Spectacular or better in all 15 for the challenge trophies; Ultimate is unnecessary. Base bonus objectives are optional unless you personally want extra tokens.'],['Follow-up missions matter','Do not stop at collectibles or bases alone. Finish Like a Fiddle, Season Finale, Wrap Party, Aiding a Human, and Scales of Justice. Let queued phone calls finish; move around in free roam if the next activity has not appeared.'],['Recording budget','Crimes spawn dynamically. Spread them across travel between missions; remove empty waiting from the edit. Activity-heavy parts may run longer, and overflow stays inside that DLC chapter. A manual save in free roam follows every episode.']]}
};
function hashRoute() {
  const match=location.hash.match(/^#(?:(kh2fm|ff9|spiderman-ctns)\/)?episode-(\d+)$/);
  if(!match)return null;
  const gameId=match[1]||'kh2fm', id=Number(match[2]);
  return id>=1&&id<=GAMES[gameId].episodes.length?{gameId,id}:null;
}
let activeGame='kh2fm';
try {const remembered=localStorage.getItem('wayfinder-active-game');if(Object.hasOwn(GAMES,remembered))activeGame=remembered;} catch {}
if(hashRoute())activeGame=hashRoute().gameId;
let EPISODES=GAMES[activeGame].episodes;
let BOSSES=GAMES[activeGame].checklist;
const gameStorageKey=id=>id==='kh2fm'?'wayfinder-kh2fm-v2':`wayfinder-${id}-v2`;
