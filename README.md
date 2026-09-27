# Wayfinder

A standalone recording companion for the 45-part Kingdom Hearts II Final Mix Let's Play roadmap.

Open `index.html` directly, or run `npm start` and visit **http://localhost:4173**. There is no build step or dependency installation. Python is needed only for the optional local server. Google Fonts enhances typography when online; system fallbacks work offline.

## Features

- All 45 episodes with objectives, boss strategies, and exact recording stopping points.
- Individual edited-runtime estimates and recording-session budgets for every episode. These are planning estimates, not measured playtimes; difficult first clears can exceed the budget, and grinding is additional.
- Search by episode, world, boss, objective, or location; story, endgame, and recorded filters.
- Objective checkboxes, production notes, and planned / recording / recorded / published status.
- All 21 mandatory optional boss challenges tracked independently of recording status.
- Parts 1–4 start recorded; Continue opens the first unrecorded episode.
- JSON backup export and validated import, plus episode deep links.
- Responsive layouts and keyboard access; `/` focuses search.

Progress stays in browser local storage. It does not sync between devices, browsers, file paths, or server origins. Export a backup before clearing browser data or switching origins. Import replaces existing progress after confirmation. Without available storage, changes last only for the current page session; export before closing.

The roadmap targets 25–35 minute edited episodes; preparation and failed attempts can require longer recording sessions. Opening episode descriptions are provisional. Review Recording essentials for prerequisites and scope.

## Files

- `episodes.js`: structured episode and optional boss data.
- `app.js`: UI rendering, navigation, progress, and backup handling.
- `styles.css`: responsive design.

Run `npm run check` to check JavaScript syntax.

With the server running and Python Playwright installed, run `python smoke_test.py` for browser checks covering persistence, search, navigation, boss tracking, backup round trips, and four responsive widths. Screenshots are written to the ignored `.checks/` directory.
