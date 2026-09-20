import {teamRequest} from './classroom-team.js';
import {validateReport,createFeedback,REVIEW_JUDGEMENTS,commonDifficulties} from '../src/learning-reports.js';
import {LITERARY_QUESTS} from '../src/literary-quests.js';
import {READING_LEVELS} from '../src/learning-content.js';
const error=(message,status=400)=>{throw Object.assign(Error(message),{status});};
const exact=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!keys.includes(k))||keys.some(k=>!Object.hasOwn(v,k)))error('欄位不完整或不支援');};
const label=(x,max=48)=>{if(typeof x!=='string'||!x.trim()||x.length>max||/[\u0000-\u001f\u007f]/.test(x))error('請填寫有效名稱');return x.trim();};
const id=x=>{if(typeof x!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(x))error('識別碼無效');return x;};
const exec=(db,sql,args=[])=>db.execute({sql,args});
const rows=async(db,sql,args=[])=>(await exec(db,sql,args)).rows;
const first=async(db,sql,args=[])=>(await rows(db,sql,args))[0];
async function owned(db,classId,uid){const c=await first(db,'SELECT * FROM learning_classes WHERE id=? AND owner=?',[id(classId),uid]);if(!c)error('找不到可管理的班級',403);return c;}
async function member(db,classId,uid){const c=await first(db,'SELECT alias FROM learning_members WHERE class_id=? AND student=?',[id(classId),uid]);if(!c)error('請先加入這個班級',403);return c;}
async function assignment(db,assignmentId){const a=await first(db,'SELECT * FROM learning_assignments WHERE id=?',[id(assignmentId)]);if(!a)error('找不到任務',404);return a;}
export async function classroomRequest(db,uid,url,method,input){
 const path=url.pathname.replace('/api/classroom/','');
 if(path.startsWith('team-'))return teamRequest(db,uid,url,method,input);
 if(method==='GET'&&path==='list')return {owned:await rows(db,'SELECT id,name,code,open FROM learning_classes WHERE owner=? ORDER BY created_at DESC',[uid]),joined:await rows(db,'SELECT c.id,c.name,m.alias FROM learning_classes c JOIN learning_members m ON c.id=m.class_id WHERE m.student=? ORDER BY m.joined_at DESC',[uid])};
 if(method==='POST'&&path==='create'){
  exact(input,['name']);const name=label(input.name),classId=crypto.randomUUID(),code=crypto.randomUUID().replaceAll('-','').slice(0,16).toUpperCase();
  const result=await exec(db,'INSERT INTO learning_classes(id,owner,name,code,created_at) SELECT ?,?,?,?,? WHERE (SELECT COUNT(*) FROM learning_classes WHERE owner=?)<10 RETURNING id',[classId,uid,name,code,Date.now(),uid]);if(!result.rows.length)error('最多建立10個班級');return {id:classId,code};
 }
 if(method==='POST'&&path==='join'){
  exact(input,['code','alias']);const alias=label(input.alias);if(typeof input.code!=='string'||!/^[A-F0-9]{16}$/.test(input.code.toUpperCase()))error('請確認16碼班級碼');
  const c=await first(db,'SELECT * FROM learning_classes WHERE code=? AND open=1',[input.code.toUpperCase()]);if(!c)error('班級碼無效或已停止加入',404);if(c.owner===uid)error('你已是這個班級的老師');
  await exec(db,'INSERT INTO learning_members(class_id,student,alias,joined_at) SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM learning_members WHERE class_id=?)<60 ON CONFLICT(class_id,student) DO NOTHING',[c.id,uid,alias,Date.now(),c.id]);await member(db,c.id,uid);return {id:c.id};
 }
 if(method==='GET'&&path==='class'){
  const classId=id(url.searchParams.get('id')),c=await first(db,'SELECT id,name,owner,code,open FROM learning_classes WHERE id=?',[classId]);if(!c)error('找不到班級',404);const teacher=c.owner===uid;if(!teacher)await member(db,classId,uid);
  const assignments=await rows(db,'SELECT * FROM learning_assignments WHERE class_id=? ORDER BY created_at DESC',[classId]);const members=teacher?await rows(db,'SELECT student,alias FROM learning_members WHERE class_id=?',[classId]):[];
  return {id:c.id,name:c.name,teacher,open:c.open,...(teacher?{code:c.code}:{}),members,assignments};
 }
 if(method==='POST'&&path==='class-open'){exact(input,['classId','open']);await owned(db,input.classId,uid);if(typeof input.open!=='boolean')error('狀態無效');await exec(db,'UPDATE learning_classes SET open=? WHERE id=?',[Number(input.open),input.classId]);return {ok:true};}
 if(method==='POST'&&path==='assign'){
  exact(input,['classId','quest','support','title']);await owned(db,input.classId,uid);if(!Object.hasOwn(LITERARY_QUESTS,input.quest)||!Object.hasOwn(READING_LEVELS,input.support))error('關卡或閱讀支援無效');const title=label(input.title,80),assignmentId=crypto.randomUUID();
  const result=await exec(db,'INSERT INTO learning_assignments(id,class_id,quest,support,title,created_at) SELECT ?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM learning_assignments WHERE class_id=?)<20 RETURNING id',[assignmentId,input.classId,input.quest,input.support,title,Date.now(),input.classId]);if(!result.rows.length)error('每班最多20份任務');return {id:assignmentId};
 }
 if(method==='POST'&&path==='assignment-open'){exact(input,['assignmentId','open']);const a=await assignment(db,input.assignmentId);await owned(db,a.class_id,uid);if(typeof input.open!=='boolean')error('狀態無效');await exec(db,'UPDATE learning_assignments SET open=? WHERE id=?',[Number(input.open),a.id]);return {ok:true};}
 if(method==='GET'&&path==='work'){
  const a=await assignment(db,url.searchParams.get('id')),c=await first(db,'SELECT owner FROM learning_classes WHERE id=?',[a.class_id]);const teacher=c.owner===uid;if(!teacher)await member(db,a.class_id,uid);
  const submissions=await rows(db,`SELECT s.student,m.alias,s.version,s.submitted_at,s.feedback,s.payload FROM learning_submissions s JOIN learning_members m ON m.class_id=? AND m.student=s.student WHERE s.assignment_id=? ${teacher?'':'AND s.student=?'} AND s.version=(SELECT MAX(s2.version) FROM learning_submissions s2 WHERE s2.assignment_id=s.assignment_id AND s2.student=s.student)`,[a.class_id,a.id,...(teacher?[]:[uid])]);
  return {assignment:a,teacher,...(teacher?{difficulties:commonDifficulties(submissions.map(s=>JSON.parse(s.payload)),a.quest)}:{}),submissions:submissions.map(({payload,...s})=>({...s,feedback:s.feedback?JSON.parse(s.feedback):null}))};
 }
 if(method==='GET'&&path==='submission'){
  const a=await assignment(db,url.searchParams.get('id')),student=id(url.searchParams.get('student')),c=await first(db,'SELECT owner FROM learning_classes WHERE id=?',[a.class_id]);if(c.owner!==uid&&student!==uid)error('無權查看其他學生的作業',403);if(c.owner!==uid)await member(db,a.class_id,uid);
  const version=Number(url.searchParams.get('version'));if(!Number.isInteger(version)||version<1)error('版本無效');const s=await first(db,'SELECT payload,feedback,version FROM learning_submissions WHERE assignment_id=? AND student=? AND version=?',[a.id,student,version]);if(!s)error('找不到提交版本',404);return {report:JSON.parse(s.payload),feedback:s.feedback?JSON.parse(s.feedback):null,version:s.version};
 }
 if(method==='POST'&&path==='submit'){
  exact(input,['assignmentId','expectedVersion','report']);const a=await assignment(db,input.assignmentId),m=await member(db,a.class_id,uid);if(!a.open)error('老師已停止收件',409);if(!Number.isInteger(input.expectedVersion)||input.expectedVersion<0||input.expectedVersion>=30)error('提交版本無效或已達30版上限');
  try{validateReport(input.report);}catch{error('學習紀錄格式不正確');}const report=structuredClone(input.report),q=report.learning.quests[a.quest];if(!q?.revisions?.length)error('請先儲存一版作品再交作業');if(Object.keys(report.learning.quests).length!==1)error('只能提交本次指定關卡');report.student={id:uid,name:m.alias};report.exportedAt=Math.max(Date.now(),report.exportedAt);const payload=JSON.stringify(report);if(new TextEncoder().encode(payload).length>750000)error('作業超過750 KB');
  const result=await exec(db,'INSERT INTO learning_submissions(assignment_id,student,version,payload,submitted_at) SELECT ?,?,?,?,? WHERE COALESCE((SELECT MAX(version) FROM learning_submissions WHERE assignment_id=? AND student=?),0)=? AND EXISTS(SELECT 1 FROM learning_assignments WHERE id=? AND open=1) ON CONFLICT DO NOTHING RETURNING version',[a.id,uid,input.expectedVersion+1,payload,Date.now(),a.id,uid,input.expectedVersion,a.id]);if(!result.rows.length)error('雲端已有較新版本或已停止收件，請重新整理；本機作品保留',409);return {version:result.rows[0].version};
 }
 if(method==='POST'&&path==='feedback'){
  exact(input,['assignmentId','student','version','comment','judgement']);const a=await assignment(db,input.assignmentId),c=await owned(db,a.class_id,uid);id(input.student);if(!Number.isInteger(input.version)||input.version<1||!Object.hasOwn(REVIEW_JUDGEMENTS,input.judgement))error('回饋版本或判讀無效');
  const s=await first(db,'SELECT payload,feedback FROM learning_submissions WHERE assignment_id=? AND student=? AND version=?',[a.id,input.student,input.version]);if(!s)error('找不到作品版本',404);if(s.feedback)error('此版已有回饋；請在學生下一版繼續回饋',409);const report=JSON.parse(s.payload),revision=report.learning.quests[a.quest].revisions.at(-1);let feedback;try{feedback=createFeedback(report,a.quest,revision.at,c.name.slice(0,46)+'老師',input.comment,input.judgement,Math.max(Date.now(),revision.at));}catch{error('請填寫1–400字具體回饋');}
  const result=await exec(db,'UPDATE learning_submissions SET feedback=? WHERE assignment_id=? AND student=? AND version=? AND feedback IS NULL RETURNING version',[JSON.stringify(feedback),a.id,input.student,input.version]);if(!result.rows.length)error('此版本已有回饋，請重新整理',409);return {feedback};
 }
 error('找不到班級功能',404);
}
