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
    assert page.evaluate('EPISODES.every((e, i) => e.id === i + 1 && e.objectives.length && e.encounters && e.stop)')
    assert page.evaluate('BOSSES.length === 21 && new Set(BOSSES.map(b => b.id)).size === 21')
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
    assert page.locator('.episode-card').count() == 1
    page.locator('#search').fill('no-such-episode-abc')
    assert page.locator('#empty-state').is_visible()
    page.locator('#clear-search').click()
    page.locator('[data-filter="endgame"]').click()
    assert page.locator('.episode-card').count() == 15
    page.locator('[data-view="bosses"]').click()
    page.locator('[data-boss="sephiroth"]').check()
    assert page.locator('#boss-count').inner_text() == '1'
    page.locator('[data-boss-episode="45"]').click()
    assert 'Lingering Will' in page.locator('#episode-detail h2').inner_text()
    assert page.locator('#next-episode').is_disabled()
    with page.expect_download() as downloaded:
        page.locator('#export-button').click()
    backup = json.loads(Path(downloaded.value.path()).read_text())
    assert backup['bosses']['sephiroth'] is True
    assert backup['statuses']['5'] == 'recorded'
    page.on('dialog', lambda dialog: dialog.accept())
    page.locator('#import-file').set_input_files({"name":"backup.json", "mimeType":"application/json", "buffer":json.dumps(backup).encode()})
    assert page.locator('#toast').inner_text() == 'Progress backup restored.'
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
    assert not errors, errors
    browser.close()
print('PASS: all 45 episodes, persistence, notes escaping, navigation, filters, boss tracking, backup round trip, and four responsive widths; no browser errors.')
