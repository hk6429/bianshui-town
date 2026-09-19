// 宋人的月令：一個月兩日（上旬、下旬），一年十二月共二十四日。
// 汴河十月閉口、來年二月開漕，冬季無漕船；義倉、常平倉存糧可續命。
export const MONTH_DAYS=2,YEAR_MONTHS=12,YEAR_DAYS=MONTH_DAYS*YEAR_MONTHS;
export const MONTH_NAMES=['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','臘月'];
export const SEASONS=[{key:'spring',name:'春'},{key:'summer',name:'夏'},{key:'autumn',name:'秋'},{key:'winter',name:'冬'}];
export const CLOSED_MONTHS=[10,11,12,1];
// 新局自二月開漕起算，第一天就有漕船。
export const EPOCH_MONTH=2;
export const dayOf=t=>Math.floor((t?.time||0)/24);
export function calendar(t){
 const day=dayOf(t),shifted=day+(EPOCH_MONTH-1)*MONTH_DAYS,yearDay=((shifted%YEAR_DAYS)+YEAR_DAYS)%YEAR_DAYS;
 const month=Math.floor(yearDay/MONTH_DAYS)+1,half=yearDay%MONTH_DAYS;
 const season=SEASONS[Math.floor((month-1)/3)];
 const open=!CLOSED_MONTHS.includes(month);
 return {day,year:Math.floor(shifted/YEAR_DAYS)+1,month,half,monthName:MONTH_NAMES[month-1],
  season:season.key,seasonName:season.name,riverOpen:open,
  label:`${season.name} · ${MONTH_NAMES[month-1]}${half?'下旬':'上旬'}`};
}
export const riverOpen=t=>calendar(t).riverOpen;
export const riverNote=t=>{const c=calendar(t);
 if(c.riverOpen)return `汴河通航（${c.label}）。`;
 const until=(2-c.month+YEAR_MONTHS)%YEAR_MONTHS||YEAR_MONTHS;
 return `汴河閉口，漕船不上（${c.label}）；約 ${until} 個月後二月開漕。`;};

// 入夜後的更鼓：一更至五更，兩個時辰一更。
export const WATCHES=['一更','二更','三更','四更','五更'];
export function watchOf(t){
 const h=((t?.time||0)%24+24)%24;
 if(h<5||h>=19)return WATCHES[Math.min(4,Math.floor((((h-19)%24)+24)%24/2))];
 return null;
}
