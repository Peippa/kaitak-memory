const TILE_DIR = "assets/tiles/";

const HISTORICAL_MAPS = {
  "1924":   { name: "1924 · 九龍及新界東部（啟德濱原海岸）", maxZoom: 17, bounds: [[22.2840, 114.1699], [22.3501, 114.2468]], src: "UK National Archives / HK Public Records Office，經 hkmaps.hk 地理配準" },
  "1947":   { name: "1947 · 九龍半島（戰後）", maxZoom: 17, bounds: [[22.2891, 114.1699], [22.3450, 114.2139]], src: "HK Public Records Office，經 hkmaps.hk" },
  "1956":   { name: "1956 · 香港及九龍測量圖（瓦片不完整）", maxZoom: 17, bounds: [[22.2840, 114.1699], [22.3501, 114.2358]], src: "Hong Kong Map Service，經 hkmaps.hk", note: "本地瓦片只有約四成有內容，畫面會出現零散空白。" },
  "1963":   { name: "1963 · 九龍航空照片（何文田至土瓜灣）", maxZoom: 17, bounds: [[22.2840, 114.1699], [22.3145, 114.2029]], src: "HK Survey & Mapping Office，經 hkmaps.hk", note: "只覆蓋何文田、紅磡、土瓜灣一帶，不包括跑道。" },
  "1963.3": { name: "1963 · 九龍半島地圖（含新跑道西北段）", maxZoom: 16, bounds: [[22.2891, 114.1699], [22.3399, 114.2029]], src: "hkmaps.hk", note: "圖幅東界約在東經 114.203°，跑道東南段不在圖內。" },
  "1973":   { name: "1973 · 香港及九龍", maxZoom: 17, bounds: [[22.2840, 114.1699], [22.3501, 114.2468]], src: "HK Public Records Office，經 hkmaps.hk" },
  "1982.3": { name: "1983 · 機場（障礙物管制）條例圖", maxZoom: 15, bounds: [[22.2789, 114.1699], [22.3501, 114.2468]], src: "hkmaps.hk", note: "小比例尺圖，放大後會變得模糊。" },
  "1996":   { name: "1996 · 香港及九龍測量圖（謝幕前夜）", maxZoom: 17, bounds: [[22.2840, 114.1699], [22.3501, 114.2468]], src: "Hong Kong Map Service，經 hkmaps.hk" }
};

const ERAS = [
  { id: "e1924", start: 1924, end: 1941, label: "草創與民航起步", map: "1924", c: [22.3245, 114.2045], z: 15,
    note: "1924 年啟德營業有限公司清盤，填海地由政府收回，亞拔同年在此試飛；其後皇家空軍進駐，1936 年帝國航空開辦定期航班。至 1941 年 12 月日軍進攻香港為止。" },
  { id: "e1941", start: 1941, end: 1945, label: "戰火與日佔", map: "1947", c: [22.3240, 114.1985], z: 15,
    note: "1941 年 12 月 8 日日軍空襲啟德。日佔期間，日方自 1942 年起動用戰俘擴建機場，修建兩條混凝土跑道，並拆平宋王臺所在的山丘。1945 年 8 月 30 日英國艦隊抵港，日佔結束。地圖為戰後 1947 年測繪，可見日佔時期修建的兩條交叉跑道。" },
  { id: "e1945", start: 1945, end: 1958, label: "戰後復興與填海", map: "1947", c: [22.3290, 114.2000], z: 15,
    note: "1945 年皇家空軍重返啟德；1946 年 5 月 1 日政府成立航空事務處（翌年改名民航處），國泰航空同年創立。1954 年起規劃向九龍灣填海興建新跑道，至 1958 年新跑道啟用為止。" },
  { id: "e1958", start: 1958, end: 1970, label: "新跑道與噴射機", map: "1963.3", c: [22.3250, 114.1990], z: 15,
    note: "1958 年 9 月 12 日伸入九龍灣的新 13/31 跑道啟用，課程年表記同日有「彗星」噴射客機抵港；1962 年新客運大樓落成。" },
  { id: "e1970", start: 1970, end: 1989, label: "廣體年代", map: "1973", c: [22.3220, 114.2000], z: 14,
    note: "1970 年 4 月 11 日泛美波音 747 首次到港。1974 年起 13 跑道採用儀器導航進場，在格仔山前右轉對準跑道；1978 年皇家空軍撤離啟德。也可在「歷史地圖」選單切換 1983 年機場條例圖。" },
  { id: "e1989", start: 1989, end: 1998, label: "飽和與謝幕", map: "1996", c: [22.3180, 114.2080], z: 14,
    note: "1989 年 10 月 11 日港府宣布在赤鱲角興建新機場，超負荷運作的啟德進入倒數。1998 年 7 月 6 日凌晨啟德關閉，運作在一夜之間遷往赤鱲角。" },
  { id: "e1998", start: 1998, end: 2007, label: "退場與臨時城市", map: "1996", c: [22.3200, 114.2050], z: 15,
    note: "1998 年 7 月機場關閉後，機場不是一夜消失，而是逐塊退場：北停機坪的地盤整理及土地淨化工程在 1998 年 10 月展開、2002 年 4 月完成，舊客運大樓與停車樓 2004 年 4 月起拆卸。與此同時，停車場、巴士車廠、高爾夫球場、堆料場和工地陸續進駐，到 2005 年約六成土地已短期出租或臨時撥用。至 2007 年底分區計劃大綱圖獲核准為止。地圖為 1996 年測量圖，可對照其後逐步拆去的機場設施。" },
  { id: "e2007", start: 2007, end: null, label: "啟德重生", map: null, c: [22.3200, 114.2070], z: 15,
    note: "2007 年底《啟德分區計劃大綱圖》獲核准，啟德發展計劃確立；2010 年成立啟德辦事處統籌發展，2013 年郵輪碼頭、2025 年體育園相繼啟用。" }
];

const POIS = [
  {
    id: "kaitakbund", era: "e1924", pos: [22.3250, 114.2075],
    name: "啟德濱：填海起家的機場",
    sub: "Kai Tak Bund · 1912–1924",
    types: ["landmark"],
    desc: "「啟德」之名源自何啟與區德於 1912 年合組的「啟德營業有限公司」。公司在九龍灣北岸填海造地，約 1916 年起全面動工，計劃發展「啟德濱」花園城市；計劃未能成功，公司於 1924 年清盤，填海地由政府收回，其後闢作飛行場地，啟德機場的故事由此開始。今天的啟晴邨、德朗邨一帶，正是當年啟德濱填海地的核心。",
    sources: [
      { label: "Gwulo：啟德濱（引何啟傳記：1912 年合組，1924 年清盤，土地由政府收回）", url: "https://gwulo.com/node/40653" },
      { label: "Gwulo：Kai Tak Reclamation 1916–1924", url: "https://gwulo.com/node/48986" },
      { label: "Hong Kong Maper：啟德行李牌（1955 年啟德與現代對比地圖）", url: "https://www.hongkongmaper.org/blogs/舊日的足跡/啟德行李牌" }
    ]
  },
  {
    id: "firstflight", era: "e1924", pos: [22.3262, 114.1998],
    name: "1924 年 5 月 31 日 · 亞拔首試飛",
    sub: "Harry Abbott's first flight",
    types: ["event"],
    desc: "1924 年 5 月 31 日，美國飛行家亞拔（Harry Abbott）首次使用啟德濱空地試飛；1925 年 1 月 25 日亞拔飛行學校於啟德濱開業，同年 8 月結束。是年英國皇家海軍航空母艦「赫米斯號」（HMS Hermes）訪港，艦上戰機曾使用啟德濱空地。香港的航空史在這片剛填平的海旁土地上起飛。",
    sources: [
      { label: "《啟德機場大事年表》（課程材料）", url: "" }
    ]
  },
  {
    id: "raf", era: "e1924", pos: [22.3293, 114.2072],
    name: "皇家空軍啟德基地（1927）",
    sub: "RAF Kai Tak · 1927–1978",
    types: ["landmark", "photo"],
    desc: "1927 年 3 月 19 日皇家空軍啟德基地正式成立，啟德成為軍民合用機場，直至 1978 年 3 月 31 日皇家空軍完全撤離。位於觀塘道 51 號的前皇家空軍軍官會所（1934 年落成）至今尚存，是啟德軍事年代少數留存的建築。1951 年從軍官會所遠眺，跑道、停機坪與九龍灣一覽無遺。",
    media: [
      { kind: "img", src: "assets/img/raf_mess_1935.jpg", cap: "皇家空軍軍官會所，1935 年", credit: "Gwulo.com（Former RAF Officers' Mess, Kai Tak）", creditUrl: "https://gwulo.com/node/7612" },
      { kind: "img", src: "assets/img/raf_view_1951.jpg", cap: "1951 年從軍官會所遠眺啟德機場", credit: "Gwulo.com", creditUrl: "https://gwulo.com/node/7612/photos" },
      { kind: "img", src: "assets/img/raf_mess_img16.jpg", cap: "軍官會所現貌（2010 年攝；現為一級歷史建築，浸大視覺藝術院）", credit: "Gwulo.com", creditUrl: "https://gwulo.com/node/7612" }
    ],
    sources: [
      { label: "Gwulo：Former RAF Officers' Mess, Kai Tak", url: "https://gwulo.com/node/7612" },
      { label: "《啟德機場大事年表》1927 年條", url: "" }
    ]
  },
  {
    id: "imperial", era: "e1924", pos: [22.3273, 114.2053],
    name: "1936 · 香港進入民航紀元",
    sub: "Imperial Airways first service",
    types: ["event", "landmark"],
    desc: "1936 年 3 月 24 日，帝國航空（Imperial Airways）香港至檳城定期航班首航，香港正式進入民航紀元；同年 11 月 6 日中國航空開辦中港定期航班。1937 年泛美航空、歐亞航空相繼首航。啟德由軍民合用機場，逐步發展為遠東重要航空港。",
    sources: [
      { label: "《啟德機場大事年表》1936–1937 年條", url: "" }
    ]
  },
  {
    id: "sungwongtoi", era: "e1941", pos: [22.3250, 114.1894],
    name: "宋皇台遷拆（1943）",
    sub: "Sung Wong Toi relocation",
    types: ["landmark", "event"],
    desc: "1943 年 1 月 9 日，日治政府為擴建啟德機場，舉行宋王台遷拆祭典，將南宋遺址巨石鑿起遷往他處；戰後 1950 年代宋王台巨石被移回現址，建宋皇台花園。一塊石頭的兩次遷移，見證了啟德擴張與九龍城社區的角力——這是啟德發展史上最早的一宗「保育 vs 機場」事件。",
    sources: [
      { label: "《啟德機場大事年表》1943 年條", url: "" }
    ]
  },
  {
    id: "war", era: "e1941", pos: [22.3230, 114.2050],
    name: "戰火中的啟德（1941–1945）",
    sub: "Kai Tak under war",
    types: ["event"],
    desc: "1941 年 12 月 8 日清晨，日軍轟炸啟德，四日後佔領機場；日治期間日軍擴建啟德。1944 年 1 月 23 日及 2 月 11 日，盟軍 B-25 轟炸機在 P-40 護航下兩度大舉空襲啟德，與日軍爆發空戰。1945 年 8 月日本投降，9 月皇家空軍重返啟德，民航逐步恢復。",
    sources: [
      { label: "《啟德機場大事年表》1941–1945 年條", url: "" }
    ]
  },
  {
    id: "cathay", era: "e1945", pos: [22.3270, 114.2038],
    name: "國泰航空誕生（1946）",
    sub: "Cathay Pacific founded at Kai Tak",
    types: ["event", "landmark"],
    desc: "1946 年 9 月 24 日，以啟德為基地的國泰航空成立，翌年 3 月 4 日香港航空成立（與 1985 年成立的港龍航空並無關係）。1948 年太古洋行成立 PAMAS 飛機維修公司，1950 年與 JAMCO 合併為香港飛機工程公司（HAECO）。啟德由此奠下香港航空業「一機場多公司」的格局，直至 1998 年。",
    sources: [
      { label: "《啟德機場大事年表》1946–1950 年條", url: "" }
    ]
  },
  {
    id: "runway", era: "e1958", pos: [22.3146, 114.2036],
    name: "13/31 跑道（1958 新跑道啟用）",
    sub: "Runway 13/31 · 2,540 m → 3,390 m",
    types: ["landmark", "photo", "video", "audio"],
    desc: "1950 年 10 月舊 13/31 跑道延長至橫越清水灣道；1954 年港府展開大規模填海擴建，1958 年 9 月 12 日新 13/31 跑道正式開幕，同日英國海外航空「彗星」5 型噴射客機抵港。1974 年跑道延長部分與儀器導進系統啟用，1979–80 年再延長至 3,390 米。這條伸入九龍灣的跑道，日後成為全球最著名的「城市機場跑道」。在側欄「歷史地圖」選擇 1963 年九龍半島地圖，可見新跑道西北段與客運大樓一帶。",
    media: [
      { kind: "img", src: "assets/img/kaitak_1951.jpg", cap: "1951 年的啟德機場（新跑道建成前），遠處為獅子山", credit: "Eternal1966（Flickr，經 Gwulo.com）", creditUrl: "https://gwulo.com/media/23334" },
      { kind: "img", src: "assets/img/opening_1958.jpg", cap: "1958 年 9 月 12 日新跑道開幕", credit: "moddsey（Gwulo.com）", creditUrl: "https://gwulo.com/media/33972" },
      { kind: "img", src: "assets/img/runway31.jpg", cap: "31 跑道望向獅子山方向", credit: "出處待補" },
      { kind: "yt", id: "umK2OdC8wso", cap: "1989 年啟德機場實錄：降落大轉彎（波音 747 / DC-10）", credit: "YouTube：Nao Nakagawa《[Old-Film] Hong kong-Kaitak 1989》", creditUrl: "https://www.youtube.com/watch?v=umK2OdC8wso" }
    ],
    sources: [
      { label: "《啟德機場大事年表》1950–1974 年條", url: "" },
      { label: "YouTube：NaoNakagawa 1989 Kai Tak", url: "https://www.youtube.com/watch?v=umK2OdC8wso" },
      { label: "Gwulo：Kai Tak Runway 13/31", url: "https://gwulo.com/node/62621" },
      { label: "Gwulo：1951 Kai Tak Airport（Eternal1966，Flickr）", url: "https://gwulo.com/media/23334" }
    ]
  },
  {
    id: "film1960", era: "e1958", pos: [22.3235, 114.2040],
    name: "1960 年的啟德（政府檔案處影像）",
    sub: "Archival footage · 1960",
    types: ["video"],
    desc: "新跑道 1958 年啟用後兩年的啟德：這段香港政府檔案處的歷史影像記錄了 1960 年機場的日常運作——新客運大樓、停機坪與剛伸入九龍灣的跑道。可在側欄「歷史地圖」切換到 1963 年九龍半島地圖，對照客運大樓一帶的位置。",
    media: [
      { kind: "video", src: "assets/video/gov_1960.mp4", cap: "1960 年的啟德機場（歷史影像，無聲／原聲）", credit: "香港政府檔案處（課程材料）" }
    ],
    sources: [
      { label: "香港政府檔案處歷史影像（課程材料）", url: "" }
    ]
  },
  {
    id: "oralhistory", era: "e1945", pos: [22.3365, 114.1955],
    name: "口述歷史：跑道閘口的年代",
    sub: "Oral histories · 1940s–50s",
    types: ["memory", "audio", "video"],
    desc: "新跑道落成前，舊 13/31 跑道向北延伸、橫越清水灣道：飛機降落時，衙前圍道、大成街一帶要落下閘口、鳴鈴截停人車，讓飛機先過。這些「香港留聲」口述歷史片段（粵語原聲）由老街坊親述：運輸帶運泥填海、在跑道地盤釣魚、飛機復飛耽誤了午飯……是啟德最地道的民間記憶。",
    media: [
      { kind: "video", src: "assets/video/oral_chanbingcheong.mp4", cap: "陳炳昌：四、五十年代的跑道運作（颱風中降落的 BOAC 不列顛尼亞式）", credit: "香港記憶「香港留聲」口述歷史檔案庫（課程材料）", creditUrl: "https://www.hkmemory.hk/tc/oral_history-intro.html" },
      { kind: "video", src: "assets/video/oral_chengtiangai.mp4", cap: "鄭天賜：舊 07/25 與 13/31 跑道交叉，飛機過馬路要落閘", credit: "香港記憶「香港留聲」口述歷史檔案庫（課程材料）", creditUrl: "https://www.hkmemory.hk/tc/oral_history-intro.html" },
      { kind: "video", src: "assets/video/oral_chengtiangai2.mp4", cap: "鄭天賜：新機師貼近獅子山降落的原因", credit: "香港記憶「香港留聲」口述歷史檔案庫（課程材料）", creditUrl: "https://www.hkmemory.hk/tc/oral_history-intro.html" },
      { kind: "video", src: "assets/video/oral_lauyeekow.mp4", cap: "劉義苟（音）：五十年代跑道閘口——大成街街市一帶，每次落閘約八至十分鐘", credit: "香港記憶「香港留聲」口述歷史檔案庫（課程材料）", creditUrl: "https://www.hkmemory.hk/tc/oral_history-intro.html" },
      { kind: "video", src: "assets/video/oral_yiuyutim.mp4", cap: "姚余添（音）：啟明樓閘口與大石", credit: "香港記憶「香港留聲」口述歷史檔案庫（課程材料）", creditUrl: "https://www.hkmemory.hk/tc/oral_history-intro.html" },
      { kind: "video", src: "assets/video/oral_ausunglai.mp4", cap: "區生來（音）：飛機復飛，巴士司機趕不上回家吃午飯", credit: "香港記憶「香港留聲」口述歷史檔案庫（課程材料）", creditUrl: "https://www.hkmemory.hk/tc/oral_history-intro.html" },
      { kind: "video", src: "assets/video/oral_liuyigou.mp4", cap: "劉義苟（音）：填海建新跑道——衙前圍道運輸帶與跑道地盤釣魚", credit: "香港記憶「香港留聲」口述歷史檔案庫（課程材料）", creditUrl: "https://www.hkmemory.hk/tc/oral_history-intro.html" }
    ],
    quotes: [
      { text: "閘口位於今天的大成街街市和黃大仙警署一帶。飛機快到時有人通知、鳴鈴，路中間的人要趕快走避。每次落閘大約八至十分鐘。", who: "口述者：劉義苟（音，Lau Yee Kow）", src: "香港記憶「香港留聲」口述歷史（課程材料轉錄）" },
      { text: "在衙前圍道築了一條運輸帶，泥頭一路運到跑道……仍在填海時我們走進跑道地盤釣魚——未建好跑道前魚很多，因為有幾條大坑去水。", who: "口述者：劉義苟（音，Lau Yee Kow）", src: "香港記憶「香港留聲」口述歷史（課程材料轉錄）" }
    ],
    sources: [
      { label: "香港記憶「香港留聲」口述歷史檔案庫", url: "https://www.hkmemory.hk/tc/oral_history-intro.html" },
      { label: "課程材料《口述檔案》《口述記錄》轉錄稿", url: "" }
    ]
  },
  {
    id: "checkerboard", era: "e1970", pos: [22.3357, 114.1843],
    name: "格仔山：啟德式降落的起點",
    sub: "Checkerboard Hill · IGS Runway 13",
    types: ["landmark", "photo", "video", "memory", "audio"],
    desc: "飛機降落 13 跑道時，需沿儀器導航（IGS）航道自西向東低空飛越九龍西部市區，目視格仔山上橙白相間的大方格後，右轉約 47 度、越過九龍城對準跑道——這就是著名的「啟德大轉彎」（Kai Tak Turn / Hong Kong Curve）。格仔山因此成為全球航空迷的朝聖地。機師稱之為「啟德心臟病發」（Kai Tak Heart Attack）。格仔山上的格仔圖案後來被塗灰；2023 年底電視劇《新聞女王》播出後，格仔山再度走紅，被市民稱為「家妍山」。",
    media: [
      { kind: "img", src: "assets/img/checkerboard_ocs.jpg", cap: "格仔山上的格仔圖案", credit: "Our China Story 當代中國", creditUrl: "https://www.ourchinastory.com/zh/8200/" },
      { kind: "img", src: "assets/img/jiemian_lufthansa_turn.jpg", cap: "漢莎航空波音 747-400 在九龍城上空大轉彎，朝 13 跑道進發", credit: "攝：Daryl Chapman（界面新聞，2018）", creditUrl: "https://www.jiemian.com/article/2303867.html" },
      { kind: "yt", id: "NiPyrfEuOeo", cap: "啟德機場經典進場合輯（附原聲）", credit: "YouTube：X-Spot Aviation《HONG KONG KAI TAK – The \"Heart Attack Approach\"》", creditUrl: "https://www.youtube.com/watch?v=NiPyrfEuOeo" }
    ],
    quotes: [
      { text: "全世界只有這麼一個機場，才需要你在 150 米以下的低空急轉 45 度對準跑道，才需要你在高樓大廈之間飛行，接近那橙白相間的格仔山之後，朝著跑道降落。", who: "羅素·戴維（Russell Davie），前國泰航空營運總經理兼機師", src: "界面新聞《告別二十年：香港啟德機場的昔日榮光》，2018-07-24" },
      { text: "啟德機場與大多數國際機場截然不同，因為它坐落在城市正中間……獅子山阻擋了進入機場的直線路徑，因此飛機入港必須在九龍城完成一個急轉，然後在 13 號跑道上降落。", who: "達里爾·查普曼（Daryl Chapman），航空攝影師", src: "同上" }
    ],
    sources: [
      { label: "界面新聞，2018-07-24", url: "https://m.jiemian.com/article/2303867.html" },
      { label: "Our China Story 當代中國：格仔山與啟德機場", url: "https://www.ourchinastory.com/zh/8200/" },
      { label: "星島：格仔山與機場的故事，2024-05-26", url: "https://www.stheadline.com/zh-hans/society/3343821/" }
    ]
  },
  {
    id: "jumbo", era: "e1970", pos: [22.3200, 114.2060],
    name: "廣體年代：747 與駕駛艙視角",
    sub: "Wide-body era · 1970s",
    types: ["photo", "video"],
    desc: "1970 年 4 月 11 日，泛美波音 747 首次到港，啟德成為美國境外第四個可供 747 升降的機場，香港正式邁進廣體客機年代。約 1979 年 7 月，Tony Hawes 從駕駛艙拍下整個進場過程：飛越九龍、對準格仔山、大轉彎、著陸 13 跑道——是體驗「啟德式降落」最震撼的視角之一；他也在地面拍下客機低飛降落的一刻。",
    media: [
      { kind: "img", src: "assets/img/cockpit_1979_10.jpg", cap: "完成右轉後，13 跑道已在正前方（駕駛艙視角，約 1979 年）", credit: "Tony Hawes 攝（Gwulo.com）", creditUrl: "https://gwulo.com/node/34146" },
      { kind: "img", src: "assets/img/cockpit_1979_11.jpg", cap: "著陸後所見的停機坪與客運大樓一帶（駕駛艙視角，約 1979 年）", credit: "Tony Hawes 攝（Gwulo.com）", creditUrl: "https://gwulo.com/node/34146" },
      { kind: "img", src: "assets/img/cockpit_1979_1.jpg", cap: "客機低飛掠過九龍城，準備降落啟德（地面視角，約 1979 年）", credit: "Tony Hawes 攝（Gwulo.com）", creditUrl: "https://gwulo.com/node/34146" }
    ],
    sources: [
      { label: "Gwulo：Approaching Kai Tak – View from the cockpit in July 1979", url: "https://gwulo.com/node/34146" },
      { label: "《啟德機場大事年表》1970 年條", url: "" }
    ]
  },
  {
    id: "concorde", era: "e1970", pos: [22.3160, 114.2115],
    name: "和諧式訪港（1976）",
    sub: "Concorde at Kai Tak",
    types: ["video", "event"],
    desc: "1976 年 11 月 5 日，法航「和諧式」（Concorde）超音速客機首次到港。退役前的啟德歲月裡，和諧式的優雅身影曾多次出現在維多利亞港上空，被譽為「啟德最美的景觀之一」。",
    media: [
      { kind: "yt", id: "fXEIs3gdW_A", cap: "法航和諧式在啟德機場降落（原聲）", credit: "YouTube：Just Planes《Awesome Air France CONCORDE at KAI TAK!》", creditUrl: "https://www.youtube.com/watch?v=fXEIs3gdW_A" }
    ],
    sources: [
      { label: "《啟德機場大事年表》1976 年條", url: "" },
      { label: "YouTube：Air France CONCORDE at KAI TAK", url: "https://youtu.be/fXEIs3gdW_A" }
    ]
  },
  {
    id: "kwuntongpier", era: "e1989", pos: [22.3064, 114.2217],
    name: "觀塘碼頭：最佳觀機點",
    sub: "Plane-spotting at Kwun Tong",
    types: ["photo", "memory"],
    desc: "對不少香港人來說，「看飛機」是周末的家庭節目：觀塘碼頭、機場停車場天台、九龍城樓頂，都是著名觀機點。飛機以近乎貼地的姿態掠過頭頂，轟鳴聲蓋過人聲——這是啟德年代九龍居民的共同感官記憶。",
    media: [
      { kind: "img", src: "assets/img/jiemian_rooftop.jpg", cap: "國泰客機低飛掠過九龍城樓宇", credit: "攝：Daryl Chapman（界面新聞，2018）", creditUrl: "https://www.jiemian.com/article/2303867.html" },
      { kind: "yt", id: "INaH4G76zBE", cap: "1998 年從九龍城看啟德：飛機擦過樓頂的經典視角（附原聲）", credit: "YouTube：AIRBOYD《Hong Kong Kai Tak From Kowloon (1998)》", creditUrl: "https://www.youtube.com/watch?v=INaH4G76zBE" }
    ],
    quotes: [
      { text: "天空中最棒的景觀：觀看飛機的人們聚集在啟德機場停車場的屋頂上，這裡曾經是觀測飛機進港離港的最佳觀景點之一。", who: "達里爾·查普曼（Daryl Chapman）", src: "界面新聞，2018" }
    ],
    sources: [
      { label: "界面新聞，2018-07-24", url: "https://www.jiemian.com/article/2303867.html" },
      { label: "YouTube：AIRBOYD – Hong Kong Kai Tak From Kowloon (1998)", url: "https://www.youtube.com/watch?v=INaH4G76zBE" }
    ]
  },
  {
    id: "kowlooncity", era: "e1989", pos: [22.3312, 114.1935],
    name: "九龍城：飛機擦過屋頂的日子",
    sub: "Under the flight path",
    types: ["memory", "audio"],
    desc: "啟德機場地處市區，降落航道正穿過九龍城、新蒲崗稠密的唐樓與工廠大廈。飛機低空掠過天台晾曬的衣物、竹竿棚架和電視天線，轟鳴聲成為幾代九龍城人的背景音。有人懷念，也有人長年受噪音之苦——愛與怨，都是啟德記憶的一部分。",
    quotes: [
      { text: "機場關閉前我還小，住在深水埗。雖然從未去過機場，但我對在頭頂上飛過的飛機和引擎聲十分著迷。我對啟德其餘的印象來自電視劇和電影。你對啟德有特別的回憶或鄉愁嗎？", who: "gary.c（Gwulo 用戶），2020", src: "Gwulo「My only memory with Kai Tak」（node 51672）" },
      { text: "剛到國泰航空上班的時候，每每有朋友到香港來看我，我們就會一起到九龍城閒逛，看看居民樓和商舖頂上低空掠過的飛機。我就這樣度過了不少快樂時光。", who: "羅素·戴維（Russell Davie），前國泰機師", src: "界面新聞，2018" }
    ],
    sources: [
      { label: "Gwulo：My only memory with Kai Tak", url: "https://gwulo.com/node/51672" },
      { label: "界面新聞，2018", url: "https://www.jiemian.com/article/2303867.html" }
    ]
  },
  {
    id: "replacement", era: "e1989", pos: [22.3240, 114.2030],
    name: "機場飽和與新機場之爭（1989–1994）",
    sub: "Saturated Kai Tak & the Chek Lap Kok decision",
    types: ["event", "video"],
    desc: "到 1980 年代末，單跑道的啟德早已超出負荷：1994 年香港電台《鏗鏘集》記錄了機場飽和的日常，並追問新機場何日落成。1989 年 10 月 11 日港府宣布在赤鱲角興建新機場，啟德的命運從此倒數。這段爭議——效率、安全、噪音與城市發展的拉鋸——正是「公共歷史」裡政策與民間記憶交鋒的現場。",
    media: [
      { kind: "video", src: "assets/video/rthk_hkc_1994.mp4", cap: "《鏗鏘集》1994：啟德機場的飽和——探討新機場的落成", credit: "香港電台《鏗鏘集》（1994，課程材料）" }
    ],
    sources: [
      { label: "《啟德機場大事年表》1989 年條", url: "" },
      { label: "香港電台《鏗鏘集》（1994，課程材料）", url: "" }
    ]
  },
  {
    id: "ca301", era: "e1970", pos: [22.3085, 114.2130],
    name: "1988 年 8 月 31 日 · 中國民航 301 號班機",
    sub: "CAAC Flight 301 overrun",
    types: ["event", "video"],
    desc: "1988 年 8 月 31 日上午，中國民航廣州管理局一架三叉戟 2E（編號 B-2218，廣州—香港）在雨霧中降落 31 跑道時，右側襟翼擦撞進場燈、主起落架撞上跑道邊緣後撕裂，飛機衝出跑道滑入九龍灣。機上 89 人中 7 人罹難（6 名機組、1 名乘客），事故令啟德封閉逾六小時。這是啟德晚期最嚴重的事故之一。",
    media: [
      { kind: "video", src: "assets/video/ca301_1988.mp4", cap: "【新聞報道】1988 年中國民航 301 號班機啟德空難", credit: "新聞檔案片段（課程材料）" }
    ],
    sources: [
      { label: "CAAC Flight 301（英文維基百科）", url: "https://en.wikipedia.org/wiki/CAAC_Flight_301" },
      { label: "新聞檔案片段（課程材料）", url: "" }
    ]
  },
  {
    id: "ci605", era: "e1989", pos: [22.3060, 114.2158],
    name: "1993 年 11 月 4 日 · 華航 605 號班機",
    sub: "China Airlines CI605 overrun",
    types: ["event", "photo"],
    desc: "1993 年 11 月 4 日，華航一架自台北抵港的波音 747-400 在暴風雨中降落啟德時衝出跑道，滑入九龍灣水域。機上 396 人全部生還，23 人受傷。事件令「啟德式降落」的風險再次成為全城話題；此時距離赤鱲角新機場啟用，尚有近五年。",
    media: [
      { kind: "img", src: "assets/img/jiemian_chinaairlines_1993.jpg", cap: "1993 年 11 月 4 日，華航 747-400 雨中降落衝出跑道滑入海中", credit: "攝：Daryl Chapman（界面新聞，2018）", creditUrl: "https://www.jiemian.com/article/2303867.html" }
    ],
    sources: [
      { label: "《啟德機場大事年表》1993 年條", url: "" },
      { label: "界面新聞，2018", url: "https://www.jiemian.com/article/2303867.html" }
    ]
  },
  {
    id: "closure", era: "e1989", pos: [22.3260, 114.2040],
    name: "1998 年 7 月 5–6 日 · 最後一日",
    sub: "The last day of Kai Tak",
    types: ["event", "photo", "memory", "audio"],
    desc: "1998 年 7 月 5 日是啟德最後一天運作：最後一班抵港航班為港龍 KA841（重慶抵港，晚上 11 時 38 分降落）；最後一班離港商業航班為國泰 CX251（7 月 6 日凌晨 0 時 02 分起飛往倫敦希思羅）。空載飛機轉場後，民航處處長施高理在控制塔以 “Goodbye Kai Tak, and thank you!” 告別，按鈕熄滅跑道全部燈光——服務香港 73 年的城市機場謝幕。其後啟德二號貨站一度重開，疏導新機場搬遷混亂。",
    media: [
      { kind: "img", src: "assets/img/closure_kt1.jpg", cap: "1998 年 7 月 22 日，站在停用兩周的跑道上望向東南（鯉魚門方向）", credit: "moddsey 攝（Gwulo.com）", creditUrl: "https://gwulo.com/node/6366" },
      { kind: "img", src: "assets/img/closure_kt2.jpg", cap: "跑道東南端的風向袋（1998 年 7 月）", credit: "moddsey 攝（Gwulo.com）", creditUrl: "https://gwulo.com/node/6366" },
      { kind: "img", src: "assets/img/closure_kt3.jpg", cap: "在 31 跑道數字標記旁望向西北（筆架山、獅子山方向）（1998 年 7 月）", credit: "moddsey 攝（Gwulo.com）", creditUrl: "https://gwulo.com/node/6366" },
      { kind: "img", src: "assets/img/closure_kt4.jpg", cap: "31 跑道數字旁，有人用黃漆噴上「Good Bye Kai Tak」（1998 年 7 月）", credit: "moddsey 攝（Gwulo.com）", creditUrl: "https://gwulo.com/node/6366" },
      { kind: "img", src: "assets/img/closure_kt5.jpg", cap: "從格仔山俯瞰九龍城樓群與跑道（1998 年 7 月）", credit: "moddsey 攝（Gwulo.com）", creditUrl: "https://gwulo.com/node/6366" },
      { kind: "img", src: "assets/img/closure_kt6.jpg", cap: "望向九龍城、格仔山與筆架山（1998 年 7 月）", credit: "moddsey 攝（Gwulo.com）", creditUrl: "https://gwulo.com/node/6366" },
      { kind: "video", src: "assets/video/last_landing_tvb.mp4", cap: "新聞檔案：啟德機場最後一班航機降落（1998 年 7 月 5 日深夜）", credit: "無綫電視新聞檔案（課程材料）" },
      { kind: "video", src: "assets/video/closure_ceremony_1998.mp4", cap: "1998 年 7 月 6 日凌晨：啟德機場關閉儀式，跑道燈光熄滅", credit: "關閉儀式錄像（課程材料）" },
      { kind: "video", src: "assets/video/atv_farewell_1998.mp4", cap: "亞視新聞：告別啟德舊機場（1998）", credit: "亞洲電視新聞（課程材料）" }
    ],
    quotes: [
      { text: "Goodbye Kai Tak, and thank you!（再見了啟德，多謝你！）", who: "民航處處長施高理（Richard Siegel），1998 年 7 月 6 日凌晨 1 時 17 分", src: "《啟德機場大事年表》1998 年條" },
      { text: "「格仔山」山頭曾畫上紅白色的格仔圖案，告知機師需要轉彎……如遇上惡劣天氣，降落難度加倍，因為降落驚險萬分，令啟德機場被機師稱為「啟德心臟病發」。", who: "金·沙曼機長（Capt. Kim Sharman），最後一班 CX251 機長", src: "BBC 中文《啟德機場關閉25周年》，2023-07-05" }
    ],
    sources: [
      { label: "《啟德機場大事年表》1998 年條", url: "" },
      { label: "BBC 中文：啟德機場關閉25周年，2023-07-05", url: "https://www.bbc.com/zhongwen/simp/chinese-news-66108373" },
      { label: "Gwulo：Closure of Kai Tak Airport", url: "https://gwulo.com/node/6366" },
      { label: "政府檔案處：1998 年啟德機場照片集", url: "https://www.grs.gov.hk/ws/erp/album/kta.html" },
      { label: "Daryl Chapman：1998 年關閉前航拍與回憶（Flickr）", url: "https://www.flickr.com/photos/darylchapman/3885972320" }
    ]
  },
  {
    id: "northapron", era: "e1998", pos: [22.3310, 114.2035],
    name: "北停機坪地盤整理及土地淨化（1998–2002）",
    sub: "North Apron decommissioning",
    types: ["event"],
    desc: "關閉前的啟德是一套相互連接的航空空間：北停機坪停放和維修飛機，客運大樓與多層停車樓連接旅客和城市交通，南停機坪一帶保留維修和加油設施，13/31 跑道伸向九龍灣。機場關閉改變了這些地方的功能，卻沒有立即抹去它們的形狀。北停機坪最先進入整備：北停機坪的地盤整理及土地淨化工程於 1998 年 10 月展開，並於 2002 年 4 月完成。這指的是前期的地盤整理和土地淨化，並非北停機坪其後的全部發展工程。旁邊的舊客運大樓和停車樓仍被佔用（租戶要到 2003 年底才遷出），施工無法進入，所以比周邊更晚退場。對附近居民來說，機場不是在某一天離開，而是在幾年間逐塊退場。",
    sources: [
      { label: "立法會工務小組委員會文件 PWSC(2003-04)66：北停機坪基建、客運大樓及停車樓拆卸", url: "https://www.legco.gov.hk/yr03-04/english/fc/pwsc/papers/p03-66e.pdf" },
      { label: "立法會工務小組委員會文件（1998 年 9 月；2012–13 年度第 27 段；2019–20 年度）：北停機坪地盤整理及土地淨化工程 1998 年 10 月展開、2002 年 4 月完成", url: "" },
      { label: "立法會規劃地政及工程事務委員會文件 CB(1)813/03-04(07)：客運大樓及停車樓租戶遷出安排", url: "https://www.legco.gov.hk/yr03-04/english/panels/plw/papers/plw0127cb1-813-7e.pdf" },
      { label: "1997 年啟德機場運行布局圖（AirportHistory.org）", url: "https://www.airporthistory.org/uploads/1/2/1/4/121407428/kai-tak-airport-part_orig.png" }
    ]
  },
  {
    id: "terminaldemolition", era: "e1998", pos: [22.3292, 114.1990],
    name: "舊客運大樓與停車樓拆卸（2004–2006）",
    sub: "Demolition of the passenger terminal",
    types: ["event"],
    desc: "租戶在 2003 年底遷出後，客運大樓、多層停車樓及相關構築物的拆卸工程於 2004 年 4 月展開，拆卸原定於 2006 年年中完成，整份工程合約則於同年 9 月大致完成。大樓拆卸之後，還要淨化客運大樓及停車場大樓下方的土地，並處理排水設施。建築從地面消失後，舊址仍留下大片硬地、工程圍欄和尚未處理的設施。2004 年和 2005 年的現場照片與航拍記錄了這個階段：繁忙的航空建築陸續消失，停機坪一帶出現沙料堆放、工程活動和其他臨時設施——舊機場不再承擔航空運輸，卻也還沒有變成新的城區。",
    sources: [
      { label: "立法會工務小組委員會文件 PWSC(2003-04)66（2004 年 2 月 18 日審議）：2004 年 4 月展開，拆卸原定 2006 年年中完成，整份合約計劃 2006 年 9 月完成", url: "https://www.legco.gov.hk/yr03-04/english/fc/pwsc/papers/p03-66e.pdf" },
      { label: "立法會工務小組委員會 2010–11 年度文件：工程於 2006 年 9 月大致完成", url: "" },
      { label: "2004 年 5 月 30 日舊址照片與現場圖說（Gilbert Choy，JetPhotos）", url: "https://www.jetphotos.com/photo/294663" },
      { label: "2005 年 8 月 31 日舊址航拍與圖說（Colin Parker，JetPhotos）", url: "https://www.jetphotos.com/photo/556857" }
    ]
  },
  {
    id: "landuse2005", era: "e1998", pos: [22.3160, 114.2030],
    name: "2005：六成土地臨時出租或撥用",
    sub: "Temporary land uses, 2005",
    types: ["event", "photo"],
    desc: "2005 年 11 月，政府向共建維港委員會提交的文件附有《Existing Land Uses in Kai Tak》地圖。文件指出，約 220 公頃的舊址中約六成已作臨時用途：約 45.5 公頃以短期租約出租，用作高爾夫球中心、非牟利飛行訓練學校、收費公眾停車場、露天貯物和巴士停泊；約 82.9 公頃臨時撥給政府部門，包括清拆舊客運大樓和停車樓的工地、承建商工地、堆料和貯存等。這些用途並不平均：靠近九龍城、能直接連接道路的外圍土地，較容易成為停車場、貯存地或部門臨時用地；機場內部遠離公共道路，缺少公共交通和安全的車輛及行人通道，約 60.1 公頃破損混凝土地面還需重鋪和加設排水。城市因此先從容易到達的邊緣進入，再逐漸接觸舊機場內部。",
    media: [
      { kind: "img", src: "assets/img/landuse_2005_annexF.jpg", cap: "Existing Land Uses in Kai Tak（2005 年 10 月 20 日）。紅／粉紅為短期租約，橙為臨時撥給土木工程拓展署，藍為臨時撥給其他部門，淺紫／淡灰為擬議臨時撥地；顏色表示租用或撥地性質，不一定等於實際用途。", credit: "土木工程拓展署（共建維港委員會文件第 29/2005 號附件 F）", creditUrl: "https://www.harbourfront.org.hk/eng/content_page/doc/agenda051124/agenda6.pdf#page=10" }
    ],
    sources: [
      { label: "共建維港委員會文件第 29/2005 號：Temporary Harbour-front Land Use（2005-11-17；第 14–17 段、附件 F）", url: "https://www.harbourfront.org.hk/eng/content_page/doc/agenda051124/agenda6.pdf" }
    ]
  },
  {
    id: "eia2007", era: "e1998", pos: [22.3190, 114.2010],
    name: "2007：舊跑道上的臨時城市",
    sub: "Temporary uses after closure, 2007",
    types: ["event", "photo"],
    desc: "2007 年，拆除舊機場餘下設施（北停機坪以外）的環境影響評估，把舊跑道和南停機坪分成多個編號地塊，標示關閉後的土地用途：巴士車廠、停車場、高爾夫練習場、為彩雲及佐敦谷發展而設的堆料場，以及各類工程用地。有些用途已經終止，有些仍在運作；南停機坪地下的燃油栓系統、舊油缸和輸油管則仍待拆除。機場的舊設施、臨時用途和未來工程，在同一片土地上重疊。2008 年起南停機坪的清拆除污，見「啟德重生」年代的大綱圖條目。",
    media: [
      { kind: "img", src: "assets/img/eia_2007_dwg32.jpg", cap: "Drawing 3.2：啟德機場關閉後，項目範圍內（舊跑道及南停機坪）的現有土地用途。圖中部分編號用途已經終止，閱讀時請對照圖例。", credit: "環境影響評估報告圖紙（環保署環評資料庫）", creditUrl: "https://www.epd.gov.hk/eia/files/applications/en/pp_160/eia_1668/progress/action_2865/Drawings/DWG%203.2.files/image002.jpg" }
    ],
    sources: [
      { label: "環保署：Decommissioning of the Former Kai Tak Airport other than the North Apron（AEIAR-114/2007）", url: "https://www.epd.gov.hk/eia/english/alpha/aspd_505.html" },
      { label: "環評報告第 2 章項目描述（關閉後的臨時用途、南停機坪燃油栓系統）", url: "https://epd.gov.hk/eia/register/report/eiareport/eia_1392007/Formal%20Submission%20html/EIA/Text/S2%20Project%20Description.htm" },
      { label: "環評報告及圖紙目錄", url: "https://www.epd.gov.hk/eia/files/applications/en/pp_160/eia_1668/progress/action_2865/TOC.htm" }
    ]
  },
  {
    id: "fencegaps", era: "e1998", pos: [22.3093, 114.2094],
    name: "圍欄內外：舊跑道上的日常（2006–2007）",
    sub: "Life inside the fence",
    types: ["memory"],
    desc: "政府地圖記錄的是獲撥用或獲租用的土地，使用者的記憶則讓圍欄內的生活變得可見。網誌作者 Stephen C Chan 在 2007 年 4 月 2 日發表〈Old KaiTak Airport Today〉，記錄他在 2006 年底至 2007 年初進入舊機場的見聞：場內有高爾夫、停車、儲沙和混凝土等用途，也有人騎自行車、放模型飛機，有兒童在打板球，還有人在舊址拾取金屬；有人從圍欄缺口進入，缺口後來又被修補；地面仍保留機場的引導標線。同年 12 月，Mark Simons 在舊跑道 A8 出口拍照時寫道，跑道正由政府使用，另有發展項目在籌劃，其中之一是改建為郵輪碼頭。停車、巴士車廠、堆料和工程透過租約或政府撥地進入，騎車、模型飛機和板球則從圍欄缺口進入——兩種使用共同構成過渡期的日常，也讓「誰能夠進入」成為這段記憶的重要部分。（以上是個人親歷記錄，不表示舊機場各區都對外開放。）",
    quotes: [
      { text: "Some people ride bicycles there. Others fly model airplanes.（有人在那裏騎單車，也有人放模型飛機。）", who: "Stephen C Chan，〈Old KaiTak Airport Today〉", src: "網誌 Musings on Life in Hong Kong，2007-04-02" },
      { text: "The city line literally started at the beginning of the runway.（城市的邊線，真的就從跑道起點開始。）", who: "Mark Simons，舊跑道 A8 出口照片說明", src: "Flickr，2007 年 12 月" }
    ],
    sources: [
      { label: "Stephen C Chan：Old KaiTak Airport Today（2007-04-02，含現場照片）", url: "https://stephencfchan.blogspot.com/2007/04/" },
      { label: "2007 年 6 月 5 日舊址航拍（JetPhotos）", url: "https://www.jetphotos.com/photo/6000626" },
      { label: "Mark Simons：2007 年 12 月舊跑道 A8 出口照片（Flickr）", url: "https://www.flickr.com/photos/msimons/2085342251/" }
    ]
  },
  {
    id: "development", era: "e2007", pos: [22.3185, 114.2055],
    name: "《啟德分區計劃大綱圖》與土地除污（2007–2008）",
    sub: "Kai Tak OZP & decontamination",
    types: ["event", "memory", "photo"],
    desc: "2007 年，歷經多年規劃反覆（1990 年代《都會計劃》、2001 年海港規劃爭議），《啟德分區計劃大綱圖》終獲行政長官會同行政會議核准，啟德發展計劃正式啟動。2008 年，立法會工務小組通過撥款，南停機坪展開清拆及除污工程——這片服務了香港大半世紀的機場用地，開始漫長的「消毒」與重生。居民對規劃一直有意見：由「不建摩天輪」到跑道末端用途，社區聲音從未停過。",
    media: [
      { kind: "img", src: "assets/img/ktd_landuse_ozp.jpg", cap: "啟德發展計劃土地用途圖：今天的規劃藍圖，對應 2022 年 10 月核准的《啟德分區計劃大綱圖》（S/K22/8）", credit: "土木工程拓展署啟德辦事處", creditUrl: "https://www.ktd.gov.hk/eng/overview.html" },
      { kind: "img", src: "assets/img/kaiching_2013.jpg", cap: "啟晴邨（2013 年 9 月攝）：前北停機坪上的第一個新屋邨，同年 7 月開始入伙", credit: "Qwer132477（Wikimedia Commons，CC BY-SA 3.0）", creditUrl: "https://commons.wikimedia.org/wiki/File:Kai_Ching_Estate_2013_09_part6.JPG" }
    ],
    sources: [
      { label: "土木工程拓展署啟德辦事處：啟德發展概覽（分區計劃大綱圖沿革）", url: "https://www.ktd.gov.hk/eng/overview.html" },
      { label: "Task Force on Kai Tak Harbourfront Development：Kai Tak Development Progress Report as of September 2013（啟晴邨 2013 年 7 月開始入伙）", url: "https://www.hfc.org.hk/filemanager/files/TFKT_11_2013.pdf" },
      { label: "《啟德資料收集(2007至今)》（課程材料）", url: "" },
      { label: "立法會 CB(1) 文件：啟德南停機坪清拆及除污，2008", url: "https://www.legco.gov.hk/yr07-08/english/panels/plw/papers/dev-sk222-e.pdf" }
    ]
  },
  {
    id: "cruise", era: "e2007", pos: [22.3066, 114.2128],
    name: "啟德郵輪碼頭（2013）",
    sub: "Kai Tak Cruise Terminal",
    types: ["landmark", "photo"],
    desc: "2013 年 6 月，建於前跑道末端的啟德郵輪碼頭啟用，可停泊世界級郵輪。碼頭頂層的啟德跑道公園保留了不少機場記憶：航空主題展品、觀景平台，以及那道伸向維港的舊跑道中軸線。站在碼頭一帶，腳下正是當年跑道東南端（13 跑道的盡頭、31 跑道的起點）伸入海港之處。",
    media: [
      { kind: "img", src: "assets/img/cruise_mariner_2013.jpg", cap: "2013 年 11 月，「海洋水手號」停靠啟德郵輪碼頭（攝於碼頭頂層公園）。同年 6 月 12 日，它是第一艘停靠這個碼頭的郵輪。", credit: "Chalongapasstrea（Wikimedia Commons，CC BY-SA 3.0）", creditUrl: "https://commons.wikimedia.org/wiki/File:HK_%E5%95%9F%E5%BE%B7%E9%83%B5%E8%BC%AA%E7%A2%BC%E9%A0%AD_Kai_Tak_Cruise_Terminal_Park_roof_night_view_%E6%B5%B7%E6%B4%8B%E6%B0%B4%E6%89%8B%E8%99%9F_Mariner_of_the_Seas_Nov-2013.JPG" },
      { kind: "img", src: "assets/img/memory_exhibition_1.jpg", cap: "Mikiki 商場「啟德機場相片展」展品（2019）", credit: "Gwulo 用戶 gary.c 攝", creditUrl: "https://gwulo.com/node/51672" },
      { kind: "img", src: "assets/img/memory_exhibition_2.jpg", cap: "啟德機場相片展展品（2019）", credit: "Gwulo 用戶 gary.c 攝", creditUrl: "https://gwulo.com/node/51672" }
    ],
    sources: [
      { label: "政府新聞公報：立法會八題 啟德郵輪碼頭的業務推廣（2013-06-26，海洋水手號 6 月 12 日首次停靠）", url: "https://www.info.gov.hk/gia/general/201306/26/P201306260267_print.htm" },
      { label: "Gwulo：My only memory with Kai Tak（Mikiki 相片展）", url: "https://gwulo.com/node/51672" },
      { label: "《啟德資料收集(2007至今)》", url: "" }
    ]
  },
  {
    id: "sportspark", era: "e2007", pos: [22.3236, 114.1978],
    name: "啟德體育園與跑道末端（2020–2025）",
    sub: "Kai Tak Sports Park",
    types: ["landmark", "memory", "event"],
    desc: "2020 年，當局就跑道末端發展展開規劃研究，諮詢居民對土地用途的意見（見 2023–24 年報道）。2025 年 3 月，啟德體育園正式開幕；同月 30 日，國泰以 A350 客機在 1,000 呎低空重飛經典航線，由北角、灣仔飛越維港，到啟德體育園上空盤旋——紀念啟德機場百周年。天上的轟鳴，回來了。",
    sources: [
      { label: "大公文匯：啟德發展報道，2023-10-28", url: "https://www.tkww.hk/a/202310/28/AP653c52f7e4b05c8858008171.html" },
      { label: "星島：啟德規劃報道，2024-08-27", url: "https://m.stnn.cc/c/2024-08-27/3916435.shtml" },
      { label: "《啟德資料收集(2007至今)》", url: "" }
    ]
  }
];

const TIMELINE = [
  { y: "1924", d: "",      t: "啟德營業有限公司清盤，填海地由政府收回", poi: "kaitakbund" },
  { y: "1924", d: "05-31", t: "美國飛行家亞拔首次使用啟德濱空地試飛", poi: "firstflight" },
  { y: "1925", d: "01-25", t: "亞拔飛行學校於啟德濱開業" },
  { y: "1927", d: "03-19", t: "皇家空軍啟德基地正式成立", poi: "raf" },
  { y: "1936", d: "03-24", t: "帝國航空香港至檳城定期航班首航，香港進入民航紀元", poi: "imperial" },
  { y: "1941", d: "12-08", t: "日軍轟炸啟德，四日後佔領機場", poi: "war" },
  { y: "1942", d: "",      t: "日軍動用戰俘擴建啟德，修建兩條混凝土跑道", poi: "war" },
  { y: "1943", d: "01-09", t: "宋王台遷拆祭典舉行，配合機場擴建", poi: "sungwongtoi" },
  { y: "1945", d: "08-30", t: "英國艦隊抵港，日佔結束；9 月皇家空軍重返啟德" },
  { y: "1946", d: "05-01", t: "政府成立航空事務處（翌年改名民航處）" },
  { y: "1946", d: "09-24", t: "以啟德為基地的國泰航空成立", poi: "cathay" },
  { y: "1950", d: "10",    t: "舊 13/31 跑道延長至橫越清水灣道" },
  { y: "1958", d: "09-12", t: "新 13/31 跑道正式開幕，「彗星」噴射客機同日抵港", poi: "runway" },
  { y: "1959", d: "07-17", t: "跑道照明系統完成，夜間升降開始" },
  { y: "1962", d: "",      t: "新客運大樓落成" },
  { y: "1970", d: "04-11", t: "泛美波音 747 首次到港，邁進廣體客機年代", poi: "jumbo" },
  { y: "1976", d: "11-05", t: "法航和諧式超音速客機首次到港", poi: "concorde" },
  { y: "1978", d: "03-31", t: "皇家空軍完全撤離啟德" },
  { y: "1988", d: "08-31", t: "中國民航 301 號班機雨中降落衝出跑道墜海，7 人罹難", poi: "ca301" },
  { y: "1989", d: "10-11", t: "港府宣布於赤鱲角興建新機場", poi: "replacement" },
  { y: "1993", d: "11-04", t: "華航 747-400 暴風雨中降落衝出跑道滑入九龍灣", poi: "ci605" },
  { y: "1998", d: "07-05", t: "啟德最後一天運作；翌日凌晨 CX251 離港後跑道燈熄滅", poi: "closure" },
  { y: "1998", d: "10",    t: "北停機坪地盤整理及土地淨化工程展開", poi: "northapron" },
  { y: "2002", d: "04",    t: "北停機坪地盤整理及土地淨化工程完成", poi: "northapron" },
  { y: "2003", d: "12-31", t: "舊客運大樓及停車樓租戶遷出限期", poi: "terminaldemolition" },
  { y: "2004", d: "04",    t: "舊客運大樓、停車樓及相關構築物開始拆卸", poi: "terminaldemolition" },
  { y: "2005", d: "11",    t: "政府文件：舊址約六成土地已短期出租或臨時撥用", poi: "landuse2005" },
  { y: "2006", d: "09",    t: "客運大樓拆卸工程合約大致完成", poi: "terminaldemolition" },
  { y: "2007", d: "04-02", t: "Stephen C Chan 發表舊機場現場日記〈Old KaiTak Airport Today〉", poi: "fencegaps" },
  { y: "2007", d: "",      t: "環評報告記錄舊跑道及南停機坪的臨時用途，燃油設施仍待拆除", poi: "eia2007" },
  { y: "2007", d: "",      t: "年底《啟德分區計劃大綱圖》獲核准，啟德發展計劃啟動", poi: "development" },
  { y: "2008", d: "",      t: "南停機坪清拆及除污工程展開（立法會撥款）", poi: "development" },
  { y: "2010", d: "03-01", t: "土木工程拓展署成立啟德辦事處，統籌啟德發展", poi: "development" },
  { y: "2013", d: "06",    t: "啟德郵輪碼頭啟用", poi: "cruise" },
  { y: "2020", d: "",      t: "跑道末端發展規劃研究，諮詢居民意見", poi: "sportspark" },
  { y: "2023", d: "10-28", t: "大公文匯報道：居民對啟德發展的期盼與意見", poi: "sportspark" },
  { y: "2024", d: "08-27", t: "星島報道：啟德規劃爭議與社區聲音", poi: "sportspark" },
  { y: "2025", d: "03-30", t: "啟德機場百周年：國泰 A350 低空重飛經典航線", poi: "sportspark" }
];

const FEATURES = {
  runway: {
    name: "13/31 跑道（示意）", note: "3,390 m × 60 m，1958/1974/1979 三次擴建",
    line: [[22.3252, 114.1920], [22.3040, 114.2152]]
  },
  approach13: {
    name: "13 跑道 IGS 進場航線（示意）", note: "自西向東沿導航航道飛行，在格仔山前右轉約 47° 對準跑道",
    path: [
      [22.33216, 114.11175],
      [22.33382, 114.14567],
      [22.33523, 114.17474],
      [22.33523, 114.17614],
      [22.33510, 114.17754],
      [22.33483, 114.17892],
      [22.33443, 114.18026],
      [22.33391, 114.18154],
      [22.33326, 114.18277],
      [22.33250, 114.18391],
      [22.33163, 114.18496],
      [22.32520, 114.19200]
    ]
  },
  checkerboard: { name: "格仔山 Checkerboard Hill", pos: [22.3357, 114.1843] }
};
