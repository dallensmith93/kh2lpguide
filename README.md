# Wayfinder - Kingdom Hearts Recording Journal

A detailed, full-cutscene plan for **43 Kingdom Hearts II Final Mix episodes followed by two Kingdom Hearts 358/2 Days HD movie watches**. Exactly 45 parts, with flexible episode lengths.

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

Chapter reference: [Days HD theater order](https://www.khwiki.com/Theater_Mode/Kingdom_Hearts_358/2_Days). Additional references are linked inside the guide.
