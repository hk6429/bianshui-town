import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://127.0.0.1:5193';
const out=process.env.CONTINUITY_EVIDENCE||'evidence/gamification/continuity';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.TEST_CHROMIUM_PATH});
const results=[];
try {
 for(const primary of ['aid','time'])for(const followup of ['repair','reserve']) {
  const context=await browser.newContext({viewport:{width:390,height:844}});
  try {
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/?classroom=yueyang&support=story');
   await expect(page.locator('.adventure-panel')).toBeVisible();
   for(let i=0;i<3;i++)await page.locator('[data-adventure-action=visit]:enabled').first().click();
   await page.locator('[data-adventure-action=decide][data-adventure-choice='+primary+']').click();
   await page.locator('[data-adventure-action=resolve][data-adventure-choice='+followup+']').click();
   if(!(await page.locator('.adventure-history').evaluate(e=>e.open)))await page.locator('.adventure-history summary').click();
   await page.locator('[data-adventure-action=reset]').click();
   const section=page.locator('.adventure-continuity');
   await expect(section).toBeVisible();
   const details=section.locator('summary');
   if(await details.count())await details.first().click();
   const evidence=page.locator('[data-adventure-field=evidence]');
   await expect(evidence).toBeVisible();
   await evidence.selectOption({index:1});
   const reason='我原以為安排好眼前需要就足夠，新的居民線索讓我注意到未受照顧的人；原文支持持續關心百姓，不能直接當成唯一工程方案。';
   await page.locator('[data-adventure-field=reflection]').fill(reason);
   // Another resident interaction must not erase the reflection draft.
   await page.locator('[data-adventure-action=visit]:enabled').first().click();
   const reopened=page.locator('.adventure-continuity summary');
   if(await reopened.count() && !(await evidence.isVisible()))await reopened.first().click();
   await expect(page.locator('[data-adventure-field=reflection]')).toHaveValue(reason);
   await page.locator('[data-adventure-action=reflect]').focus();
   await page.keyboard.press('Enter');
   await page.reload();
   await expect(page.locator('.adventure-continuity')).toContainText(reason);
   assert(await page.locator('#literary-quests').evaluate(e=>e.scrollWidth<=e.clientWidth));
   assert.deepEqual(errors,[]);
   await page.locator('.adventure-continuity').scrollIntoViewIfNeeded();
   await page.screenshot({path:out+'/'+primary+'-'+followup+'.png'});
   results.push({primary,followup,draftRetained:true,keyboardSave:true,savedAfterReload:true,mobile390:true,errors});
  }finally{await context.close();}
 }
 await writeFile(out+'/result.json',JSON.stringify({base,checkedAt:new Date().toISOString(),paths:results},null,2));
 console.log('four continuity branches, draft and reload passed');
}finally{await browser.close();}
