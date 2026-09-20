import {LITERARY_QUESTS} from '../src/literary-quests.js';
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
const exact=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||keys.some(k=>!Object.hasOwn(v,k))||Object.keys(v).some(k=>!keys.includes(k)))fail('小隊欄位無效');};
const text=(v,max=400)=>{if(typeof v!=='string'||!v.trim()||v.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))fail('請填寫有效文字');return v.trim();};
const id=v=>{if(typeof v!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(v))fail('識別碼無效');return v;};
const rows=async(db,sql,args=[])=>(await db.execute({sql,args})).rows;
const one=async(db,sql,args=[])=>(await rows(db,sql,args))[0];
async function assignment(db,aid,uid){const a=await one(db,'SELECT a.*,c.owner FROM learning_assignments a JOIN learning_classes c ON c.id=a.class_id WHERE a.id=?',[id(aid)]);if(!a)fail('找不到任務',404);const teacher=a.owner===uid;if(!teacher&&!await one(db,'SELECT student FROM learning_members WHERE class_id=? AND student=?',[a.class_id,uid]))fail('不屬於這個班級',403);return {...a,teacher};}
async function access(db,tid,uid){const t=await one(db,'SELECT * FROM learning_teams WHERE id=?',[id(tid)]);if(!t)fail('找不到小隊',404);const a=await assignment(db,t.assignment_id,uid),members=await rows(db,'SELECT m.*,c.alias FROM learning_team_members m JOIN learning_members c ON c.class_id=? AND c.student=m.student WHERE m.team_id=? ORDER BY m.role',[a.class_id,t.id]);if(!a.teacher&&!members.some(m=>m.student===uid))fail('只能查看自己的小隊',403);return {t,a,members};}
export const TEAM_ROLES=['原文尋訪員','不同觀點提問員','推論整理員','證據檢查員'];
export async function teamRequest(db,uid,url,method,input){const action=url.pathname.split('/').at(-1);
 if(method==='GET'&&action==='team-list'){
  const a=await assignment(db,url.searchParams.get('assignment'),uid),teams=await rows(db,`SELECT t.* FROM learning_teams t WHERE t.assignment_id=? ${a.teacher?'':'AND EXISTS(SELECT 1 FROM learning_team_members m WHERE m.team_id=t.id AND m.student=?)'} ORDER BY t.created_at`,[a.id,...(a.teacher?[]:[uid])]);
  const result=[];for(const t of teams){const {members}=await access(db,t.id,uid);const versions=await rows(db,'SELECT version,author,conclusion,snapshot,created_at FROM learning_team_versions WHERE team_id=? ORDER BY version DESC',[t.id]);result.push({...t,version:versions[0]?.version||0,members,versions:versions.map(v=>({...v,snapshot:JSON.parse(v.snapshot)}))});}
  return {teacher:a.teacher,quest:a.quest,open:!!a.open,teams:result,roles:TEAM_ROLES,...(a.teacher?{roster:await rows(db,'SELECT student,alias FROM learning_members WHERE class_id=?',[a.class_id])}:{})};
 }
 if(method==='POST'&&action==='team-create'){
  exact(input,['assignmentId','name','members']);const a=await assignment(db,input.assignmentId,uid);if(!a.teacher)fail('只有本班老師能建立小隊',403);if(!a.open)fail('任務已停止收件',409);const name=text(input.name,48);if(!Array.isArray(input.members)||input.members.length<2||input.members.length>4||new Set(input.members).size!==input.members.length)fail('請選2–4位不同學生');
  for(const student of input.members){id(student);if(!await one(db,'SELECT student FROM learning_members WHERE class_id=? AND student=?',[a.class_id,student]))fail('成員不在本班',403);}
  if((await one(db,'SELECT COUNT(*) AS n FROM learning_teams WHERE assignment_id=?',[a.id])).n>=30)fail('每份任務最多30隊');const tid=crypto.randomUUID();
  try{await db.batch([{sql:'INSERT INTO learning_teams(id,assignment_id,name,created_at) VALUES(?,?,?,?)',args:[tid,a.id,name,Date.now()]},...input.members.map((student,i)=>({sql:'INSERT INTO learning_team_members(team_id,assignment_id,student,role) VALUES(?,?,?,?)',args:[tid,a.id,student,i]}))],'write');}catch(e){if(/UNIQUE|constraint/i.test(e.message))fail('其中一位學生已在這份任務的小隊中',409);throw e;}return {id:tid};
 }
 if(method==='POST'&&action==='team-contribute'){
  exact(input,['teamId','expectedRevision','evidence','reason','replyTo','reply']);const {t,a,members}=await access(db,input.teamId,uid),mine=members.find(m=>m.student===uid);if(!mine)fail('老師可查看，但不能代寫隊員內容',403);if(!a.open)fail('任務已停止收件',409);if(!Number.isInteger(input.expectedRevision)||input.expectedRevision<0||input.expectedRevision>=100)fail('貢獻版本無效或達上限');const lines=LITERARY_QUESTS[a.quest].steps.flatMap(s=>s.text.split('\n').filter(Boolean));if(!Number.isInteger(input.evidence)||!lines[input.evidence])fail('請選本關的原文或改編證詞');const reason=text(input.reason),replyTo=input.replyTo||null,reply=input.reply||'';
  if(replyTo){if(replyTo===uid||!members.some(m=>m.student===replyTo&&m.revision>0))fail('請選已提出線索的另一位隊友');text(reply);}else if(reply)fail('請選回應的隊友');
  const changed=await rows(db,'UPDATE learning_team_members SET evidence=?,reason=?,reply_to=?,reply=?,revision=revision+1 WHERE team_id=? AND student=? AND revision=? AND EXISTS(SELECT 1 FROM learning_assignments WHERE id=? AND open=1) RETURNING revision',[input.evidence,reason,replyTo,reply,t.id,uid,input.expectedRevision,a.id]);if(!changed.length)fail('已有較新貢獻或已停止收件，請更新小隊',409);return {revision:changed[0].revision};
 }
 if(method==='POST'&&action==='team-conclude'){
  exact(input,['teamId','expectedVersion','memberRevisions','conclusion']);const {t,a,members}=await access(db,input.teamId,uid);if(!members.some(m=>m.student===uid))fail('請由隊員整理結論',403);if(!a.open)fail('任務已停止收件',409);if(!members.every(m=>m.revision>0&&m.reply_to&&m.reply.trim()))fail('每位隊員先提出線索，再回應一位隊友，才能整理共同結論');if(!Number.isInteger(input.expectedVersion)||input.expectedVersion<0||input.expectedVersion>=12)fail('結論版本無效或已達12版');
  if(!input.memberRevisions||typeof input.memberRevisions!=='object'||Array.isArray(input.memberRevisions)||Object.keys(input.memberRevisions).length!==members.length||members.some(m=>input.memberRevisions[m.student]!==m.revision))fail('隊友貢獻有更新，請讀取後再整理',409);const conclusion=text(input.conclusion,600);const snapshot=JSON.stringify(members.map(({student,alias,role,evidence,reason,reply_to,reply,revision})=>({student,alias,role,evidence,reason,reply_to,reply,revision})));
  const checks=members.map(()=>'(SELECT revision FROM learning_team_members WHERE team_id=? AND student=?)=?').join(' AND '),checkArgs=members.flatMap(m=>[t.id,m.student,m.revision]);
  const inserted=await rows(db,`INSERT INTO learning_team_versions(team_id,version,author,conclusion,snapshot,created_at) SELECT ?,?,?,?,?,? WHERE COALESCE((SELECT MAX(version) FROM learning_team_versions WHERE team_id=?),0)=? AND EXISTS(SELECT 1 FROM learning_assignments WHERE id=? AND open=1) AND ${checks} ON CONFLICT DO NOTHING RETURNING version`,[t.id,input.expectedVersion+1,uid,conclusion,snapshot,Date.now(),t.id,input.expectedVersion,a.id,...checkArgs]);if(!inserted.length)fail('小隊已有更新，請重新整理；草稿仍保留',409);
  return {version:inserted[0].version};
 }
 fail('找不到小隊功能',404);
}
