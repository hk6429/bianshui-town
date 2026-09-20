// Interaction scenes adapt the works; they do not damage the live town.
export const LITERARY_ACTIVITIES={
  "yueyang": [
    {
      "kind": "allocation",
      "title": "洪水退後的六份物資",
      "prompt": "這是獨立救災情境，不會破壞你的小鎮。分配六份物資，讓受災居民有住處、糧食與可通行的道路。每張卡只能選一次。",
      "items": [
        [
          "shelter",
          "安置三戶居民",
          2
        ],
        [
          "food",
          "開倉供糧",
          2
        ],
        [
          "road",
          "修復通往義倉的道路",
          2
        ],
        [
          "feast",
          "登樓盛宴",
          3
        ],
        [
          "gate",
          "彩門裝飾",
          2
        ]
      ],
      "required": [
        "shelter",
        "food",
        "road"
      ],
      "budget": 6,
      "result": "三戶安置、供糧與道路都已安排；修樓慶典留在基本生活恢復之後。"
    },
    {
      "kind": "pairs",
      "title": "晴雨登臨圖",
      "prompt": "先點景物，再點對應的情緒。可修正配對，完成後送出。",
      "pairs": [
        [
          "rain",
          "陰風怒號，濁浪排空",
          "fear",
          "去國懷鄉，憂讒畏譏"
        ],
        [
          "sun",
          "春和景明，波瀾不驚",
          "joy",
          "心曠神怡，寵辱偕忘"
        ]
      ],
      "result": "雨景與晴景遊記完成：遷客騷人的感受因境而異。"
    },
    {
      "kind": "sequence",
      "title": "把修樓議案交給滕子京",
      "prompt": "依文章先後與本次救災結果排出議案。",
      "items": [
        [
          "people",
          "確認安置、糧食與道路"
        ],
        [
          "restore",
          "恢復民生日常"
        ],
        [
          "tower",
          "重修岳陽樓"
        ],
        [
          "share",
          "與居民共享登樓之樂"
        ]
      ],
      "solution": [
        "people",
        "restore",
        "tower",
        "share"
      ],
      "result": "已完成先憂後樂的修樓議案。"
    }
  ],
  "kaifeng": [
    {
      "kind": "witnesses",
      "title": "街頭訪查案卷",
      "prompt": "逐一拜訪三位故事角色，讀取陳述。這些是戲曲改編的遊戲證詞，不是宋代案卷。",
      "items": [
        [
          "qin",
          "秦香蓮｜當事人",
          "我說陳世美是我的丈夫，並提出子女與家庭往事。這是待查的當事人陳述。"
        ],
        [
          "neighbor",
          "街坊｜轉述者",
          "我沒有見過婚姻過程，只聽別人說駙馬未婚。這是傳聞。"
        ],
        [
          "clerk",
          "案牘吏｜案情摘要",
          "戲曲另有韓琪追殺的情節，須與婚姻關係分別查證，不能以身分判案。"
        ]
      ],
      "result": "三份陳述已入案：當事人、傳聞與案情摘要分開記錄。"
    },
    {
      "kind": "pairs",
      "title": "給線索找查證方向",
      "prompt": "把每項線索送到正確的查證欄位。",
      "pairs": [
        [
          "family",
          "婚姻與子女陳述",
          "marriage",
          "交叉核對婚姻關係"
        ],
        [
          "attack",
          "韓琪追殺線索",
          "threat",
          "另查追殺經過"
        ],
        [
          "rumor",
          "街坊未親見的說法",
          "hearsay",
          "標記傳聞，不能獨立定案"
        ]
      ],
      "result": "已建立婚姻與追殺兩條查證線，並隔離傳聞。"
    },
    {
      "kind": "sequence",
      "title": "完成公堂辦案摘要",
      "prompt": "依合理辦案流程整理公堂摘要。",
      "items": [
        [
          "claim",
          "列出爭議主張"
        ],
        [
          "evidence",
          "比較兩條查證線的證據"
        ],
        [
          "limits",
          "指出仍待查證的資訊"
        ],
        [
          "reason",
          "說明理由，不因權勢停止查證"
        ]
      ],
      "solution": [
        "claim",
        "evidence",
        "limits",
        "reason"
      ],
      "result": "公堂摘要完成：證據與理由先於結論，權勢不能取代查證。"
    }
  ],
  "printing": [
    {
      "kind": "sequence",
      "title": "排出一行活字",
      "prompt": "依原句排字：「一板印刷，一板已自布字」。每塊同字字模各有獨立位置，不要漏字。",
      "items": [
        [
          "0",
          "一"
        ],
        [
          "1",
          "板"
        ],
        [
          "2",
          "印"
        ],
        [
          "3",
          "刷"
        ],
        [
          "4",
          "一"
        ],
        [
          "5",
          "板"
        ],
        [
          "6",
          "已"
        ],
        [
          "7",
          "自"
        ],
        [
          "8",
          "布"
        ],
        [
          "9",
          "字"
        ]
      ],
      "solution": [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9"
      ],
      "result": "試印文字與原句相符，可重複使用字模。"
    },
    {
      "kind": "sequence",
      "title": "從泥字到試印",
      "prompt": "排出活字印製工序。",
      "items": [
        [
          "carve",
          "刻泥字"
        ],
        [
          "fire",
          "燒製字模"
        ],
        [
          "arrange",
          "排字成版"
        ],
        [
          "heat",
          "加熱壓平"
        ],
        [
          "print",
          "上墨覆紙印刷"
        ]
      ],
      "solution": [
        "carve",
        "fire",
        "arrange",
        "heat",
        "print"
      ],
      "result": "活字工序完成，字面平整後才能試印。"
    },
    {
      "kind": "pairs",
      "title": "兩版交替工作臺",
      "prompt": "把甲乙版在兩個時刻的工作分配好，讓排字與印刷交替進行。",
      "pairs": [
        [
          "a1",
          "第一輪：甲版",
          "print1",
          "印第一批"
        ],
        [
          "b1",
          "第一輪：乙版",
          "set2",
          "排第二批"
        ],
        [
          "a2",
          "第二輪：甲版",
          "set3",
          "排第三批"
        ],
        [
          "b2",
          "第二輪：乙版",
          "print2",
          "印第二批"
        ]
      ],
      "result": "交替排印計畫完成：印刷時準備下一版，減少空等。"
    }
  ],
  "zuiweng": [
    {
      "kind": "sequence",
      "title": "由遠而近的導覽",
      "prompt": "依文章鏡頭順序安排遊園站點。",
      "items": [
        [
          "city",
          "環滁群山"
        ],
        [
          "mountain",
          "琅琊山"
        ],
        [
          "spring",
          "釀泉"
        ],
        [
          "pavilion",
          "醉翁亭"
        ]
      ],
      "solution": [
        "city",
        "mountain",
        "spring",
        "pavilion"
      ],
      "result": "已排出由大範圍走入泉亭的導覽。"
    },
    {
      "kind": "pairs",
      "title": "布置四季景觀冊",
      "prompt": "把四張景物放進正確季節。",
      "pairs": [
        [
          "flowers",
          "野芳發而幽香",
          "spring",
          "春"
        ],
        [
          "shade",
          "佳木秀而繁陰",
          "summer",
          "夏"
        ],
        [
          "frost",
          "風霜高潔",
          "autumn",
          "秋"
        ],
        [
          "rocks",
          "水落而石出",
          "winter",
          "冬"
        ]
      ],
      "result": "四季景觀冊完成。"
    },
    {
      "kind": "route",
      "title": "讓百姓走到亭子",
      "prompt": "點選相鄰格鋪出遊園步道，避開山石，途中拜訪泉水與休憩處，最後抵達醉翁亭。",
      "width": 4,
      "height": 4,
      "start": 0,
      "end": 15,
      "blocked": [
        2,
        6,
        8,
        12
      ],
      "waypoints": [
        [
          5,
          "釀泉"
        ],
        [
          11,
          "百姓休憩處"
        ]
      ],
      "result": "遊園路徑連通泉水、休憩處與亭子。"
    }
  ],
  "lotus": [
    {
      "kind": "pairs",
      "title": "三花象徵圖",
      "prompt": "把花卉與作者寄託配對。",
      "pairs": [
        [
          "ju",
          "菊",
          "hidden",
          "隱逸"
        ],
        [
          "peony",
          "牡丹",
          "rich",
          "富貴"
        ],
        [
          "lotus",
          "蓮",
          "virtue",
          "君子"
        ]
      ],
      "result": "三花象徵圖完成；種植偏好不是居民品德評分。"
    },
    {
      "kind": "pairs",
      "title": "蓮的形態與品格",
      "prompt": "把原文特徵與合理解讀配對。",
      "pairs": [
        [
          "mud",
          "出淤泥而不染",
          "integrity",
          "環境複雜仍守操守"
        ],
        [
          "upright",
          "中通外直",
          "honest",
          "通達而正直"
        ],
        [
          "fragrance",
          "香遠益清",
          "reputation",
          "美德傳播而更清芬"
        ]
      ],
      "result": "已用植物形態說明人格寄託。"
    },
    {
      "kind": "route",
      "title": "保留公共觀蓮步道",
      "prompt": "點相鄰格連接入口與出口，經過公共觀花岸和休憩席，避開池中禁行格。",
      "width": 4,
      "height": 4,
      "start": 0,
      "end": 15,
      "blocked": [
        2,
        6,
        8,
        12
      ],
      "waypoints": [
        [
          5,
          "公共觀花岸"
        ],
        [
          11,
          "休憩席"
        ]
      ],
      "result": "富商宴席不封閉公共通行，觀蓮路徑完成。"
    }
  ],
  "redcliff": [
    {
      "kind": "route",
      "title": "赤壁夜航",
      "prompt": "點相鄰水格划船，經過月影與清風處，避開暗礁，最後返回繫舟處。",
      "width": 4,
      "height": 4,
      "start": 0,
      "end": 15,
      "blocked": [
        2,
        6,
        8,
        12
      ],
      "waypoints": [
        [
          5,
          "東山月影"
        ],
        [
          11,
          "清風水面"
        ]
      ],
      "result": "夜航遊記：從月出到回舟，留下清風水面的記憶。"
    },
    {
      "kind": "pairs",
      "title": "主客對話札記",
      "prompt": "把客人的問題與主人的回應方向連起來。",
      "pairs": [
        [
          "short",
          "客：人生須臾",
          "angle",
          "主：換個角度看水月"
        ],
        [
          "endless",
          "客：羨江水無窮",
          "shared",
          "主：共享江上清風與山間明月"
        ]
      ],
      "result": "對話札記完成；回應感慨，而不是命令客人停止悲傷。"
    },
    {
      "kind": "pairs",
      "title": "水月的變與不變",
      "prompt": "依文章的觀看角度分類。",
      "pairs": [
        [
          "flow",
          "水一直流逝",
          "change",
          "變：當下水流不同"
        ],
        [
          "river",
          "江流持續存在",
          "remain",
          "不變：江流延續"
        ],
        [
          "phase",
          "月有盈虛",
          "wax",
          "變：月相不同"
        ],
        [
          "moon",
          "月仍為月",
          "whole",
          "不變：整體未消長"
        ]
      ],
      "result": "完成變與不變兩面觀照。"
    }
  ],
  "oil": [
    {
      "kind": "sequence",
      "title": "注油示範臺",
      "prompt": "依動詞逐步操作，不限時間，不需要手速。",
      "items": [
        [
          "take",
          "取葫蘆"
        ],
        [
          "place",
          "置於地"
        ],
        [
          "cover",
          "以錢覆口"
        ],
        [
          "scoop",
          "徐以杓酌油"
        ],
        [
          "pour",
          "瀝油穿錢孔"
        ]
      ],
      "solution": [
        "take",
        "place",
        "cover",
        "scoop",
        "pour"
      ],
      "result": "示範完成：依序備器、覆口、酌油與瀝入。"
    },
    {
      "kind": "sequence",
      "title": "陳堯咨態度變化",
      "prompt": "按故事發展排列人物言行。",
      "items": [
        [
          "proud",
          "以射箭技藝自矜"
        ],
        [
          "question",
          "詢問賣油翁是否懂射箭"
        ],
        [
          "angry",
          "忿然責問"
        ],
        [
          "laugh",
          "見注油後笑而遣之"
        ]
      ],
      "solution": [
        "proud",
        "question",
        "angry",
        "laugh"
      ],
      "result": "人物態度順序完成，可再討論最後一笑的不同解讀。"
    },
    {
      "kind": "pairs",
      "title": "帶一位學徒",
      "prompt": "把學徒的疑問連到原文可支持的說明。",
      "pairs": [
        [
          "skill",
          "為何油能穿過錢孔？",
          "practice",
          "反覆練習，手熟"
        ],
        [
          "only",
          "「惟手熟爾」的惟？",
          "just",
          "只是、只有"
        ],
        [
          "teach",
          "示範比爭辯多了什麼？",
          "show",
          "用具體技藝回應自負"
        ]
      ],
      "result": "學徒課完成，不把技巧熟練等同天生優越。"
    }
  ],
  "creek": [
    {
      "kind": "sequence",
      "title": "回憶的圖文頁",
      "prompt": "按詞中事件次序排列畫面。",
      "items": [
        [
          "dusk",
          "溪亭日暮"
        ],
        [
          "return",
          "興盡回舟"
        ],
        [
          "lost",
          "誤入藕花"
        ],
        [
          "row",
          "爭渡尋路"
        ],
        [
          "birds",
          "驚起鷗鷺"
        ]
      ],
      "solution": [
        "dusk",
        "return",
        "lost",
        "row",
        "birds"
      ],
      "result": "回憶頁完成：日暮、荷深、舟動、鳥起。"
    },
    {
      "kind": "route",
      "title": "划進荷花深處",
      "prompt": "點相鄰水格划船，先經過荷花深處再經鷗鷺灘，最後找到出口；驚鳥只記一次，不增加金錢。",
      "width": 4,
      "height": 4,
      "start": 0,
      "end": 15,
      "blocked": [
        2,
        6,
        8,
        12
      ],
      "waypoints": [
        [
          5,
          "藕花深處"
        ],
        [
          11,
          "鷗鷺灘"
        ]
      ],
      "result": "小舟離開荷塘；鷗鷺飛起記入一次遊記。"
    },
    {
      "kind": "pairs",
      "title": "讓畫面動起來",
      "prompt": "把詞中的動詞放回對應畫面。",
      "pairs": [
        [
          "lost",
          "誤入",
          "deep",
          "走進荷花深處"
        ],
        [
          "cross",
          "爭渡",
          "boat",
          "急於划舟找出路"
        ],
        [
          "startle",
          "驚起",
          "birds",
          "鳥群由靜轉動"
        ]
      ],
      "result": "動詞圖文頁完成。"
    }
  ],
  "lantern": [
    {
      "kind": "witnesses",
      "title": "燈市籌備拜訪",
      "prompt": "分別向燈匠、樂師與攤販取得籌備需求。",
      "items": [
        [
          "lantern",
          "燈匠",
          "我負責燈彩，留出一處燈火稀落的角落，才能形成詞末對照。"
        ],
        [
          "musician",
          "樂師",
          "我在表演棚奏簫，鳳簫聲動是聽覺線索。"
        ],
        [
          "vendor",
          "攤販",
          "攤位靠路邊，留下行人通路，不封住尋人路線。"
        ]
      ],
      "result": "三方完成籌備，燈彩、聲音與通路各有安排。"
    },
    {
      "kind": "pairs",
      "title": "把詞句放回燈市",
      "prompt": "將感官線索與場景配對。",
      "pairs": [
        [
          "flowers",
          "花千樹、星如雨",
          "lights",
          "燈火煙花"
        ],
        [
          "flute",
          "鳳簫聲動",
          "sound",
          "樂師的簫聲"
        ],
        [
          "dragon",
          "魚龍舞",
          "dance",
          "魚龍燈舞"
        ]
      ],
      "result": "燈市詞景配置完成。"
    },
    {
      "kind": "route",
      "title": "眾裏尋他",
      "prompt": "穿過燈市相鄰街格，經過樂棚與繁燈處，最後抵達右下角的燈火稀疏處。",
      "width": 4,
      "height": 4,
      "start": 0,
      "end": 15,
      "blocked": [
        2,
        6,
        8,
        12
      ],
      "waypoints": [
        [
          5,
          "鳳簫樂棚"
        ],
        [
          11,
          "魚龍繁燈"
        ]
      ],
      "result": "回首尋到燈火闌珊處的人影，完成繁與簡的對照。"
    }
  ],
  "moon": [
    {
      "kind": "sequence",
      "title": "月下心情札記",
      "prompt": "依詞意轉折安排四段心情。",
      "items": [
        [
          "leave",
          "欲乘風歸去"
        ],
        [
          "cold",
          "又恐高處不勝寒"
        ],
        [
          "human",
          "回看人間起舞"
        ],
        [
          "wish",
          "向遠方送出祝願"
        ]
      ],
      "solution": [
        "leave",
        "cold",
        "human",
        "wish"
      ],
      "result": "月下心情札記完成。"
    },
    {
      "kind": "pairs",
      "title": "替居民寫一封中秋信",
      "prompt": "把書信中的想法與原文連結。",
      "pairs": [
        [
          "apart",
          "承認彼此分離",
          "part",
          "人有悲歡離合"
        ],
        [
          "imperfect",
          "不要求事事十全",
          "full",
          "此事古難全"
        ],
        [
          "safe",
          "祝願平安長久",
          "long",
          "但願人長久"
        ],
        [
          "together",
          "隔地共享月色",
          "moon",
          "千里共嬋娟"
        ]
      ],
      "result": "中秋家書已寫好：承認離別，也保留相念。"
    },
    {
      "kind": "route",
      "title": "將家書交給遞夫",
      "prompt": "沿相鄰街格經過寄信居民與遞鋪，最後抵達公共賞月臺，完成送信與相聚路線。",
      "width": 4,
      "height": 4,
      "start": 0,
      "end": 15,
      "blocked": [
        2,
        6,
        8,
        12
      ],
      "waypoints": [
        [
          5,
          "寄信居民"
        ],
        [
          11,
          "遞鋪"
        ]
      ],
      "result": "家書交給遞夫，公共賞月路線完成。"
    }
  ]
};
