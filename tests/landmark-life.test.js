import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {addResident} from '../src/city-growth.js';
import {scheduleLandmark,tickLandmarkLife,landmarkResidentAction,LANDMARK_LIFE} from '../src/landmark-life.js';
import {LANDMARK_TEXT,landmarkUpgrade,reflectLandmark,connectLandmarks} from '../src/landmark-upgrades.js';
import {upgradeBuilding} from '../src/urban.js';
import {commitJourney} from '../src/journey.js';
function setup(design='yueyangTower'){
 const t=new Town();t.journey.literary=Object.fromEntries(Object.values(LANDMARK_LIFE).map(s=>[s.quest,{step:4,note:'',activity:{stage:3,selection:[],visited:[]}}]));
 t.place('home',[{x:0,z:0}],true,'residence');const home=t.buildings[0];
 // Exercise road travel using a separate existing footprint, then set its landmark identity.
 t.place('garden',[{x:1,z:0}],true,'garden');const b=t.buildings[1];b.design=design;b.name=design;
 const p=addResident(t,home);p.current=home.id;p.outside=false;p.health=100;
 return {t,b,p};
}
function run(t,b){assert(scheduleLandmark(t,b.id));t.time=t.journey.landmarks.active.at;tickLandmarkLife(t);for(let i=0;i<130&&t.journey.landmarks.active;i++){t.elapsed+=1;tickLandmarkLife(t);for(const p of t.people)if(landmarkResidentAction(t,p))t.move(p,1);}return t.journey.landmarks;}
test('all ten landmark events wait for real road arrival and persist capped service without creating funds',()=>{
 for(const design of Object.keys(LANDMARK_LIFE)){const {t,b,p}=setup(design),money=t.city.treasury;scheduleLandmark(t,b.id);t.time=t.journey.landmarks.active.at;tickLandmarkLife(t);assert.equal(t.journey.landmarks.active.phase,'gathering');assert.equal(t.journey.landmarks.visits[design],undefined);assert(p.route.length>0);
 for(let i=0;i<130&&t.journey.landmarks.active;i++){t.elapsed++;tickLandmarkLife(t);if(landmarkResidentAction(t,p))t.move(p,1);}
 assert.equal(t.journey.landmarks.visits[design].count,1,design);assert.equal(p.education,2);assert.equal(t.city.treasury,money);assert.equal(t.journey.landmarks.history[0].participants[0],p.id);
 // Same game day replay cannot grant another service bonus.
 const at=t.time;scheduleLandmark(t,b.id);t.journey.landmarks.active.at=at;tickLandmarkLife(t);t.elapsed+=19;tickLandmarkLife(t);assert.equal(p.education,2);assert.equal(t.journey.landmarks.visits[design].served,1);
 }
});
test('disconnected roads, demolished venue and absent participants cannot complete activities',()=>{
 const {t,b}=setup();t.roads=new Set();const s=run(t,b);assert.equal(s.history[0].success,false);assert.equal(s.visits[b.design],undefined);
 const v=setup();scheduleLandmark(v.t,v.b.id);v.t.buildings=v.t.buildings.filter(x=>x.id!==v.b.id);tickLandmarkLife(v.t);assert.equal(v.t.journey.landmarks.history[0].success,false);
 const a=setup();scheduleLandmark(a.t,a.b.id);a.t.time=a.t.journey.landmarks.active.at;tickLandmarkLife(a.t);a.t.elapsed+=91;tickLandmarkLife(a.t);assert.equal(a.t.journey.landmarks.history[0].success,false);
});
test('upgrade gates protect money and do not downgrade legacy levels; extended reading requires scene work',()=>{
 const {t,b}=setup();const balance=t.city.treasury;assert.equal(upgradeBuilding(t,b.id),false);assert.equal(t.city.treasury,balance);b.tier=3;assert.equal(landmarkUpgrade(t,b).allowed,false);assert.equal(b.tier,3);
 b.tier=2;t.journey.literary.yueyang.activity.stage=0;assert.equal(reflectLandmark(t,b.id,0),false);t.journey.literary.yueyang.activity.stage=3;assert.equal(reflectLandmark(t,b.id,1),false);assert(reflectLandmark(t,b.id,0));assert(landmarkUpgrade(t,b).allowed);assert(upgradeBuilding(t,b.id));assert.equal(b.tier,3);
});
test('cross-work comparison requires visits and both complete scenes; failed persistence rolls back scheduled event',()=>{
 const {t,b}=setup();assert.equal(connectLandmarks(t,b.id,'moonTerrace',0,'岳陽樓寫超越個人的憂樂，望月臺則由個人思念走向對遠人的祝福。',LANDMARK_TEXT[b.design][1],LANDMARK_TEXT.moonTerrace[1]),false);assert.equal(commitJourney(t,d=>scheduleLandmark(d,b.id),()=>({ok:false})),false);assert.equal(t.journey.landmarks,undefined);
 run(t,b);t.journey.landmarks.visits.moonTerrace={count:1,lastAt:t.elapsed,days:[0],served:1};assert.equal(connectLandmarks(t,b.id,'moonTerrace',1),false);assert(connectLandmarks(t,b.id,'moonTerrace',0,'岳陽樓寫超越個人的憂樂，望月臺則由個人思念走向對遠人的祝福。',LANDMARK_TEXT[b.design][1],LANDMARK_TEXT.moonTerrace[1]));b.tier=4;assert(landmarkUpgrade(t,b).allowed);assert.equal(connectLandmarks(t,b.id,'moonTerrace',0,'岳陽樓寫超越個人的憂樂，望月臺則由個人思念走向對遠人的祝福。',LANDMARK_TEXT[b.design][1],LANDMARK_TEXT.moonTerrace[1]),false);
});

test('persisted activity schema rejects forged future records, duplicate beneficiaries and invalid participants',async()=>{
 const {landmarkLifeSchema,validateLandmarkChronology}=await import('../src/landmark-life-save.js');
 const {t,b}=setup();run(t,b);const saved=JSON.parse(JSON.stringify(t.journey.landmarks));assert.doesNotThrow(()=>landmarkLifeSchema(saved));assert.doesNotThrow(()=>validateLandmarkChronology(t));
 saved.beneficiaries.push(saved.beneficiaries[0]);assert.throws(()=>landmarkLifeSchema(saved));
 t.journey.landmarks.history[0].at=t.elapsed+1;assert.throws(()=>validateLandmarkChronology(t));
});

test('four sequential upgrade tasks require real support, reading, different-day service and another work',()=>{
 const {t,b}=setup();run(t,b);assert.equal(landmarkUpgrade(t,b).allowed,false);
 assert(t.place('garden',[{x:2,z:0}],true,'granary'));assert(landmarkUpgrade(t,b).allowed);assert(upgradeBuilding(t,b.id));assert.equal(b.tier,2);
 assert.equal(upgradeBuilding(t,b.id),false);assert(reflectLandmark(t,b.id,0));assert(upgradeBuilding(t,b.id));assert.equal(b.tier,3);assert.equal(upgradeBuilding(t,b.id),false);
 run(t,b);assert.equal(t.journey.landmarks.visits[b.design].days.length,2);assert(upgradeBuilding(t,b.id));assert.equal(b.tier,4);assert.equal(upgradeBuilding(t,b.id),false);
 const other=t.buildings.find(x=>x.design==='granary');other.design='moonTerrace';run(t,other);assert(connectLandmarks(t,b.id,'moonTerrace',0,'岳陽樓寫超越個人的憂樂，望月臺則由個人思念走向對遠人的祝福。',LANDMARK_TEXT[b.design][1],LANDMARK_TEXT.moonTerrace[1]));assert(upgradeBuilding(t,b.id));assert.equal(b.tier,5);assert.equal(upgradeBuilding(t,b.id),false);
});

test('real Town.tick preserves event attendance through rain and competing street stories; restores scheduled and completed records',()=>{
 const t=new Town();t.journey.literary=Object.fromEntries(Object.values(LANDMARK_LIFE).map(s=>[s.quest,{step:4,note:'',activity:{stage:3,selection:[],visited:[]}}]));
 assert(t.place('home',[{x:-1,z:0}],true,'residence'));const home=t.buildings[0];
 assert(t.place('garden',[{x:1,z:0},{x:2,z:0},{x:1,z:1},{x:2,z:1}],true,'yueyangTower'));const b=t.buildings[1];
 assert(t.place('shop',[{x:-1,z:1}],true,'tea'));for(let i=0;i<4;i++)addResident(t,home);
 t.weather={mode:'rain',raining:true,nextAt:1e12};assert(scheduleLandmark(t,b.id));
 const resumed=Town.restore(t.toJSON());assert.equal(resumed.journey.landmarks.active.phase,'scheduled');resumed.time=resumed.journey.landmarks.active.at;resumed.stories.nextAt=0;
 for(let i=0;i<160&&resumed.journey.landmarks.active;i++)resumed.tick(1);
 assert.equal(resumed.journey.landmarks.history[0].success,true);assert(resumed.journey.landmarks.history[0].participants.length>0);assert.equal(resumed.weather.raining,true);
 const saved=Town.restore(resumed.toJSON());assert.deepEqual(saved.journey.landmarks,resumed.journey.landmarks);
 // Same event hook remains active when ordinary street storytelling is eligible.
 saved.weather={mode:'clear',raining:false,nextAt:1e12};assert(scheduleLandmark(saved,b.id));saved.time=saved.journey.landmarks.active.at;saved.stories.active=null;saved.stories.nextAt=0;
 for(let i=0;i<160&&saved.journey.landmarks.active;i++){saved.tick(1);const e=saved.journey.landmarks.active;if(e)for(const id of e.participants)assert(!saved.people.find(p=>p.id===id)?.streetEvent);}
 assert.equal(saved.journey.landmarks.visits.yueyangTower.count,2);
});
test('sick participant leaves actual Town.tick gathering and cannot earn a visit',()=>{
 const {t,b,p}=setup();t.city.mode='managed';t.city.treasury=1000000;scheduleLandmark(t,b.id);t.time=t.journey.landmarks.active.at;tickLandmarkLife(t);p.health=10;
 for(let i=0;i<110&&t.journey.landmarks.active;i++)t.tick(1);
 assert.equal(t.journey.landmarks.history[0].success,false);assert.equal(t.journey.landmarks.visits[b.design],undefined);
});
test('cross comparison rejects omitted excerpts and short notes; persists both actual quotations and note',()=>{
 const {t,b}=setup();run(t,b);t.journey.landmarks.visits.moonTerrace={count:1,lastAt:t.elapsed,days:[0],served:1};
 assert.equal(connectLandmarks(t,b.id,'moonTerrace',0),false);assert.equal(connectLandmarks(t,b.id,'moonTerrace',0,'都很感人',...['不以物喜，不以己悲。','但願人長久，千里共嬋娟。']),false);
 const note='岳陽樓寫超越個人的憂樂，望月臺則由個人思念走向對遠人的祝福。';
 assert(connectLandmarks(t,b.id,'moonTerrace',0,note,LANDMARK_TEXT.yueyangTower[1],LANDMARK_TEXT.moonTerrace[1]));assert.equal(t.journey.landmarkConnections.yueyangTower.note,note);assert.equal(t.journey.landmarkConnections.yueyangTower.otherQuote,LANDMARK_TEXT.moonTerrace[1]);
});

test('moving residents at fractional coordinates can be invited through their actual road anchor',()=>{
 const {t,b,p}=setup();const home=t.building(p.home);p.outside=true;p.current=null;p.x=home.entrance[0]+.2;p.z=home.entrance[1];p.socialUntil=0;
 scheduleLandmark(t,b.id);t.time=t.journey.landmarks.active.at;tickLandmarkLife(t);assert(t.journey.landmarks.active);assert(t.journey.landmarks.active.participants.includes(p.id));assert(p.route.length>0);
});
