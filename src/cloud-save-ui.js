import {createCloudAPI} from './cloud-save.js';
import {escapeHTML as esc} from './content-html.js';
export function installCloudSave({getTown,validate,preview,enabled=true,connect=createCloudAPI}){
 let config=enabled;const dialog=document.createElement('dialog');dialog.id='cloud-save';dialog.setAttribute('aria-labelledby','cloud-title');document.body.append(dialog);
 let api=null,starting=null,user=null,epoch=0,remote=null,busy=false,auto=false,confirm=false,lastText='',message=config?'登入 Google，將小鎮與關卡進度保留到自己的帳號。':'Google 登入尚待站方完成設定。目前進度仍保留在這台裝置，也能從存檔管理匯出。';
 const say=x=>{message=x;render();};
 function render(){dialog.innerHTML=`<div class="dialog-heading"><h2 id="cloud-title">登入與雲端存檔</h2><button data-cloud="close" aria-label="關閉雲端存檔">×</button></div><p role="status">${esc(message)}</p>${user?`<p>已登入：${esc(user.displayName||user.email||'Google 使用者')}</p><p>雲端版本：${remote?remote.data?`${remote.revision} · ${remote.data.buildings.length}處建築 · ${esc(remote.updatedAt||'剛更新')}`:'尚無存檔':'尚未讀取'}</p><p>本機：${getTown().buildings.length}處建築。登入不會直接取代目前的小鎮。</p><div class="cloud-actions"><button data-cloud="refresh" ${busy?'disabled':''}>重新查看雲端</button><button data-cloud="upload" ${busy||!remote?'disabled':''}>儲存目前小鎮到雲端</button><button data-cloud="load" ${busy||!remote?.data?'disabled':''}>預覽並讀取雲端小鎮</button></div>${confirm?'<section class="cloud-confirm"><p>確定以目前小鎮更新雲端存檔？若其他裝置已更新，這次操作會停止。</p><button data-cloud="confirm">確認更新雲端</button><button data-cloud="cancel">取消</button></section>':''}<label><input type="checkbox" data-cloud-auto ${auto?'checked':''} ${!lastText||busy?'disabled':''}>本次登入自動備份（每2分鐘；先手動儲存一次）</label><p>雲端包含城市、居民、關卡與閱讀短箋；不公開給其他玩家。離線時本機仍可遊玩，自動備份失敗會停止並提示。</p><button data-cloud="logout" ${busy?'disabled':''}>登出 Google</button>`:`<button data-cloud="login" ${!config||busy||!api?'disabled':''}>使用 Google 帳號登入</button><div id="cloud-google-button"></div><p>可先不登入，所有關卡照常開放。本機存檔與雲端存檔會分開確認。</p>`}`;}
 async function refresh(){const token=epoch,id=user?.uid;if(!id)return;busy=true;confirm=false;render();try{const next=await api.read(id,validate);if(token!==epoch)return;remote=next;auto=false;lastText='';message=next.data?'已讀取雲端版本；選擇上傳目前小鎮，或先預覽雲端小鎮。':'雲端尚無小鎮；可儲存目前的城市與關卡進度。';}catch{if(token===epoch){remote=null;auto=false;message='無法讀取雲端，請確認網路或稍後重試。本機進度仍保留。';}}finally{if(token===epoch){busy=false;render();}}}
 async function upload(){if(busy||!user||!remote)return;const token=epoch,id=user.uid,data=structuredClone(getTown());busy=true;confirm=false;render();try{const revision=await api.write(id,data,remote.revision,validate);if(token!==epoch)return;remote={revision,data,updatedAt:new Date().toISOString()};lastText=JSON.stringify(data);message='雲端存檔成功；已保留城市與關卡進度。';}catch(error){if(token===epoch){auto=false;message=error.message?.includes('較新存檔')?error.message:'雲端儲存失敗，本機進度仍保留。請檢查網路或重新登入後重試。';}}finally{if(token===epoch){busy=false;render();}}}
 async function start(){if(api||!config)return;if(starting)return starting;starting=connect(next=>{user=next;epoch++;remote=null;auto=false;lastText='';busy=false;confirm=false;message=next?'正在讀取你的雲端版本…':'尚未登入；本機進度仍保留。';render();if(next&&api)refresh();}).then(value=>{api=value;config=value.configured;if(!config)message='Google 登入尚待站方完成設定。目前進度仍保留在這台裝置，也能從存檔管理匯出。';render();if(user)return refresh();}).finally(()=>{starting=null;});return starting;}

 const open=()=>{render();if(!dialog.open)dialog.showModal();if(config&&!api)start().catch(()=>say('登入服務暫時無法連線。本機進度仍保留。'));};
 dialog.onclick=async e=>{const b=e.target.closest('[data-cloud]');if(!b)return;const action=b.dataset.cloud;
 if(action==='close')return dialog.close();if(busy)return;
 if(action==='upload'){confirm=true;render();return;}if(action==='cancel'){confirm=false;render();return;}
 if(action==='refresh')return refresh();if(action==='confirm')return upload();
 if(action==='load'&&remote?.data){auto=false;lastText='';dialog.close();preview(structuredClone(remote.data));return;}
 if(action==='login'){try{await start();busy=true;render();await api.mountLogin(dialog.querySelector('#cloud-google-button'),error=>{busy=false;say(error.message);});busy=false;dialog.querySelector('[data-cloud=login]').hidden=true;}catch(error){busy=false;say(error.code==='auth/popup-closed-by-user'?'已取消登入。本機進度不受影響。':'登入未完成。請允許 Google 登入視窗，並確認網路；本機進度不受影響。');}}
 if(action==='logout'){try{await api.logout();}catch{say('登出未完成，請檢查網路後重試。');}}
 };
 dialog.onchange=e=>{if(e.target.matches('[data-cloud-auto]'))auto=e.target.checked&&!!lastText;};
 setInterval(()=>{if(auto&&!busy&&user&&remote&&JSON.stringify(getTown())!==lastText)upload();},120000);
 document.querySelector('#cloud-save-btn').onclick=open;return {open,localReplaced(){auto=false;lastText='';confirm=false;}};
}
