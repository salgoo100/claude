const REFRESH_MS = 30_000;
const $ = (sel) => document.querySelector(sel);
const form = $('#search');
const regionEl = $('#region');
const stopEl = $('#stop');
const busEl = $('#bus');
const resultEl = $('#result');

let current = null; // { region, stop, bus }
let lastData = null;
let lastFetchMs = 0;
let refreshTimer = null;

const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 저장 불가 환경은 무시 */ }
  },
};

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatEta(sec) {
  if (sec <= 60) return '곧 도착';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}분 ${String(s).padStart(2, '0')}초`;
}

async function loadRegions() {
  const res = await fetch('/api/regions');
  const { regions } = await res.json();
  regionEl.innerHTML = regions.map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');
  const saved = store.get('lastQuery', null);
  if (saved && regions.some((r) => r.id === saved.region)) {
    regionEl.value = saved.region;
    stopEl.value = saved.stop;
    busEl.value = saved.bus;
  }
  if (regions.length === 0) resultEl.innerHTML = '<div class="card error">서버에 인증키가 설정되지 않았습니다.</div>';
}

async function fetchArrivals() {
  if (!current) return;
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    const qs = new URLSearchParams(current);
    const res = await fetch(`/api/arrivals?${qs}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `오류 (HTTP ${res.status})`);
    lastData = data;
    lastFetchMs = Date.now();
    render();
  } catch (err) {
    lastData = null;
    resultEl.innerHTML = `<div class="card error">${escapeHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
}

function render() {
  const data = lastData;
  if (!data) return;
  const elapsed = Math.floor((Date.now() - lastFetchMs) / 1000);
  const updated = new Date(lastFetchMs).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  let body;
  if (data.arrivals.length === 0) {
    if (data.routeFound === false) {
      body = `<div class="empty">이 정류장에 <b>${escapeHtml(current.bus)}</b>번 도착 정보가 없습니다.`
        + (data.availableRoutes?.length
          ? `<div class="chips">${data.availableRoutes.map((r) => `<button type="button" data-route="${escapeHtml(r)}">${escapeHtml(r)}</button>`).join('')}</div>`
          : '')
        + '</div>';
    } else {
      body = '<div class="empty">현재 도착 예정인 버스가 없습니다.</div>';
    }
  } else {
    body = data.arrivals.map((a) => {
      const buses = a.buses.length
        ? a.buses.map((b) => {
          const eta = b.etaSeconds == null ? null : Math.max(0, b.etaSeconds - elapsed);
          const text = eta == null ? escapeHtml(b.message || '정보 없음') : formatEta(eta);
          const detail = [
            b.stopsAway != null ? `${b.stopsAway}정거장 전` : '',
            b.seats != null ? `빈자리 ${b.seats}` : '',
            b.plate ?? '',
          ].filter(Boolean).join(' · ');
          return `<div class="bus"><span class="eta${eta != null && eta <= 180 ? ' soon' : ''}">${text}</span><span class="detail">${escapeHtml(detail)}</span></div>`;
        }).join('')
        : '<div class="bus"><span class="eta">도착 정보 없음</span></div>';
      return `<div class="route"><div class="route-head"><span class="route-no">${escapeHtml(a.route)}</span><span class="dir">${escapeHtml(a.direction)}</span></div>${buses}</div>`;
    }).join('');
  }

  resultEl.innerHTML = `<div class="card">
    <div class="station"><strong>${escapeHtml(data.station.name)} <small class="meta">${escapeHtml(data.station.number)}</small></strong>
    <span class="meta">${updated} 갱신 · 30초마다 자동</span></div>${body}</div>`;
}

resultEl.addEventListener('click', (e) => {
  const route = e.target.closest('button[data-route]')?.dataset.route;
  if (!route) return;
  busEl.value = route;
  form.requestSubmit();
});

function startQuery(q) {
  current = q;
  store.set('lastQuery', q);
  resultEl.innerHTML = '<div class="card empty">불러오는 중…</div>';
  clearInterval(refreshTimer);
  fetchArrivals();
  refreshTimer = setInterval(() => { if (!document.hidden) fetchArrivals(); }, REFRESH_MS);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  startQuery({ region: regionEl.value, stop: stopEl.value.trim(), bus: busEl.value.trim() });
});

// 화면으로 돌아오면 바로 새로 고침
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && current && Date.now() - lastFetchMs > 10_000) fetchArrivals();
});

// 1초마다 남은 시간 카운트다운
setInterval(() => { if (lastData && !document.hidden) render(); }, 1000);

// ---- 즐겨찾기 ----
function favKey(f) { return `${f.region}|${f.stop}|${f.bus}`; }

function renderFavorites() {
  const favs = store.get('favorites', []);
  $('#favorites').hidden = favs.length === 0;
  $('#fav-list').innerHTML = favs.map((f, i) => `<li>
    <button type="button" data-fav="${i}">${escapeHtml(f.label)}</button>
    <button type="button" class="del" data-del="${i}" aria-label="삭제">✕</button></li>`).join('');
}

$('#fav').addEventListener('click', () => {
  if (!form.reportValidity()) return;
  const f = { region: regionEl.value, stop: stopEl.value.trim(), bus: busEl.value.trim() };
  const regionName = regionEl.selectedOptions[0]?.textContent ?? '';
  const stationName = lastData && current && favKey(current) === favKey(f) ? ` ${lastData.station.name}` : '';
  f.label = `${regionName} ${f.stop}${stationName}${f.bus ? ` · ${f.bus}번` : ''}`;
  const favs = store.get('favorites', []).filter((x) => favKey(x) !== favKey(f));
  favs.unshift(f);
  store.set('favorites', favs.slice(0, 12));
  renderFavorites();
});

$('#fav-list').addEventListener('click', (e) => {
  const favs = store.get('favorites', []);
  const del = e.target.closest('[data-del]')?.dataset.del;
  if (del != null) {
    favs.splice(Number(del), 1);
    store.set('favorites', favs);
    return renderFavorites();
  }
  const idx = e.target.closest('[data-fav]')?.dataset.fav;
  if (idx == null) return;
  const f = favs[Number(idx)];
  regionEl.value = f.region;
  stopEl.value = f.stop;
  busEl.value = f.bus;
  startQuery({ region: f.region, stop: f.stop, bus: f.bus });
});

// URL 로 바로 조회: /?region=seoul&stop=01234&bus=143
const params = new URLSearchParams(location.search);
renderFavorites();
loadRegions().then(() => {
  if (params.get('stop')) {
    if (params.get('region')) regionEl.value = params.get('region');
    stopEl.value = params.get('stop');
    busEl.value = params.get('bus') ?? '';
    form.requestSubmit();
  }
}).catch(() => {
  resultEl.innerHTML = '<div class="card error">서버에 연결할 수 없습니다.</div>';
});
