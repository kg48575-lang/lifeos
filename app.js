document.addEventListener(‘DOMContentLoaded’, function() {
if (window.Telegram && window.Telegram.WebApp) {
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
setTimeout(function() {
tg.expand();
}, 50);
document.addEventListener(‘touchstart’, function() {
tg.expand();
}, { once: true });
}
});
const API = “https://script.google.com/macros/s/AKfycbxcCGzOir9xYySL5cOFdGl2xcBmvsilm2_MxfcXJpAcppYqXfPKeRReo5ttp-iWrzpJwA/exec”;
let TOKEN = localStorage.getItem(‘los_token’);
function checkAuth() {
if (TOKEN) { showApp(); loadAll(); }
}
async function requestCode() {
const btn = document.getElementById(‘req-btn’);
btn.textContent = ‘Отправляю…’; btn.disabled = true;
try {
const r = await call({ action: ‘request_code’ });
if (r.ok) {
btn.textContent = ‘Код отправлен ✓’;
const inp = document.getElementById(‘code-inp’);
inp.style.display = ‘’; inp.focus();
} else { btn.textContent = ‘Ошибка — попробуй снова’; btn.disabled = false; }
} catch { btn.textContent = ‘Нет соединения’; btn.disabled = false; }
}
async function verifyCode() {
const code = document.getElementById(‘code-inp’).value;
const r = await call({ action: ‘verify_code’, code });
if (r.ok && r.token) {
TOKEN = r.token;
localStorage.setItem(‘los_token’, TOKEN);
showApp(); loadAll();
} else {
document.getElementById(‘auth-err’).style.display = ‘’;
}
}
function playMossBoot() {
const boot = document.getElementById(‘moss-boot’);
if (!boot) {
console.error(‘НЕТ ЭЛЕМЕНТА #moss-boot — проверь, что div id=“moss-boot” реально вставлен вместо .ao-wrap’);
return;
}
boot.innerHTML = ‘’;
const frameCount = 19;
const imgs = [];
for (let i = 1; i <= frameCount; i++) {
const img = document.createElement(‘img’);
img.className = ‘moss-frame’ + (i === 1 ? ’ on’ : ‘’);
img.src = ‘moss-’ + i + ‘.jpeg’;
boot.appendChild(img);
imgs.push(img);
}
const label = document.createElement(‘div’);
label.className = ‘moss-boot-label’;
label.textContent = ‘Ива на связи’;
boot.appendChild(label);
let idx = 0;
const interval = setInterval(() => {
idx++;
if (idx >= frameCount) {
clearInterval(interval);
setTimeout(() => label.classList.add(‘on’), 150);
return;
}
imgs.forEach(im => im.classList.remove(‘on’));
imgs[idx].classList.add(‘on’);
}, 150);
}
function showApp() {
const authEl = document.getElementById(‘auth’);
const bootEl = document.getElementById(‘app-open’);
const appEl = document.getElementById(‘app’);
if (!authEl) console.error(‘НЕТ ЭЛЕМЕНТА #auth’);
if (!bootEl) console.error(‘НЕТ ЭЛЕМЕНТА #app-open’);
if (!appEl) console.error(‘НЕТ ЭЛЕМЕНТА #app’);
if (authEl) authEl.classList.add(‘gone’);
if (bootEl) bootEl.classList.add(‘show’);
playMossBoot();
setTimeout(() => {
if (bootEl) bootEl.classList.remove(‘show’);
if (appEl) appEl.classList.remove(‘gone’);
if (window.Telegram && window.Telegram.WebApp) {
const tg = window.Telegram.WebApp;
if (tg.requestFullscreen) tg.requestFullscreen();
else tg.expand();
}
}, 3300);
}
async function call(params) {
const url = new URL(API);
if (TOKEN) params.token = TOKEN;
Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)));
const r = await fetch(url);
return r.json();
}
let activeTab = ‘home’;
const loaded = new Set();
function goTab(name) {
document.querySelectorAll(’.screen’).forEach(s => s.classList.remove(‘on’));
document.querySelectorAll(’.tab’).forEach(t => t.classList.remove(‘on’));
document.getElementById(‘s-’ + name).classList.add(‘on’);
document.getElementById(‘tab-’ + name).classList.add(‘on’);
document.getElementById(‘scroll’).scrollTo(0, 0);
activeTab = name;
if (!loaded.has(name)) {
loaded.add(name);
if (name === ‘health’) loadHealth();
if (name === ‘workouts’) loadWorkouts();
if (name === ‘lists’) loadLists();
}
}
let margoInited = false;
function openMargoPanel() {
document.getElementById(‘margo-panel’).classList.add(‘open’);
document.getElementById(‘margo-backdrop’).classList.add(‘open’);
if (!margoInited) { margoInited = true; initMargo(); }
}
function closeMargoPanel() {
document.getElementById(‘margo-panel’).classList.remove(‘open’);
document.getElementById(‘margo-backdrop’).classList.remove(‘open’);
}
function loadAll() { loadHome(); }
function showSkeleton(containerId, count = 3) {
const el = document.getElementById(containerId);
const patterns = [
[‘w-40’, ‘w-90’, ‘w-60’],
[‘w-60’, ‘w-80’],
[‘w-40’, ‘w-90’, ‘w-40’]
];
el.innerHTML = Array(count).fill(0).map((_, i) => {
const lines = patterns[i % patterns.length]
.map(w => `<div class="skeleton-line ${w}"></div>`).join(’’);
return `<div class="skeleton-card" style="animation-delay:${i * 0.12}s">${lines}</div>`;
}).join(’’);
}
function showBload(containerId) {
const el = document.getElementById(containerId);
if (!el) return;
const leafSVG = ‘<svg viewBox="0 0 24 28"><path class="leaf-body" d="M12 2C6 6 3 11 3 16c0 6 4 10 9 10s9-4 9-10c0-5-3-10-9-14z"/><line class="leaf-vein" x1="12" y1="6" x2="12" y2="24"/></svg>’;
el.innerHTML = `

<div class="leaf-loader">
<div class="fly-leaf f1">${leafSVG}</div>
<div class="fly-leaf f2">${leafSVG}</div>
<div class="fly-leaf f3">${leafSVG}</div>
<div class="fly-leaf f4">${leafSVG}</div>
<div class="fly-leaf f5">${leafSVG}</div>
</div>`;
}
const PHASE_META = {
menstrual: { label: 'Менструальная', color: '#C4918A', soft: '#F7EFEE' },
follicular: { label: 'Фолликулярная', color: '#7A9B8A', soft: '#EEF4F0' },
ovulation: { label: 'Овуляция', color: '#B8A882', soft: '#F7F4EE' },
luteal: { label: 'Лютеиновая', color: '#7A92A8', soft: '#EEF2F7' }
};
const PHASE_TIP = {
menstrual: 'Щадящий ритм. Тело работает.',
follicular: 'Хорошее время для новых начинаний.',
ovulation: 'Пик энергии — хороший момент для важного.',
luteal: 'Замедлись. Это нормально.'
};
async function loadHome() {
showBload('home-flow');
const d = await call({ action: 'dashboard' });
renderHome(d);
loadInsight();
}
function loadInsight(force) {
const el = document.getElementById('home-insight-text');
const btn = document.getElementById('insight-refresh-btn');
if (force) {
if (el) el.textContent = 'Обновляю…';
if (btn) btn.classList.add('spinning');
}
const params = { action: 'home_insight' };
if (force) params.force = 1;
call(params).then(r => {
const el2 = document.getElementById('home-insight-text');
if (el2) el2.textContent = r.insight || 'Пока нет данных для наблюдений — заполни данные здоровья.';
if (btn) btn.classList.remove('spinning');
});
}
function renderHome(d) {
const now = new Date();
document.getElementById('h-label').textContent =
now.toLocaleDateString('ru-RU', { weekday: 'long' });
document.getElementById('h-title').textContent =
now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
let html = '';
html += `<div class="card insight-card">
<div class="card-top">
<span class="card-eyebrow" style="color:var(--lavender)">Что заметила Ива</span>
<button class="insight-refresh" id="insight-refresh-btn" onclick="loadInsight(true)" aria-label="Обновить">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
<path d="M4 4v6h6M20 20v-6h-6"/>
<path d="M5.5 9a7 7 0 0112.6-2M18.5 15a7 7 0 01-12.6 2"/>
</svg>
</button>
</div>
<div class="card-body">
<div class="insight-text" id="home-insight-text">…</div>
</div>
</div>`;
if (d.phaseName && d.phaseKey) {
const m = PHASE_META[d.phaseKey] || {};
const tip = PHASE_TIP[d.phaseKey] || '';
html += `<div class="card">
<div class="card-body" style="padding-top:16px">
<div style="display:flex;align-items:center;justify-content:space-between">
<div class="phase-pill" style="background:${m.soft};color:${m.color}">
<div class="phase-dot" style="background:${m.color}"></div>
${m.label}
</div>
<span style="font-size:12px;color:var(--ink3)">день ${d.cycleDay}</span>
</div>
<div style="font-size:13px;color:var(--ink3);margin-top:10px;line-height:1.5">${tip}</div>
</div>
</div>`;
}
if (d.birthdays && d.birthdays.length) {
const b = d.birthdays[0];
const ds = b.daysUntil === 0 ? 'сегодня 🎂' : `через ${b.daysUntil} ${pDays(b.daysUntil)}`;
html += `<div class="card bday" onclick="goTab('lists');lTab('gifts',document.querySelector('#seg-lists .seg-btn:last-child'))">
<span style="font-size:24px">🎁</span>
<div class="bday-text">
<div class="title">${b.title}</div>
<div class="sub">${ds} · посмотреть идеи</div>
</div>
</div>`;
}
if (!d.healthTodayFilled) {
html += `<div class="card" style="border-color:var(--blush);cursor:pointer" onclick="openMoodModal()">
<div class="card-body" style="padding-top:14px;display:flex;align-items:center;justify-content:space-between">
<div style="font-size:14px">Как ты сегодня?</div>
<span style="font-size:12px;color:var(--blush)">Записать →</span>
</div>
</div>`;
}
if (d.events && d.events.length) {
html += `<div class="card">
<div class="card-top"><span class="card-eyebrow">Сегодня</span></div>
<div class="card-body" style="padding-top:0">`;
d.events.forEach(ev => {
html += `<div class="row">
<div class="phase-dot" style="background:var(--slate)"></div>
<div class="row-name">${ev.title}</div>
<div class="row-meta">${ev.time || 'весь день'}</div>
</div>`;
});
html += `</div></div>`;
}
if (d.tasks && d.tasks.length) {
html += `<div class="card">
<div class="card-top">
<span class="card-eyebrow">Задачи</span>
<button class="card-link" onclick="goTab('lists')">Все →</button>
</div>
<div class="card-body" style="padding-top:0">`;
d.tasks.forEach(t => {
html += `<div class="task-row" onclick="completeTask(${t.id},this)">
<div class="circle"></div>
<div class="task-name">${t.title}</div>
${t.duration ? `<div class="task-dur">${t.duration}</div>` : ''}
</div>`;
});
html += `</div></div>`;
}
if (d.supps && d.supps.length) {
html += `<div class="card">
<div class="card-top"><span class="card-eyebrow">Принимаю сегодня</span></div>
<div class="card-body" style="padding-top:0">`;
d.supps.forEach(s => {
const warn = s.daysLeft !== null && s.daysLeft <= 7;
const end = s.daysLeft === null ? '' : s.daysLeft <= 0 ? '⚠ курс завершён' : warn ? `⏰ ${s.daysLeft} дн.` : `до ${s.endDate}`;
html += `<div class="row">
<div class="row-name">${s.name}</div>
<div class="row-meta ${warn ? 'row-warn' : ''}">${end}</div>
</div>`;
});
html += `</div></div>`;
}
document.getElementById('home-flow').innerHTML = html || '<div class="empty">Добавь события или задачи чтобы видеть их здесь</div>';
}
let hLoading = false;
async function loadHealth() {
if (hLoading) return;
hLoading = true;
showBload('ht-metrics');
try {
const [hd, sd, bs, md] = await Promise.all([
call({ action: 'health' }),
call({ action: 'supps' }),
call({ action: 'body_score_history' }),
call({ action: 'body_measurements' })
]);
renderMetrics(hd);
renderMood(hd);
renderSupps(sd);
renderMeasurements(md);
document.getElementById('ht-metrics').insertAdjacentHTML('beforeend', renderBodyScoreChart(bs.history));
} finally { hLoading = false; }
}
function hTab(name, btn) {
document.querySelectorAll('#seg-health .seg-btn').forEach(b => b.classList.remove('on'));
btn.classList.add('on');
['metrics','mood','supps','measure'].forEach(n => {
document.getElementById('ht-' + n).style.display = n === name ? '' : 'none';
});
}
function renderMeasurements(md) {
const list = (md.measurements || []).slice().reverse();
let html = '<div class="flow">';
html += `<button class="add-btn" onclick="openMeasurementModal()">+ Записать замер</button>`;
if (!list.length) {
html += '<div class="empty">Замеров пока нет — рекомендую раз в 3-4 недели</div>';
} else {
html += '<div class="card"><div class="card-body" style="padding-top:14px">';
list.forEach((m, i) => {
const prev = list[i + 1];
function d(field) {
if (!prev || !m[field] || !prev[field]) return '';
const diff = parseFloat(m[field]) - parseFloat(prev[field]);
if (isNaN(diff) || Math.abs(diff) < 0.1) return '';
return ` <span style="color:var(--ink3)">${diff > 0 ? '↑' : '↓'}${Math.abs(diff).toFixed(1)}</span>`;
}
html += `<div class="row" style="flex-direction:column;align-items:flex-start;gap:4px;padding:14px 0">
<div style="font-size:12px;color:var(--ink3)">${m.date}</div>
<div style="font-size:14px;line-height:1.7">
Вес ${m.weight || '—'}кг${d('weight')} · Жир ${m.fat || '—'}%${d('fat')} · Мышцы ${m.muscle || '—'}кг${d('muscle')}<br>
Грудь ${m.chest || '—'} · Талия ${m.waist || '—'} · Бёдра ${m.hips || '—'} · Плечи ${m.shoulders || '—'}
</div>
</div>`;
});
html += '</div></div>';
}
html += '</div>';
document.getElementById('ht-measure').innerHTML = html;
}
function openMeasurementModal() {
const latest = window._latestHealth || {};
openModal(`
<div class="modal-title">Записать замер</div>
<div class="form-group"><label class="form-lbl">Вес (кг)</label><input class="form-field" id="bm-weight" type="number" step="0.1" value="${latest.weight || ''}"></div>
<div class="form-2col">
<div class="form-group"><label class="form-lbl">% жира</label><input class="form-field" id="bm-fat" type="number" step="0.1" value="${latest.fat || ''}"></div>
<div class="form-group"><label class="form-lbl">Мышцы (кг)</label><input class="form-field" id="bm-muscle" type="number" step="0.1" value="${latest.muscle || ''}"></div>
</div>
<div class="form-2col">
<div class="form-group"><label class="form-lbl">Обхват груди</label><input class="form-field" id="bm-chest" type="text" placeholder="93-94 см"></div>
<div class="form-group"><label class="form-lbl">Обхват талии</label><input class="form-field" id="bm-waist" type="text" placeholder="84-85 см"></div>
</div>
<div class="form-2col">
<div class="form-group"><label class="form-lbl">Обхват бёдер</label><input class="form-field" id="bm-hips" type="text" placeholder="96 см"></div>
<div class="form-group"><label class="form-lbl">Обхват плеч</label><input class="form-field" id="bm-shoulders" type="text" placeholder="100-101 см"></div>
</div>
<div class="modal-footer">
<button class="modal-btn modal-btn-cancel" onclick="closeModal()">Отмена</button>
<button class="modal-btn modal-btn-primary" onclick="saveMeasurement()">Записать</button>
</div>`);
}
async function saveMeasurement() {
const btn = document.querySelector('#overlay .modal-btn-primary');
if (btn.classList.contains('btn-saving')) return;
btn.classList.add('btn-saving'); btn.textContent = 'Записываю…';
const r = await call({
action: 'add_body_measurement',
weight: v('bm-weight'), fat: v('bm-fat'), muscle: v('bm-muscle'),
chest: v('bm-chest'), waist: v('bm-waist'), hips: v('bm-hips'), shoulders: v('bm-shoulders')
});
closeModal();
if (r.error) { showToast('Ошибка: ' + r.error); return; }
showToast('✓ Замер записан');
loaded.delete('health'); if (activeTab==='health') loadHealth();
}
function renderMetrics(d) {
const btns = `<div class="qa-grid" style="padding:0 16px 12px">
<button class="qa-btn" onclick="openDailyHealthModal()"><span class="qa-icon">📅</span>Данные за день</button>
<button class="qa-btn" onclick="openWeeklyHealthModal()"><span class="qa-icon">📆</span>Данные за неделю</button>
</div>`;
if (!d.latest) {
document.getElementById('ht-metrics').innerHTML = btns + '<div class="empty">Нет данных из таблицы здоровья</div>';
return;
}
const l = d.latest;
window._latestHealth = l;
const sleep = (l.deepSleep && l.lightSleep && l.remSleep)
? ((+l.deepSleep + +l.lightSleep + +l.remSleep)/60).toFixed(1) : '—';
document.getElementById('ht-metrics').innerHTML = btns + `
<div class="metric-grid">
${mCell('Вес', r1(l.weight), 'кг', 'var(--blush)', l.deltaWeight)}
${mCell('% жира', r1(l.fat), '%', 'var(--blush)', l.deltaFat)}
${mCell('Мышцы', r1(l.muscle), 'кг', 'var(--sage)', l.deltaMuscle)}
${mCell('Шаги', l.steps ? Math.round(l.steps).toLocaleString('ru') : '—', '/день', 'var(--slate)', l.deltaSteps)}
${mCell('% воды', r1(l.water), '%', 'var(--lavender)', l.deltaWater)}
${mCell('Энергия', r1(l.energy), '/ 5', 'var(--sand)', l.deltaEnergy)}
</div>
<div style="font-size:11px;color:var(--ink3);padding:0 16px 4px">Среднее за неделю · стрелка — к прошлой неделе</div>
<button class="add-btn" onclick="openMoodModal()">+ Записать состояние</button>`;
}
function scoreBreakdown(history) {
if (!history || history.length < 2) return 'Индекс = 0.4×(100−%жира) + 0.4×(%мышц от веса) + 0.2×(%воды). Чем выше — тем лучше состав тела.';
const a = history[history.length - 2], b = history[history.length - 1];
const dScore = b.score - a.score;
const base = 'Индекс = 0.4×(100−%жира) + 0.4×(%мышц от веса) + 0.2×(%воды).';
if (Math.abs(dScore) < 0.3) return base + ' Почти не изменился с прошлой записи.';
const parts = [
{ label: 'изменения % жира', val: ((100-b.fat) - (100-a.fat)) * 0.4 },
{ label: 'изменения доли мышц', val: ((b.muscle/b.weight*100) - (a.muscle/a.weight*100)) * 0.4 },
{ label: 'изменения % воды', val: ((b.water/60*100) - (a.water/60*100)) * 0.2 }
].sort((x,y) => Math.abs(y.val) - Math.abs(x.val));
const dir = dScore > 0 ? 'вырос' : 'снизился';
return base + ` ${dir === 'вырос' ? 'Вырос' : 'Снизился'} на ${Math.abs(dScore).toFixed(1)} — в основном за счёт ${parts[0].label}.`;
}
function renderBodyScoreChart(history) {
if (!history || history.length < 2) return '';
const w = 280, h = 80, pad = 8;
const scores = history.map(p => p.score);
const min = Math.min(...scores), max = Math.max(...scores);
const range = (max - min) || 1;
const stepX = (w - pad*2) / (history.length - 1);
const points = history.map((p,i) => {
const x = pad + i * stepX;
const y = h - pad - ((p.score - min) / range) * (h - pad*2);
return `${x},${y}`;
}).join(' ');
const today = scores[scores.length - 1];
return `<div class="card">
<div class="card-top">
<span class="card-eyebrow" style="color:var(--lavender)">Индекс тела</span>
</div>
<div class="card-body">
<div style="font-size:28px;font-weight:300;margin-bottom:8px">${today}</div>
<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px">
<polyline points="${points}" fill="none" stroke="var(--lavender)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<div style="font-size:12px;color:var(--ink3);margin-top:8px;line-height:1.5">${scoreBreakdown(history)}</div>
</div>
</div>`;
}
function mCell(label, val, unit, color, delta) {
let arrow = '';
if (delta !== null && delta !== undefined && Math.abs(delta) >= 0.1) {
arrow = `<span style="color:var(--ink3);font-size:11px;margin-left:4px">${delta > 0 ? '↑' : '↓'}${Math.abs(delta)}</span>`;
}
return `<div class="metric-cell">
<div class="metric-label">${label}</div>
<div class="metric-value" style="color:${color}">${val || '—'}${arrow}</div>
<div class="metric-unit">${unit}</div>
</div>`;
}
let moodEntriesCache = [];
function renderMood(d) {
const entries = (d.mood || []).slice(-14).reverse();
moodEntriesCache = entries;
if (!entries.length) {
document.getElementById('ht-mood').innerHTML = '<div class="empty">Записей о состоянии пока нет</div>';
return;
}
let html = '<div class="flow">';
entries.forEach((m, i) => {
const sc = +m.score || 0;
const em = sc >= 8 ? '🌟' : sc >= 6 ? '🙂' : sc >= 4 ? '😐' : '💙';
html += `<div class="card" style="cursor:pointer" onclick="openEditMoodModal(${i})">
<div class="card-body" style="padding-top:14px">
<div style="display:flex;justify-content:space-between;align-items:center">
<div style="font-size:14px">${em} ${sc}/10 ${m.tag ? '· ' + m.tag : ''}</div>
<div style="font-size:11px;color:var(--ink3)">${m.date}</div>
</div>
${m.phase ? `<div style="font-size:12px;color:var(--ink3);margin-top:4px">${m.phase}, день ${m.cycleDay||'?'}</div>` : ''}
</div>
</div>`;
});
html += '</div>';
document.getElementById('ht-mood').innerHTML = html;
}
function openEditMoodModal(i) {
const m = moodEntriesCache[i];
if (!m) return;
openModal(`
<div class="modal-title">Запись за ${m.date}</div>
<div class="form-group" style="text-align:center">
<input class="form-field" id="em-score" type="number" min="1" max="10" value="${m.score||''}"
style="font-size:36px;letter-spacing:8px;text-align:center;padding:18px">
</div>
<div class="form-group">
<label class="form-lbl">Одним словом</label>
<input class="form-field" id="em-tag" type="text" value="${(m.tag||'').replace(/"/g,'&quot;')}">
</div>
<div class="form-group">
<label class="form-lbl">Заметка</label>
<input class="form-field" id="em-note" type="text" value="${(m.note||'').replace(/"/g,'&quot;')}">
</div>
<div class="modal-footer">
<button class="modal-btn modal-btn-cancel" onclick="deleteMoodEntry(${m.row})">🗑 Удалить</button>
<button class="modal-btn modal-btn-primary" onclick="saveEditMood(${m.row})">Сохранить</button>
</div>`);
}
async function saveEditMood(row) {
const btn = document.querySelector('#overlay .modal-btn-primary');
if (btn.classList.contains('btn-saving')) return;
btn.classList.add('btn-saving'); btn.textContent = 'Сохраняю…';
const r = await call({ action:'edit_mood', row, score:v('em-score'), tag:v('em-tag'), note:v('em-note') });
closeModal();
if (r.error) { showToast('Ошибка: ' + r.error); return; }
showToast('✓ Запись обновлена');
loaded.delete('health'); if (activeTab==='health') loadHealth();
}
async function deleteMoodEntry(row) {
if (!confirm('Удалить эту запись?')) return;
await call({ action:'delete_mood', row });
closeModal();
showToast('✓ Запись удалена');
loaded.delete('health'); if (activeTab==='health') loadHealth();
}
function renderSupps(d) {
const supps = d.supps || [];
if (!supps.length) {
document.getElementById('ht-supps').innerHTML = '<div class="empty">БАДов нет</div>';
return;
}
const active = supps.filter(s => String(s.status || '').toLowerCase() !== 'завершён');
const finished = supps.filter(s => String(s.status || '').toLowerCase() === 'завершён');
let html = '<div class="flow">';
html += '<div class="card"><div class="card-body" style="padding-top:14px">';
if (active.length) {
active.forEach(s => {
const warn = s.daysLeft !== null && s.daysLeft <= 7;
const ds = s.daysLeft === null ? 'без срока' : s.daysLeft <= 0 ? '⚠ курс завершён' : `осталось ${s.daysLeft} дн.`;
html += `<div class="row">
<div>
<div class="row-name">${s.name}</div>
<div style="font-size:12px;color:var(--ink3);margin-top:1px">с ${s.startDate}</div>
</div>
<div style="display:flex;align-items:center;gap:8px">
<div class="row-meta ${warn ? 'row-warn' : ''}">${ds}</div>
<button onclick="completeSuppUI('${esc(s.name)}',this)" style="background:none;border:1px solid var(--border2);border-radius:6px;padding:4px 10px;font-size:12px;color:var(--ink3);cursor:pointer;font-family:var(--font)">Завершить</button>
</div>
</div>`;
});
} else {
html += '<div class="empty" style="padding:8px 0">Активных БАДов нет</div>';
}
html += '</div></div>';
if (finished.length) {
html += '<div class="card"><div class="card-top"><span class="card-eyebrow">История</span></div><div class="card-body" style="padding-top:0">';
finished.forEach(s => {
html += `<div class="row" style="opacity:.5">
<div class="row-name">${s.name}</div>
<div class="row-meta">${s.startDate} — ${s.endDate || '?'}</div>
</div>`;
});
html += '</div></div>';
}
html += '</div>';
document.getElementById('ht-supps').innerHTML = html;
}
async function completeSuppUI(name, btn) {
btn.textContent = '✓'; btn.disabled = true;
await call({ action:'complete_supp', name });
showToast('✓ Курс завершён');
loaded.delete('health'); if (activeTab==='health') loadHealth();
}
async function loadWorkouts() {
showBload('workout-flow');
const [wd, td] = await Promise.all([call({ action:'workouts' }), call({ action:'workout_templates' })]);
renderWorkouts(wd, td);
}
function renderWorkouts(wd, td) {
const templates = td.templates || [];
const workouts = wd.workouts || [];
window._workoutsCache = workouts;
let html = '';
html += `<div class="flow"><div class="card">
<div class="card-top"><span class="card-eyebrow">Начать тренировку</span></div>
<div class="chip-row">`;
templates.forEach(t => {
html += `<button class="chip" onclick="startWorkout(${encodeData(t)})">${t.name}</button>`;
});
html += `</div>
<div class="qa-grid" style="padding:0 16px 12px;grid-template-columns:1fr">
<button class="qa-btn" onclick="openProgressModal()"><span class="qa-icon">📈</span>Прогресс по упражнению</button>
</div>
<button class="add-btn" onclick="openAddTemplateModal()">+ Создать свой шаблон</button>
</div>`;
if (workouts.length) {
html += `<div class="card">
<div class="card-top"><span class="card-eyebrow">История</span></div>
<div class="card-body" style="padding-top:0">`;
workouts.slice(0,5).forEach(w => {
const realIdx = workouts.indexOf(w);
html += `<div class="row" style="cursor:pointer" onclick="viewWorkoutDetail(${realIdx})">
<div class="row-name">${w.type || 'Тренировка'}</div>
<div style="display:flex;gap:8px;align-items:center">
${w.duration ? `<div class="row-meta">${w.duration} мин</div>` : ''}
<div class="row-meta">${w.date}</div>
</div>
</div>`;
});
html += `</div></div>`;
} else {
html += `<div class="card"><div class="empty" style="text-align:left;padding:16px 18px">Выбери шаблон выше чтобы записать первую тренировку</div></div>`;
}
html += `</div>`;
document.getElementById('workout-flow').innerHTML = html;
}
let newTemplateExCount = 0;
function openAddTemplateModal() {
newTemplateExCount = 1;
openModal(`
<div class="modal-title">Новый шаблон</div>
<div class="form-group">
<label class="form-lbl">Название</label>
<input class="form-field" id="nt-name" type="text" placeholder="Ноги">
</div>
<div class="form-group">
<label class="form-lbl">Группы мышц</label>
<input class="form-field" id="nt-groups" type="text" placeholder="квадрицепс, ягодицы">
</div>
<div id="nt-exercises">${templateExerciseRow(0)}</div>
<button class="add-btn" onclick="addTemplateExerciseRow()">+ Ещё упражнение</button>
<div class="modal-footer">
<button class="modal-btn modal-btn-cancel" onclick="closeModal()">Отмена</button>
<button class="modal-btn modal-btn-primary" onclick="saveNewTemplate()">Сохранить шаблон</button>
</div>`);
}
function templateExerciseRow(i) {
return `<div class="form-group" id="nt-row-${i}">
<input class="form-field" id="nt-ex-name-${i}" type="text" placeholder="Название упражнения" style="margin-bottom:6px">
<div class="form-3col">
<input class="form-field" type="number" placeholder="подх." id="nt-ex-sets-${i}" style="text-align:center">
<input class="form-field" type="text" placeholder="повт. или время (40 сек)" id="nt-ex-reps-${i}" style="text-align:center">
<input class="form-field" type="number" placeholder="кг" id="nt-ex-weight-${i}" style="text-align:center">
</div>
<input class="form-field" id="nt-ex-alt-${i}" type="text" placeholder="Замена, если не подойдёт (необязательно)" style="margin-top:6px;font-size:13px">
</div>`;
}
function addTemplateExerciseRow() {
document.getElementById('nt-exercises').insertAdjacentHTML('beforeend', templateExerciseRow(newTemplateExCount));
newTemplateExCount++;
}
async function saveNewTemplate() {
const name = v('nt-name'); if (!name) return;
const exercises = [];
for (let i = 0; i < newTemplateExCount; i++) {
const exName = v('nt-ex-name-' + i);
if (!exName) continue;
exercises.push({ name: exName, sets: v('nt-ex-sets-'+i), reps: v('nt-ex-reps-'+i), weight: v('nt-ex-weight-'+i), alt: v('nt-ex-alt-'+i) });
}
if (!exercises.length) { showToast('Добавь хотя бы одно упражнение'); return; }
const btn = document.querySelector('#overlay .modal-btn-primary');
btn.classList.add('btn-saving'); btn.textContent = 'Сохраняю…';
const r = await call({ action:'add_workout_template', name, muscleGroups:v('nt-groups'), exercises: JSON.stringify(exercises) });
closeModal();
if (r.error) { showToast('Ошибка: ' + r.error); return; }
showToast('✓ Шаблон создан');
loaded.delete('workouts'); loadWorkouts();
}
function viewWorkoutDetail(idx) {
const w = window._workoutsCache[idx];
if (!w) return;
let exHtml = '';
if (w.exercises && w.exercises.length) {
exHtml = w.exercises.map(ex => `
<div class="ex-row">
<div class="ex-name">${ex.name || 'Упражнение'}</div>
<div class="ex-sets">${ex.sets || '—'}×${ex.reps || '—'}${ex.weight ? ' × ' + ex.weight + ' кг' : ''}</div>
</div>`).join('');
} else {
exHtml = '<div class="empty" style="padding:12px 0">Подробностей по упражнениям нет</div>';
}
openModal(`
<div class="modal-title">${w.type || 'Тренировка'}</div>
<div style="font-size:13px;color:var(--ink3);margin-bottom:14px">
${w.date}${w.duration ? ' · ' + w.duration + ' мин' : ''}
</div>
${exHtml}
${w.note ? `<div class="form-group" style="margin-top:14px">
<label class="form-lbl">Заметка</label>
<div style="font-size:14px;color:var(--ink)">${w.note}</div>
</div>` : ''}
<div class="modal-footer">
<button class="modal-btn modal-btn-cancel" onclick="closeModal()">Закрыть</button>
<button class="modal-btn modal-btn-primary" onclick="editWorkoutDetail(${idx})">✏️ Изменить</button>
</div>`);
}
function editWorkoutDetail(idx) {
const w = window._workoutsCache[idx];
if (!w) return;
const exercises = w.exercises && w.exercises.length ? w.exercises : [{ name: '', sets: '', reps: '', weight: '' }];
let exHtml = exercises.map((ex, i) => `
<div class="form-group">
<label class="form-lbl" style="margin-bottom:7px">${ex.name || 'Упражнение ' + (i+1)}</label>
<input type="hidden" id="ew-name-${i}" value="${esc(ex.name || '')}">
<div class="form-3col">
<input class="form-field" type="number" placeholder="подх." value="${ex.sets || ''}" id="ew-s${i}" style="text-align:center">
<input class="form-field" type="text" placeholder="повт. или время" value="${ex.reps || ''}" id="ew-r${i}" style="text-align:center">
<input class="form-field" type="number" placeholder="кг" value="${ex.weight || ''}" id="ew-w${i}" style="text-align:center">
</div>
</div>`).join('');
openModal(`
<div class="modal-title">Изменить: ${w.type || 'Тренировка'}</div>
<div style="font-size:12px;color:var(--ink3);margin-bottom:14px">${w.date} · дата остаётся прежней</div>
${exHtml}
<div class="form-group">
<label class="form-lbl">Длительность</label>
<input class="form-field" type="number" id="ew-dur" placeholder="60 мин" value="${w.duration || ''}">
</div>
<div class="form-group">
<label class="form-lbl">Заметка</label>
<input class="form-field" type="text" id="ew-note" placeholder="Как прошло?" value="${(w.note||'').replace(/"/g,'&quot;')}">
</div>
<div class="modal-footer">
<button class="modal-btn modal-btn-cancel" onclick="closeModal()">Отмена</button>
<button class="modal-btn modal-btn-primary" onclick="saveEditedWorkout(${idx},${exercises.length})">Сохранить</button>
</div>`);
}
async function saveEditedWorkout(idx, cnt) {
const w = window._workoutsCache[idx];
if (!w) return;
const btn = document.querySelector('#overlay .modal-btn-primary');
if (btn.classList.contains('btn-saving')) return;
btn.classList.add('btn-saving'); btn.textContent = 'Сохраняю…';
const exercises = [];
for (let i = 0; i < cnt; i++) {
exercises.push({ name: v('ew-name-'+i), sets: v('ew-s'+i), reps: v('ew-r'+i), weight: v('ew-w'+i) });
}
const r = await call({
action: 'update_workout',
sessionId: w.sessionId, date: w.date, type: w.type,
duration: v('ew-dur'), note: v('ew-note'),
exercises: JSON.stringify(exercises)
});
closeModal();
if (r.error) { showToast('Ошибка: ' + r.error); return; }
showToast('✓ Тренировка обновлена');
loaded.delete('workouts'); loadWorkouts();
}
function encodeData(obj) {
return "'" + encodeURIComponent(JSON.stringify(obj)) + "'";
}
async function openProgressModal() {
const data = await call({ action: 'exercise_names' });
const names = data.names || [];
if (!names.length) {
openModal(`<div class="modal-title">Прогресс</div><div class="empty">Пока нет истории упражнений с названиями</div>`);
return;
}
openModal(`
<div class="modal-title">Выбери упражнение</div>
<div class="chip-row" style="flex-wrap:wrap;padding:0 0 8px">
${names.map(n => `<button class="chip" onclick="loadExerciseProgress('${esc(n)}')">${n}</button>`).join('')}
</div>
<div id="progress-chart-area"></div>
`);
}
async function loadExerciseProgress(name) {
const area = document.getElementById('progress-chart-area');
if (area) area.innerHTML = '<div class="loading">Загружаю…</div>';
const data = await call({ action: 'exercise_history', name });
const history = (data.history || []).filter(h => h.weight !== null && h.weight !== undefined);
if (!area) return;
if (history.length < 2) {
area.innerHTML = '<div class="empty">Пока маловато данных с весом для графика</div>';
return;
}
const w = 280, h = 100, pad = 10;
const weights = history.map(p => p.weight);
const min = Math.min(...weights), max = Math.max(...weights);
const range = (max - min) || 1;
const stepX = (w - pad*2) / (history.length - 1);
const points = history.map((p,i) => {
const x = pad + i * stepX;
const y = h - pad - ((p.weight - min) / range) * (h - pad*2);
return `${x},${y}`;
}).join(' ');
const first = history[0], last = history[history.length - 1];
const diff = Math.round((last.weight - first.weight) * 10) / 10;
const diffStr = diff === 0 ? 'без изменений' : (diff > 0 ? `+${diff} кг` : `${diff} кг`);
area.innerHTML = `
<div class="card" style="margin-top:12px">
<div class="card-body" style="padding-top:14px">
<div style="font-size:22px;font-weight:300;margin-bottom:2px">${last.weight} кг</div>
<div style="font-size:12px;color:var(--ink3);margin-bottom:8px">${first.date} → ${last.date} · ${diffStr}</div>
<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px">
<polyline points="${points}" fill="none" stroke="var(--slate)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</div>
</div>`;
}
async function startWorkout(enc) {
const t = JSON.parse(decodeURIComponent(enc));
if (t.staged) { startStagedWorkout(t); return; }
// Подтягиваем последнюю тренировку с таким же названием — если есть,
// подставляем реальные вес/повторы вместо статичных дефолтов шаблона
let lastByName = {};
try {
const last = await call({ action: 'last_workout_by_type', type: t.name });
if (last && last.exercises) {
last.exercises.forEach(ex => { if (ex.name) lastByName[ex.name.trim().toLowerCase()] = ex; });
}
} catch(e) {}
let exHtml = (t.exercises || []).map((ex, i) => {
const prev = lastByName[(ex.name || '').trim().toLowerCase()];
const sets = prev ? (prev.sets || ex.defaultSets) : ex.defaultSets;
const reps = prev ? (prev.reps || ex.defaultReps) : ex.defaultReps;
const weight = prev ? (prev.weight || ex.defaultWeight) : ex.defaultWeight;
return `
<div class="form-group">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px">
<label class="form-lbl" id="ex-label-${i}" style="margin:0">${ex.name}</label>
${ex.alt ? `<button type="button" onclick="swapExercise(${i},'${esc(ex.name)}','${esc(ex.alt)}')" style="background:none;border:1px solid var(--border2);border-radius:6px;padding:3px 8px;font-size:11px;color:var(--ink3);cursor:pointer;font-family:var(--font)">⇄ заменить</button>` : ''}
</div>
<input type="hidden" id="ex-name-val-${i}" value="${esc(ex.name)}">
<div class="form-3col">
<input class="form-field" type="number" placeholder="подх." value="${sets}" id="s${i}" style="text-align:center">
<input class="form-field" type="text" placeholder="повт. или время" value="${reps}" id="r${i}" style="text-align:center">
<input class="form-field" type="number" placeholder="кг" value="${weight||''}" id="w${i}" style="text-align:center">
</div>
</div>`;
}).join('');
openModal(`
<div class="modal-title">${t.name}</div>
${lastByName && Object.keys(lastByName).length ? '<div style="font-size:12px;color:var(--ink3);margin-bottom:12px">Подставила значения с прошлого раза</div>' : ''}
${exHtml}
<div class="form-group">
<label class="form-lbl">Длительность</label>
<input class="form-field" type="number" id="wdur" placeholder="60 мин">
</div>
<div class="form-group">
<label class="form-lbl">Заметка</label>
<input class="form-field" type="text" id="wnote" placeholder="Как прошло?">
</div>
<div class="modal-footer">
<button class="modal-btn modal-btn-cancel" onclick="closeModal()">Отмена</button>
<button class="modal-btn modal-btn-primary" onclick='saveWorkout("${t.name}",${t.exercises.length})'>Сохранить</button>
</div>`);
}
function swapExercise(i, original, alt) {
const label = document.getElementById('ex-label-' + i);
const hidden = document.getElementById('ex-name-val-' + i);
const btn = event.target;
const isAlt = hidden.value === alt;
const next = isAlt ? original : alt;
hidden.value = next;
label.textContent = next;
btn.style.background = isAlt ? 'none' : 'var(--cream2)';
}
function startStagedWorkout(t) {
let html = `<div class="modal-title">${t.name}</div>`;
let exCounter = 0;
let exNames = [];
t.stages.forEach((stage, si) => {
html += `<div style="font-size:13px;font-weight:500;color:var(--ink3);text-transform:uppercase;letter-spacing:0.06em;margin:${si>0?'20px':'0'} 0 10px">${stage.title}</div>`;
if (stage.type === 'stretch') {
html += `<div class="form-group">
<label class="form-lbl">Сделала растяжку? (мин)</label>
<input class="form-field" type="number" id="stage${si}-dur" placeholder="${stage.durationMin}">
</div>`;
}
if (stage.type === 'circuit') {
html += `<div class="form-group">
<label class="form-lbl">Кругов сделано</label>
<input class="form-field" type="number" id="stage${si}-rounds" placeholder="${stage.rounds}">
</div>`;
}
if (stage.type === 'strength') {
stage.exercises.forEach(ex => {
exNames.push(ex.name);
html += `<div class="form-group">
<label class="form-lbl">${ex.name}</label>
<div class="form-3col">
<input class="form-field" type="number" placeholder="подх." value="${ex.defaultSets}" id="ex${exCounter}-s" style="text-align:center">
<input class="form-field" type="text" placeholder="повт. или время" value="${ex.defaultReps}" id="ex${exCounter}-r" style="text-align:center">
<input class="form-field" type="number" placeholder="кг" value="${ex.defaultWeight||''}" id="ex${exCounter}-w" style="text-align:center">
</div>
</div>`;
exCounter++;
});
}
});
html += `<div class="form-group">
<label class="form-lbl">Общая длительность (мин)</label>
<input class="form-field" type="number" id="wdur" placeholder="90">
</div>
<div class="form-group">
<label class="form-lbl">Заметка</label>
<input class="form-field" type="text" id="wnote" placeholder="Как прошло?">
</div>
<div class="modal-footer">
<button class="modal-btn modal-btn-cancel" onclick="closeModal()">Отмена</button>
<button class="modal-btn modal-btn-primary" onclick='saveStagedWorkout("${t.name}",${exCounter},${JSON.stringify(exNames)})'>Сохранить</button>
</div>`;
openModal(html);
}
async function saveStagedWorkout(name, exCount, exNames) {
const btn = document.querySelector('#overlay .modal-btn-primary');
if (btn.classList.contains('btn-saving')) return;
btn.classList.add('btn-saving'); btn.textContent = 'Сохраняю…';
const exercises = [];
for (let i = 0; i < exCount; i++) {
exercises.push({ name: exNames[i], sets: v('ex'+i+'-s'), reps: v('ex'+i+'-r'), weight: v('ex'+i+'-w') });
}
await call({ action:'add_workout', type:name, duration:v('wdur'), exercises:JSON.stringify(exercises), note:v('wnote') });
closeModal();
showToast('✓ Тренировка записана');
loaded.delete('workouts'); loadWorkouts();
}
async function saveWorkout(name, cnt) {
const btn = document.querySelector('#overlay .modal-btn-primary');
if (btn.classList.contains('btn-saving')) return;
btn.classList.add('btn-saving'); btn.textContent = 'Сохраняю…';
const exercises = [];
for (let i = 0; i < cnt; i++) {
exercises.push({ name: v('ex-name-val-'+i), sets: v('s'+i), reps: v('r'+i), weight: v('w'+i) });
}
await call({ action:'add_workout', type:name, duration:v('wdur'), exercises:JSON.stringify(exercises), note:v('wnote') });
closeModal();
showToast('✓ Тренировка записана');
loaded.delete('workouts'); loadWorkouts();
}
let listsCache = {};
async function loadLists() {
showBload('lt-tasks');
const [tasks, work, shop, watch, gifts] = await Promise.all([
call({ action:'tasks' }), call({ action:'work_tasks' }), call({ action:'shopping' }),
call({ action:'watchlist' }), call({ action:'gifts' })
]);
listsCache = { tasks, work, shop, watch, gifts };
lRender('tasks');
}
function lTab(name, btn) {
document.querySelectorAll('#seg-lists .seg-btn').forEach(b => b.classList.remove('on'));
btn.classList.add('on');
['tasks','work','shopping','watch','gifts'].forEach(n => {
document.getElementById('lt-' + n).style.display = n === name ? '' : 'none';
});
lRender(name);
}
function lRender(name) {
if (name === 'tasks') renderTasks();
if (name === 'work') renderWorkTasks();
if (name === 'shopping') renderShopping();
if (name === 'watch') renderWatch();
if (name === 'gifts') renderGifts();
}
function renderWorkTasks() {
const data = listsCache.work || {};
const primary = data.primary || [];
const reserve = data.reserve || [];
let html = '<div class="flow">';
if (primary.length) {
html += '<div class="card"><div class="card-top"><span class="card-eyebrow">В работе</span></div><div class="card-body" style="padding-top:0">';
primary.forEach(t => {
html += `<div class="row">
<div>
<div class="row-name">${t.title}</div>
<div style="font-size:11px;color:var(--ink3);margin-top:2px">${t.project || ''}${t.status ? ' · ' + t.status : ''}</div>
</div>
${t.link ? `<a href="${t.link}" target="_blank" style="color:var(--slate);font-size:12px;text-decoration:none;flex-shrink:0">открыть ↗</a>` : ''}
</div>`;
});
html += '</div></div>';
}
if (reserve.length) {
html += '<div class="card"><div class="card-top"><span class="card-eyebrow">Отложено</span></div><div class="card-body" style="padding-top:0">';
reserve.forEach(t => {
html += `<div class="row" style="opacity:.55">
<div class="row-name">${t.title}</div>
${t.link ? `<a href="${t.link}" target="_blank" style="color:var(--slate);font-size:12px;text-decoration:none">открыть ↗</a>` : ''}
</div>`;
});
html += '</div></div>';
}
if (!primary.length && !reserve.length) {
html += '<div class="empty">Активных рабочих задач нет</div>';
}
html += '</div>';
document.getElementById('lt-work').innerHTML = html;
}
function renderTasks() {
const tasks = listsCache.tasks?.tasks || [];
let html = '<div class="flow">';
if (tasks.length) {
html += '<div class="card"><div class="card-body" style="padding-top:14px">';
tasks.forEach(t => {
html += `<div class="task-row" onclick="completeTask(${t.id},this)">
<div class="circle"></div>
<div class="task-name">${t.title}${t.deadline ? ` <span style="font-size:11px;color:var(--ink3)">до ${t.deadline}</span>` : ''}</div>
${t.duration ? `<div class="task-dur">${t.duration}</div>` : ''}
</div>`;
});
html += '</div></div>';
} else {
html += '<div class="empty">Задач нет</div>';
}
html += '</div>';
html += '<button class="add-btn" onclick="openAddTask()">+ Добавить задачу</button>';
document.getElementById('lt-tasks').innerHTML = html;
}
function renderShopping() {
const items = listsCache.shop?.items || [];
const cats = {};
items.forEach(i => { const c = i.category || 'другое'; (cats[c] = cats[c]||[]).push(i); });
let html = '<div class="flow">';
['себе','домой','родителям','другое'].forEach(cat => {
if (!cats[cat]) return;
html += `<div class="card">
<div class="card-top"><span class="card-eyebrow">${cat}</span></div>
<div class="card-body" style="padding-top:0">`;
cats[cat].forEach(it => {
html += `<div class="row">
<div class="row-name">${it.name}</div>
<button onclick="shopDone('${esc(it.name)}',this)" style="background:none;border:1px solid var(--border2);border-radius:6px;padding:4px 10px;font-size:12px;color:var(--ink3);cursor:pointer;font-family:var(--font)">Куплено</button>
</div>`;
});
html += '</div></div>';
});
if (!Object.keys(cats).length) html += '<div class="empty">Список пуст</div>';
html += '</div>';
html += '<button class="add-btn" onclick="openAddShop()">+ Добавить</button>';
document.getElementById('lt-shopping').innerHTML = html;
}
function renderWatch() {
const items = listsCache.watch?.items || [];
const byT = {};
items.forEach(i => { const t = i.type||'видео'; (byT[t]=byT[t]||[]).push(i); });
let html = '<div class="flow">';
Object.keys(byT).forEach(type => {
html += `<div class="card">
<div class="card-top"><span class="card-eyebrow">${type}</span></div>
<div class="card-body" style="padding-top:0">`;
byT[type].forEach(it => {
html += `<div class="row">
${it.url ? `<a href="${it.url}" target="_blank" style="flex:1;color:var(--ink);text-decoration:none">${it.name}<span style="color:var(--slate);margin-left:4px">↗</span></a>` : `<div class="row-name">${it.name}</div>`}
</div>`;
});
html += '</div></div>';
});
if (!Object.keys(byT).length) html += '<div class="empty">Список пуст</div>';
html += '</div>';
document.getElementById('lt-watch').innerHTML = html;
}
function renderGifts() {
const gifts = listsCache.gifts?.gifts || [];
const byP = {};
gifts.forEach(g => { (byP[g.person]=byP[g.person]||[]).push(g); });
let html = '<div class="flow">';
Object.keys(byP).forEach(person => {
html += `<div class="card">
<div class="card-top"><span class="card-eyebrow">${person}</span></div>
<div class="card-body" style="padding-top:0">`;
byP[person].forEach(g => {
const bought = g.status === 'куплен';
html += `<div class="row" style="${bought?'opacity:.4':''}">
<div class="row-name">${g.idea}${g.budget ? ` <span style="color:var(--ink3);font-size:12px">~${g.budget}</span>` : ''}${bought?' ✓':''}</div>
${g.url ? `<a href="${g.url}" target="_blank" style="color:var(--slate);font-size:12px;text-decoration:none">ссылка ↗</a>` : ''}
</div>`;
});
html += '</div></div>';
});
if (!Object.keys(byP).length) html += '<div class="empty">Список пуст</div>';
html += '</div>';
document.getElementById('lt-gifts').innerHTML = html;
}
function initMargo() {
const cmds = [
{ icon:'📅', label:'Расписание', cmd:'расписание' },
{ icon:'💊', label:'БАДы', cmd:'бады' },
{ icon:'📊', label:'Аналитика', cmd:'аналитика здоровья' },
{ icon:'✦', label:'Полный анализ', cmd:'полная аналитика' },
];
document.getElementById('qa-grid').innerHTML = cmds.map(c =>
`<button class="qa-btn" onclick="sendCmd('${c.cmd}')">
<span class="qa-icon">${c.icon}</span>${c.label}
</button>`
).join('');
}
function sendCmd(cmd) {
document.getElementById('chat-inp').value = cmd;
chatSend();
}
function addBubble(text, isMe) {
const d = document.createElement('div');
d.className = 'bubble ' + (isMe ? 'bubble-me' : 'bubble-margo');
d.textContent = text;
document.getElementById('chat-area').appendChild(d);
d.scrollIntoView({ behavior:'smooth' });
}
async function chatSend() {
const inp = document.getElementById('chat-inp');
const text = inp.value.trim();
if (!text) return;
inp.value = ''; autoH(inp);
addBubble(text, true);
const typing = document.createElement('div');
typing.className = 'bubble bubble-margo';
typing.textContent = '…';
document.getElementById('chat-area').appendChild(typing);
if (/фокус/i.test(text)) {
const plan = await call({ action: 'focus_mode', text });
typing.remove();
if (plan.error) { addBubble('Не получилось собрать план: ' + plan.error, false); return; }
let out = '🎯 Фокус\n\nРабота (до 18:00):\n';
out += plan.work.length ? plan.work.map(t => ` • ${t.title}${t.note ? ' — ' + t.note : ''}`).join('\n') : ' (пусто)';
out += '\n\nОстальное (после 18:00-19:00):\n';
out += plan.other.length ? plan.other.map(t => ` • ${t.title}${t.note ? ' — ' + t.note : ''}`).join('\n') : ' (пусто)';
if (plan.reserve && plan.reserve.length) {
out += '\n\nОтложено (когда основное сделано):\n';
out += plan.reserve.map(t => ` • ${t.title}`).join('\n');
}
addBubble(out.trim(), false);
return;
}
const r = await call({ action:'ask_margo', text });
typing.remove();
if (r.intent === 'items') {
const w = r.written || [];
const ok = w.filter(x => !x.error);
if (!ok.length) { addBubble('Не получилось записать пункты.', false); return; }
let out = `Записала ${ok.length}:\n`;
ok.forEach(x => {
if (x.type === 'task') out += `${x.num}. ${x.title}${x.category ? ' (' + x.category + ')' : ''}\n`;
else out += `${x.num}. ${x.title}${x.date ? ' — ' + x.date + (x.time ? ' ' + x.time : '') : ''}\n`;
});
addBubble(out.trim(), false);
loaded.delete('lists');
return;
}
if (r.intent === 'get_schedule') {
addBubble('Расписание лучше смотреть через бота в Telegram — там полный доступ к Calendar.', false);
} else if (r.intent === 'training_advice') {
addBubble('Совет по тренировке зависит от фазы цикла. Открой бота в Telegram для детального ответа.', false);
} else if (r.intent === 'add_event') {
addBubble(`Запишу "${r.data?.title||text}" через Telegram-бота — там есть доступ к Google Calendar.`, false);
} else if (r.error) {
addBubble('Не смогла обработать. Попробуй через бота в Telegram.', false);
} else {
addBubble('Команда распознана. Для выполнения используй бота Ива в Telegram.', false);
}
}
function chatKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); chatSend(); } }
async function completeTask(id, el) {
const row = el.closest('.task-row');
row.classList.add('done');
await call({ action:'complete_task', row: id });
setTimeout(() => row.remove(), 500);
}
async function shopDone(name, btn) {
btn.textContent = '✓'; btn.disabled = true;
await call({ action:'mark_shopping_done', name });
}
function openAddTask() {
openModal(`
<div class="modal-title">Новая задача</div>
<div class="form-group">
<label class="form-lbl">Что нужно сделать</label>
<input class="form-field" id="nt" type="text" placeholder="Купить магний">
</div>
<div class="form-group">
<label class="form-lbl">Категория</label>
<select class="form-field" id="nc">
<option value="личное">личное</option>
<option value="дом">дом</option>
<option value="покупки">покупки</option>
<option value="здоровье">здоровье</option>
</select>
</div>
<div class="form-group">
<label class="form-lbl">Срок</label>
<input class="form-field" id="nd" type="text" placeholder="до пятницы">
</div>
<div class="modal-footer">
<button class="modal-btn modal-btn-cancel" onclick="closeModal()">Отмена</button>
<button class="modal-btn modal-btn-primary" onclick="saveTask()">Добавить</button>
</div>`);
}
async function saveTask() {
const title = v('nt'); if (!title) return;
const btn = document.querySelector('#overlay .modal-btn-primary');
if (btn.classList.contains('btn-saving')) return;
btn.classList.add('btn-saving'); btn.textContent = 'Добавляю…';
await call({ action:'add_task', title, category:v('nc'), deadline:v('nd') });
closeModal();
showToast('✓ Задача добавлена');
loaded.delete('lists'); if (activeTab==='lists') loadLists();
}
function openAddShop() {
openModal(`
<div class="modal-title">Добавить в покупки</div>
<div class="form-group">
<label class="form-lbl">Что купить</label>
<input class="form-field" id="si" type="text" placeholder="Крем для рук">
</div>
<div class="form-group">
<label class="form-lbl">Категория</label>
<select class="form-field" id="sc">
<option value="себе">себе</option>
<option value="домой">домой</option>
<option value="родителям">родителям</option>
</select>
</div>
<div class="modal-footer">
<button class="modal-btn modal-btn-cancel" onclick="closeModal()">Отмена</button>
<button class="modal-btn modal-btn-primary" onclick="saveShop()">Добавить</button>
</div>`);
}
async function saveShop() {
const name = v('si'); if (!name) return;
const btn = document.querySelector('#overlay .modal-btn-primary');
if (btn.classList.contains('btn-saving')) return;
btn.classList.add('btn-saving'); btn.textContent = 'Добавляю…';
await call({ action:'add_shopping', name, category:v('sc') });
closeModal();
showToast('✓ Добавлено в покупки');
loaded.delete('lists'); if (activeTab==='lists') loadLists();
}
function openMoodModal() {
openModal(`
<div class="modal-title">Как ты сейчас?</div>
<div class="form-group" style="text-align:center">
<input class="form-field" id="ms" type="number" min="1" max="10" placeholder="7"
style="font-size:36px;letter-spacing:8px;text-align:center;padding:18px">
</div>
<div class="form-group">
<label class="form-lbl">Одним словом</label>
<div class="mood-row">
${['спокойно','устала','тревожно','энергично','грустно','радостно'].map(t =>
`<button class="mood-chip" onclick="pickMood(this,'${t}')">${t}</button>`
).join('')}
</div>
<input class="form-field" id="mt" type="text" placeholder="или своё слово">
</div>
<div class="modal-footer">
<button class="modal-btn modal-btn-cancel" onclick="closeModal()">Пропустить</button>
<button class="modal-btn modal-btn-primary" onclick="saveMood()">Записать</button>
</div>`);
}
function pickMood(el, tag) {
document.querySelectorAll('.mood-chip').forEach(c => c.classList.remove('on'));
el.classList.add('on');
document.getElementById('mt').value = tag;
}
async function saveMood() {
const score = v('ms'); if (!score) return;
const btn = document.querySelector('#overlay .modal-btn-primary');
if (btn.classList.contains('btn-saving')) return;
btn.classList.add('btn-saving'); btn.textContent = 'Записываю…';
await call({ action:'add_mood', score, tag:v('mt') });
closeModal();
showToast('✓ Состояние записано');
loaded.delete('health'); if (activeTab==='health') loadHealth();
loaded.delete('home'); loadHome();
}
function openDailyHealthModal() {
const last = (() => { try { return JSON.parse(localStorage.getItem('lastDailyHealth') || '{}'); } catch { return {}; } })();
openModal(`
<div class="modal-title">Данные за сегодня</div>
<div class="form-group"><label class="form-lbl">Вес (кг)</label><input class="form-field" id="dh-weight" type="number" step="0.1" placeholder="67.2" value="${last.weight || ''}"></div>
<div class="form-2col">
<div class="form-group"><label class="form-lbl">% жира</label><input class="form-field" id="dh-fat" type="number" step="0.1" placeholder="36.5" value="${last.fat || ''}"></div>
<div class="form-group"><label class="form-lbl">Мышцы (кг)</label><input class="form-field" id="dh-muscle" type="number" step="0.1" placeholder="22.4" value="${last.muscle || ''}"></div>
</div>
<div class="form-2col">
<div class="form-group"><label class="form-lbl">% воды</label><input class="form-field" id="dh-water" type="number" step="0.1" placeholder="43.1" value="${last.water || ''}"></div>
<div class="form-group"><label class="form-lbl">Энергия (1–7)</label><input class="form-field" id="dh-energy" type="number" placeholder="4" value="${last.energy || ''}"></div>
</div>
<div class="form-group">
<label class="form-lbl">Шаги (за вчера)</label>
<input class="form-field" id="dh-steps" type="number" placeholder="7500">
</div>
<div class="modal-footer">
<button class="modal-btn modal-btn-cancel" onclick="closeModal()">Отмена</button>
<button class="modal-btn modal-btn-primary" onclick="saveDailyHealth()">Записать</button>
</div>`);
}
async function saveDailyHealth() {
const btn = document.querySelector('#overlay .modal-btn-primary');
if (btn.classList.contains('btn-saving')) return;
btn.classList.add('btn-saving'); btn.textContent = 'Записываю…';
const vals = { weight: v('dh-weight'), fat: v('dh-fat'), muscle: v('dh-muscle'), water: v('dh-water'), energy: v('dh-energy') };
const r = await call({
action: 'add_daily_health',
weight: vals.weight, fat: vals.fat, muscle: vals.muscle,
water: vals.water, steps: v('dh-steps'), energy: vals.energy
});
closeModal();
if (r.error) { showToast('Ошибка: ' + r.error); return; }
localStorage.setItem('lastDailyHealth', JSON.stringify(vals));
showToast(r.stepsToYesterday ? '✓ Записано (шаги — за вчера)' : '✓ Данные за день записаны');
loaded.delete('health'); if (activeTab==='health') loadHealth();
}
function openWeeklyHealthModal() {
const last = (() => { try { return JSON.parse(localStorage.getItem('lastWeeklyHealth') || '{}'); } catch { return {}; } })();
openModal(`
<div class="modal-title">Данные за неделю</div>
<div class="form-2col">
<div class="form-group"><label class="form-lbl">Зарядка (раз)</label><input class="form-field" id="wh-workoutDays" type="number" placeholder="5" value="${last.workoutDays || ''}"></div>
<div class="form-group"><label class="form-lbl">Тренировки (раз)</label><input class="form-field" id="wh-trainings" type="number" placeholder="2" value="${last.trainings || ''}"></div>
</div>
<div class="form-2col">
<div class="form-group"><label class="form-lbl">Длительность (мин)</label><input class="form-field" id="wh-duration" type="number" placeholder="60" value="${last.duration || ''}"></div>
<div class="form-group"><label class="form-lbl">Пульс</label><input class="form-field" id="wh-pulse" type="number" placeholder="120" value="${last.pulse || ''}"></div>
</div>
<div class="form-3col">
<div class="form-group"><label class="form-lbl">Глуб. сон</label><input class="form-field" id="wh-deepSleep" type="number" placeholder="140" value="${last.deepSleep || ''}"></div>
<div class="form-group"><label class="form-lbl">Лёгкий сон</label><input class="form-field" id="wh-lightSleep" type="number" placeholder="210" value="${last.lightSleep || ''}"></div>
<div class="form-group"><label class="form-lbl">Быстрый сон</label><input class="form-field" id="wh-remSleep" type="number" placeholder="130" value="${last.remSleep || ''}"></div>
</div>
<div class="form-group"><label class="form-lbl">БАДы</label><input class="form-field" id="wh-bads" type="text" placeholder="Д3 + креатин" value="${last.bads || ''}"></div>
<div class="form-group"><label class="form-lbl">МЦ</label><input class="form-field" id="wh-cycle" type="text" placeholder="М (если было)"></div>
<div class="modal-footer">
<button class="modal-btn modal-btn-cancel" onclick="closeModal()">Отмена</button>
<button class="modal-btn modal-btn-primary" onclick="saveWeeklyHealth()">Записать</button>
</div>`);
}
async function saveWeeklyHealth() {
const btn = document.querySelector('#overlay .modal-btn-primary');
if (btn.classList.contains('btn-saving')) return;
btn.classList.add('btn-saving'); btn.textContent = 'Записываю…';
const vals = {
workoutDays: v('wh-workoutDays'), trainings: v('wh-trainings'),
duration: v('wh-duration'), pulse: v('wh-pulse'),
deepSleep: v('wh-deepSleep'), lightSleep: v('wh-lightSleep'), remSleep: v('wh-remSleep'),
bads: v('wh-bads')
};
const r = await call({
action: 'add_weekly_health',
...vals, cycle: v('wh-cycle')
});
closeModal();
if (r.error) { showToast('Ошибка: ' + r.error); return; }
localStorage.setItem('lastWeeklyHealth', JSON.stringify(vals));
showToast('✓ Данные за неделю записаны');
loaded.delete('health'); if (activeTab==='health') loadHealth();
}
function openModal(html) {
document.getElementById('modal-body').innerHTML = '<div class="modal-handle"></div>' + html;
document.getElementById('overlay').classList.remove('gone');
}
function closeModal() { document.getElementById('overlay').classList.add('gone'); }
function overlayClick(e) { if (e.target === document.getElementById('overlay')) closeModal(); }
function v(id) { return (document.getElementById(id)?.value || '').trim(); }
function esc(s) { return s.replace(/'/g,"&#39;"); }
function r1(v) {
if (v === '' || v === null || v === undefined) return null;
const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
return isNaN(n) ? null : Math.round(n * 10) / 10;
}
function pDays(n) { return n===1?'день':n>=2&&n<=4?'дня':'дней'; }
function autoH(el) { el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,110)+'px'; }
function showToast(text) {
const t = document.getElementById('toast');
t.textContent = text;
t.classList.add('show');
clearTimeout(t._timer);
t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}
checkAuth();
