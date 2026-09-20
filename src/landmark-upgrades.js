import {LANDMARK_TEXT} from './landmark-life-data.js';
import {LANDMARK_LIFE,landmarkState,landmarkSupport} from './landmark-life.js';
const REFLECTIONS={
 yueyangTower:['「不以物喜，不以己悲」接著談「先天下之憂而憂」。這份關懷指向？','天下百姓','只看自己遭遇'],
 kaifengCourt:['公案改編中，雙方各有陳述；調解街坊糾紛先做什麼？','交叉核對可查證的證據','依地位高低決定'],
 zuiwengPavilion:['「四時之景不同，而樂亦無窮也。」遊園延伸到哪種觀察？','跨季節重訪景物','只記一次春遊'],
 virtueLotus:['「可遠觀而不可褻玩焉。」公共步道應如何設計？','讓人欣賞且保護植物','讓人任意攀折'],
 redcliffBoat:['「自其不變者而觀之，則物與我皆無盡也。」這是？','換個角度理解生命與自然','宣稱世間從無變化'],
 movableTypeHall:['「更互用之」讓兩版交替；延伸到合作應該？','安排不同工序同時準備','所有人空等上一版'],
 oilSchool:['「無他，但手熟爾。」學徒應如何練習？','分解步驟反覆練習與修正','只求一次炫技'],
 creekLotus:['「興盡晚回舟，誤入藕花深處。」回憶中的轉折是？','遊興之後誤入荷塘','循原路準時返家'],
 lanternMarket:['「眾裡尋他千百度」到「燈火闌珊處」形成什麼對照？','熱鬧人群與清寂所在','正午和清晨'],
 moonTerrace:['「但願人長久，千里共嬋娟。」書信能傳達什麼？','相隔千里仍共享祝福','只有團聚才能祝福']
};
export {LANDMARK_TEXT} from './landmark-life-data.js';
export const landmarkReflection=b=>REFLECTIONS[b?.design];
export function reflectLandmark(t,id,choice){
 const b=t.buildings.find(b=>b.id===id),s=LANDMARK_LIFE[b?.design];if(!s||choice!==0||t.journey.literary?.[s.quest]?.activity?.stage!==3)return false;
 t.journey.landmarkReflections??={};if(t.journey.landmarkReflections[b.design])return false;t.journey.landmarkReflections[b.design]=true;return true;
}
export function connectLandmarks(t,id,other,choice,note,quote,otherQuote){
 const b=t.buildings.find(b=>b.id===id),s=LANDMARK_LIFE[b?.design],o=LANDMARK_LIFE[other];if(!s||!o||other===b.design||choice!==0)return false;
 if([s.quest,o.quest].some(q=>t.journey.literary?.[q]?.step!==4||t.journey.literary?.[q]?.activity?.stage!==3))return false;
 if(typeof note!=='string'||note.trim().length<20||note.trim().length>400||quote!==LANDMARK_TEXT[b.design][1]||otherQuote!==LANDMARK_TEXT[other][1])return false;
 if(!landmarkState(t)?.visits[b.design]?.count||!landmarkState(t)?.visits[other]?.count)return false;
 t.journey.landmarkConnections??={};if(t.journey.landmarkConnections[b.design])return false;t.journey.landmarkConnections[b.design]={other,quote,otherQuote,note:note.trim()};return true;
}
export function landmarkUpgrade(t,b){
 const spec=LANDMARK_LIFE[b?.design];if(!spec)return {allowed:true,text:''};
 const tier=b.tier||1,v=landmarkState(t)?.visits[b.design],entry=t.journey.literary?.[spec.quest];
 if(tier>=5)return {allowed:false,text:'已達五級。'};
 const rules={
  1:[!!landmarkSupport(t,b)&&!!v?.count,`二級配套委託：沿路連通${spec.support}，並完成一次居民到場活動`],
  2:[entry?.activity?.stage===3&&!!t.journey.landmarkReflections?.[b.design],'三級延伸閱讀：完成三段文學操作，再回答延伸閱讀題'],
  3:[(v?.days.length||0)>=2&&(v?.served||0)>=2,'四級公共服務：於兩個不同遊戲日舉行活動，累計服務至少兩人次'],
  4:[!!t.journey.landmarkConnections?.[b.design],'五級跨作品：完成另一作品閱讀與操作、兩地到場活動，再留下跨作品比較']
 };
 const [allowed,text]=rules[tier];return {allowed:!!allowed,text:`${text}（${allowed?'已達成':'尚未達成'}）。`};
}
