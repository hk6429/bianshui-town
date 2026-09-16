export const STORY_TYPES=[
 {type:'story',title:'巷口聽說書',gather:'趕去聽一段說書',activity:'聽說書人講汴河趣事',end:'說書告一段落，街坊各自散去'},
 {type:'market',title:'攤前看新貨',gather:'應聲到攤前看看',activity:'在攤前聽行商介紹新貨',end:'攤前招呼歇下，人們繼續趕路'},
 {type:'tea',title:'茶坊遇熟客',gather:'赴茶坊與熟客碰面',activity:'和熟客聊一盞茶的工夫',end:'茶敘散席，熟客相約改日再會'}
];

export const STORY_BRANCHES={
 stage:{title:'勾欄長篇評話',activity:'在勾欄聽說書人鋪陳長篇故事',reason:'本次在落成瓦舍相聚，採用勾欄長篇評話。'},
 street:{title:'街口短篇趣談',activity:'在商鋪前聽說書人講一段市井趣談',reason:'本次在商鋪前相聚，採用街口短篇趣談。'}
};
export function storyBranch(type,venue){return type==='story'?(venue.design==='wazi'?'stage':'street'):null;}
