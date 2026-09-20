import assert from 'node:assert/strict';
import {LANDMARK_LIFE,LANDMARK_TEXT} from '../src/landmark-life-data.js';
import {DESIGNS} from '../src/heritage.js';
// Prequalified state for geometry/cost tests only. Actual progression is tested in landmark-life.test.js.
export function qualifyLandmark(t,b){
 const s=LANDMARK_LIFE[b.design];if(!s)return;
 const design={shop:'tea',work:'kiln',school:'villageSchool'}[s.companion]||s.companion;
 assert(t.place(DESIGNS[design].type,[{x:b.design==='yueyangTower'?0:2,z:0}],true,design));
 t.journey.literary[s.quest].activity={stage:3,selection:[],visited:[]};
 t.journey.landmarks={sequence:0,active:null,visits:{[b.design]:{count:2,lastAt:0,days:[0,1],served:2}},history:[],benefitDay:-1,beneficiaries:[]};
 t.journey.landmarkReflections={[b.design]:true};
 const other=b.design==='moonTerrace'?'yueyangTower':'moonTerrace';
 t.journey.landmarkConnections={[b.design]:{other,quote:LANDMARK_TEXT[b.design][1],otherQuote:LANDMARK_TEXT[other][1],note:'模型及成本測試預先具備閱讀與服務資格；真實流程另有整合測試。'}};
}
