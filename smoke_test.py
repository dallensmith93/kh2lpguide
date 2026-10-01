"""Optional browser smoke checks: python smoke_test.py (requires Python Playwright)."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1100}, device_scale_factor=1)
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto("http://127.0.0.1:4173", wait_until="networkidle")
    assert page.locator('.episode-card').count() == 45
    assert page.locator('#recorded-count').inner_text() == '4'
    assert 'Mulan' in page.locator('#episode-detail h2').inner_text()
    assert page.locator('#atlantica-route').is_visible()
    page.locator('[data-route-episode="11"]').click()
    assert 'Atlantica' in page.locator('#episode-detail h2').inner_text()
    assert 'Swim This Way' in page.locator('#episode-detail').inner_text()
    assert page.evaluate('EPISODES[10].world === "Atlantica → Port Royal" && EPISODES.length === 45')
    page.locator('[data-route-episode="16"]').click()
    assert 'Atlantica' in page.locator('#episode-detail h2').inner_text()
    assert 'Under the Sea' in page.locator('#episode-detail').inner_text()
    page.locator('[data-route-episode="22"]').click()
    assert 'Ursula' in page.locator('#episode-detail h2').inner_text()
    page.locator('[data-route-episode="26"]').click()
    assert 'A New Day' in page.locator('#episode-detail h2').inner_text()
    page.locator('[data-episode="5"]').click()
    assert page.evaluate('EPISODES.every((e, i) => e.id === i + 1 && e.objectives.length && e.encounters && e.stop)')
    assert page.evaluate('BOSSES.length === 21 && new Set(BOSSES.map(b => b.id)).size === 21')
    assert page.evaluate('EPISODES.every(e => e.start && e.prep.length >= 2 && e.objectives.length >= 5 && e.cutscenes.length && e.tactics.length && e.commentary.length && e.pickups)')
    assert page.evaluate('BOSSES.every(b => b.episode <= 43) && EPISODES.slice(43).every(e => e.kind === "watch")')
    assert page.evaluate('EPISODES.every(e => e.timing.recordingMax >= e.timing.editedMax)')
    page.locator('[data-objective="5-0"]').check()
    page.locator('#episode-notes').fill('Record the gate defense. <script>literal note</script>')
    page.locator('#episode-status').select_option('recorded')
    page.reload(wait_until='networkidle')
    assert page.locator('[data-objective="5-0"]').is_checked()
    assert page.locator('#episode-notes').input_value().endswith('<script>literal note</script>')
    assert page.locator('#recorded-count').inner_text() == '5'
    page.locator('#continue-button').click()
    assert 'Beast Behind' in page.locator('#episode-detail h2').inner_text()
    page.locator('#search').fill('Sephiroth')
    assert page.locator('[data-episode="32"]').is_visible()
    page.locator('#search').fill('no-such-episode-abc')
    assert page.locator('#empty-state').is_visible()
    page.locator('#clear-search').click()
    page.locator('[data-filter="endgame"]').click()
    assert page.locator('.episode-card').count() == 13
    page.locator('[data-filter="watch"]').click()
    assert page.locator('.episode-card').count() == 2
    page.locator('[data-episode="44"]').click()
    assert 'Day 193' in page.locator('.stop-box').inner_text()
    page.locator('#next-episode').click()
    assert 'Day 194' in page.locator('.start-box').inner_text()
    assert page.locator('#next-episode').is_disabled()
    page.locator('[data-view="bosses"]').click()
    page.locator('[data-boss="sephiroth"]').check()
    assert page.locator('#boss-count').inner_text() == '1'
    page.locator('[data-boss-episode="43"]').click()
    assert 'Lingering Will' in page.locator('#episode-detail h2').inner_text()
    assert not page.locator('#next-episode').is_disabled()
    with page.expect_download() as downloaded:
        page.locator('#export-button').click()
    backup = json.loads(Path(downloaded.value.path()).read_text())
    assert backup['games']['kh2fm']['bosses']['sephiroth'] is True
    assert backup['games']['kh2fm']['statuses']['5'] == 'recorded'
    assert backup['version'] == 3
    page.on('dialog', lambda dialog: dialog.accept())
    page.locator('#import-file').set_input_files({"name":"backup.json", "mimeType":"application/json", "buffer":json.dumps(backup).encode()})
    assert page.locator('#toast').inner_text() == 'Progress backup restored.'
    # Old Part 45 was Lingering Will, not the movie. Preserve notes with their subject.
    legacy = {"version":1,"statuses":{"1":"recorded","31":"recorded","32":"planned","45":"published"},"notes":{"31":"Zexion notes","32":"Vexen notes","45":"Armor victory"},"objectives":{"45-0":True},"bosses":{"lingering-will":True}}
    page.locator('#import-file').set_input_files({"name":"old-route.json","mimeType":"application/json","buffer":json.dumps(legacy).encode()})
    page.wait_for_function('state.legacyProgress?.version === 1')
    assert page.evaluate('state.notes[43] === "Armor victory" && !state.notes[45] && state.statuses[43] === "published" && !state.statuses[45]')
    assert page.evaluate('state.notes[31].includes("Zexion notes") && state.notes[31].includes("Vexen notes") && state.statuses[31] === "planned"')
    assert page.evaluate('!state.objectives["43-0"] && state.legacyProgress.objectives["45-0"] && state.bosses["lingering-will"]')
    page.reload(wait_until='networkidle')
    assert page.locator('#episode-notes').input_value() == 'Armor victory'
    # Reset only this isolated test browser to inspect the default composition.
    page.evaluate('localStorage.clear()')
    page.goto('http://127.0.0.1:4173/#episode-5', wait_until='networkidle')
    page.reload(wait_until='networkidle')
    page.evaluate('window.scrollTo(0, 0)')
    assert page.locator('#recorded-count').inner_text() == '4'
    artifacts = ROOT / '.checks'
    artifacts.mkdir(exist_ok=True)
    page.screenshot(path=str(artifacts / 'desktop.png'), full_page=True)
    for width in [390, 768, 1024, 1440]:
        page.set_viewport_size({"width":width,"height":900})
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), f'Overflow at {width}'
        assert page.locator('#export-button').is_visible(), f'Backup control hidden at {width}'
    page.set_viewport_size({"width":390,"height":844})
    page.screenshot(path=str(artifacts / 'mobile.png'), full_page=True)
    page.locator('[data-episode="6"]').click()
    assert 'Beast Behind' in page.locator('#episode-detail h2').inner_text()
    page.locator('[data-view="prep"]').click()
    assert page.locator('#prep-view').is_visible()
    page.evaluate('(legacy) => { localStorage.clear(); localStorage.setItem("wayfinder-kh2fm-v1", JSON.stringify(legacy)); }', legacy)
    page.goto('http://127.0.0.1:4173/#episode-43', wait_until='networkidle')
    page.reload(wait_until='networkidle')
    assert page.locator('#episode-notes').input_value() == 'Armor victory'
    assert page.evaluate('localStorage.getItem("wayfinder-kh2fm-v1") !== null && JSON.parse(localStorage.getItem("wayfinder-kh2fm-v2")).version === 2')
    assert not errors, errors
    browser.close()
print('PASS: 45 detailed episodes, all bosses before Days, movie continuity, persistence, legacy migration, navigation, filters, backup round trip, and four responsive widths; no browser errors.')
