import {MAX_SAVE_BYTES} from './save-store.js';
export function installSaveUI({store,getTown,prepareTown,replaceTown,pause}){
 const $=s=>document.querySelector(s),dialog=$('#save-manager');let pending=null,choices=[];
 const say=text=>{$('#save-message').textContent=text;};
 const download=(text,name)=>{const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 function refresh(){pending=null;$('#save-apply').hidden=true;$('#save-preview').textContent='';try{choices=store.candidates();}catch{choices=[];}const list=$('#save-candidates');list.replaceChildren();for(const [i,c] of choices.entries()){const b=document.createElement('button');b.dataset.candidate=String(i);const label=c.id==='reset'?'重置前小鎮':c.id==='backup'?'上一個有效版本':c.id==='current'?'目前共用存檔':`分頁版本 ${c.owner.slice(0,8)}`;b.textContent=`${label} · ${c.data.buildings.length} 處建築 · ${c.data.people.length} 位居民${c.savedAt?' · '+new Date(c.savedAt).toLocaleString('zh-TW'):''}`;list.append(b);}if(!choices.length)list.textContent='尚無可用備份。';$('#save-rescue').hidden=!store.rescueRaw();}
 function open(message){pause();refresh();say(message||store.blocked==='recovery'&&'存檔無法讀取，原始檔仍保留；請匯出救援檔或選擇有效備份。'||store.blocked==='conflict'&&'另一個分頁已更新進度，自動儲存已停止。可先匯出本頁，再選擇要使用的版本。'||'可匯出城市、驗證匯入，或恢復備份；預覽不會改動目前小鎮。');if(!dialog.open)dialog.showModal();}
 function preview(data,label){pending=data;$('#save-preview').textContent=`${label}：${data.buildings.length} 處建築、${data.people.length} 位居民、第 ${Math.floor(data.time/24)+1} 日。確認後取代目前小鎮，取代前會另存復原點。`;$('#save-apply').hidden=false;}
 $('#save-manager-btn').onclick=()=>open();
 $('#save-export').onclick=()=>{try{download(store.export(getTown()),'汴水小鎮.json');say('已匯出目前小鎮。');}catch(e){say('無法匯出：'+e.message);}};
 $('#save-rescue').onclick=()=>download(store.rescueRaw(),'汴水小鎮-原始救援.json');
 $('#save-file').onchange=async e=>{pending=null;$('#save-apply').hidden=true;const file=e.target.files[0];if(!file)return;try{if(file.size>MAX_SAVE_BYTES)throw Error('檔案超過 2 MB 上限');const data=store.preview(await file.text());preview(data,'匯入預覽');say('驗證通過，尚未取代小鎮。');}catch(error){say('匯入未完成：'+error.message);}finally{e.target.value='';}};
 $('#save-candidates').onclick=e=>{const b=e.target.closest('[data-candidate]');if(!b)return;const c=choices[Number(b.dataset.candidate)];if(c)preview(c.data,b.textContent);};
 $('#save-apply').onclick=()=>{if(!pending)return;try{const prepared=prepareTown(pending);if(!store.blocked){const backup=store.checkpoint(getTown());if(!backup.ok)throw Error('無法保留復原點：'+backup.message);}const result=store.replace(pending);if(!result.ok)throw Error(result.message||'儲存失敗');replaceTown(prepared);dialog.close();pending=null;}catch(error){say('未取代小鎮：'+error.message);}};
 $('#save-new').onclick=()=>{dialog.close();$('#confirm-reset').showModal();};
 window.addEventListener('storage',e=>{if(e.key===store.key&&store.externalChange())open('另一分頁已儲存較新的小鎮。本頁已暫停自動覆寫；請先匯出本頁或選擇要使用的版本。');});
 if(store.blocked)open();return {open,refresh};
}
