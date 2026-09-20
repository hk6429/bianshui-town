export async function readSave(db,uid){const row=(await db.execute({sql:'SELECT revision, payload, updated_at FROM town_saves WHERE user_id = ?',args:[uid]})).rows[0];return row?{revision:Number(row.revision),data:JSON.parse(row.payload),updatedAt:row.updated_at}:{revision:0,data:null};}
export async function writeSave(db,uid,payload,expected){
 const updatedAt=new Date().toISOString(),result=await db.execute(expected===0?{sql:'INSERT INTO town_saves(user_id, revision, payload, updated_at) VALUES (?, 1, ?, ?) ON CONFLICT(user_id) DO NOTHING RETURNING revision',args:[uid,payload,updatedAt]}:{sql:'UPDATE town_saves SET revision=revision+1, payload=?, updated_at=? WHERE user_id=? AND revision=? RETURNING revision',args:[payload,updatedAt,uid,expected]});
 if(!result.rows.length)return null;return {revision:Number(result.rows[0].revision),updatedAt};
}
