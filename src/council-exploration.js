import {STORY_TYPES} from './story-data.js';
import {storyDay,storyVenues} from './stories.js';
import {isLeisureGarden} from './garden-services.js';
import {escapeHTML as esc} from './content-html.js';
const proposals=[{id:'garden',title:'留一處歇腳園景',test:b=>isLeisureGarden(b)&&b.design!=='wazi',condition:'落成一處園景（公設與瓦舍不計），且未受損。'},{id:'work',title:'添一間百工作坊',test:b=>b.type==='work'&&b.stage>=3&&!b.fireDamage,condition:'落成一間作坊，且未受損。'}];
export function councilProposals(t){return proposals.map(p=>{const record=t.journey.council?.find(r=>r.proposal===p.id),buildings=t.buildings.filter(p.test);return {...p,record,buildings,needed:!buildings.length,ready:record?.state==='accepted'&&buildings.length>0};});}
export function respondCouncil(t,id,action){
 const p=councilProposals(t).find(p=>p.id===id);if(!p||p.record?.state==='completed')return false;
 if(action==='complete'){
  if(!p.ready)return false;Object.assign(p.record,{state:'completed',at:t.elapsed,building:p.buildings[0].id,venue:p.buildings[0].name});return true;
 }
 if(!['accept','ignore'].includes(action)||!p.needed)return false;
 const state=action==='accept'?'accepted':'ignored';if(p.record?.state===state)return false;
 t.journey.council??=[];if(p.record)Object.assign(p.record,{state,at:t.elapsed});else t.journey.council.push({proposal:id,state,at:t.elapsed});return true;
}
export function observeStory(t){
 const e=t.stories.active;if(!e||e.phase!=='active'||!STORY_TYPES.some(s=>s.type===e.type)||!e.participants.some(id=>{const p=t.people.find(p=>p.id===id);return p?.eventSlot&&Math.hypot(p.x-p.eventSlot[0],p.z-p.eventSlot[1])<.1;}))return false;
 t.journey.seenStories??=[];if(t.journey.seenStories.some(s=>s.type===e.type))return false;
 t.journey.seenStories.push({type:e.type,event:e.id,at:t.elapsed,venue:e.venue});return true;
}
export function councilHTML(t){return `<p>兩項自願提案依目前設施提出；可擱置或放下，不扣資源、不設期限。採納後須完成建設，再回來回應。</p>${councilProposals(t).map(p=>`<article><h4>${esc(p.title)}</h4><p>${esc(p.condition)}目前符合：${p.buildings.length}處。</p>${p.record?.state==='completed'?`<p>已回應議案：${esc(p.record.venue)}（保留當時紀錄）</p>`:p.record?.state==='accepted'?`<p>已採納${p.ready?'，建設已達成':'，等待建設'}。</p><button data-council="complete" data-proposal="${p.id}" ${p.ready?'':'disabled'}>回應建設成果</button>${p.needed?`<button data-council="ignore" data-proposal="${p.id}">放下提案</button>`:''}`:p.needed?`<p>${p.record?.state==='ignored'?'已擱置，可隨時重接。':'目前缺少這類設施，街坊提出建議。'}</p><button data-council="accept" data-proposal="${p.id}">採納提案</button><button data-council="ignore" data-proposal="${p.id}">暫時擱置</button>`:'<p>已有相應設施，暫無新增提案。</p>'}</article>`).join('')}`;}
export function explorationHTML(t){return `<p>活動輪流出現：晴天08:00–19:00、至少3位居民、落成商鋪或瓦舍。附近須有可達道路與可參與居民；集合最久30遊戲秒，無人到場就取消，散場後至少等35遊戲秒。說書優先瓦舍、茶敘優先茶鋪，沒有時可在其他商鋪相聚。</p><p>目前：${storyDay(t)?'天候時段符合':'等待晴天白日'}；居民${t.people.length}人；場所${storyVenues(t).length}處。下一類：${esc(STORY_TYPES[t.stories.sequence%3].title)}。</p><p>打開「市井見聞」，在活動進行時按「去街口看看」才記為親自見過；集合中與回看散場地點不計。</p>${STORY_TYPES.map(s=>{const seen=t.journey.seenStories?.find(r=>r.type===s.type);return `<article><h4>${esc(s.title)} · ${seen?'親自見過':'尚未看過'}</h4>${seen?`<p>初見地點：${esc(seen.venue)}</p>`:'<p>依上述條件，等待輪到這類活動。</p>'}</article>`;}).join('')}`;}
