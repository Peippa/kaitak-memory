/* ============================================================
   啟德記憶 Kai Tak Memory — 主程式
   Leaflet 地圖 · 歷史圖層 · 年代時光機 · 記憶抽屜 · 居民投稿
   v4：歷史地圖選單、地圖出處欄、搜尋涵蓋所有年代等；v4.1：刪除「關於本站 · 貢獻記憶」；v4.2：重訂年代劃分，年代按鈕改由 data.js 生成。見 CHANGELOG.md
   ============================================================ */
"use strict";

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const escHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- 地圖初始化 ---------- */
const AIRPORT_CENTER = [22.3185, 114.2065];
const map = L.map("map", {
  center: AIRPORT_CENTER,
  zoom: 14,
  minZoom: 11,
  maxZoom: 18,
  zoomControl: false,
  attributionControl: false
});
L.control.zoom({ position: "bottomright" }).addTo(map);
/* 地圖來源：收在左下角的「ⓘ」按鈕裏，點開才顯示。
   Esri 底圖條款要求在地圖上署名，所以保留出處欄，只是預設收起。
   先加按鈕、再加出處欄：Leaflet 底部角落的控制項後加的排在上方，所以出處會在按鈕上方彈出。 */
const AttrToggle = L.Control.extend({
  options: { position: "bottomleft" },
  onAdd() {
    const btn = L.DomUtil.create("button", "attr-toggle");
    btn.type = "button";
    btn.textContent = "ⓘ";
    btn.title = "地圖來源";
    btn.setAttribute("aria-label", "顯示地圖來源");
    btn.setAttribute("aria-expanded", "false");
    L.DomEvent.disableClickPropagation(btn);   // 點按鈕不會穿透到地圖
    L.DomEvent.on(btn, "click", () => {
      const open = map.getContainer().classList.toggle("attr-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "收起地圖來源" : "顯示地圖來源");
    });
    return btn;
  }
});
new AttrToggle().addTo(map);
L.control.attribution({
  position: "bottomleft",
  prefix: '<a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a>'
}).addTo(map);

/* 現代底圖 */
const BASES = {
  imagery: L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "底圖 © Esri, Maxar, Earthstar Geographics", maxZoom: 19 }
  ),
  street: L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    { attribution: "底圖 © Esri, OpenStreetMap contributors", maxZoom: 19 }
  ),
  blank: L.gridLayer()
};
BASES.imagery.addTo(map);
let currentBase = "imagery";

/* ---------- 歷史地圖圖層（本地瓦片） ---------- */
/* 缺失瓦片的替代圖：真正透明的 1×1 PNG（舊版用的是半透明藍色像素，缺圖處會出現藍色方塊） */
const TRANSPARENT_PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==";
/* "1963.3" 之類的鍵不是整數，Object.keys 不會按年份排列，所以手動排序 */
const HIST_IDS = Object.keys(HISTORICAL_MAPS).sort((a, b) => parseFloat(a) - parseFloat(b));
const histLayers = {};
HIST_IDS.forEach((id) => {
  const cfg = HISTORICAL_MAPS[id];
  histLayers[id] = L.tileLayer(`${TILE_DIR}${id}/{z}/{x}/{y}.png`, {
    bounds: L.latLngBounds(cfg.bounds),   // 只請求確實存在的瓦片
    minNativeZoom: 12,                    // 縮小到 11 級時沿用 12 級瓦片，不會整層消失
    maxNativeZoom: Math.min(cfg.maxZoom, 17),
    maxZoom: 18,
    opacity: 0.85,
    zIndex: 5,
    errorTileUrl: TRANSPARENT_PX,
    attribution: "歷史地圖：" + escHtml(cfg.src)
  });
});
let activeHistId = null;

function setHistoricalLayer(id) {
  if (activeHistId) map.removeLayer(histLayers[activeHistId]);
  activeHistId = id && histLayers[id] ? id : null;
  $("#histSelect").value = activeHistId || "";
  if (activeHistId) {
    histLayers[activeHistId].addTo(map);
    histLayers[activeHistId].setOpacity(parseFloat($("#opacity").value));
    $("#histLabel").textContent = HISTORICAL_MAPS[activeHistId].note || "";
  } else {
    $("#histLabel").textContent = "無歷史圖層 · 只看今天";
  }
}

function buildHistSelect() {
  const sel = $("#histSelect");
  sel.innerHTML = HIST_IDS.map((id) =>
    `<option value="${escHtml(id)}">${escHtml(HISTORICAL_MAPS[id].name)}</option>`).join("") +
    `<option value="">不顯示歷史地圖</option>`;
  sel.addEventListener("change", () => {
    setHistoricalLayer(sel.value);
    if (!activeHistId) return;
    // 圖幅不覆蓋目前視野中心時（例如 1963 航空照片），飛到它的範圍
    const b = L.latLngBounds(HISTORICAL_MAPS[activeHistId].bounds);
    if (!b.contains(map.getCenter())) map.flyToBounds(b, { duration: 1.1 });
  });
}

/* ---------- 機場痕跡（示意） ---------- */
const traceGroup = L.layerGroup().addTo(map);
function buildTraces() {
  traceGroup.clearLayers();
  const rw = FEATURES.runway, ap = FEATURES.approach13, cb = FEATURES.checkerboard;
  // 跑道
  L.polyline(rw.line, { color: "#c8452c", weight: 5, opacity: 0.9 }).addTo(traceGroup)
    .bindTooltip(rw.name, { permanent: true, direction: "center", className: "runway-label" });
  // 停機坪範圍
  L.rectangle([[22.3240, 114.1985], [22.3295, 114.2075]], {
    color: "#c8452c", weight: 2, dashArray: "6 4", fillOpacity: 0.06
  }).addTo(traceGroup).bindTooltip("客運大樓及停機坪範圍（示意）", { sticky: true });
  // 13 跑道進場航線：自西向東，格仔山前右轉
  L.polyline(ap.path, { color: "#d9a441", weight: 3, dashArray: "2 10", opacity: 0.95, className: "approach-line" })
    .addTo(traceGroup).bindTooltip(`${ap.name}：${ap.note}`, { sticky: true });
  L.circleMarker(cb.pos, { radius: 7, color: "#c8452c", fillColor: "#c8452c", fillOpacity: 0.9, weight: 2 })
    .addTo(traceGroup).bindTooltip(cb.name, { permanent: true, direction: "top", className: "cb-label" });
}

/* ---------- 標記 ---------- */
const TYPE_META = {
  event:    { label: "事件",   glyph: "◆", color: "#1b2a3a" },
  landmark: { label: "地標",   glyph: "▲", color: "#0e5f6b" },
  photo:    { label: "照片",   glyph: "◉", color: "#8a5a2b" },
  video:    { label: "影像",   glyph: "▶", color: "#c8452c" },
  audio:    { label: "聲音",   glyph: "♪", color: "#6b4fa0" },
  memory:   { label: "記憶",   glyph: "❝", color: "#b03060" }
};

function poiIcon(poi) {
  const meta = TYPE_META[poi.types[0]];
  const multi = poi.types.length > 1 ? `<span class="ic-plus">+${poi.types.length - 1}</span>` : "";
  return L.divIcon({
    className: "poi-wrap",
    html: `<div class="poi-marker" style="--mc:${meta.color}"><span>${meta.glyph}</span>${multi}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

const markers = {}; // id -> marker
function buildMarkers() {
  POIS.forEach((poi) => {
    const m = L.marker(poi.pos, { icon: poiIcon(poi), riseOnHover: true });
    m.bindTooltip(poi.name, { direction: "top", offset: [0, -14], className: "poi-tip" });
    m.on("click", () => openPoi(poi.id, { fly: false }));
    markers[poi.id] = m;
    m.addTo(map);
  });
}

/* ---------- 年代時光機 ---------- */
let activeEra = null;
const isNarrow = () => window.matchMedia("(max-width: 860px)").matches;
const eraRange = (e) => (e.end ? `${e.start}–${e.end}` : `${e.start} 至今`);

/* 年代按鈕與時間軸刻度都由 ERAS 生成，改 data.js 一處即可 */
function buildEraControls() {
  $("#eraGrid").innerHTML = ERAS.map((e) =>
    `<button class="era-btn" data-era="${e.id}" aria-pressed="false"><b>${e.label}</b><small>${eraRange(e)}</small></button>`).join("");
  $("#eraTrack").insertAdjacentHTML("beforeend", ERAS.map((e) =>
    `<span class="seg" data-era="${e.id}" title="${escHtml(e.label + " " + eraRange(e))}">${e.start}${e.end ? "" : "→"}</span>`).join(""));
}

/* 切換年代時，把該年代所有地點收進畫面（不同螢幕尺寸都適用）；沒有地點時用後備視角 */
function flyToEra(era) {
  const pts = POIS.filter((p) => p.era === era.id).map((p) => p.pos);
  if (pts.length > 1) map.flyToBounds(L.latLngBounds(pts).pad(0.2), { maxZoom: 15, duration: 1.4 });
  else if (pts.length === 1) map.flyTo(pts[0], 15, { duration: 1.4 });
  else map.flyTo(era.c, era.z, { duration: 1.4 });
}

function setEra(eraId, fly = true) {
  const era = ERAS.find((e) => e.id === eraId);
  if (!era) return;
  activeEra = eraId;
  setHistoricalLayer(era.map);
  if (fly) flyToEra(era);
  $$(".era-btn").forEach((b) => {
    const on = b.dataset.era === eraId;
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  $$("#eraTrack .seg").forEach((s) => s.classList.toggle("on", s.dataset.era === eraId));
  $("#eraNote").textContent = era.note || "";
  applyFilters();
  const idx = ERAS.findIndex((e) => e.id === eraId);
  $("#tlCursor").style.left = ((idx + 0.5) / ERAS.length) * 100 + "%";
}

/* 年份 → 所屬年代（年表中沒有對應地點的事件用）。分界年份歸入後一個年代，因為分界事件是新年代的開端 */
function eraForYear(y) {
  const era = ERAS.filter((e) => e.start <= y).pop();
  return era ? era.id : null;
}

/* ---------- 篩選（年代 × 類型 × 關鍵字） ---------- */
const activeTypes = new Set();
const POI_TEXT = Object.fromEntries(POIS.map((p) => [p.id, [
  p.name, p.sub, p.desc,
  ...(p.quotes || []).map((q) => `${q.text} ${q.who}`),
  ...(p.media || []).map((m) => m.cap || "")
].join(" ").toLowerCase()]));

const currentKeyword = () => $("#search").value.trim().toLowerCase();

function poiMatches(poi, kw) {
  // 有關鍵字時搜尋所有年代；沒有關鍵字時只列出目前年代
  const inEra = kw ? true : (!activeEra || poi.era === activeEra);
  const inType = activeTypes.size === 0 || poi.types.some((t) => activeTypes.has(t));
  const inKw = !kw || POI_TEXT[poi.id].includes(kw);
  return inEra && inType && inKw;
}

function applyFilters() {
  const kw = currentKeyword();
  POIS.forEach((poi) => {
    const m = markers[poi.id];
    const show = poiMatches(poi, kw);
    if (show && !map.hasLayer(m)) m.addTo(map);
    if (!show && map.hasLayer(m)) map.removeLayer(m);
  });
  renderPoiList();
}

function renderPoiList() {
  const kw = currentKeyword();
  const list = POIS.filter((poi) => poiMatches(poi, kw));
  const box = $("#poiList");
  const hint = kw && list.length ? `<p class="empty">搜尋範圍：所有年代（共 ${list.length} 項）</p>` : "";
  box.innerHTML = hint + (list.length
    ? list.map((p) => {
        const meta = TYPE_META[p.types[0]];
        const era = ERAS.find((e) => e.id === p.era);
        return `<button class="poi-item" data-poi="${p.id}">
          <span class="dot" style="background:${meta.color}">${meta.glyph}</span>
          <span class="nm">${p.name}<small>${era ? eraRange(era) : ""} · ${p.types.map((t) => TYPE_META[t].label).join("/")}</small></span>
        </button>`;
      }).join("")
    : `<p class="empty">${kw ? "找不到相關地點，可以換個關鍵字試試。" : "此篩選下暫無地點。試試切換年代或類型。"}</p>`);
  box.querySelectorAll(".poi-item").forEach((b) =>
    b.addEventListener("click", () => {
      if (isNarrow()) setSidebarFolded(true);   // 手機上收起側欄，讓出地圖
      openPoi(b.dataset.poi);
    }));
}

/* 打開地點：如屬其他年代（搜尋結果），先切換年代，讓歷史地圖與地點對應 */
function openPoi(id, { fly = true } = {}) {
  const poi = POIS.find((p) => p.id === id);
  if (!poi) return;
  if (activeEra !== poi.era) setEra(poi.era, false);
  if (fly) map.flyTo(poi.pos, Math.max(map.getZoom(), 15), { duration: 1.1 });
  openDrawer(id);
}

/* ---------- 詳情抽屜 ---------- */
function creditHtml(med, fallbackUrl) {
  const url = med.creditUrl || fallbackUrl;
  const text = med.credit || (url ? "來源" : "");
  if (!text) return "";
  const inner = url ? `<a href="${escHtml(url)}" target="_blank" rel="noopener noreferrer">${text}</a>` : text;
  return ` <span class="credit">${inner}</span>`;
}

function mediaHtml(med) {
  const cap = med.cap || "";
  if (med.kind === "img")
    return `<figure><a href="${escHtml(med.src)}" target="_blank" rel="noopener"><img loading="lazy" decoding="async" src="${escHtml(med.src)}" alt="${escHtml(cap)}"></a>
      <figcaption>${cap}${creditHtml(med)}</figcaption></figure>`;
  if (med.kind === "yt") {
    const vid = encodeURIComponent(med.id);
    return `<figure class="yt"><div class="yt-frame"><iframe src="https://www.youtube-nocookie.com/embed/${vid}" title="${escHtml(cap || "video")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>
      <figcaption>${cap}${creditHtml(med, `https://www.youtube.com/watch?v=${vid}`)}</figcaption></figure>`;
  }
  if (med.kind === "video")
    return `<figure><video class="vfile" controls preload="metadata" playsinline src="${escHtml(med.src)}"></video>
      <figcaption>${cap}${creditHtml(med)}</figcaption></figure>`;
  return "";
}

function openDrawer(poiId) {
  const poi = POIS.find((p) => p.id === poiId);
  if (!poi) return;
  const era = ERAS.find((e) => e.id === poi.era);
  const el = $("#drawer");
  el.innerHTML = `
    <button class="drawer-close" id="drawerClose" aria-label="關閉">✕</button>
    <div class="drawer-inner">
      <p class="d-era">${era ? eraRange(era) + " · " + era.label : ""}</p>
      <h2>${poi.name}</h2>
      <p class="d-sub">${poi.sub || ""}</p>
      <p class="d-types">${poi.types.map((t) => `<span class="tag" style="--tc:${TYPE_META[t].color}">${TYPE_META[t].label}</span>`).join("")}</p>
      <p class="d-desc">${poi.desc}</p>
      ${(poi.quotes || []).map((q) => `
        <blockquote>
          <p>${q.text}</p>
          <footer>—— ${q.who}<br><small>${q.src}</small></footer>
        </blockquote>`).join("")}
      ${(poi.media || []).map(mediaHtml).join("")}
      ${(poi.sources || []).length ? `
        <div class="d-sources"><h4>資料來源</h4><ul>
          ${poi.sources.map((s) => `<li>${s.url ? `<a href="${escHtml(s.url)}" target="_blank" rel="noopener noreferrer">${s.label}</a>` : s.label}</li>`).join("")}
        </ul></div>` : ""}
      <p class="d-note">位置為約略標示，僅供教學演示。</p>
    </div>`;
  el.classList.add("open");
  $("#drawerClose").addEventListener("click", closeDrawer);
  // 高亮對應標記
  Object.values(markers).forEach((m) => m.getElement()?.classList?.remove("pulse"));
  markers[poi.id]?.getElement()?.classList?.add("pulse");
}

function closeDrawer() {
  const el = $("#drawer");
  el.classList.remove("open");
  el.innerHTML = ""; // 清空內容，確保影片隨關閉停止播放
  Object.values(markers).forEach((m) => m.getElement()?.classList?.remove("pulse"));
}

/* ---------- 時間軸 ---------- */
function buildTimeline() {
  const strip = $("#timeline");
  strip.innerHTML = TIMELINE.map((t, i) => `
    <button class="tl-item" data-i="${i}">
      <span class="tl-year">${t.y}${t.d ? "<small>" + t.d + "</small>" : ""}</span>
      <span class="tl-text">${t.t}</span>
    </button>`).join("");
  strip.querySelectorAll(".tl-item").forEach((b) =>
    b.addEventListener("click", () => {
      const t = TIMELINE[parseInt(b.dataset.i, 10)];
      const poi = t.poi ? POIS.find((p) => p.id === t.poi) : null;
      if (poi) {
        // 切到該事件年代，再飛去
        setEra(poi.era, false);
        map.flyTo(poi.pos, Math.max(map.getZoom(), 15), { duration: 1.2 });
        setTimeout(() => openDrawer(poi.id), 900);
      } else {
        // 無地點事件：切到該年份所屬年代，再對焦機場中央
        const eraId = eraForYear(parseInt(t.y, 10));
        if (eraId) setEra(eraId, false);
        closeDrawer();
        map.flyTo(AIRPORT_CENTER, 15, { duration: 1.2 });
      }
      strip.querySelectorAll(".tl-item").forEach((x) => x.classList.toggle("on", x === b));
    })
  );
}

/* ---------- UI 事件 ---------- */
function setSidebarFolded(folded) {
  $("#sidebar").classList.toggle("fold", folded);
  const btn = $("#sidebarToggle");
  btn.textContent = folded ? "»" : "«";
  btn.setAttribute("aria-label", folded ? "展開側欄" : "收起側欄");
  // 側欄收起/展開後地圖容器尺寸改變，通知 Leaflet 重算
  setTimeout(() => map.invalidateSize(), 300);
}

function bindUI() {
  // 切換年代時關閉上一個年代的詳情；手機上收起側欄（底部時間軸仍可切換年代）
  const pickEra = (id) => { closeDrawer(); setEra(id); };
  $$(".era-btn").forEach((b) => b.addEventListener("click", () => {
    if (isNarrow()) setSidebarFolded(true);
    pickEra(b.dataset.era);
  }));
  $$("#eraTrack .seg").forEach((s) => s.addEventListener("click", () => pickEra(s.dataset.era)));
  $$(".type-chip").forEach((c) => {
    c.setAttribute("aria-pressed", "false");
    c.addEventListener("click", () => {
      const t = c.dataset.type;
      if (activeTypes.has(t)) activeTypes.delete(t); else activeTypes.add(t);
      const on = activeTypes.has(t);
      c.classList.toggle("on", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
      applyFilters();
    });
  });
  // 搜尋防抖：輸入停止 150ms 後才篩選，避免逐字重建列表
  let searchTimer = null;
  $("#search").addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 150);
  });
  $("#opacity").addEventListener("input", () => {
    if (activeHistId) histLayers[activeHistId].setOpacity(parseFloat($("#opacity").value));
    $("#opacityVal").textContent = Math.round(parseFloat($("#opacity").value) * 100) + "%";
  });
  $$("input[name=base]").forEach((r) =>
    r.addEventListener("change", () => {
      map.removeLayer(BASES[currentBase]);
      currentBase = r.value;
      BASES[currentBase].addTo(map);
    })
  );
  $("#toggleTraces").addEventListener("change", (e) => {
    if (e.target.checked) { traceGroup.addTo(map); } else { map.removeLayer(traceGroup); }
  });
  $("#sidebarToggle").addEventListener("click", () => setSidebarFolded(!$("#sidebar").classList.contains("fold")));
  $("#tlToggle").addEventListener("click", () => {
    $("#timelineWrap").classList.toggle("fold");
    $("#tlToggle").textContent = $("#timelineWrap").classList.contains("fold") ? "▲ 年表" : "▼ 收起";
    // 年表收起後地圖高度改變
    map.invalidateSize();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
}

/* ---------- 啟動 ---------- */
buildEraControls();
buildHistSelect();
buildTraces();
buildMarkers();
buildTimeline();
bindUI();
// 窄螢幕預設收起側欄，免得一打開就蓋住地圖
if (window.matchMedia("(max-width: 860px)").matches) setSidebarFolded(true);

/* 深層連結：?era=e1924&poi=checkerboard 直接開啟指定年代/地點 */
const params = new URLSearchParams(location.search);
const pEra = params.get("era");
const pPoi = params.get("poi");
const deepPoi = pPoi ? POIS.find((p) => p.id === pPoi) : null;
const startEra = deepPoi ? deepPoi.era : ((pEra && ERAS.some((e) => e.id === pEra)) ? pEra : "e1958");
setEra(startEra, false);
if (deepPoi) {
  map.setView(deepPoi.pos, 15);
  openDrawer(deepPoi.id);
}
