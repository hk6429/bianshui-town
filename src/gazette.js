import {calendar,riverNote,watchOf} from './calendar.js';
import {festivalNote} from './festivals.js';
import {marketNote} from './market.js';
import {nextMilestone,rankName} from './milestones.js';
import {advisors} from './advisors.js';
import {hasGovernment} from './civic.js';
import {almanacOf} from './disasters.js';
import {managed} from './city-finance.js';
import {formatMoney} from './money.js';

// 邸報：每日一卷，把月令、河況、市況、政情與災情併成幾行。
export function gazette(t){
 const c=calendar(t),lines=[];
 lines.push(`${c.label}（第 ${c.day+1} 日）${watchOf(t)?`· ${watchOf(t)}`:''}`);
 lines.push(riverNote(t));
 lines.push(marketNote(t));
 const festival=festivalNote(t);
 if(festival)lines.push(festival);
 const next=nextMilestone(t);
 lines.push(next?`今為${rankName(t)}；下一階「${next.name}」還差：${next.text}。`:`今為${rankName(t)}，已是最高等第。`);
 if(managed(t))lines.push(`鎮庫 ${formatMoney(t.city.treasury)}。`);
 if(hasGovernment(t)){
  const worst=advisors(t).find(a=>a.level==='bad')||advisors(t).find(a=>a.level==='watch');
  if(worst)lines.push(`${worst.office}稟報：${worst.advice}`);
 }
 const notice=almanacOf(t).notice;
 if(notice)lines.push(`近日災情：${notice}`);
 return lines;
}
