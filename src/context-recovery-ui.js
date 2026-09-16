export function installContextRecoveryUI({snapshot,exportSave,reload,toast}){
 const dialog=document.createElement('dialog');dialog.id='graphics-recovery';dialog.setAttribute('aria-labelledby','graphics-recovery-title');
 dialog.innerHTML='<h2 id="graphics-recovery-title">畫面暫時中斷</h2><p role="status"></p><div class="dialog-actions"><button data-export>匯出目前小鎮</button><button data-reload>保留進度並重新載入</button></div>';
 document.body.append(dialog);const message=dialog.querySelector('p');let inertBefore=false;
 dialog.addEventListener('cancel',event=>event.preventDefault());
 dialog.querySelector('[data-export]').onclick=()=>{try{const raw=exportSave(snapshot()),url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='汴水小鎮-畫面中斷復原.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message.textContent='已匯出中斷時的小鎮；畫面仍在等待復原。';}catch{message.textContent='匯出失敗，小鎮仍保留在此分頁，請稍後再試。';}};
 dialog.querySelector('[data-reload]').onclick=()=>{if(!reload(snapshot()))message.textContent='無法安全儲存，請先匯出目前小鎮；尚未重新載入。';};
 return state=>{
  const app=document.querySelector('#app');
  if(state==='restored'){dialog.close();app.inert=inertBefore;toast('畫面已恢復，小鎮進度完整保留');return;}
  if(!dialog.open){inertBefore=app.inert;app.inert=true;dialog.showModal();}
  message.textContent=state==='timeout'?'畫面尚未恢復，模擬與音效已停止。可先匯出目前小鎮，或保留進度後重新載入。':'正在恢復畫面，模擬與音效已暫停，小鎮進度保留中。';
 };
}
