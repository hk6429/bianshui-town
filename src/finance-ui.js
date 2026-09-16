import {BUILD_COST,ROAD_COST,UPKEEP,dailyUpkeep,householdTax,setCityPolicy} from './city-finance.js';
export function installFinanceUI({getTown,edit}){
 const $=s=>document.querySelector(s),dialog=$('#city-budget');
 function refresh(){const t=getTown(),c=t.city;$('#budget-summary').textContent=`${c.mode==='managed'?'城市經營':'自由營造'} · 金庫 ${c.treasury} 文。${c.mode==='sandbox'?'若切換城市經營：':''}每日人口稅預估 ${householdTax(t)} 文；目前每日維護費 ${dailyUpkeep(t)} 文。經營模式另依實際成交計稅。累計稅收 ${c.taxIncome} 文、已付維護費 ${c.maintenancePaid} 文。`;
 $('#budget-prices').textContent=`每格建設：民居 ${BUILD_COST.home}、商鋪 ${BUILD_COST.shop}、作坊 ${BUILD_COST.work}、園景 ${BUILD_COST.garden} 文；小路 ${ROAD_COST.lane}、大路 ${ROAD_COST.avenue} 文。四格按四格計費。每日每格維護：民居 ${UPKEEP.home}、商鋪 ${UPKEEP.shop}、作坊 ${UPKEEP.work}、園景 ${UPKEEP.garden} 文，再乘建築級數；小路 ${UPKEEP.lane}、大路 ${UPKEEP.avenue} 文。未落成建築暫不收維護費。`;
 $('#budget-mode').value=c.mode;$('#budget-tax').value=c.taxRate;$('#budget-warning').textContent=c.treasury<0?'金庫已欠款；可調整稅率、拆除高維護建築減支，或改為自由營造。':'城市經營會收建設與維護費；自由營造不扣款、不收稅。切換不重設金庫，也不追扣舊城建設費。';
 const list=$('#budget-ledger');list.replaceChildren();for(const entry of [...c.ledger].reverse()){const li=document.createElement('li');li.textContent=`第 ${entry.day+1} 日 · ${entry.label} ${entry.amount>=0?'+':''}${entry.amount} 文 · 餘額 ${entry.balance} 文`;list.append(li);}if(!c.ledger.length)list.textContent='尚無收支紀錄。';}
 $('#budget-btn').onclick=()=>{refresh();dialog.showModal();};
 $('#budget-apply').onclick=()=>{const taxRate=Number($('#budget-tax').value),mode=$('#budget-mode').value;if(!Number.isInteger(taxRate)||taxRate<0||taxRate>20){$('#budget-warning').textContent='稅率請填 0 至 20 的整數。';return;}if(edit(t=>setCityPolicy(t,{mode,taxRate}))){dialog.close();}else $('#budget-warning').textContent='設定未儲存，原小鎮仍保留。';};
 return {update(){const c=getTown().city;$('#budget-btn').textContent=c.mode==='managed'?`金庫 ${c.treasury} 文`:'自由營造 · 收支';},refresh};
}
