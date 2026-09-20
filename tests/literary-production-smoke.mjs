import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const out='evidence/literary-release';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.TEST_CHROMIUM_PATH});const results=[];
for(const [name,url]of [['cloudflare','https://bianshui-town.pages.dev/'],['netlify','https://bianshui-town.netlify.app/']]){
 const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));const tool=async id=>{if(!await page.locator(id).isVisible())await page.locator('#tools-toggle').click();await page.locator(id).click();};await page.setViewportSize({width:1440,height:1000});await page.goto(url);await page.waitForFunction(()=>window.__townDebug);
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await tool('#literary-quests-btn');assert.equal(await page.locator('[data-quest]').count(),10);
 await page.locator('[data-quest="creek"]').click();await expect(page.locator('.literary-recollection svg')).toHaveAttribute('aria-label',/鷗鷺/);await expect(page.locator('.literary-history')).toContainText('文學地景');
 await page.locator('#literary-quests [data-close]').click();await tool('#save-manager-btn');await page.locator('#save-file').setInputFiles('evidence/literary-inspector/city.json');await expect(page.locator('#save-message')).toContainText('驗證通過');await page.locator('#save-apply').click();
 const tower=await page.evaluate(()=>window.__townDebug.town().buildings.find(b=>b.design==='yueyangTower').id);await tool('#city-list-btn');await page.locator(`[data-object-kind="building"][data-object-id="${tower}"]`).click();await expect(page.locator('#inspector')).toContainText('已達五級');await expect(page.locator('.landmark-comparison')).toContainText('關懷對象不同');await page.setViewportSize({width:390,height:844});await page.locator('.landmark-comparison').scrollIntoViewIfNeeded();assert(await page.locator('#inspector').evaluate(el=>el.scrollWidth<=el.clientWidth));await page.screenshot({path:`${out}/${name}-mobile.png`});
 assert.deepEqual(errors,[]);results.push({name,url,tenQuests:true,illustratedJournal:true,importedTier5:true,comparison:true,mobileWidth:390,errors});await context.close();
}
await browser.close();await writeFile(out+'/browser.json',JSON.stringify({scope:'isolated automated production browsers; no real user save modified',results},null,2));console.log('Both production browser smoke checks passed');
