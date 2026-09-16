import {AUTHORS} from './literati-data.js';
import {SOURCES} from './heritage.js';
export const SOURCE_WORK={wazi:'dream-stage',city:'dream-wine',pond:'pond',pavilion:'ouyang',academy:'academy'};
export const WORKS=Object.fromEntries([...AUTHORS.map(a=>[a.id,{title:a.title,author:a.name,authorId:a.id,source:a.id==='ouyang'?'pavilion':null}]),...Object.entries(SOURCE_WORK).filter(([,id])=>id!=='ouyang').map(([source,id])=>[id,{title:SOURCES[source].title,author:SOURCES[source].author,source}])]);
