"use strict";

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const escHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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
const AttrToggle = L.Control.extend({
  options: { position: "bottomleft" },
  onAdd() {
    const btn = L.DomUtil.create("button", "attr-toggle");
    btn.type = "button";
    btn.textContent = "ⓘ";
    btn.title = "地圖來源";
    btn.setAttribute("aria-label", "顯示地圖來源");
    btn.setAttribute("aria-expanded", "false");
    L.DomEvent.disableClickPropagation(btn);
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

const TRANSPARENT_PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==";
const HIST_IDS = Object.keys(HISTORICAL_MAPS).sort((a, b) => parseFloat(a) - parseFloat(b));
const histLayers = {};
HIST_IDS.forEach((id) => {
  const cfg = HISTORICAL_MAPS[id];
  histLayers[id] = L.tileLayer(`${TILE_DIR}${id}/{z}/{x}/{y}.png`, {
    bounds: L.latLngBounds(cfg.bounds),
    minNativeZoom: 12,
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
    const b = L.latLngBounds(HISTORICAL_MAPS[activeHistId].bounds);
    if (!b.contains(map.getCenter())) map.flyToBounds(b, { duration: 1.1 });
  });
}

const traceGroup = L.layerGroup().addTo(map);
function buildTraces() {
  traceGroup.clearLayers();
  const rw = FEATURES.runway, ap = FEATURES.approach13, cb = FEATURES.checkerboard;
  L.polyline(rw.line, { color: "#c8452c", weight: 5, opacity: 0.9 }).addTo(traceGroup)
    .bindTooltip(rw.name, { permanent: true, direction: "center", className: "runway-label" });
  L.rectangle([[22.3240, 114.1985], [22.3295, 114.2075]], {
    color: "#c8452c", weight: 2, dashArray: "6 4", fillOpacity: 0.06
  }).addTo(traceGroup).bindTooltip("客運大樓及停機坪範圍（示意）", { sticky: true });
  L.polyline(ap.path, { color: "#d9a441", weight: 3, dashArray: "2 10", opacity: 0.95, className: "approach-line" })
    .addTo(traceGroup).bindTooltip(`${ap.name}：${ap.note}`, { sticky: true });
  L.circleMarker(cb.pos, { radius: 7, color: "#c8452c", fillColor: "#c8452c", fillOpacity: 0.9, weight: 2 })
    .addTo(traceGroup).bindTooltip(cb.name, { permanent: true, direction: "top", className: "cb-label" });
}

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

const markers = {};
function buildMarkers() {
  POIS.forEach((poi) => {
    const m = L.marker(poi.pos, { icon: poiIcon(poi), riseOnHover: true });
    m.bindTooltip(poi.name, { direction: "top", offset: [0, -14], className: "poi-tip" });
    m.on("click", () => openPoi(poi.id, { fly: false }));
    markers[poi.id] = m;
    m.addTo(map);
  });
}

let activeEra = null;
const isNarrow = () => window.matchMedia("(max-width: 860px)").matches;
const eraRange = (e) => (e.end ? `${e.start}–${e.end}` : `${e.start} 至今`);

function buildEraControls() {
  $("#eraGrid").innerHTML = ERAS.map((e) =>
    `<button class="era-btn" data-era="${e.id}" aria-pressed="false"><b>${e.label}</b><small>${eraRange(e)}</small></button>`).join("");
  $("#eraTrack").insertAdjacentHTML("beforeend", ERAS.map((e) =>
    `<span class="seg" data-era="${e.id}" title="${escHtml(e.label + " " + eraRange(e))}">${e.start}${e.end ? "" : "→"}</span>`).join(""));
}

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

function eraForYear(y) {
  const era = ERAS.filter((e) => e.start <= y).pop();
  return era ? era.id : null;
}

const activeTypes = new Set();
const POI_TEXT = Object.fromEntries(POIS.map((p) => [p.id, [
  p.name, p.sub, p.desc,
  ...(p.quotes || []).map((q) => `${q.text} ${q.who}`),
  ...(p.media || []).map((m) => m.cap || "")
].join(" ").toLowerCase()]));

const currentKeyword = () => $("#search").value.trim().toLowerCase();

function poiMatches(poi, kw) {
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
      if (isNarrow()) setSidebarFolded(true);
      openPoi(b.dataset.poi);
    }));
}

function openPoi(id, { fly = true } = {}) {
  const poi = POIS.find((p) => p.id === id);
  if (!poi) return;
  if (activeEra !== poi.era) setEra(poi.era, false);
  if (fly) map.flyTo(poi.pos, Math.max(map.getZoom(), 15), { duration: 1.1 });
  openDrawer(id);
}

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
  Object.values(markers).forEach((m) => m.getElement()?.classList?.remove("pulse"));
  markers[poi.id]?.getElement()?.classList?.add("pulse");
}

function closeDrawer() {
  const el = $("#drawer");
  el.classList.remove("open");
  el.innerHTML = "";
  Object.values(markers).forEach((m) => m.getElement()?.classList?.remove("pulse"));
}

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
        setEra(poi.era, false);
        map.flyTo(poi.pos, Math.max(map.getZoom(), 15), { duration: 1.2 });
        setTimeout(() => openDrawer(poi.id), 900);
      } else {
        const eraId = eraForYear(parseInt(t.y, 10));
        if (eraId) setEra(eraId, false);
        closeDrawer();
        map.flyTo(AIRPORT_CENTER, 15, { duration: 1.2 });
      }
      strip.querySelectorAll(".tl-item").forEach((x) => x.classList.toggle("on", x === b));
    })
  );
}

function setSidebarFolded(folded) {
  $("#sidebar").classList.toggle("fold", folded);
  const btn = $("#sidebarToggle");
  btn.textContent = folded ? "»" : "«";
  btn.setAttribute("aria-label", folded ? "展開側欄" : "收起側欄");
  setTimeout(() => map.invalidateSize(), 300);
}

function bindUI() {
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
    map.invalidateSize();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
}

buildEraControls();
buildHistSelect();
buildTraces();
buildMarkers();
buildTimeline();
bindUI();
if (window.matchMedia("(max-width: 860px)").matches) setSidebarFolded(true);

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
