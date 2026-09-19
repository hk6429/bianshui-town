// 玩家看到的八大類。引擎內部仍只有 home／shop／work／garden 四種占地規則，
// 分類只決定圖錄、篩選與說明文字，讓官署、學校、祠廟與水運不再全擠進「園景」。
export const CATEGORIES={home:'民居',shop:'商鋪',work:'作坊',garden:'園景',school:'文教',civic:'公設',shrine:'祠廟',water:'水運'};
export const CATEGORY_ORDER=['home','shop','work','garden','school','civic','shrine','water'];
export const CATEGORY_NOTE={
 home:'居住與街坊生活',shop:'買賣、飲食與市井娛樂',work:'作坊與手工生產',garden:'園林、池塘與田園',
 school:'村塾、鎮學與書院，累積學力',civic:'官署、稅務與街道服務',shrine:'祠廟祭祀，安一方人心',water:'汴河沿岸的碼頭、義倉與水碾'
};
