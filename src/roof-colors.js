import {DESIGNS} from './heritage.js';

// 宋代屋面：民居多茅草與土瓦，市肆用青灰筒瓦或褐瓦，官署祠廟才見朱漆與琉璃。
// 同一類給數種色，依圖樣與 variant 固定取用，讓街景不再整片同一個綠。
export const ROOF_TONES={
 home:[0x8a7550,0x7a6a4d,0x6f6152,0x5f6a58],
 shop:[0x4f5f63,0x7a5b46,0x6b5445,0x55636a],
 work:[0x5b5b53,0x6d5a45,0x4d5a5c],
 garden:[0x53635c,0x6a5b47,0x5d6a5a],
 school:[0x4a5f63,0x55605a,0x5d5a4a],
 civic:[0x46565c,0x8a4e3c,0x55605f],
 shrine:[0x8a4e3c,0x7b5136,0x6a5340],
 water:[0x5a6058,0x6b5b46,0x4f5d5f]
};
const hash=id=>{let h=2166136261;for(let i=0;i<id.length;i++){h^=id.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
export function roofTone(b){
 const design=b?.design,spec=design?DESIGNS[design]:null;
 const tones=ROOF_TONES[spec?.cat]||ROOF_TONES.garden;
 const seed=(design?hash(design):0)+(b?.variant||0);
 return tones[seed%tones.length];
}
