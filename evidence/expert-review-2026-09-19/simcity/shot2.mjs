import {chromium} from '@playwright/test';
const out='/Users/naichengchen/projects/bianshui-town/evidence/expert-review-2026-09-19/simcity/';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('https://bianshui-town.pages.dev/',{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(2000);
await p.click('#demo-btn');await p.waitForTimeout(3000);
await p.click('#tools-toggle');await p.waitForTimeout(500);
await p.click('#blueprints-btn');await p.waitForTimeout(600);
await p.click('[data-size="4"]');await p.click('[data-design-filter="garden"]');await p.waitForTimeout(400);
const card=await p.evaluateHandle(()=>[...document.querySelectorAll('.blueprint-card')].find(c=>c.textContent.includes('方塘書院')));
await card.asElement().scrollIntoViewIfNeeded();await p.waitForTimeout(400);
await p.screenshot({path:out+'10-blueprints-academy-card.png'});
const order=await p.evaluate(()=>[...document.querySelectorAll('.blueprint-card h3')].map(h=>h.textContent));
console.log(JSON.stringify({gardenOrder4:order}));
await p.click('[data-design-filter="all"]');await p.waitForTimeout(300);
console.log(JSON.stringify({allOrder4:await p.evaluate(()=>[...document.querySelectorAll('.blueprint-card h3')].map(h=>h.textContent))}));
await p.keyboard.press('Escape');await p.click('#tools-toggle').catch(()=>{});await p.waitForTimeout(300);
// zoom in on demo town
for(let i=0;i<4;i++){await p.click('#zoom-in');await p.waitForTimeout(200);}
await p.waitForTimeout(1200);
await p.screenshot({path:out+'11-demo-town-closeup.png'});
// speed up & let time pass, then check fire alert & population
await b.close();
