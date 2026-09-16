// Public-domain Song texts; the buildings are literary interpretations, not reconstructions.
export const SOURCES={
 city:{author:'孟元老',title:'《東京夢華錄》卷二〈酒樓〉',era:'南宋追記北宋汴京',quote:'凡京師酒店，門首皆縛綵樓歡門。',url:'https://zh.wikisource.org/zh-hant/東京夢華錄/卷二',note:'書中記錄汴京酒樓的歡門、廊道與夜間燈火。此處取其市井空間意象，並非特定酒樓復原。'},
 pond:{author:'楊萬里',title:'〈小池〉',era:'南宋 · 詩中小池',quote:'小荷才露尖尖角，早有蜻蜓立上頭。',url:'https://zh.wikisource.org/zh-hant/小池',note:'把小荷、樹陰與蜻蜓轉成可觀察的園景。詩未在此指定汴京地點。'},
 pavilion:{author:'歐陽修',title:'〈醉翁亭記〉',era:'北宋 · 滁州琅琊山',quote:'有亭翼然臨於泉上者，醉翁亭也。',url:'https://zh.wikisource.org/zh-hant/醉翁亭記',note:'取臨泉亭榭與遊人共樂的意象；滁州不在汴京，本亭為跨地域的文學轉譯。'},
 academy:{author:'朱熹',title:'〈觀書有感〉其一',era:'南宋 · 讀書的譬喻',quote:'半畝方塘一鑑開，天光雲影共徘徊。',url:'https://zh.wikisource.org/zh-hant/觀書有感',note:'以方塘與活水比喻讀書所得。遊戲把書齋與方塘組成書院，並非詩中建築的考據復原。'}
};
export const DESIGNS={
 residence:{name:'雅居小樓',type:'home',variant:0,mark:'居',sizes:[1],source:null,detail:'雙層民居、木欄與花窗；可住四人。'},
 mansion:{name:'四合雅宅',type:'home',variant:0,mark:'宅',sizes:[4],source:null,detail:'四格特殊民居，正廳與雙翼廂房圍合花木中庭；可住八人。'},
 kiln:{name:'精製窯坊',type:'work',variant:0,mark:'陶',sizes:[1],source:null,detail:'窯爐、煙囪與晾坯架；陶器加工加快。'},
 woodshop:{name:'精製木作坊',type:'work',variant:1,mark:'木',sizes:[1],source:null,detail:'鋸木棚、堆料與長工作檯；木器加工加快。'},
 weavery:{name:'精製織坊',type:'work',variant:2,mark:'織',sizes:[1],source:null,detail:'織機、彩線與曬布架；布匹加工加快。'},
 kilnHall:{name:'瓷窯大院',type:'work',variant:0,mark:'窯',sizes:[4],source:null,detail:'四格雙窯、晾坯庭與倉房；可容六名工匠，加工速度兩倍。'},
 woodshopHall:{name:'木作營造院',type:'work',variant:1,mark:'木',sizes:[4],source:null,detail:'四格木作大廳、堆料場與鋸架；可容六名工匠，加工速度兩倍。'},
 weaveryHall:{name:'織錦大院',type:'work',variant:2,mark:'錦',sizes:[4],source:null,detail:'四格織機廳、染布架與曬場；可容六名工匠，加工速度兩倍。'},
 garden:{name:'百花公園',type:'garden',variant:0,mark:'園',sizes:[1,4],source:null,detail:'公共花圃、石徑與歇腳長椅；四格為中央花壇大花園。'},

 tea:{name:'臨街茶坊',type:'shop',variant:0,mark:'茶',sizes:[1,4],source:'city',detail:'開敞茶棚、圓桌與矮凳；四格變成環廊茶院。'},
 food:{name:'炊煙食肆',type:'shop',variant:1,mark:'食',sizes:[1,4],source:'city',detail:'高灶煙囪、蒸籠與暖色雨棚；四格擴為前店後廚。'},
 textile:{name:'錦色布莊',type:'shop',variant:2,mark:'布',sizes:[1,4],source:'city',detail:'高挑倉閣、彩布垂簾與布架；四格成為雙翼布行。'},
 wine:{name:'夢華酒樓',type:'shop',variant:1,mark:'酒',sizes:[4],source:'city',detail:'四格合院、雙層樓閣、綵樓歡門與酒甕。'},
 academy:{name:'方塘書院',type:'garden',variant:0,mark:'書',sizes:[4],source:'academy',detail:'講堂、兩側廊房、中央方塘；居民閒時來此讀書。'},
 pavilion:{name:'臨泉亭',type:'garden',variant:0,mark:'亭',sizes:[1,4],source:'pavilion',detail:'開敞六角亭、石徑與泉池；四格增添迴廊與樹蔭。'},
 pond:{name:'小荷池塘',type:'garden',variant:0,mark:'荷',sizes:[1,4],source:'pond',detail:'挖出池床，注水後長出荷葉、荷花；蜻蜓在池面盤旋。'}
};
export const designFor=b=>b.design|| (b.type==='shop'?['tea','food','textile'][b.variant]:null);
export function squareCells(c){return [{x:c.x,z:c.z},{x:c.x+1,z:c.z},{x:c.x,z:c.z+1},{x:c.x+1,z:c.z+1}];}
export function isSquare(cells){return cells.length===4&&new Set(cells.map(c=>`${c.x},${c.z}`)).size===4&&Math.max(...cells.map(c=>c.x))-Math.min(...cells.map(c=>c.x))===1&&Math.max(...cells.map(c=>c.z))-Math.min(...cells.map(c=>c.z))===1;}
export const gardenActivity=b=>({pond:'沿池賞荷、看蜻蜓',pavilion:'在亭中歇腳、賞景',academy:'在書院讀書、觀方塘'})[b.design]||'在園中散步';
