// ===== 尚融成长网站 - 前端 =====
const API = '';  // 同源，留空

let currentPage = 'home';
let selectedMood = '😄';
const MOODS = ['😄','🤩','😊','🙂','😐','😔','😤','😢'];

// ===== 工具函数 =====
function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

async function api(method, path, body) {
  const opts = { method, headers: {} };
  if (body instanceof FormData) {
    opts.body = body;
  } else if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${API}/api${path}`, opts);
  return res.json();
}

// ===== 页面切换 =====
function switchPage(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  if (page === 'diary') renderDiary();
  if (page === 'learn') renderLearn();
  if (page === 'shine') renderShine();
  if (page === 'tech') renderTech();
  if (page === 'home') updateHomePage();
  // 移动端自动收起侧边栏
  if (window.innerWidth < 768) {
    document.getElementById('sidebar').classList.add('collapsed');
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ===== 弹窗 =====
function openModal(id) {
  document.getElementById(id).classList.add('active');
  if (id === 'modal-diary') renderMoodPicker();
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// ===== 灯箱 =====
function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('active');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
}

// ===== 首页 =====
async function updateHomePage() {
  // 问候语
  const h = new Date().getHours();
  let greet = h < 6 ? '夜深了' : h < 12 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
  document.getElementById('greeting').innerHTML = `<h2>${greet}，永远的神 🌟</h2><p style="color:var(--text2);margin-top:4px">${today()}</p>`;

  // 统计
  const [diary, shines, progress] = await Promise.all([
    api('GET', '/diary'),
    api('GET', '/shines'),
    api('GET', '/progress')
  ]);
  const omCount = progress.doneOM ? progress.doneOM.length : 0;
  const unitCount = progress.doneUnits ? progress.doneUnits.length : 0;

  document.getElementById('stats-grid').innerHTML = `<div class="home-sections" style="grid-template-columns:repeat(4,1fr)">
    <div class="home-section-card" style="border-left:3px solid var(--accent)">
      <div class="card-icon">📝</div>
      <h3>日记</h3>
      <p>记录每天的心情和故事</p>
      <div class="count">${diary.length} 篇</div>
    </div>
    <div class="home-section-card" style="border-left:3px solid var(--pink)">
      <div class="card-icon">✨</div>
      <h3>闪光时刻</h3>
      <p>每一个精彩瞬间</p>
      <div class="count">${shines.length} 个</div>
    </div>
    <div class="home-section-card" style="border-left:3px solid var(--accent2)">
      <div class="card-icon">🧮</div>
      <h3>奥数进度</h3>
      <p>每天进步一点点</p>
      <div class="count">${omCount} 关</div>
    </div>
    <div class="home-section-card" style="border-left:3px solid var(--orange)">
      <div class="card-icon">📚</div>
      <h3>课程完成</h3>
      <p>语数英学习进度</p>
      <div class="count">${unitCount} 单元</div>
    </div></div>
  `;

  // 最近日记
  document.getElementById('home-diary').innerHTML = diary.slice(0, 3).map(d =>
    `<div class="home-card"><span class="mood-emoji">${d.mood}</span><div><strong>${d.title}</strong><p style="color:var(--text2);font-size:12px">${d.date}</p></div></div>`
  ).join('') || '<div class="empty-state"><p>还没有日记，快去写一篇吧！</p></div>';

  // 最近闪光
  document.getElementById('home-shines').innerHTML = shines.slice(0, 4).map(s =>
    `<div class="home-card"><span class="mood-emoji">${s.icon}</span><div><strong>${s.title}</strong><p style="color:var(--text2);font-size:12px">${s.date}</p></div></div>`
  ).join('') || '<div class="empty-state"><p>还没有闪光时刻</p></div>';
}

// ===== 日记 =====
function renderMoodPicker() {
  document.getElementById('mood-picker').innerHTML = MOODS.map(m =>
    `<span class="mood-opt${m===selectedMood?' selected':''}" onclick="pickMood('${m}')">${m}</span>`
  ).join('');
}
function pickMood(m) { selectedMood = m; renderMoodPicker(); }

async function renderDiary() {
  const diary = await api('GET', '/diary');
  document.getElementById('diary-list').innerHTML = diary.map(d => `
    <div class="diary-card">
      <div class="diary-header">
        <span class="diary-mood">${d.mood}</span>
        <strong class="diary-title">${d.title}</strong>
        <span class="diary-date">${d.date}</span>
        <button class="btn-icon" onclick="deleteDiary(${d.id})" title="删除">🗑️</button>
      </div>
      <p class="diary-content">${d.content}</p>
    </div>
  `).join('') || '<div class="empty-state"><div class="emoji">📝</div><p>还没有日记，点击右上角写一篇吧</p></div>';
}

async function saveDiary() {
  const title = document.getElementById('diary-title').value.trim();
  const content = document.getElementById('diary-content').value.trim();
  if (!title) return;
  await api('POST', '/diary', { mood: selectedMood, title, content, date: today() });
  document.getElementById('diary-title').value = '';
  document.getElementById('diary-content').value = '';
  closeModal('modal-diary');
  renderDiary();
  updateHomePage();
}

async function deleteDiary(id) {
  if (!confirm('确定删除这篇日记吗？')) return;
  await api('DELETE', `/diary/${id}`);
  renderDiary();
  updateHomePage();
}

// ===== 学习进度 =====
const SUBJECTS = {
  chinese: { name: '语文', icon: '📖', units: 8 },
  math: { name: '数学', icon: '🔢', units: 6 },
  english: { name: '英语', icon: '🔤', units: 6 },
  olympiad: { name: '奥数', icon: '🧮', units: 20 }
};

async function renderLearn() {
  const progress = await api('GET', '/progress');
  const done = new Set([...(progress.doneUnits||[]), ...(progress.doneOM||[])]);

  document.getElementById('learn-grid').innerHTML = Object.entries(SUBJECTS).map(([key, sub]) => {
    const unitCount = sub.units;
    const completed = [...Array(unitCount)].filter((_, i) => done.has(`${key}_${i+1}`)).length;
    const pct = Math.round(completed / unitCount * 100);
    return `
      <div class="learn-card">
        <h3>${sub.icon} ${sub.name}</h3>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <p class="progress-text">${completed}/${unitCount} 完成 (${pct}%)</p>
        <div class="unit-grid">
          ${[...Array(unitCount)].map((_, i) => {
            const uid = `${key}_${i+1}`;
            const isDone = done.has(uid);
            return `<button class="unit-btn${isDone?' done':''}" onclick="toggleUnit('${key}','${uid}',${!isDone})">${i+1}</button>`;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

async function toggleUnit(subject, unit, completed) {
  if (completed) {
    await api('POST', `/progress/${subject}/${unit}`);
  } else {
    await api('DELETE', `/progress/${subject}/${unit}`);
  }
  renderLearn();
  updateHomePage();
}

// ===== 闪光时刻 =====
async function renderShine() {
  const shines = await api('GET', '/shines');
  const wall = document.getElementById('shine-wall');
  if (!shines.length) {
    wall.innerHTML = '<div class="empty-state"><div class="emoji">✨</div><p>还没有闪光时刻，添加第一个吧！</p></div>';
    return;
  }
  wall.innerHTML = shines.map(s => `
    <div class="shine-card">
      ${s.photoUrl ? `<img src="${s.photoUrl}" class="shine-photo" onclick="openLightbox('${s.photoUrl}')">` : ''}
      <div class="shine-info">
        <span class="shine-icon">${s.icon}</span>
        <strong>${s.title}</strong>
        <p class="shine-desc">${s.description}</p>
        <span class="shine-date">${s.date}</span>
      </div>
      <button class="btn-icon shine-del" onclick="deleteShine(${s.id})">🗑️</button>
    </div>
  `).join('');
}

async function saveShine() {
  const title = document.getElementById('shine-title').value.trim();
  const type = document.getElementById('shine-type').value;
  const desc = document.getElementById('shine-desc').value.trim();
  const photo = document.getElementById('shine-photo').files[0];
  if (!title) return;
  const icon = type.split(' ')[0];
  const fd = new FormData();
  fd.append('title', title);
  fd.append('type', type);
  fd.append('icon', icon);
  fd.append('description', desc);
  fd.append('date', today());
  if (photo) fd.append('photo', photo);
  await api('POST', '/shines', fd);
  document.getElementById('shine-title').value = '';
  document.getElementById('shine-desc').value = '';
  document.getElementById('shine-photo').value = '';
  closeModal('modal-shine');
  renderShine();
  updateHomePage();
}

async function deleteShine(id) {
  if (!confirm('确定删除这个闪光时刻吗？')) return;
  await api('DELETE', `/shines/${id}`);
  renderShine();
  updateHomePage();
}

// ===== 科技探索 =====
async function renderTech() {
  const techs = await api('GET', '/tech');
  document.getElementById('tech-list').innerHTML = techs.map(t => `
    <div class="tech-card">
      <div class="tech-header">
        <strong>${t.title}</strong>
        <button class="btn-icon" onclick="deleteTech(${t.id})">🗑️</button>
      </div>
      <p class="tech-summary">${t.summary}</p>
      <span class="tech-date">${t.date}</span>
    </div>
  `).join('') || '<div class="empty-state"><div class="emoji">🔬</div><p>还没有科技新闻</p></div>';
}

async function saveTech() {
  const title = document.getElementById('tech-title').value.trim();
  const summary = document.getElementById('tech-summary').value.trim();
  if (!title) return;
  await api('POST', '/tech', { title, summary, source: '', date: today() });
  document.getElementById('tech-title').value = '';
  document.getElementById('tech-summary').value = '';
  closeModal('modal-tech');
  renderTech();
  updateHomePage();
}

async function deleteTech(id) {
  if (!confirm('确定删除这条新闻吗？')) return;
  await api('DELETE', `/tech/${id}`);
  renderTech();
  updateHomePage();
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  updateHomePage();
  // 移动端默认收起侧边栏
  if (window.innerWidth < 768) {
    document.getElementById('sidebar').classList.add('collapsed');
  }
});
