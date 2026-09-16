import {TYPES} from './grid-rules.js';
export function cityEntries(t,{filter='all',query=''}={}){
 const q=query.trim().toLocaleLowerCase();
 return [...t.buildings.map(b=>({kind:'building',id:b.id,name:b.name,type:b.type,detail:`${TYPES[b.type]} · 編號${b.id} · X ${b.x}、Z ${b.z}${b.stage<3?' · 施工中':''}`})),...t.people.map(p=>({kind:'person',id:p.id,name:p.name,type:'person',detail:`居民 · 編號${p.id} · ${p.action||'日常生活'} · 住處${t.building(p.home)?.name||'尚未安排'}`}))].filter(e=>(filter==='all'||filter===e.type)&&(e.name+' '+e.detail+' #'+e.id).toLocaleLowerCase().includes(q));
}
export function installCityDirectory({getTown,select}){
 const $=s=>document.querySelector(s),dialog=$('#city-directory');
 function refresh(){const list=$('#city-objects'),rows=cityEntries(getTown(),{filter:$('#city-object-filter').value,query:$('#city-object-query').value});list.replaceChildren();$('#city-object-count').textContent=`找到 ${rows.length} 個對象`;
  for(const row of rows){const li=document.createElement('li'),button=document.createElement('button');button.textContent=`${row.name} · ${row.detail}`;button.dataset.objectKind=row.kind;button.dataset.objectId=row.id;li.append(button);list.append(li);}
 }
 $('#city-list-btn').onclick=()=>{refresh();dialog.showModal();$('#city-directory-title').focus();};
 $('#city-object-query').oninput=refresh;$('#city-object-filter').onchange=refresh;
 $('#city-objects').onclick=e=>{const button=e.target.closest('[data-object-id]');if(!button)return;const ref={kind:button.dataset.objectKind,id:Number(button.dataset.objectId)},t=getTown(),exists=ref.kind==='building'?t.building(ref.id):t.people.find(p=>p.id===ref.id);if(!exists){refresh();$('#city-object-count').textContent='對象已離開小鎮，清單已更新。';return;}dialog.close();select(ref);};
}
