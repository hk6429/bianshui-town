import '../src/journey-ui.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {claimMilestone} from '../src/journey.js';
import {markRead} from '../src/reading-collection.js';
import {respondCommission} from '../src/commissions.js';
import {sessionBaseline,sessionSummary,sessionSummaryHTML} from '../src/journey-summary.js';
function town(){const t=new Town();t.place('home',[{x:0,z:0}],true);t.tick(.05);t.journey.enabled=true;return t;}
test('one actual milestone, reading and completed commission appear once; review itself never changes town',()=>{
 const t=town(),b=sessionBaseline(t);assert(claimMilestone(t,'settlement'));assert(markRead(t,'su'));assert(respondCommission(t,t.people[0].id,'accept','garden'));t.place('garden',[{x:1,z:0}],true,'garden');assert(respondCommission(t,t.people[0].id,'complete'));
 t.place('home',[{x:-1,z:0}],true);t.tick(.05);const before=structuredClone(t.toJSON());for(let i=0;i<10;i++){const r=sessionSummary(t,b);assert.equal(r.stamps.length,1);assert.equal(r.read.length,1);assert.equal(r.commissions.length,1);assert(r.achieved);sessionSummaryHTML(t,b);}assert.deepEqual(t.toJSON(),before);
});
test('existing records are excluded, normal transactional town replacement preserves baseline, explicitly new session starts empty',()=>{
 const t=town();markRead(t,'su');const baseline=sessionBaseline(t);assert.equal(sessionSummary(t,baseline).read.length,0);const replaced=Town.restore(t.toJSON());markRead(replaced,'li');assert.equal(sessionSummary(replaced,baseline).read.length,1);assert.equal(sessionSummary(replaced,sessionBaseline(replaced)).read.length,0);
});
test('review allows stopping before vision and escapes resident-provided labels',()=>{
 const t=new Town(),b=sessionBaseline(t);t.journey.commissions=[{resident:1,name:'<img src=x>',venue:'<script>x</script>',state:'completed'}];assert(!sessionSummary(t,b).achieved);const html=sessionSummaryHTML(t,b);assert.match(html,/結束本次觀察並暫停/);assert.match(html,/&lt;img/);assert(!html.includes('<script>'));assert.match(html,/尚在營造中/);
});
