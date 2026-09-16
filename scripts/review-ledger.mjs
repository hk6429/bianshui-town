import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const ledger=JSON.parse(readFileSync(new URL('../docs/review/ledger.json',import.meta.url)));
assert.equal(ledger.items.length,100,'必須保留 100 個獨立驗收項');
assert.equal(new Set(ledger.items.map(i=>i.id)).size,100,'ID 不可重複');
for(const prefix of ['C','O','U','E'])for(let n=1;n<=25;n++){
 const id=prefix+String(n).padStart(2,'0'),item=ledger.items.find(i=>i.id===id);
 assert(item,`缺少 ${id}`);for(const field of ['title','fix','acceptance','baselineEvidence'])assert(item[field]?.length,`${id} 缺 ${field}`);
 assert(['open','in_progress','implemented','verified'].includes(item.status),`${id} 狀態無效`);
 if(item.status==='verified'){assert(item.implementation?.length,`${id} 缺實作來源`);assert(item.evidence?.length,`${id} 缺驗收證據`);assert(item.verifiedBy,`${id} 缺查核者`);}
}
const counts={};for(const item of ledger.items)counts[item.status]=(counts[item.status]||0)+1;
console.log(JSON.stringify({items:100,counts,note:'帳本結構檢查不等於行為驗收，證據內容仍須逐項閱讀。'},null,2));
