// 先由 save-schema 驗證欄位，再檢查印製來源之間的關係。
// 已歸檔的貨物 ID 為歷史引用，不要求仍出現在目前清單。
export function validateBookEconomy(e,fail){
 if(!e)return;
 const byId=new Map(e.lots.map(l=>[l.id,l])),usedInk=new Set();
 const invalid=message=>fail('economy.books',message);
 if(e.lots.some(l=>l.good==='books'||l.at==='consumed')&&e.imported!==e.lots.length+e.archived)invalid('進口貨物與現存及歸檔貨物不守恆');
 for(const l of e.lots){
  if(l.at==='consumed'){
   if(l.good!=='ink'||!l.consumedBy||l.consumedBy===l.id||l.consumedBy>=e.nextId)invalid('耗用紀錄必須為印墨並指向另一冊書籍');
   const book=byId.get(l.consumedBy);
   if(book?book.good!=='books':!e.archived)invalid('耗墨所指書籍不存在或不是書籍');
  }else if(l.consumedBy!==undefined)invalid('只有耗用印墨可記錄製成書籍');
  if(l.good!=='books'){
   if(l.materials!==undefined)invalid('只有書籍可記錄紙墨來源');
   continue;
  }
  const m=l.materials,paper=m?.find(x=>x.good==='paper'),ink=m?.find(x=>x.good==='ink');
  if(!m||m.length!==2||!paper||!ink||paper.id!==l.id||ink.id===paper.id||ink.id>=e.nextId||paper.origin!==l.origin||!l.madeAt)invalid('書籍須有兩份不同且可追溯的紙墨來源');
  if(usedInk.has(ink.id))invalid('同一份印墨不可重複製成多冊書籍');
  usedInk.add(ink.id);
  const source=byId.get(ink.id);
  if(source?(source.good!=='ink'||source.at!=='consumed'||source.consumedBy!==l.id||source.origin!==ink.origin):!e.archived)invalid('書籍墨料與耗用紀錄不一致');
 }
 for(const l of e.lots.filter(l=>l.at==='consumed')){
  const book=byId.get(l.consumedBy);
  if(book&&!book.materials?.some(m=>m.good==='ink'&&m.id===l.id))invalid('耗用印墨未列入對應書籍來源');
 }
}
