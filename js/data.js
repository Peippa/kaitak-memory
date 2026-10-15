/* ============================================================
   啟德記憶 Kai Tak Memory — 數據檔
   資料來源：HIST5011B 課程材料《啟德機場大事年表》、《啟德資料收集(2007至今)》、
   民航處、Gwulo、Hong Kong Maper、Our China Story、界面新聞、BBC、
   立法會文件、星島/大公文匯報道。詳見 README.md 與「關於本站」。
   v4：修正地圖覆蓋、座標與內容錯誤，見 CHANGELOG.md。
   註解中標有「待核」的地方，是尚未找到可靠出處、暫未改動的內容。
   ============================================================ */

const TILE_DIR = "assets/tiles/";

/* 歷史地圖圖層（瓦片已下載至本地，原始來源 hkmaps.hk，教育用途引用）
   bounds：本地瓦片的實際覆蓋範圍 [[南, 西], [北, 東]]（按 z16 瓦片計算，1982.3 按 z15）
   maxZoom：本地瓦片的最高縮放級，再放大時以此級別放大顯示
   note：顯示在側欄的覆蓋說明 */
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

/* 年代帶：切換年代 = 切換歷史地圖 + 聚焦視角 + 篩選標記 */
/* 年代劃分（v4.2）
   以有據可查的事件分界；相鄰年代共用分界年份（分界事件都在年中發生，不把整年硬分給一邊）：
   1924 啟德營業公司清盤、土地由政府收回｜1941.12.08 日軍進攻香港｜1945.08.30 英國艦隊抵港
   1958.09.12 新跑道啟用｜1970.04.11 波音 747 首次到港｜1989.10.11 宣布興建赤鱲角新機場｜1998.07.06 啟德關閉
   start / end：起訖年份（end 為 null 表示「至今」）；map：預設歷史地圖；c / z：該年代沒有地點時的後備視角；
   note：側欄顯示的年代說明。年代按鈕和時間軸刻度都由這裏自動生成，改這裏一處即可。
   1956 圖瓦片不完整、1963 航空照片不覆蓋跑道，沒有作為預設圖，仍可在「歷史地圖」選單自選。 */
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
  { id: "e1998", start: 1998, end: null, label: "後機場時代", map: null, c: [22.3200, 114.2070], z: 15,
    note: "機場關閉後，原址經歷多年規劃爭議；2007 年底《啟德分區計劃大綱圖》獲核准，2010 年成立啟德辦事處統籌發展，2013 年郵輪碼頭、2025 年體育園相繼啟用。" }
];

/* 地點（標記）。type: event 事件 | landmark 地標 | photo 照片 | video 影像 | audio 聲音 | memory 記憶 */
const POIS = [
  {
    id: "kaitakbund", era: "e1924", pos: [22.3250, 114.2075],
    name: "啟德濱：填海起家的機場",
    sub: "Kai Tak Bund · 1912–1924",
    types: ["landmark"],
    /* 1912 年合組、約 1916 年全面動工、1924 年清盤及土地收回：見 Gwulo 引《The life and times of Sir Kai Ho Kai》。
       待核：啟晴邨、德朗邨是否為啟德濱填海地核心（兩邨位於前北停機坪） */
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
    /* 待核：「一級歷史建築」評級；標記座標尚未按觀塘道 51 號精確定位 */
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
    /* 待核：「將巨石鑿起遷往他處」「戰後移回現址」「兩次遷移」——宋王臺花園並非原址，戰後是把殘石移到花園，
       不是「移回」；建議對照 Hon & Chan (2023) 及古物古蹟辦事處資料改寫 */
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
    /* 待核：「彗星」5 型——5 型從未投入服務，1958 年英國海外航空使用的應是 4 型，請對照課程年表原文 */
    desc: "1950 年 10 月舊 13/31 跑道延長至橫越清水灣道；1954 年港府展開大規模填海擴建，1958 年 9 月 12 日新 13/31 跑道正式開幕，同日英國海外航空「彗星」5 型噴射客機抵港。1974 年跑道延長部分與儀器導進系統啟用，1979–80 年再延長至 3,390 米。這條伸入九龍灣的跑道，日後成為全球最著名的「城市機場跑道」。在側欄「歷史地圖」選擇 1963 年九龍半島地圖，可見新跑道西北段與客運大樓一帶。",
    media: [
      { kind: "img", src: "assets/img/kaitak_1951.jpg", cap: "1951 年的啟德機場（新跑道建成前），遠處為獅子山", credit: "Eternal1966（Flickr，經 Gwulo.com）", creditUrl: "https://gwulo.com/media/23334" },
      { kind: "img", src: "assets/img/opening_1958.jpg", cap: "1958 年 9 月 12 日新跑道開幕", credit: "moddsey（Gwulo.com）", creditUrl: "https://gwulo.com/media/33972" },
      /* 待核：此圖不在原標註的 Gwulo node/62621 頁面上，攝影者與出處待補 */
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
    /* 待核：「後來被塗灰」與 checkerboard_ocs.jpg 所見的鮮明格仔不符；「家妍山」稱呼（劇中主角名為文家宜），
       宜對照星島 2024-05-26 報道 */
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
    /* 待核：「多次出現在維港上空」「被譽為『啟德最美的景觀之一』」暫無出處；和諧式從未開辦來港定期航班。
       1976 年法航 F-BTSC 首次訪港，Gwulo 有照片佐證 */
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
    /* 待核：KA841 出發地（原文作重慶，另有說法為成都）；金·沙曼那段引文是否為機長本人原話、
       他是否為最後一班 CX251 的機長，宜對照 BBC 中文原文 */
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
      { label: "Gwulo：Closure of Kai Tak Airport", url: "https://gwulo.com/node/6366" }
    ]
  },
  {
    id: "development", era: "e1998", pos: [22.3185, 114.2055],
    name: "《啟德分區計劃大綱圖》與土地除污（2007–2008）",
    sub: "Kai Tak OZP & decontamination",
    types: ["event", "memory"],
    desc: "2007 年，歷經多年規劃反覆（1990 年代《都會計劃》、2001 年海港規劃爭議），《啟德分區計劃大綱圖》終獲行政長官會同行政會議核准，啟德發展計劃正式啟動。2008 年，立法會工務小組通過撥款，南停機坪展開清拆及除污工程——這片服務了香港大半世紀的機場用地，開始漫長的「消毒」與重生。居民對規劃一直有意見：由「不建摩天輪」到跑道末端用途，社區聲音從未停過。",
    sources: [
      { label: "《啟德資料收集(2007至今)》（課程材料）", url: "" },
      { label: "立法會 CB(1) 文件：啟德南停機坪清拆及除污，2008", url: "https://www.legco.gov.hk/yr07-08/english/panels/plw/papers/dev-sk222-e.pdf" }
    ]
  },
  {
    id: "cruise", era: "e1998", pos: [22.3066, 114.2128],
    name: "啟德郵輪碼頭（2013）",
    sub: "Kai Tak Cruise Terminal",
    types: ["landmark", "photo"],
    /* 待核：「碼頭頂層的啟德跑道公園」——跑道公園可能是碼頭旁另一個公園，碼頭頂層的花園另有名稱 */
    desc: "2013 年 6 月，建於前跑道末端的啟德郵輪碼頭啟用，可停泊世界級郵輪。碼頭頂層的啟德跑道公園保留了不少機場記憶：航空主題展品、觀景平台，以及那道伸向維港的舊跑道中軸線。站在碼頭一帶，腳下正是當年跑道東南端（13 跑道的盡頭、31 跑道的起點）伸入海港之處。",
    media: [
      { kind: "img", src: "assets/img/memory_exhibition_1.jpg", cap: "Mikiki 商場「啟德機場相片展」展品（2019）", credit: "Gwulo 用戶 gary.c 攝", creditUrl: "https://gwulo.com/node/51672" },
      { kind: "img", src: "assets/img/memory_exhibition_2.jpg", cap: "啟德機場相片展展品（2019）", credit: "Gwulo 用戶 gary.c 攝", creditUrl: "https://gwulo.com/node/51672" }
    ],
    sources: [
      { label: "Gwulo：My only memory with Kai Tak（Mikiki 相片展）", url: "https://gwulo.com/node/51672" },
      { label: "《啟德資料收集(2007至今)》", url: "" }
    ]
  },
  {
    id: "sportspark", era: "e1998", pos: [22.3236, 114.1978],
    name: "啟德體育園與跑道末端（2020–2025）",
    sub: "Kai Tak Sports Park",
    types: ["landmark", "memory", "event"],
    /* 待核：2025 年 3 月 30 日國泰 A350 低空飛行的日期、高度、航線，以及「啟德機場百周年」的說法 */
    desc: "2020 年，當局就跑道末端發展展開規劃研究，諮詢居民對土地用途的意見（見 2023–24 年報道）。2025 年 3 月，啟德體育園正式開幕；同月 30 日，國泰以 A350 客機在 1,000 呎低空重飛經典航線，由北角、灣仔飛越維港，到啟德體育園上空盤旋——紀念啟德機場百周年。天上的轟鳴，回來了。",
    sources: [
      { label: "大公文匯：啟德發展報道，2023-10-28", url: "https://www.tkww.hk/a/202310/28/AP653c52f7e4b05c8858008171.html" },
      { label: "星島：啟德規劃報道，2024-08-27", url: "https://m.stnn.cc/c/2024-08-27/3916435.shtml" },
      { label: "《啟德資料收集(2007至今)》", url: "" }
    ]
  }
];

/* 大事年表（選錄，依《啟德機場大事年表》及課程材料） */
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
  { y: "2007", d: "",      t: "年底《啟德分區計劃大綱圖》獲核准，啟德發展計劃啟動", poi: "development" },
  { y: "2008", d: "",      t: "南停機坪清拆及除污工程展開（立法會撥款）", poi: "development" },
  { y: "2010", d: "03-01", t: "土木工程拓展署成立啟德辦事處，統籌啟德發展", poi: "development" },
  { y: "2013", d: "06",    t: "啟德郵輪碼頭啟用", poi: "cruise" },
  { y: "2020", d: "",      t: "跑道末端發展規劃研究，諮詢居民意見", poi: "sportspark" },
  { y: "2023", d: "10-28", t: "大公文匯報道：居民對啟德發展的期盼與意見", poi: "sportspark" },
  { y: "2024", d: "08-27", t: "星島報道：啟德規劃爭議與社區聲音", poi: "sportspark" },
  { y: "2025", d: "03-30", t: "啟德機場百周年：國泰 A350 低空重飛經典航線", poi: "sportspark" }
];

/* 機場痕跡示意圖層（geometry 為約略位置，供教學演示）
   跑道兩端按 1996 年測量圖量度；格仔山位置取自 OpenStreetMap。
   進場航線：沿 IGS 導航航道（約 088°）自西向東飛向格仔山，於格仔山前右轉約 47° 對準 13 跑道，
   轉彎半徑以 1.4 公里示意。 */
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
