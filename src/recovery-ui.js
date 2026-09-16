export function installRuntimeRecovery({getRecovery,store,fixtureMode=false}){
 const dialog=document.querySelector('#runtime-error'),message=document.querySelector('#runtime-error-message');
 dialog.addEventListener('cancel',e=>e.preventDefault());
 document.querySelector('#runtime-export').onclick=()=>{try{const raw=store.export(getRecovery().snapshot());const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='汴水小鎮-安全復原.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message.textContent='已匯出最後通過驗證的小鎮，可從存檔管理匯入。';}catch{message.textContent='匯出未完成；原存檔仍保留，請使用重新載入。';}};
 document.querySelector('#runtime-recover').onclick=()=>{const result=fixtureMode?{ok:true}:store.replace(getRecovery().snapshot());if(!result.ok){message.textContent='目前無法寫入復原版本，請先匯出安全快照。';return;}const url=new URL(location.href);url.searchParams.delete('runtime-fault');location.replace(url.href);};
 return error=>{getRecovery().fail(error);document.querySelector('#app').inert=true;for(const open of document.querySelectorAll('dialog[open]'))open.close();message.textContent='小鎮遇到執行錯誤，已停止模擬及自動儲存。可匯出安全快照，或讀回最後通過驗證的進度並重新載入；可能回到最近一次安全快照的時間。';dialog.showModal();};
}
