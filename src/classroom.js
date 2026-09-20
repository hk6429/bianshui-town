import {Town} from './simulation.js';
import {LITERARY_QUESTS,requirements} from './literary-quests.js';
import {READING_LEVELS} from './learning-content.js';
import {setReadingSupport} from './learning.js';
export function classroomAssignment(search){const p=new URLSearchParams(search),quest=p.get('classroom'),level=p.get('support')||'guided';return Object.hasOwn(LITERARY_QUESTS,quest)&&Object.hasOwn(READING_LEVELS,level)?{quest,level,...(/^[a-f0-9-]{36}$/.test(p.get('assignment')||'')?{assignmentId:p.get('assignment')}:{})}:null;}
export function classroomURL(base,quest,level){if(!Object.hasOwn(LITERARY_QUESTS,quest)||!Object.hasOwn(READING_LEVELS,level))throw Error('請選擇有效關卡與閱讀支援');const u=new URL(base);u.search='';u.hash='';u.searchParams.set('classroom',quest);u.searchParams.set('support',level);return u.href;}
export const classroomKey=(id,assignmentId)=>`bianshui-classroom-v1:${id}${assignmentId?':'+assignmentId:''}`;
export function createClassroomTown({quest,level}){
 if(!Object.hasOwn(LITERARY_QUESTS,quest)||!Object.hasOwn(READING_LEVELS,level))throw Error('課堂設定無效');
 const t=new Town({mode:'sandbox'});setReadingSupport(t,level,level==='story');
 const plans={kaifeng:[['home'],['shop']],yueyang:[['home'],['work'],['garden','granary']],printing:[['work'],['garden','villageSchool']],zuiweng:[['home'],['garden','pavilion'],['garden','garden']],lotus:[['garden','pond'],['garden','garden']],redcliff:[['garden','dock'],['garden','pond']],oil:[['shop'],['work']],creek:[['garden','pond'],['garden','pavilion']],lantern:[['shop'],['shop'],['shop'],['garden','garden']],moon:[['home'],['garden','postStation'],['garden','garden']]};
 plans[quest].forEach(([type,design],i)=>{if(!t.place(type,[{x:-6+i*2,z:-4}],true,design||null))throw Error('課堂設施準備失敗');});
 if(requirements(t,quest).some(r=>!r.ok))throw Error('課堂前置尚未完成');return t;
}
