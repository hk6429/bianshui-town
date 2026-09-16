import {Town} from './simulation.js';
import {validateSave} from './save-schema.js';
// Work only on a detached town. Publish after validation, rendering and storage succeed.
export function editTown(current,edit,{prepare=()=>{},persist=()=>({ok:true})}={}){
 try{
  const before=validateSave(current.toJSON()),draft=Town.restore(before);draft.revision=current.revision;
  const result=edit(draft);if(!result)return {ok:false,town:current,result};
  const data=validateSave(draft.toJSON());prepare(draft);
  const saved=persist(data);if(!saved?.ok)return {ok:false,town:current,error:new Error('存檔未成功，原小鎮與進度仍保留。'),status:saved?.status};
  return {ok:true,town:draft,before,result};
 }catch(error){return {ok:false,town:current,error};}
}
