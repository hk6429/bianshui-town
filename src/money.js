// 宋代以「文」為基本單位，一貫＝1000文；介面顯示 N貫N文。
export const COINS_PER_STRING=1000;
export function formatMoney(value){
 const n=Math.round(Number(value)||0),sign=n<0?'−':'',abs=Math.abs(n);
 const strings=Math.floor(abs/COINS_PER_STRING),coins=abs%COINS_PER_STRING;
 if(!strings)return `${sign}${coins} 文`;
 return coins?`${sign}${strings} 貫 ${coins} 文`:`${sign}${strings} 貫`;
}
