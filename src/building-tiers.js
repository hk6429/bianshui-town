export const MAX_TIER=5;
export const tierOf=b=>Math.max(1,Math.min(MAX_TIER,Number.isInteger(b.tier)?b.tier:1));
export const TIER_NAMES=['初築','添彩','華庭','重簷','盛景'];
export const TIER_DETAILS=['保留原有建築樣式','增添花木、燈籠與雕飾','增建門廊、欄杆與迎賓簷','增添高閣或園林樓亭','完成重簷樓閣、華蓋與精緻屋脊'];
