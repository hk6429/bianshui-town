const FORMAT='bianshui-save';
export const SAVE_KEY='bianshui-town-v1';
export const MAX_SAVE_BYTES=2_000_000;
export class SaveStore{
 constructor({storage,validate,owner,now=Date.now,key=SAVE_KEY}){Object.assign(this,{storage,validate,owner,now,key});this.seen=null;this.blocked=null;this.error='';}
 decode(raw){if(typeof raw!=='string'||new TextEncoder().encode(raw).length>MAX_SAVE_BYTES)throw Error('存檔過大或不是文字');const parsed=JSON.parse(raw);if(parsed?.format===FORMAT){if(!Number.isSafeInteger(parsed.revision)||parsed.revision<1||typeof parsed.owner!=='string')throw Error('存檔版本紀錄無效');return {data:this.validate(parsed.data),record:parsed};}return {data:this.validate(parsed),record:{revision:0}};}
 read(key=this.key){return this.storage.getItem(key);}
 record(data){let revision=0;try{revision=this.decode(this.read()).record.revision;}catch{}return JSON.stringify({format:FORMAT,revision:revision+1,owner:this.owner,savedAt:this.now(),data:this.validate(data)});}
 load(){try{this.seen=this.read();if(this.seen===null){this.blocked=null;return {status:'empty',data:null};}const {data}=this.decode(this.seen);this.blocked=null;return {status:'ready',data};}catch(error){this.blocked='recovery';this.error=error.message;try{if(this.seen!==null)this.storage.setItem(this.key+':quarantine',this.seen);}catch{}return {status:'recovery',data:null,message:'原存檔無法讀取，已停止自動覆寫。'+error.message};}}
 save(data){if(this.blocked==='recovery')return {ok:false,status:'recovery'};try{const raw=this.record(data);this.storage.setItem(this.key+':branch:'+this.owner,raw);if(this.blocked)return {ok:false,status:this.blocked};if(this.read()!==this.seen){this.blocked='conflict';return {ok:false,status:'conflict'};}const old=this.seen;if(old!==null){try{this.decode(old);this.storage.setItem(this.key+':backup',old);}catch(error){this.blocked='recovery';return {ok:false,status:'recovery'};}}this.storage.setItem(this.key,raw);this.seen=raw;return {ok:true,status:'saved'};}catch(error){this.error=error.message;return {ok:false,status:'storage-error',message:error.message};}}
 checkpoint(data){try{this.storage.setItem(this.key+':reset',this.record(data));return {ok:true};}catch(error){return {ok:false,message:error.message};}}
 replace(data){try{this.validate(data);this.seen=this.read();if(this.seen!==null){try{this.decode(this.seen);}catch{this.storage.setItem(this.key+':quarantine',this.seen);this.seen=null;}}this.blocked=null;const raw=this.record(data);this.storage.setItem(this.key+':branch:'+this.owner,raw);if(this.seen!==null)this.storage.setItem(this.key+':backup',this.seen);this.storage.setItem(this.key,raw);this.seen=raw;return {ok:true,status:'saved'};}catch(error){this.blocked='recovery';this.error=error.message;return {ok:false,status:'storage-error',message:error.message};}}
 preview(text){return this.decode(text).data;}
 export(data){return JSON.stringify({format:FORMAT,revision:1,owner:this.owner,savedAt:this.now(),data:this.validate(data)},null,2);}
 candidate(id){return this.decode(this.read(id==='current'?this.key:this.key+':'+id)).data;}
 candidates(){const keys=['current','backup','reset'];for(let i=0;i<this.storage.length;i++){const key=this.storage.key(i);if(key?.startsWith(this.key+':branch:'))keys.push(key.slice(this.key.length+1));}return [...new Set(keys)].flatMap(id=>{try{const {data,record}=this.decode(this.read(id==='current'?this.key:this.key+':'+id));return [{id,data,savedAt:record.savedAt||0,owner:record.owner||'舊版'}];}catch{return [];}});}
 rescueRaw(){try{return this.read(this.key+':quarantine')??this.read()??'';}catch{return this.seen??'';}}
 externalChange(){try{if(this.read()!==this.seen){this.blocked='conflict';return true;}}catch{this.blocked='recovery';return true;}return false;}
}
