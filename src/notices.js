export class NoticeHistory {
 constructor(limit=30){this.limit=limit;this.entries=[];this.nextId=1;}
 add(text,at=Date.now()){
  const entry={id:this.nextId++,text:String(text),at};
  this.entries.unshift(entry);this.entries.length=Math.min(this.entries.length,this.limit);
  return entry;
 }
}
export function installNotices(){
 const history=new NoticeHistory(),button=document.querySelector('#notices-btn'),dialog=document.querySelector('#notices');
 function render(){
  const list=document.querySelector('#notice-list');list.replaceChildren();
  document.querySelector('#notice-empty').hidden=history.entries.length>0;
  for(const entry of history.entries){
   const li=document.createElement('li'),time=document.createElement('time'),p=document.createElement('p');
   time.dateTime=new Date(entry.at).toISOString();time.textContent=new Date(entry.at).toLocaleTimeString('zh-TW',{hour12:false});
   p.textContent=entry.text;li.append(time,p);list.append(li);
  }
 }
 button.onclick=()=>{render();dialog.showModal();};
 return {record(text){history.add(text);button.textContent=`通知紀錄（${history.entries.length}）`;if(dialog.open)render();}};
}
