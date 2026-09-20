import {NEW_DESIGNS} from './variety.js';
// Public-domain Song texts; the buildings are literary interpretations, not reconstructions.
export const SOURCES={
 wazi:{author:'孟元老',title:'《東京夢華錄》卷五〈京瓦伎藝〉',era:'南宋追記北宋汴京',quote:'霍四究，說《三分》。尹常賣，《五代史》。',url:'https://zh.wikisource.org/zh-hant/東京夢華錄/卷五',note:'卷二記桑家瓦子與勾欄，卷五記講史、小說等伎藝。遊戲說書內容為汴河生活故事，並非史料原有演出腳本。'},

 city:{author:'孟元老',title:'《東京夢華錄》卷二〈酒樓〉',era:'南宋追記北宋汴京',quote:'凡京師酒店，門首皆縛綵樓歡門。',url:'https://zh.wikisource.org/zh-hant/東京夢華錄/卷二',note:'書中記錄汴京酒樓的歡門、廊道與夜間燈火。此處取其市井空間意象，並非特定酒樓復原。'},
 pond:{author:'楊萬里',title:'〈小池〉',era:'南宋 · 詩中小池',quote:'小荷才露尖尖角，早有蜻蜓立上頭。',url:'https://zh.wikisource.org/zh-hant/小池',note:'把小荷、樹陰與蜻蜓轉成可觀察的園景。詩未在此指定汴京地點。'},
 pavilion:{author:'歐陽修',title:'〈醉翁亭記〉',era:'北宋 · 滁州琅琊山',quote:'有亭翼然臨於泉上者，醉翁亭也。',url:'https://zh.wikisource.org/zh-hant/醉翁亭記',note:'取臨泉亭榭與遊人共樂的意象；滁州不在汴京，本亭為跨地域的文學轉譯。'},
 academy:{author:'朱熹',title:'〈觀書有感〉其一',era:'南宋 · 讀書的譬喻',quote:'半畝方塘一鑑開，天光雲影共徘徊。',url:'https://zh.wikisource.org/zh-hant/觀書有感',note:'以方塘與活水比喻讀書所得。遊戲把書齋與方塘組成書院，並非詩中建築的考據復原。'}
};
export const DESIGNS={
 yueyangTower:{cat:'garden',name:'岳陽樓',type:'garden',variant:0,mark:'岳',sizes:[4],cost:18000,source:null,detail:'宋韻任務解鎖。三層樓閣與登臨平臺；宋代文學意象模型，非歷史精確復原。'},
 kaifengCourt:{cat:'civic',name:'開封府',type:'garden',variant:0,mark:'府',sizes:[4],cost:18000,source:null,detail:'宋韻任務解鎖。府門、公堂與廊院；後世包公戲曲的教學場景，非宋代案件實錄。'},
 movableTypeHall:{cat:'school',name:'活字印書坊',type:'garden',variant:0,mark:'印',sizes:[4],cost:15000,source:null,detail:'宋韻任務解鎖。字櫃、排字臺、泥字窯與晾紙架；提供學習名額，書籍商品交易尚未加入。'},
 ...NEW_DESIGNS,
 // 文教：村塾→鎮學→書院三層，教育名額逐層增加。 // 升縣後才解鎖的縣級建置。
 countyOffice:{cat:'civic',name:'縣衙',type:'garden',variant:0,mark:'縣',sizes:[4],cost:30000,rank:4,source:null,detail:'四格縣衙：儀門、大堂與六房。奉旨升縣後才能營造；與監鎮廨同樣開啟鎮政議事，規制更高。每格 30 貫。'},
 countySchool:{cat:'school',name:'縣學',type:'garden',variant:0,mark:'庠',sizes:[4],cost:27000,rank:4,source:null,detail:'四格縣學：大成殿、明倫堂與齋舍。教育名額為書院的一又四分之一，是全鎮最高學府。升縣後解鎖，每格 27 貫。'},
 cityWall:{cat:'civic',name:'城垣',type:'garden',variant:0,mark:'城',sizes:[1,4],cost:21000,rank:4,source:null,detail:'夯土包磚的城垣與馬面：每段可抵擋一次災害，與義倉相加計算。升縣後解鎖，每格 21 貫。'},
 zhengdian:{cat:'shop',name:'正店',type:'shop',variant:1,mark:'正',sizes:[4],cost:36000,rank:4,source:null,detail:'四格正店：綵樓歡門、樓閣雅座，自釀自沽。零售量與酒樓同級，並計入酒務榷酤。升縣後解鎖，每格 36 貫。'},
 // 商鋪中的兩種行當：邸店留宿客商，質庫收質放貸。
 inn:{cat:'shop',name:'邸店',type:'shop',variant:1,mark:'邸',sizes:[1,4],cost:24000,source:null,detail:'邸店：前店後棧，留宿往來客商並寄放貨物。每座各為小鎮多帶來一批客人，四格加倍。每格 24 貫。'},
 pawnshop:{cat:'shop',name:'質庫',type:'shop',variant:1,mark:'質',sizes:[1],cost:27000,source:null,detail:'質庫：收質放貸，月息三分。落成後每日為鎮庫帶來一筆息錢，欠款時效率同樣打折。每格 27 貫。'},
 villageSchool:{cat:'school',name:'村塾',type:'garden',variant:0,mark:'塾',sizes:[1],cost:12000,source:null,detail:'一格村塾：一位塾師、一間講堂與幾張矮案。教育名額為書院的一半，沿路覆蓋較短，是小鎮最早能負擔的文教設施。每格 12 貫。'},
 townSchool:{cat:'school',name:'鎮學',type:'garden',variant:0,mark:'學',sizes:[1,4],cost:21000,source:null,detail:'鎮學：講堂、齋舍與小庭；教育名額為書院的四分之三，四格再加廊房與射圃。每格 21 貫。'},
 // 公設：宋代鎮級沒有「市政廳」，只設監鎮官與其屬務。
 townOffice:{cat:'civic',name:'監鎮廨',type:'garden',variant:0,mark:'監',sizes:[4],cost:22500,source:null,detail:'四格監鎮廨：監鎮官治事的廳事、耳房與影壁。落成後開啟鎮政議事（戶曹、工曹、巡檢、教諭、醫官、里正六位僚屬回報鎮務），並且是「置鎮」里程碑的必要條件。每格 22 貫 500 文。'},
 taxOffice:{cat:'civic',name:'商稅務',type:'garden',variant:0,mark:'稅',sizes:[1],cost:30000,source:null,detail:'商稅務：宋制過稅二分、住稅三分。落成後每筆成交額外抽二分過稅入鎮庫，是鎮級最穩定的稅源。每格 30 貫。'},
 wineOffice:{cat:'civic',name:'酒務',type:'garden',variant:0,mark:'酒',sizes:[1],cost:30000,source:null,detail:'酒務：官榷酒麴，按鎮上酒樓與食肆數目每日抽榷酤錢。酒樓、食肆越多，這筆收入越可觀。每格 30 貫。'},
 postStation:{cat:'civic',name:'遞鋪',type:'garden',variant:0,mark:'遞',sizes:[1],cost:18000,source:null,detail:'遞鋪：遞夫換馬傳送文書。朝廷升格的詔書由遞鋪送到，是「奉旨升縣」里程碑的必要條件。每格 18 貫。'},
 // 祠廟：不供應服務，但安一方人心，與園景同樣提高宜居。
 earthShrine:{cat:'shrine',name:'土地廟',type:'garden',variant:0,mark:'社',sizes:[1],cost:12000,source:null,detail:'一格土地廟：小殿、香爐與老樹。街坊四時祭社，提供與園景同樣的宜居加成。每格 12 貫。'},
 cityGodTemple:{cat:'shrine',name:'城隍廟',type:'garden',variant:0,mark:'城',sizes:[4],cost:18000,source:null,detail:'四格城隍廟：山門、戲臺與正殿。廟會時人聲鼎沸，宜居加成高於一般園景。每格 18 貫。'},
 // 水運：汴河邊的營生。
 dock:{cat:'water',name:'河津碼頭',type:'garden',variant:0,mark:'津',sizes:[1,4],cost:24000,source:null,detail:'碼頭棧橋與起卸架：落成後腳夫每趟多搬一件，四格再多一件。汴河冬季閉口期間停用。每格 24 貫。'},
 granary:{cat:'water',name:'義倉',type:'garden',variant:0,mark:'倉',sizes:[1,4],cost:21000,source:null,detail:'義倉：豐年納穀、凶年賑濟。每處儲糧可抵銷一次災害的損失，汴水漲與時疫都靠它緩衝。每格 21 貫。'},
 watermill:{cat:'water',name:'水碾磨',type:'garden',variant:0,mark:'碾',sizes:[1],cost:27000,source:null,detail:'臨渠水輪帶動碾磨：沿路範圍內的作坊加工速度提高一成。每格 27 貫。'},
 firePost:{cat:'civic',name:'軍巡鋪',largeName:'四方軍巡總鋪',type:'garden',variant:0,mark:'防',sizes:[1,4],source:null,detail:'望火樓、警鐘與水桶架；每級巡守8處（一格）或32處（四格），沿路24步起，每級加4步；降低火警機率與損害。每格 15 貫，維護 450 文乘級數。'},
 cleaningYard:{cat:'civic',name:'街道司',largeName:'四方街道總司',type:'garden',variant:0,mark:'淨',sizes:[1,4],source:null,detail:'清運車、分類桶與堆置棚；每日一格每級處理12份、四格48份，沿路24步起，每級加4步。人口與作坊產出髒污，欠款降低服務。每格建設 15 貫、維護 450 文乘級數。'},
 well:{cat:'civic',name:'街坊水井',largeName:'四方井院',type:'garden',variant:0,mark:'井',sizes:[1,4],source:null,detail:'轆轤、井欄與汲水桶；一格每級供水12人、四格48人，沿路24步內供應住宅，每升一級增加4步。建設每格 15 貫，每日每格 450 文乘級數。'},
 wazi:{cat:'shop',name:'街巷說書棚',largeName:'瓦舍勾欄',type:'garden',variant:0,mark:'說',sizes:[1,4],source:'wazi',detail:'說書臺、篷頂與聽眾長凳；四格成帶圍廊的瓦舍勾欄，定期聚眾聽書。'},
 orchard:{cat:'garden',name:'桑柳果圃',largeName:'桑柳田園',type:'garden',variant:0,mark:'圃',sizes:[1,4],source:null,detail:'果樹、竹籬與田間小徑；四格增添水渠與農舍，屬田園意象設計。'},
 scholarGarden:{cat:'garden',name:'曲水疊石園',type:'garden',variant:0,mark:'景',sizes:[4],source:null,detail:'四格花園合成曲水、疊石、亭榭與花木的完整園景。'},

 residence:{cat:'home',name:'雅居小樓',type:'home',variant:0,mark:'居',sizes:[1],source:null,detail:'雙層民居、木欄與花窗；可住四人。'},
 mansion:{cat:'home',name:'四合雅宅',type:'home',variant:0,mark:'宅',sizes:[4],source:null,detail:'四格特殊民居，正廳與雙翼廂房圍合花木中庭；可住八人。'},
 kiln:{cat:'work',name:'精製窯坊',type:'work',variant:0,mark:'陶',sizes:[1],source:null,detail:'窯爐、煙囪與晾坯架；陶器加工加快。'},
 woodshop:{cat:'work',name:'精製木作坊',type:'work',variant:1,mark:'木',sizes:[1],source:null,detail:'鋸木棚、堆料與長工作檯；木器加工加快。'},
 weavery:{cat:'work',name:'精製織坊',type:'work',variant:2,mark:'織',sizes:[1],source:null,detail:'織機、彩線與曬布架；布匹加工加快。'},
 kilnHall:{cat:'work',name:'瓷窯大院',type:'work',variant:0,mark:'窯',sizes:[4],source:null,detail:'四格雙窯、晾坯庭與倉房；可容六名工匠，加工速度兩倍。'},
 woodshopHall:{cat:'work',name:'木作營造院',type:'work',variant:1,mark:'木',sizes:[4],source:null,detail:'四格木作大廳、堆料場與鋸架；可容六名工匠，加工速度兩倍。'},
 weaveryHall:{cat:'work',name:'織錦大院',type:'work',variant:2,mark:'錦',sizes:[4],source:null,detail:'四格織機廳、染布架與曬場；可容六名工匠，加工速度兩倍。'},
 garden:{cat:'garden',name:'百花園圃',type:'garden',variant:0,mark:'園',sizes:[1,4],source:null,detail:'公共花圃、石徑與歇腳長椅；四格為中央花壇大花園。'},

 tea:{cat:'shop',name:'臨街茶坊',type:'shop',variant:0,mark:'茶',sizes:[1,4],source:'city',detail:'開敞茶棚、圓桌與矮凳；四格變成環廊茶院。'},
 food:{cat:'shop',name:'炊煙食肆',type:'shop',variant:1,mark:'食',sizes:[1,4],source:'city',detail:'高灶煙囪、蒸籠與暖色雨棚；四格擴為前店後廚。'},
 textile:{cat:'shop',name:'錦色布莊',type:'shop',variant:2,mark:'布',sizes:[1,4],source:'city',detail:'高挑倉閣、彩布垂簾與布架；四格成為雙翼布行。'},
 wine:{cat:'shop',name:'夢華酒樓',type:'shop',variant:1,mark:'酒',sizes:[4],source:'city',detail:'四格合院、雙層樓閣、綵樓歡門與酒甕。'},
 academy:{cat:'school',name:'方塘書院',type:'garden',variant:0,mark:'書',sizes:[4],source:'academy',detail:'講堂、兩側廊房、中央方塘；每級提供8個街坊教育名額，學力逐日累積並小幅提升工匠產能。'},
 pavilion:{cat:'garden',name:'臨泉亭',type:'garden',variant:0,mark:'亭',sizes:[1,4],source:'pavilion',detail:'開敞六角亭、石徑與泉池；四格增添迴廊與樹蔭。'},
 pond:{cat:'garden',name:'小荷池塘',type:'garden',variant:0,mark:'荷',sizes:[1,4],source:'pond',detail:'挖出池床，注水後長出荷葉、荷花；蜻蜓在池面盤旋。'}
};
// 文教三層：名額倍率依村塾→鎮學→書院遞增。
export const SCHOOL_FACTOR={movableTypeHall:1,villageSchool:.5,townSchool:.75,academy:1,countySchool:1.25};
export const isSchool=b=>!!SCHOOL_FACTOR[b?.design];
export const categoryOf=b=>DESIGNS[designFor(b)]?.cat||b.type||'garden';
export const designCategory=id=>DESIGNS[id]?.cat||DESIGNS[id]?.type||'garden';
export const designFor=b=>b.design|| (b.type==='shop'?['tea','food','textile'][b.variant]:null);
export function squareCells(c){return [{x:c.x,z:c.z},{x:c.x+1,z:c.z},{x:c.x,z:c.z+1},{x:c.x+1,z:c.z+1}];}
export function isSquare(cells){return cells.length===4&&new Set(cells.map(c=>`${c.x},${c.z}`)).size===4&&Math.max(...cells.map(c=>c.x))-Math.min(...cells.map(c=>c.x))===1&&Math.max(...cells.map(c=>c.z))-Math.min(...cells.map(c=>c.z))===1;}
export const gardenActivity=b=>({wazi:'在瓦舍聽書、看表演',orchard:'沿田間小徑看果樹',scholarGarden:'在曲水疊石間遊園',pond:'沿池賞荷、看蜻蜓',pavilion:'在亭中歇腳、賞景',academy:'在書院讀書、觀方塘'})[b.design]||'在園中散步';

export function gardenMergeGroups(buildings){
 const available=buildings.filter(b=>b.design==='garden'&&!b.footprint).sort((a,b)=>a.z-b.z||a.x-b.x),used=new Set(),groups=[];
 for(const a of available){if(used.has(a.id))continue;const parts=squareCells(a).map(c=>available.find(b=>!used.has(b.id)&&b.x===c.x&&b.z===c.z));if(parts.some(p=>!p))continue;groups.push(parts);for(const b of parts)used.add(b.id);}
 return groups;
}
