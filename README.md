# Wayfinder - Let's Play Recording Journal

A detailed, full-cutscene plan for **43 Kingdom Hearts II Final Mix episodes followed by two Kingdom Hearts 358/2 Days HD movie watches**. Exactly 45 parts, with flexible episode lengths.

The series selector also includes **Final Fantasy IX (45 parts)** and **Marvel's Spider-Man: The City That Never Sleeps (20 parts)**. Each game has independent recording status, route checks, completion checks, and production notes.

## Additional roadmaps

- **FF9:** Disc 1 parts 1–11, Disc 2 parts 12–23, Disc 3 parts 24–35, Disc 4 parts 36–45. Story-focused; optional completionist grinds and superbosses are omitted. Target 30–40 minutes, with honest per-episode estimates: story-heavy chapters run longer, and the requested ten-part Disc 4 band creates shorter late chapters. Parts 43–45 use continuous recording with editing boundaries because there is no save between Kuja and Necron.
- **Spider-Man CTNS:** The Heist parts 1–7, Turf Wars parts 8–13, Silver Lining parts 14–20. All main missions, chapter crimes, art, Fronts, Hideouts, challenges, recordings, and their follow-up side missions. Targets 25–35 edited minutes; recording budgets allow additional crime spawns and retries. Spectacular challenge ratings are an additional trophy target; Ultimate ratings and base bonus objectives are not required for map completion. Each chapter ends with an in-game 100% audit.

`roadmap-schema.d.ts` defines the requested canonical `Episode` interface and optional recording metadata. `ff9-roadmap.js` and `spiderman-roadmap.js` expose canonical arrays; `games.js` adapts them to the existing view without changing the KH route. Use **Download episode data** to export the selected new roadmap as JSON. All 65 new records contain episodeNumber, gameId, suggestedTitle, arcOrAct, location, storyBeats, keyEncountersOrActivities, and stoppingPoint, plus estimatedMinutes and runtimeNote.

Links support `#ff9/episode-1`, `#spiderman-ctns/episode-20`, and the existing KH `#episode-5`. Game choice is remembered on the device. The active game controls search, totals, episode bounds, titles, and completion checks.

Progress exports now use a version-3 library envelope containing all three game slices. Existing version-1 and version-2 KH backups still import into KH only, preserving the other games. KH retains its existing storage key; other games have separate keys. Recording status never automatically checks a gameplay completion milestone.

Source references are linked inside each roadmap: [FF9 story route](https://jegged.com/Games/Final-Fantasy-IX/Walkthrough/), [Memoria saves](https://www.ffexodus.com/ff9/walkthrough41.php), [Heist missions](https://holdtoreset.com/the-heist-dlc-guide-spider-man-ps4/), and [Silver Lining completion requirements](https://platget.com/guides/marvels-spider-man-silver-lining-trophy-guide/). Routes and runtime ranges are editorial plans, not guarantees of a particular playthrough duration.

Open `index.html`, or run `npm start` and visit **http://localhost:4173**. No build step or npm dependencies. Python is needed for the optional server. Google Fonts is optional; system fonts work offline. The twilight illustration and heart crest are local SVG artwork.

## The revised route

- **1-4:** provisional descriptions of existing recordings; keep actual footage boundaries.
- **5-30:** world stories, ordinary cups, and the complete KH2FM ending and credits.
- **31:** all five Absent Silhouettes.
- **32:** Sephiroth and the Fenrir story sequence.
- **33:** the three preliminary Paradox cups.
- **34:** all 50 Hades Paradox rounds in five ten-round acts.
- **35:** full Cavern of Remembrance and the Garden shortcut.
- **36-42:** all thirteen Data rematches across seven episodes.
- **43:** Lingering Will and the end of the playable boss campaign.
- **44:** Days HD movie opening through the final Day 193 scene, *The Girl with the Sketch Book*.
- **45:** resume at Day 194~, *Axel Learns the Truth*, through Day 359 and full credits.

Watch every scene, including text bridges and the opening flash-forward. Listed scenes are checkpoints, not a skip list. Video and recording ranges are **planning estimates**, not measured cutscene durations. Boss learning and grinding can take additional sessions. Follow chapter boundaries rather than cutting scenes to fit a timer.

## Features

Each episode includes a starting location, preparation checklist, numbered route, cutscene checkpoints, boss tactics or viewing notes, commentary prompts, key pickups, an exact stop, time estimates, and production notes. Search includes these details. Filter story, optional bosses, Days, or recorded episodes.

Recording status and all 21 optional challenge victories are independent. Local storage saves progress; JSON export/import provides backups. There is no account or automatic device sync. Export before changing browsers, file paths, or server origins.

### Existing progress

Version-1 notes and statuses move with their subjects when loading this revision or importing an old backup. Combined chapters inherit only the status reached by both old parts. Old Part 45's Lingering Will notes move to Part 43, never to the movie. Expanded checklists start unchecked because their instructions changed. Original sanitized progress remains in `legacyProgress` in exports, and the old local-storage key is retained during startup migration.

## Files and checks

- `episodes.js`: original route retained for migration and stable optional boss IDs.
- `route-details.js`: revised plan, detailed instructions, and time estimates.
- `progress.js`: validation and migration.
- `guide-view.js`: episode template.
- `app.js`: navigation, persistence, and backups.
- `styles.css`, `kingdom.css`, `assets/`: responsive Kingdom Hearts-inspired presentation.

Run `npm run check` for JavaScript syntax. With the server running and Python Playwright installed, run `python smoke_test.py`. Checks cover route completeness, movie continuity, boss scheduling, migration, persistence, backups, and responsive widths. Screenshots go to ignored `.checks/`.

`npm run check` also validates the 65-record data contract, disc/chapter bands, and DLC mission coverage. Run `python library_smoke_test.py` for game isolation, all-game backup round trips, old KH imports, dataset downloads, deep links, navigation bounds, and responsive checks for all three games.

Chapter reference: [Days HD theater order](https://www.khwiki.com/Theater_Mode/Kingdom_Hearts_358/2_Days). Additional references are linked inside the guide.
