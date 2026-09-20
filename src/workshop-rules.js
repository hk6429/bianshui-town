// 印書坊保留舊存檔的 garden 型別，仍兼具教育與製造用途。
export const isWorkshop=b=>!!b&&(b.type==='work'||b.design==='movableTypeHall');
export const RECIPES=[{input:'clay',output:'ceramics',seconds:14,action:'拉坯、入窯燒製'},{input:'timber',output:'furniture',seconds:12,action:'鋸切、打磨木器'},{input:'fiber',output:'cloth',seconds:16,action:'紡線、上機織布'},{input:'paper',inputs:['paper','ink'],output:'books',seconds:18,action:'排字、上墨、印紙成冊'}];
export const recipeFor=b=>b?.design==='movableTypeHall'?RECIPES[3]:b?.type==='work'?RECIPES[b.variant]:null;
export const acceptsGoods=(b,good)=>b?.type==='shop'&&(good!=='books'||b.design==='bookshop');
