import {readFile,writeFile,mkdir} from 'node:fs/promises';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const html=await readFile('dist/index.html','utf8'),assets=[...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(m=>m[1]),rows=[];
for(const base of ['https://bianshui-town.pages.dev','https://bianshui-town.netlify.app']) {
 const remote=await(await fetch(base+'/?release=continuity-7bead88')).text();
 for(const asset of assets) {assert(remote.includes(asset));const a=await readFile('dist'+asset),b=Buffer.from(await(await fetch(base+asset)).arrayBuffer());assert.equal(createHash('sha256').update(a).digest('hex'),createHash('sha256').update(b).digest('hex'));}
 const config=await(await fetch(base+'/api/config')).json();assert.equal(config.configured,true);
 rows.push({base,assetsMatched:assets.length,configured:config.configured});
}
await mkdir('evidence/gamification/continuity-production',{recursive:true});
await writeFile('evidence/gamification/continuity-production/readback.json',JSON.stringify({commit:'7bead88',checkedAt:new Date().toISOString(),sites:rows},null,2));
console.log(JSON.stringify(rows));
