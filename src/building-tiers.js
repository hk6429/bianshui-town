export const MAX_TIER=5;
export const tierOf=b=>Math.max(1,Math.min(MAX_TIER,Number.isInteger(b.tier)?b.tier:1));
export const TIER_NAMES=['初築','添彩','華庭','重簷','盛景'];
export const TIER_DETAILS=['保留原有建築樣式','加蓋整層樓閣、大牌樓與燈籠','再增一層寬簷樓閣與彩幡','三層高閣、雙側重簷塔與成排燈籠','四層金瓦高閣、三重簷雙塔、金色冠頂與加大朱紅長幡'];
