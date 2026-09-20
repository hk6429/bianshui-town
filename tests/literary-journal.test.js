import {test} from 'node:test';import assert from 'node:assert/strict';
import {JOURNAL_PROMPTS,journalSaved,journalIllustration} from '../src/literary-journal.js';
import {LITERARY_QUESTS} from '../src/literary-quests.js';
test('ten works expose distinct writing tasks; recollection page includes illustration and escapes personal text',()=>{
 assert.deepEqual(Object.keys(JOURNAL_PROMPTS).sort(),Object.keys(LITERARY_QUESTS).sort());assert.equal(new Set(Object.values(JOURNAL_PROMPTS).map(p=>p[0])).size,10);
 const page=journalSaved('creek','<img src=x onerror=alert(1)>');assert.match(page,/作品回憶示意圖/);assert.match(page,/&lt;img/);assert.doesNotMatch(page,/<img/);assert.equal(journalSaved('creek',''),'');assert.equal(journalIllustration('printing'),'');
});
