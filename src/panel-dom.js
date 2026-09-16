const nodeKey=n=>n.nodeType===1?(n.id?`id:${n.id}`:n.hasAttribute('data-manage')?`manage:${n.dataset.building}:${n.dataset.manage}`:n.hasAttribute('data-resident')?`person:${n.dataset.resident}`:n.hasAttribute('data-reading')?`reading:${n.dataset.reading}`:n.className?`${n.tagName}.${n.className}`:null):null;
const compatible=(a,b)=>a.nodeType===b.nodeType&&(a.nodeType!==1||a.tagName===b.tagName)&&nodeKey(a)===nodeKey(b);
function patchChildren(parent,next){
 const old=[...parent.childNodes],used=new Set();
 for(const [i,want] of [...next.childNodes].entries()){
  const key=nodeKey(want);let keep=key?old.find(n=>!used.has(n)&&compatible(n,want)):old.find(n=>!used.has(n)&&!nodeKey(n)&&compatible(n,want));
  if(!keep)keep=want.cloneNode(true);else if(keep.nodeType===3){if(keep.nodeValue!==want.nodeValue)keep.nodeValue=want.nodeValue;}else if(keep.nodeType===1){
   for(const a of [...keep.attributes])if(!want.hasAttribute(a.name))keep.removeAttribute(a.name);
   for(const a of [...want.attributes])if(keep.getAttribute(a.name)!==a.value)keep.setAttribute(a.name,a.value);
   patchChildren(keep,want);
  }
  used.add(keep);if(parent.childNodes[i]!==keep)parent.insertBefore(keep,parent.childNodes[i]||null);
 }
 for(const node of old)if(!used.has(node))node.remove();
}
export function patchPanel(panel,html,scrollRoot=panel){
 const template=panel.ownerDocument.createElement('template');template.innerHTML=html;
 const heading=template.content.querySelector('h2');if(heading){heading.id||='inspector-title';heading.tabIndex=-1;}
 const active=panel.ownerDocument.activeElement,owned=panel.contains(active),scroll=scrollRoot.scrollTop;
 patchChildren(panel,template.content);
 if(owned){const target=active.isConnected?active:panel.querySelector('h2');target?.focus({preventScroll:true});}
 scrollRoot.scrollTop=scroll;
}
export function focusHeading(panel){const heading=panel.querySelector('h2');if(!heading)return;heading.tabIndex=-1;panel.scrollTop=0;heading.focus({preventScroll:true});}
