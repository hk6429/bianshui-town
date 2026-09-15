# 美術方向與概念圖

## 交付

| 圖片 | 主題 | 生成方式 |
|---|---|---|
| `public/concepts/01-settlement.png` | 河畔初建 | 內建 imagegen，新圖 |
| `public/concepts/02-daytime.png` | 白日市井 | 內建 imagegen，新圖 |
| `public/concepts/03-nighttime.png` | 入夜街坊 | 內建 imagegen，以白日圖為編輯目標 |
| `public/concepts/04-block.png` | 三格共享街坊 | 內建 imagegen，新圖 |

## 提示詞

### 01 河畔初建
Generate one 16:9 gameplay concept image for 汴水小鎮, a cozy Song dynasty Chinese city simulation inspired by the everyday riverside urban life of Along the River During the Qingming Festival. Use case stylized-concept. Technically achievable simple low-poly 3D game screenshot with subtle pixel-textured materials, orthographic slightly top-down camera. Early riverside settlement: mostly open pale grassy land, winding blue-green river along right side, reeds and willow trees, three small gray tiled timber courtyard buildings at different construction stages (foundation, timber frame, completed cream plaster wooden house), tan dirt streets only around the exterior of a connected three-unit block, no roads between the connected units, shared courtyard. Tiny Song-era pedestrians and one handcart. Muted jade green, parchment cream, weathered timber, warm soft morning light, ambient occlusion, crisp miniature silhouettes. Wide composition with lots of buildable empty land and a minimal unobtrusive icon-only build toolbar. All geometry can be made with simple modular 3D meshes. No photorealism, no imperial palaces, no modern elements, no Qing hairstyles, no readable text.

### 02 白日市井
Generate one 16:9 concept screenshot of a playable cozy Song dynasty Chinese riverside city-builder 汴水小鎮, inspired by Along the River During the Qingming Festival. Use case stylized-concept. Daytime mature town. Orthographic top-down 3/4 camera, technically achievable LOW POLY modular 3D miniature, softly pixelated simple textures. Cream timber houses with blue-gray tiled pitched roofs, connected two- and three-unit blocks, small courtyard tea shop with terracotta cloth awning, weaving and pottery workshops, connected sandy exterior streets with tiny distinct citizens walking to destinations, handcarts, one ox cart. A jade river curves along the right side with wooden bridge, dock and small cargo boat. Willows, cattails, low stone embankment, scattered shrubs. Strong readable silhouettes and open spacing. Warm parchment beige, sage, ochre, muted slate, soft late-morning illumination. Restrained minimal game interface framing, small icon-only bottom toolbar. No cinematic illustration, no modern vehicles or lamps, no palace roof forest, no Qing braids, no realistic high-poly detail, no text.

### 03 入夜街坊
Use case lighting-weather. Edit this exact cozy Song dynasty 3D town gameplay concept from day to NIGHT. Keep camera, architecture, streets, river, bridge, geometry, UI icons and composition unchanged. Soft cool indigo-blue ambient light, clear readable ground and roofs, warm diffuse amber light glowing from inhabited windows and small hanging paper lanterns at storefronts and street corners. Warm modest reflections on jade river. Restrained bloom, no neon, no modern lamps. Few pedestrians returning home, tea shop still warmly illuminated. Night should feel cozy and peaceful, not dark or threatening. Maintain achievable stylized game graphics.

### 04 三格街坊
Use case stylized-concept. 16:9 orthographic slightly top-down gameplay interaction concept for 汴水小鎮 cozy Song dynasty Chinese low-poly 3D town builder. Close view of ONE connected THREE-CELL ROW building block. Three adjacent simple timber gray tiled houses on one continuous pale beige rectangular plot, with small common rear courtyard. Thin warm jade selection outline around the ENTIRE combined 3-cell rectangle. Sandy roads run ONLY around exterior of combined block. ABSOLUTELY NO road or alley separating the internal three cells. Faint translucent preview model on final third cell and small cursor at far corner imply click-drag building placement. Muted moss green open land surrounds block, river glimpsed in upper right, one tiny handcart and Song pedestrians on exterior path. Low-poly simple meshes, soft pixel-art-flavored textures, cream plaster, dark timber, blue-gray roofs, terracotta shop awning. Restrained game UI icon toolbar at bottom, no text, no watermark. Visually clear and technically achievable, no ornate palace roofs, no modern props.

## 圖像檢視與取捨

- 四張圖均已回傳並檢視。灰瓦、木構、米白、河綠與暖燈保持同一系列意象。
- 夜景大致保留白日街坊與河橋構圖；細節存在生成變化，不能視為像素完全一致的日夜貼圖。
- 第四張清楚表現三間相連的選取外框與無內部馬路。
- 生成圖的瓦片、人物與植栽密度高於簡單 3D 原型。實作保留整體尺度、輪廓、配色及燈光關係，簡化幾何與動態。
- 實際模型採程序化生成，概念 PNG 用於遊戲內畫卷及美術參考。
