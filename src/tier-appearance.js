// Each plan grows through four different additions; no universal pagoda overlay.
const plan=(features,labels)=>({features:features.split(' '),labels:labels.split('|')});
export const TIER_APPEARANCES={
 bambooHome:plan('vegetables bamboo pergola bambooHall','竹籬菜畦|高低竹叢|藤架歇腳廊|竹頂田居與高竹屏'),
 terraceHome:plan('terrace stairs lookout skyGallery','寬闊望河露臺|外掛折梯|偏側望河閣|雙閣空中連廊'),
 plumHome:plan('plum moonGate whiteGallery plumCourt','梅樹花冠|白牆大月門|梅窗曲廊|雙月洞與梅香庭院'),
 dragonKiln:plan('pottery kiln chimney kilnMountain','彩釉晾坯架|第二座拱窯|高低煙囪群|階梯連窯與窯火門'),
 timberYard:plan('timber saw canopy crane','分層原木架|大鋸木作檯|雙翼木料棚|高架木構吊臂'),
 dyeHouse:plan('vats cloth loom clothGallery','四色染缸|高低曬布架|外露織機|跨院彩帛長廊'),
 bookshop:plan('books reading canopy bookTower','開放卷冊牆|前庭閱書臺|雙翼書棚|偏側藏書高閣'),
 incenseShop:plan('incense canopy incenseSpire perfumeCourt','高腳香爐|紫色香帛棚|鏤空香煙塔|香爐雙塔與紫幡'),
 herbShop:plan('cabinet herbs herbRacks herbHall','百眼藥櫃|綠色藥圃|層疊曬藥匾|開敞晾藥高棚'),
 cakeShop:plan('steamers kitchen canopy steamHall','竹蒸籠群|雙孔磚灶|赭紅前店棚|高低蒸樓與灶間'),
 tea:plan('teaDeck bamboo terrace teaPavilion','臨街茶席|竹影屏風|觀景茶臺|開敞六角茶亭'),
 food:plan('kitchen steamers terrace kitchenHall','外露長灶|成排蒸籠|食客露臺|雙煙囪大廚房'),
 textile:plan('cloth books canopy silkGate','彩帛陳列架|布卷陳列牆|彩色店棚|彩緞拱架與雙翼布行'),
 wine:plan('jars terrace wineGate wineTower','大型酒甕群|宴飲露臺|綵樓歡門|偏側重簷宴飲樓'),
 garden:plan('flowers hedge pergola flowerTerrace','高低花壇|幾何花籬|攀花拱廊|三層花臺與花冠'),
 scholarGarden:plan('bridge rockery moonGate waterfall','曲橋石徑|高聳疊石|月洞借景|層岩水瀑與碧潭'),
 pond:plan('lotus bridge waterside lotusPavilion','大葉荷花群|弧形木橋|臨水歇腳臺|荷心亭與花叢'),
 pavilion:plan('waterside flowers hexRoof twinPavilion','環泉石臺|泉畔花木|六角雙層飛簷|高低雙亭'),
 orchard:plan('vegetables orchard waterwheel orchardHall','田畦水渠|高低結果樹|木構灌溉水輪|果圃農舍與藤棚'),
 wazi:plan('audience canopy drum stageHall','階梯聽眾席|朱紅表演棚|雙鼓與彩幡|寬闊雙簷戲臺'),
 academy:plan('reading whiteGallery books academyHall','露天講席|白牆連廊|卷冊藏書架|雙翼講堂與講學臺'),
 well:plan('jars aqueduct wheel wellTower','汲水缸群|架高引水槽|大轆轤輪|雙轆轤井樓'),
 cleaningYard:plan('bins cart canopy cleanHall','分類桶列|木輪清運車|開敞整理棚|雙翼清運棚與車隊'),
 firePost:plan('drum waterTank watchTower fireTower','警鐘鼓架|高架儲水桶|望火高臺|雙層望火樓與警幡')
};
const aliases={residence:'terraceHome',mansion:'plumHome',kiln:'dragonKiln',kilnHall:'dragonKiln',woodshop:'timberYard',woodshopHall:'timberYard',weavery:'dyeHouse',weaveryHall:'dyeHouse'};
export function appearanceKey(b){return aliases[b.design]|| (TIER_APPEARANCES[b.design]?b.design:b.type==='home'?['bambooHome','terraceHome','plumHome'][b.variant||0]:b.type==='work'?['dragonKiln','timberYard','dyeHouse'][b.variant||0]:b.type==='shop'?['tea','food','textile'][b.variant||0]:'garden');}
export function tierAppearance(b,tier=b.tier||1){return tier<=1?'保留原有建築樣式':TIER_APPEARANCES[appearanceKey(b)].labels[Math.min(5,tier)-2];}
