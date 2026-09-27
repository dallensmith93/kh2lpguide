"""Run against npm start: python library_smoke_test.py."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1440,"height":1000})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:4173',wait_until='networkidle')
    page.locator('#episode-notes').fill('KH preserved')
    page.locator('#game-select').select_option('ff9')
    assert page.locator('.episode-card').count()==45
    assert page.locator('#recorded-count').inner_text()=='0'
    assert page.locator('#episode-notes').input_value()==''
    page.locator('#episode-notes').fill('FF9 <literal>')
    page.locator('#episode-status').select_option('published')
    page.locator('[data-objective="activity-1-0"]').check()
    page.locator('[data-view="bosses"]').click()
    page.locator('[data-boss="disc-1"]').check()
    page.locator('#game-select').select_option('spiderman-ctns')
    assert page.locator('.episode-card').count()==20
    assert page.locator('#recorded-count').inner_text()=='0'
    assert page.locator('#episode-notes').input_value()==''
    assert not page.locator('[data-objective="activity-1-0"]').is_checked()
    page.locator('#episode-notes').fill('Spider patrol ledger')
    page.locator('#episode-status').select_option('recorded')
    page.locator('[data-episode="20"]').click()
    assert page.locator('#next-episode').is_disabled()
    assert '/ 20' in page.locator('.detail-footer').inner_text()
    page.reload(wait_until='networkidle')
    assert page.locator('#game-select').input_value()=='spiderman-ctns'
    assert page.locator('#next-episode').is_disabled()
    with page.expect_download() as download:page.locator('#download-roadmap').click()
    rows=json.loads(Path(download.value.path()).read_text())
    assert len(rows)==20 and rows[-1]['episodeNumber']==20 and rows[0]['gameId']=='spiderman-ctns'
    page.locator('#game-select').select_option('ff9')
    assert page.locator('#episode-notes').input_value()=='FF9 <literal>'
    assert page.locator('[data-objective="activity-1-0"]').is_checked()
    assert page.locator('#recorded-count').inner_text()=='1'
    assert page.locator('#boss-count').inner_text()=='1'
    page.locator('#search').fill('Necron')
    assert page.locator('[data-episode="44"]').is_visible()
    page.locator('#search').fill('')
    page.locator('#game-select').select_option('kh2fm')
    assert page.locator('#episode-notes').input_value()=='KH preserved'
    assert page.locator('#recorded-count').inner_text()=='4'
    with page.expect_download() as download:page.locator('#export-button').click()
    backup=json.loads(Path(download.value.path()).read_text())
    assert len(backup['games'])==3
    assert backup['games']['ff9']['notes']['1']=='FF9 <literal>'
    assert backup['games']['spiderman-ctns']['notes']['1']=='Spider patrol ledger'
    page.locator('#game-select').select_option('ff9')
    page.locator('#episode-notes').fill('Changed')
    page.on('dialog',lambda d:d.accept())
    page.locator('#import-file').set_input_files({'name':'library.json','mimeType':'application/json','buffer':json.dumps(backup).encode()})
    page.wait_for_function('activeGame === "kh2fm"')
    page.locator('#game-select').select_option('ff9')
    assert page.locator('#episode-notes').input_value()=='FF9 <literal>'
    # Import old KH v2 while FF9 is selected; it must touch only KH.
    old={'version':2,'notes':{'5':'Old KH note'},'statuses':{'5':'published'}}
    page.locator('#import-file').set_input_files({'name':'old.json','mimeType':'application/json','buffer':json.dumps(old).encode()})
    page.wait_for_function('activeGame === "kh2fm"')
    assert page.locator('#episode-notes').input_value()=='Old KH note'
    page.locator('#game-select').select_option('ff9')
    assert page.locator('#episode-notes').input_value()=='FF9 <literal>'
    # Direct links, bounds, browser history, and per-game UI restoration.
    page.goto('http://127.0.0.1:4173/#spiderman-ctns/episode-14',wait_until='networkidle')
    assert 'Silver Sable' in page.locator('#episode-detail h2').inner_text()
    page.goto('http://127.0.0.1:4173/#episode-5',wait_until='networkidle')
    assert page.locator('#game-select').input_value()=='kh2fm'
    assert 'Mulan' in page.locator('#episode-detail h2').inner_text()
    for game in ['ff9','spiderman-ctns','kh2fm']:
        page.locator('#game-select').select_option(game)
        for width in [390,768,1024,1440]:
            page.set_viewport_size({'width':width,'height':1000})
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(game,width)
            assert page.locator('#game-select').is_visible()
            assert page.locator('#export-button').is_visible()
        if game!='kh2fm':page.screenshot(path=f'.checks/{game}-desktop.png',full_page=True)
    assert not errors,errors
    browser.close()
print('PASS: game isolation, all-game backup/import, old KH import, JSON download, deep links, bounds, and 12 responsive checks.')
