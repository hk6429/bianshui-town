import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {validateSave} from '../src/save-schema.js';
import {editTown} from '../src/town-edit.js';
import {upgradeBuilding,moveBuilding,demolishBuilding} from '../src/urban.js';
import {commitJourney} from '../src/journey.js';
import {cleanPlaceName,townName,renameTown,renameBuilding,saveBookmark,removeBookmark,bookmarkTarget,bookmarksHTML} from '../src/place-identity.js';
import {constructionHTML} from '../src/building-life.js';
const town=()=>{const t=new Town();t.place('home',[{x:0,z:0}],true);t.place('shop',[{x:1,z:0}],true,'tea');t.place('shop',[{x:-1,z:0}],true,'tea');t.tick(.05);return t;};
test('town naming trims input, preserves brand fallback, bounds names and survives save round-trip',()=>{
 const t=town();assert.equal(townName(t),'汴水小鎮');assert(renameTown(t,'  柳岸鎮  '));assert.equal(townName(Town.restore(t.toJSON())),'柳岸鎮');assert.match(constructionHTML(t),/柳岸鎮/);
 for(const value of ['', '   ','甲'.repeat(25),null,3,'城\n鎮']){assert.equal(cleanPlaceName(value),null);assert.equal(renameTown(t,value),false);}assert.equal(townName(t),'柳岸鎮');assert(cleanPlaceName('甲'.repeat(24)));
});
test('only one tea shop is renamed; live destinations follow while historical text stays historical',()=>{
 const t=town(),shops=t.buildings.filter(b=>b.type==='shop'),[a,b]=shops,old=a.name,p=t.people[0];p.destination=a.id;p.action=`前往${old}`;p.diary=[{time:t.time,text:`前往${old}`}];const other=b.name;
 assert(renameBuilding(t,a.id,'聽雨茶坊'));assert.equal(a.originalName,old);assert.equal(b.name,other);assert.equal(t.building(p.destination).name,'聽雨茶坊');assert.equal(p.action,'前往聽雨茶坊');assert.equal(p.diary[0].text,`前往${old}`);assert.equal(Town.restore(t.toJSON()).building(a.id).name,'聽雨茶坊');
});
test('custom home name survives upgrade and moving while template type is retained',()=>{
 const t=town(),b=t.buildings[0];renameBuilding(t,b.id,'小滿之家');assert(upgradeBuilding(t,b.id));assert.equal(b.name,'小滿之家');assert(b.originalName);assert(moveBuilding(t,b.id,{x:0,z:2}));assert.equal(b.name,'小滿之家');assert.doesNotThrow(()=>validateSave(t.toJSON()));
});
test('two bookmarks resolve independently, follow moved places and report demolished places without guessing',()=>{
 const t=town(),[a,b]=t.buildings;assert(saveBookmark(t,a.id,'我的家'));assert(saveBookmark(t,b.id,'喝茶處'));assert.equal(bookmarkTarget(t,a.id),a);assert.equal(bookmarkTarget(t,b.id),b);assert.equal(saveBookmark(t,b.id,'喝茶處'),false);assert(saveBookmark(t,b.id,'午後茶席'));assert.equal(t.journey.bookmarks.length,2);
 assert(moveBuilding(t,a.id,{x:0,z:2}));assert.equal(bookmarkTarget(t,a.id).z,2);assert(removeBookmark(t,a.id));assert.equal(bookmarkTarget(t,a.id),null);assert.equal(bookmarkTarget(t,b.id),b);assert(demolishBuilding(t,b.id));assert.equal(bookmarkTarget(t,b.id),null);assert.match(bookmarksHTML(t),/已失效/);assert.doesNotThrow(()=>Town.restore(t.toJSON()));assert(removeBookmark(t,b.id));assert.equal(t.journey.bookmarks.length,0);
});
test('storage failure leaves names and bookmarks unchanged; HTML-like names display as text',()=>{
 const t=town(),before=structuredClone(t.toJSON()),id=t.buildings[0].id;assert.equal(commitJourney(t,d=>renameTown(d,'失敗鎮'),()=>({ok:false})),false);assert.deepEqual(t.toJSON(),before);
 const result=editTown(t,d=>renameBuilding(d,id,'失敗樓'),{persist:()=>({ok:false})});assert.equal(result.ok,false);assert.deepEqual(t.toJSON(),before);assert(saveBookmark(t,id,'<img src=x>'));assert(!bookmarksHTML(t).includes('<img src=x>'));assert.match(bookmarksHTML(t),/&lt;img/);
});
test('old files without identity restore; malformed names, duplicate or excessive bookmarks fail schema',()=>{
 const t=town(),data=t.toJSON();assert.doesNotThrow(()=>validateSave(data));
 for(const v of [null,'','空\n白','甲'.repeat(25)])assert.throws(()=>validateSave({...data,journey:{...data.journey,townName:v}}));
 for(const bookmarks of [[{building:1,label:'甲'},{building:1,label:'乙'}],Array.from({length:17},(_,i)=>({building:100+i,label:'舊地點'}))])assert.throws(()=>validateSave({...data,journey:{...data.journey,bookmarks}}));
 t.journey.bookmarks=Array.from({length:16},(_,i)=>({building:100+i,label:'舊地點'}));assert.equal(saveBookmark(t,t.buildings[0].id,'新增'),false);assert.doesNotThrow(()=>validateSave(t.toJSON()));
});
