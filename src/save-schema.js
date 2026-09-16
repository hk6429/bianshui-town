import {DESIGNS,isSquare} from './heritage.js';
import {AUTHORS} from './literati-data.js';
export const MAX_SAVE_BYTES=2_000_000;
const fail=(p,m)=>{throw new Error(`存檔 ${p}：${m}`);};
const num=(min=0,max=1e12,integer=false)=>(v,p)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||(integer&&!Number.isSafeInteger(v)))fail(p,'必須是範圍內的有限數值');};
const count=num(0,1e12,true),id=num(1,Number.MAX_SAFE_INTEGER-1000,true),actorId=num(-1e9,1e9,true),signed=num(-1e12,1e12),coord=num(-100,100),bool=(v,p)=>{if(typeof v!=='boolean')fail(p,'必須是布林值');};
const str=(v,p)=>{if(typeof v!=='string'||v.length>2048)fail(p,'必須是長度不超過 2048 的文字');};
const en=(values)=>(v,p)=>{if(!values.includes(v))fail(p,'未知狀態或類型');};
const opt=f=>({optional:true,check:f}),nullable=f=>(v,p)=>{if(v!==null)f(v,p);};
function obj(fields){return(v,p)=>{if(!v||typeof v!=='object'||Array.isArray(v))fail(p,'必須是物件');for(const k of Object.keys(v))if(!Object.hasOwn(fields,k))fail(`${p}.${k}`,'不接受的欄位');for(const [k,f]of Object.entries(fields)){if(!Object.hasOwn(v,k)){if(!f.optional)fail(`${p}.${k}`,'缺少必要欄位');}else(f.check||f)(v[k],`${p}.${k}`);}};}
const arr=(f,max=2048,min=0)=>(v,p)=>{if(!Array.isArray(v)||v.length>max||v.length<min)fail(p,`陣列筆數須介於 ${min} 至 ${max}`);v.forEach((x,i)=>f(x,`${p}[${i}]`));};
const pair=(v,p)=>{arr(coord,2,2)(v,p);};
const cell=obj({x:num(-8,2,true),z:num(-6,6,true)}),type=en(['home','shop','work','garden']);
const journal=obj({time:num(),text:str}),goods=['clay','timber','fiber','ceramics','furniture','cloth','legacy'];
const place=(v,p)=>{if(typeof v!=='string'||!(/^(boat|dock|sold)$|^(porter|ox|cart|input|output|shop):-?\d+$/.test(v)))fail(p,'無效貨物位置');};
const actorFields={id:actorId,x:coord,z:coord,route:arr(pair,4096),speed:num(0,10),name:opt(str),action:opt(str),angle:opt(signed),wait:opt(signed),carrying:opt(num(0,1024,true)),traffic:opt(str),laneOffset:opt(num(-2,2)),goal:opt(pair),walking:opt(bool),visible:opt(bool),kind:opt(en(['porter','ox','peddler','traveler','shopper','author'])),phase:opt(str)};
const person=obj({...actorFields,id,home:nullable(id),work:opt(nullable(id)),current:nullable(id),destination:nullable(id),outside:bool,socialUntil:opt(num()),chatCooldown:opt(num()),chatPartner:opt(id),shelter:opt(nullable(id)),streetEvent:opt(nullable(id)),eventSlot:opt(nullable(pair)),diary:opt(arr(journal,24)),diaryDay:opt(count),health:opt(num(0,100)),education:opt(num(0,100)),jobLostAt:opt(num()),buyAfter:opt(num()),needsSatisfiedUntil:opt(num()),hardship:opt(obj({unhoused:num(0,90),unemployed:num(0,180),unserved:num(0,360)}))});
const external=obj({...actorFields,phase:en(['outbound','fetch','load','store','deliver','return','choose','browse','watch','stall','bridge','leave','home','night']),kind:en(['porter','ox','peddler','traveler','shopper']),walking:bool,visible:bool,target:opt(nullable(id)),deliveryAt:opt(nullable(place)),stall:opt(en(['fruit','tea','snack','paper']))});
const author=en(AUTHORS.map(a=>a.id));
const authorActor=obj({...actorFields,author,kind:en(['author']),phase:en(['walking','writing','reading']),walking:bool,visible:bool,visits:count,progress:num(0,12),venue:str});
const building=obj({id,blockId:id,type,x:num(-8,2),z:num(-6,6),footprint:opt(arr(cell,4,4)),tier:opt(num(1,5,true)),level:opt(num(1,2,true)),design:opt(nullable(en(Object.keys(DESIGNS)))),born:num(-100),variant:num(0,2,true),stage:num(0,4,true),entrance:nullable(pair),name:str,facing:opt(signed),stock:opt(num(0,1024,true)),productionStatus:opt(str),fireWarningAt:opt(num()),fireDamage:opt(num(1,100)),fireRepairAt:opt(num()),waste:opt(num(0,1000)),pendingWaste:opt(num(0,1000000)),lastSupply:opt(num())});
const life=obj({version:en([1]),visitors:arr(external,64),porters:arr(external,64),oxen:arr(external,64),dock:obj({stock:num(0,1024,true),received:count,delivered:count,sold:count}),boat:obj({x:coord,z:coord,state:en(['approach','mooring','unloading','depart','away']),cargo:num(0,1024,true),imported:count,mast:num(0,1),trips:count,wait:signed,announced:bool}),socialCount:count,bridgePasses:count});
const story=obj({type:en(['story','market','tea']),title:str,gather:str,activity:str,end:str,id,center:pair,venue:str,phase:en(['gathering','active']),deadline:num(),until:opt(num()),participants:arr(id,4,1)});
const city=obj({version:en([1]),mode:en(['managed','sandbox']),logisticsLevel:opt(num(1,3,true)),trade:opt(obj({funds:count,importExpense:count,revenue:count,taxPaid:count,nextBatch:id,ledger:arr(obj({day:count,kind:en(['import','sale']),batch:count,good:en(goods),quantity:num(1,12,true),unitPrice:count,tax:count,amount:num(-1e12,1e12,true),balance:count}),60)})),treasury:num(-1e12,1e12,true),taxRate:num(0,20,true),day:count,taxIncome:count,spent:count,maintenancePaid:count,deficitDays:count,sanitationDay:opt(count),fireDay:opt(count),ledger:arr(obj({day:count,label:str,amount:num(-1e12,1e12,true),balance:num(-1e12,1e12,true)}),60)});
const schemas={version:en([1,2,3,4,5,6,7,8,9]),city:opt(city),demography:opt(obj({lastAt:num(),credit:num(0,1),arrived:count,departed:count})),time:num(),elapsed:num(),nextId:id,buildings:arr(building,143),blocks:arr(obj({id,type,combined:opt(bool),cells:arr(cell,4,1)}),143),people:arr(person,1144),carts:arr(person,143),events:arr(journal,24),market:opt(obj({trades:count})),publicWorks:opt(arr(obj({x:num(-8,2,true),z:num(-6,6,true),type:en(['lane','avenue'])}),143)),life:opt(life),weather:opt(obj({mode:en(['auto','rain','clear']),raining:bool,nextAt:num()})),stories:opt(obj({nextAt:num(),sequence:count,completed:count,active:nullable(story),last:opt(obj({id,title:str,venue:str,center:pair}))})),literati:opt(obj({actors:arr(authorActor,AUTHORS.length),collected:arr(obj({author,time:num(),venue:str}),AUTHORS.length),nextAt:num()})),economy:opt(obj({version:en([1]),nextId:id,imported:count,archived:count,sold:obj(Object.fromEntries(goods.map(k=>[k,opt(count)]))),lots:arr(obj({id,good:en(goods),at:place,origin:str,trail:arr(obj({at:place,time:num()}),4096,1),trailOmitted:opt(count),progress:opt(num(0,32)),madeAt:opt(id)}),1024)}))};
// Historical trail locations and madeAt are provenance, not live references: demolished buildings remain valid history.
const key=c=>`${c.x},${c.z}`;
function unique(list,p,seen=new Set()){for(const a of list){if(seen.has(a.id))fail(`${p}.id`,'ID 重複');seen.add(a.id);}return seen;}
function references(d){
 const ids=unique(d.blocks,'blocks');unique(d.buildings,'buildings',ids);unique(d.people,'people',ids);unique(d.carts,'carts',ids);
 if(d.nextId<=Math.max(0,...ids))fail('nextId','必須大於所有現有城市 ID');
 const buildings=new Map(d.buildings.map(b=>[b.id,b])),blocks=new Map(d.blocks.map(b=>[b.id,b]));
 const checkRef=(v,p)=>{if(v!=null&&!buildings.has(v))fail(p,'參照不存在的建築');};
 const occupied=new Set();for(const b of d.blocks){for(const c of b.cells){const k=key(c);if(occupied.has(k))fail('blocks.cells','占地重疊');occupied.add(k);}}
 const covered=new Set();for(const b of d.buildings){if(b.born>d.elapsed)fail('buildings.born','建造時間不可晚於目前時間');if(b.design&&DESIGNS[b.design].type!==b.type)fail('buildings.design','建築設計與類型不一致');const group=blocks.get(b.blockId);if(!group||group.type!==b.type)fail('buildings.blockId','街坊參照或類型不一致');const cells=b.footprint||[{x:b.x,z:b.z}];if(group.combined===true&&!b.footprint)fail('buildings.footprint','合建街坊需要四格占地');if(b.footprint&&(!isSquare(cells)||b.x!==cells.reduce((n,c)=>n+c.x,0)/4||b.z!==cells.reduce((n,c)=>n+c.z,0)/4))fail('buildings.footprint','占地須為四格正方形且中心一致');for(const c of cells){if(!group.cells.some(q=>key(q)===key(c))||covered.has(key(c)))fail('buildings.footprint','占地與街坊不一致或重疊');covered.add(key(c));}}
 if(covered.size!==occupied.size)fail('blocks.cells','街坊含無建築地塊');
 for(const p of d.publicWorks||[]){if(occupied.has(key(p)))fail('publicWorks','道路與占地重疊');occupied.add(key(p));}
 for(const a of d.people)if(a.jobLostAt>d.elapsed)fail('people.jobLostAt','失聯時間不可晚於目前時間');
 for(const [kind,list]of [['people',d.people],['carts',d.carts]])for(const a of list)for(const field of ['home','work','current','destination','shelter'])checkRef(a[field],`${kind}.${field}`);
 const trade=d.city?.trade;if(trade){
  if(trade.funds!==600-trade.importExpense+trade.revenue-trade.taxPaid||trade.taxPaid>trade.revenue)fail('city.trade','周轉金與累計收支不一致');
  for(const e of trade.ledger){const gross=e.quantity*e.unitPrice;if(e.amount!==(e.kind==='import'?-gross:gross-e.tax)||e.tax>gross||(e.kind==='import'&&(e.tax!==0||e.batch>=trade.nextBatch)))fail('city.trade.ledger','交易數量、價格與金額不一致');}
  if(trade.ledger.length&&trade.ledger.at(-1).balance!==trade.funds)fail('city.trade.ledger','最後餘額與周轉金不一致');
 }
 const ex=d.life?[...d.life.visitors,...d.life.porters,...d.life.oxen]:[];unique(ex,'life');unique(d.literati?.actors||[],'literati.actors');for(const a of ex)checkRef(a.target,'life.target');
 const livePlace=(value,p)=>{if(!value.includes(':'))return;const [kind,raw]=value.split(':'),n=Number(raw);if(['shop','input','output'].includes(kind)){checkRef(n,p);if(buildings.get(n).type!==(kind==='shop'?'shop':'work'))fail(p,'貨物位置建築類型不符');}else {const list=kind==='cart'?d.carts:kind==='ox'?d.life?.oxen:d.life?.porters;if(!list?.some(a=>a.id===n))fail(p,'參照不存在的運貨者');}};
 if(d.economy){const e=d.economy,ids=unique(e.lots,'economy.lots');if(e.nextId<=Math.max(0,...ids))fail('economy.nextId','必須大於所有貨物 ID');if(d.version>=4)for(const l of e.lots)livePlace(l.at,'economy.lots.at');}
 if(d.stories?.active){const e=d.stories.active;unique(e.participants.map(id=>({id})),'stories.active.participants');for(const id of e.participants){const a=d.people.find(p=>p.id===id);if(!a||a.streetEvent!==e.id||!a.eventSlot)fail('stories.active.participants','參與居民或 eventSlot 不一致');}if(e.phase==='active'&&e.until===undefined)fail('stories.active.until','缺少結束時間');}
 if(d.version<4&&d.life){const l=d.life,n=l.boat.cargo+l.dock.stock+[...l.porters,...l.oxen].reduce((n,a)=>n+(a.carrying||0),0)+d.buildings.reduce((n,b)=>n+(b.stock||0),0);if(n>1024)fail('life.cargo','舊存檔貨物展開超過 1024 筆');}
}
function cloneJSON(v,p='根',depth=0,budget={nodes:0,bytes:0},seen=new Set()){
 if(++budget.nodes>300000||depth>24)fail(p,'資料結構超過資源上限');
 if(v===null||typeof v==='boolean'||typeof v==='number')return v;
 if(typeof v==='string'){budget.bytes+=v.length*3;if(budget.bytes>MAX_SAVE_BYTES)fail(p,'文字大小超過上限');return v;}
 if(typeof v!=='object'||(!Array.isArray(v)&&Object.getPrototypeOf(v)!==Object.prototype&&Object.getPrototypeOf(v)!==null))fail(p,'僅接受 JSON 資料');
 if(seen.has(v))fail(p,'不可包含循環參照');seen.add(v);const out=Array.isArray(v)?[]:{};
 if(Array.isArray(v)&&v.length>8192)fail(p,'陣列筆數超過上限');
 for(const k of Object.keys(v)){if(['__proto__','constructor','prototype'].includes(k))fail(`${p}.${k}`,'禁止原型保留鍵');const desc=Object.getOwnPropertyDescriptor(v,k);if(!Object.hasOwn(desc,'value'))fail(`${p}.${k}`,'禁止存取器');out[k]=cloneJSON(desc.value,`${p}.${k}`,depth+1,budget,seen);}seen.delete(v);return out;
}
export function validateSave(data){const d=cloneJSON(data);obj(schemas)(d,'根');for(const [version,key]of [[2,'life'],[3,'stories'],[4,'weather'],[4,'economy'],[6,'literati'],[7,'publicWorks'],[8,'market'],[9,'city']])if(d.version>=version&&!Object.hasOwn(d,key))fail(key,'此版本缺少必要欄位');if(d.city&&d.city.day>Math.floor(d.time/24))fail('city.day','結算日不能晚於目前時間');if(d.city?.fireDay>Math.floor(d.time/24))fail('city.fireDay','防火檢查日不可晚於目前時間');for(const b of d.buildings){if((b.fireDamage!==undefined)!==(b.fireRepairAt!==undefined))fail('fireDamage','受損與修復時間須成對');if(b.fireWarningAt!==undefined&&b.fireDamage!==undefined)fail('fireWarningAt','不可同時預警與受損');}if(d.city?.sanitationDay>Math.floor(d.time/24))fail('city.sanitationDay','衛生結算日不能晚於目前時間');if(d.demography&&d.demography.lastAt>d.elapsed+1e-6)fail('demography.lastAt','人口統計時間不可晚於目前時間');references(d);return d;}
export function parseSave(text){if(typeof text!=='string')fail('根','JSON 原文必須是文字');if(text.length>MAX_SAVE_BYTES||new TextEncoder().encode(text).byteLength>MAX_SAVE_BYTES)fail('根','存檔大小超過 2 MB');let data;try{data=JSON.parse(text);}catch{fail('根','JSON 格式損壞');}return validateSave(data);}
