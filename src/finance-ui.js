import {logistics,upgradeLogistics,MAX_LOGISTICS_LEVEL} from './logistics.js';
import {GOODS} from './production.js';
import {affordable} from './city-finance.js';
import {cityDemand,CENSUS_SECONDS,GRACE} from './city-growth.js';
import {BUILD_COST,ROAD_COST,UPKEEP,dailyUpkeep,householdTax,setCityPolicy} from './city-finance.js';
export function installFinanceUI({getTown,edit}){
 const $=s=>document.querySelector(s),dialog=$('#city-budget');
 function growth(){const t=getTown(),d=cityDemand(t),root=$('#city-demand');root.replaceChildren();for(const [key,name] of [['home','住宅'],['shop','商業'],['work','作坊']]){const row=document.createElement('p'),label=document.createElement('label'),meter=document.createElement('meter');label.textContent=`${name}需求 ${d[key].score}`;meter.min=-100;meter.max=100;meter.value=d[key].score;meter.setAttribute('aria-label',`${name}需求`);label.append(meter);row.append(label,document.createTextNode(d[key].reasons.join('；')));root.append(row);}
 $('#population-policy').textContent=t.city.mode==='managed'?`城市經營：每 ${CENSUS_SECONDS} 遊戲秒評估一次，最多遷入一人；優先安置原有無家住戶。需求越低，等候越久。長期無家 ${GRACE.unhoused} 秒、失業 ${GRACE.unemployed} 秒或日用品不足 ${GRACE.unserved} 秒後，每次最多遷出一人；改善後停止該項倒數。累計遷入 ${t.demography.arrived} 人、遷出 ${t.demography.departed} 人。`:'自由營造：住宅直接入住，不因就業或日用品不足遷出；需求僅供營造參考。切換城市經營後，開始依需求與生活條件評估人口。';}
 function commerce(){const t=getTown(),a=t.city.trade,q=logistics(t);$('#trade-summary').textContent=`商業周轉金 ${a.funds} 文；累計進口成本 ${a.importExpense} 文、營業額 ${a.revenue} 文、已繳成交稅 ${a.taxPaid} 文。${a.funds<10?'周轉金不足，原料船暫停補貨；售出既有商品可回補。':''}`;
 $('#logistics-summary').textContent=`貨棧 ${q.level}／${MAX_LOGISTICS_LEVEL} 級：腳夫編制 ${q.porters} 人、每趟 ${q.porterLoad} 件；牛車 ${q.oxen} 輛、每趟 ${q.oxLoad} 件。每日物流維護 ${q.upkeep} 文（經營模式）。`;
 const button=$('#logistics-upgrade');button.disabled=q.level>=MAX_LOGISTICS_LEVEL||!affordable(t,q.upgradeCost);button.textContent=q.level>=MAX_LOGISTICS_LEVEL?'貨棧已達最高三級':`貨棧升至 ${q.level+1} 級 · ${t.city.mode==='managed'?q.upgradeCost+' 文':'自由營造免付費'}`;
 const list=$('#trade-ledger');list.replaceChildren();for(const e of [...a.ledger].reverse().slice(0,12)){const li=document.createElement('li');li.textContent=`第 ${e.day+1} 日 · ${e.kind==='import'?'進口批次 '+e.batch:'成交'} ${GOODS[e.good]} ${e.quantity} 件 × ${e.unitPrice} 文；稅 ${e.tax} 文，周轉金 ${e.amount>=0?'+':''}${e.amount} 文，餘額 ${e.balance} 文`;list.append(li);}if(!a.ledger.length)list.textContent='尚無貿易收支。';}
 $('#logistics-upgrade').onclick=()=>{if(edit(upgradeLogistics))refresh();else $('#budget-warning').textContent='升級未完成：請確認金庫足夠且尚未滿三級。';};
 function refresh(){growth();commerce();const t=getTown(),c=t.city;$('#budget-summary').textContent=`${c.mode==='managed'?'城市經營':'自由營造'} · 金庫 ${c.treasury} 文。${c.mode==='sandbox'?'若切換城市經營：':''}每日人口稅預估 ${householdTax(t)} 文；目前每日維護費 ${dailyUpkeep(t)} 文。經營模式另依實際成交計稅。累計稅收 ${c.taxIncome} 文、已付維護費 ${c.maintenancePaid} 文。`;
 $('#budget-prices').textContent=`每格建設：民居 ${BUILD_COST.home}、商鋪 ${BUILD_COST.shop}、作坊 ${BUILD_COST.work}、園景 ${BUILD_COST.garden} 文；小路 ${ROAD_COST.lane}、大路 ${ROAD_COST.avenue} 文。四格按四格計費。每日每格維護：民居 ${UPKEEP.home}、商鋪 ${UPKEEP.shop}、作坊 ${UPKEEP.work}、園景 ${UPKEEP.garden} 文，再乘建築級數；小路 ${UPKEEP.lane}、大路 ${UPKEEP.avenue} 文。未落成建築暫不收維護費。`;
 $('#budget-mode').value=c.mode;$('#budget-tax').value=c.taxRate;$('#budget-warning').textContent=c.treasury<0?'金庫已欠款；可調整稅率、拆除高維護建築減支，或改為自由營造。':'城市經營須自行鋪路接通街坊，並收建設與維護費；自由營造自動接路、不扣款、不收稅。切換不重設金庫，也不追扣舊城建設費。';
 const list=$('#budget-ledger');list.replaceChildren();for(const entry of [...c.ledger].reverse()){const li=document.createElement('li');li.textContent=`第 ${entry.day+1} 日 · ${entry.label} ${entry.amount>=0?'+':''}${entry.amount} 文 · 餘額 ${entry.balance} 文`;list.append(li);}if(!c.ledger.length)list.textContent='尚無收支紀錄。';}
 $('#budget-btn').onclick=()=>{refresh();dialog.showModal();};
 $('#budget-apply').onclick=()=>{const taxRate=Number($('#budget-tax').value),mode=$('#budget-mode').value;if(!Number.isInteger(taxRate)||taxRate<0||taxRate>20){$('#budget-warning').textContent='稅率請填 0 至 20 的整數。';return;}if(edit(t=>setCityPolicy(t,{mode,taxRate}))){dialog.close();}else $('#budget-warning').textContent='設定未儲存，原小鎮仍保留。';};
 return {update(){if(dialog.open){growth();commerce();}const c=getTown().city;$('#budget-btn').textContent=c.mode==='managed'?`金庫 ${c.treasury} 文 · 需求`:'自由營造 · 收支';},refresh};
}
