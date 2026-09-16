import {watchResident,residentWatchHTML,watchedResident} from './resident-relationships.js';
export function installResidentRelationshipsUI({getTown,change,focus}){
 const dialog=document.querySelector('#resident-watch'),list=document.querySelector('#resident-watch-list'),status=document.querySelector('#resident-watch-status');
 const render=()=>{list.innerHTML=residentWatchHTML(getTown());};
 document.querySelector('#resident-watch-btn').onclick=()=>{render();status.textContent='最多關注16人；熟識按不同日常與完成委託累積，不要求每日登入。';dialog.showModal();};document.querySelector('#resident-watch-close').onclick=()=>dialog.close();
 list.onclick=e=>{const remove=e.target.closest('[data-watch-remove]'),open=e.target.closest('[data-watch-open]'),follow=e.target.closest('[data-watch-follow]');if(remove){if(change(t=>watchResident(t,Number(remove.dataset.watchRemove),false))){render();status.textContent='已取消關注，熟識紀錄仍保留。';}}else if(open||follow){const id=Number(open?.dataset.watchOpen||follow.dataset.watchFollow),p=watchedResident(getTown(),id);if(p){dialog.close();focus(p,!!follow);}else{render();status.textContent='居民已離鎮，保留最近已知紀錄。';}}};
}
