import {wellbeingReport} from './wellbeing.js';
import {waterReport} from './water-service.js';
import {sanitationReport} from './sanitation.js';
import {healthcareReport} from './healthcare.js';
import {educationReport} from './education.js';
import {gardenReport} from './garden-services.js';
import {fireCoverage} from './fire-service.js';
import {pollutionReport} from './pollution.js';
import {logistics} from './logistics.js';
import {dailyUpkeep,householdTax} from './city-finance.js';
import {wineExcise,transitTaxRate,granaryStores} from './civic.js';
import {formatMoney} from './money.js';

// 監鎮官的六位僚屬：每位只讀既有模型，把最該處理的一件事說出來。
const grade=(good,watch)=>good?'good':watch?'watch':'bad';
export function advisors(t){
 const net=householdTax(t)+wineExcise(t)-dailyUpkeep(t),water=waterReport(t),hygiene=sanitationReport(t);
 const care=healthcareReport(t),school=educationReport(t),garden=gardenReport(t);
 const fire=fireCoverage(t),pollution=pollutionReport(t),well=wellbeingReport(t),q=logistics(t);
 const uncovered=fire.buildings.length-fire.covered.size;
 return [
  {office:'戶曹',duty:'錢穀出納',
   level:grade(t.city.treasury>=0&&net>=0,t.city.treasury>=0),
   status:`鎮庫 ${formatMoney(t.city.treasury)}，每日 ${net>=0?'結餘':'短少'} ${formatMoney(Math.abs(net))}。住稅 ${t.city.taxRate}%${transitTaxRate(t)?`、過稅 ${transitTaxRate(t)}%`:'，未設商稅務'}。`,
   advice:t.city.treasury<0?'先減維護支出或調高稅率，欠款會壓低供水與清運。':net<0?'每日入不敷出，可添商稅務、酒務，或拆掉閒置高維護建築。':'收支穩定，可考慮買地或升級貨棧。'},
  {office:'工曹',duty:'營造工役',
   level:grade(q.level>=2&&pollution.environment>=70,pollution.environment>=55),
   status:`貨棧 ${q.level} 級：腳夫 ${q.porters} 人／每趟 ${q.porterLoad} 件，牛車 ${q.oxen} 輛。居住環境 ${pollution.environment.toFixed(1)}／100。`,
   advice:pollution.environment<55?'作坊排放壓住民居，請把工坊移離住宅或多留園景。':q.level<2?'貨棧升級可讓補貨更快，商鋪較不缺貨。':'營造與物流順暢。'},
  {office:'巡檢',duty:'防火捕盜',
   level:grade(uncovered===0&&fire.buildings.length>0,uncovered<=2),
   status:`巡守涵蓋 ${fire.covered.size}／${fire.buildings.length} 處；軍巡鋪 ${fire.posts.length} 處。義倉存糧 ${granaryStores(t)} 處。`,
   advice:uncovered>0?`還有 ${uncovered} 處在巡守範圍外，窯坊與密集街區最危險。`:'全鎮在巡守之內，火警損害可控。'},
  {office:'教諭',duty:'學校教化',
   level:grade(school.academies.length>0&&school.waiting===0,school.academies.length>0),
   status:`學堂 ${school.academies.length} 處，受教 ${school.assigned.size} 人、候學 ${school.waiting} 人；平均學力 ${school.average.toFixed(1)}／100。`,
   advice:!school.academies.length?'鎮上還沒有學堂，先立一座村塾最省。':school.waiting>0?'候學者眾，可升級學堂或增設鎮學、書院。':'學額充足，工匠產能已有加成。'},
  {office:'醫官',duty:'疾疫醫藥',
   level:grade(hygiene.hygiene>=80&&care.sick===0,hygiene.hygiene>=60),
   status:`衛生 ${hygiene.hygiene}／100、平均健康 ${hygiene.health}／100；照護 ${care.assigned.size} 人、病假 ${care.sick} 人。`,
   advice:hygiene.hygiene<60?'髒污積存會拖垮健康，請增設街道司或縮短清運距離。':care.waiting>0?'待照護者未獲藥鋪覆蓋，可增開百草藥鋪。':'疾疫無虞。'},
  {office:'里正',duty:'戶口民情',
   level:grade(well.average>=75&&well.low===0,well.average>=65),
   status:`民生滿意 ${well.average.toFixed(1)}／100，偏低 ${well.low} 人；供水 ${water.served}／${water.residents} 人，園景加成 ${garden.average.toFixed(1)}／20。`,
   advice:well.low>0?'有住戶長期不滿，久了會遷離；先看居民小卡的分項原因。':water.available<=0?'供水已滿載，新住戶要有水井空位才遷入。':'街坊安居，人口可望續增。'}
 ];
}
