// ============================================================
// 尚融成长网站 - JavaScript v2.0
// ============================================================

const API = '';
let currentPage = 'home';
let selectedMood = '😄';
const MOODS = ['😄','🤩','😊','🙂','😐','😔','😤','😢'];
const TODAY_KEY = 'shengrong_today_' + (() => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
})();

// ============================================================
// 工具函数
// ============================================================

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth()+1}月${d.getDate()}日`;
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

// ============================================================
// 页面切换
// ============================================================

function switchPage(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });
  
  if (page === 'diary') renderDiary();
  if (page === 'learn') renderLearn();
  if (page === 'shine') renderShine();
  if (page === 'tech') renderTech();
  if (page === 'home') updateHomePage();
  if (page === 'guitar') updateGuitarPage();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ============================================================
// 弹窗
// ============================================================

function openModal(id) {
  document.getElementById(id).classList.add('active');
  if (id === 'modal-diary') renderMoodPicker();
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// ============================================================
// 灯箱
// ============================================================

function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('active');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
}

// ============================================================
// 首页
// ============================================================

async function updateHomePage() {
  // 问候语
  const h = new Date().getHours();
  let greet = h < 6 ? '夜深了，注意休息' : h < 9 ? '早上好，新的一天' : h < 12 ? '上午好' : h < 14 ? '中午好' : h < 18 ? '下午好' : h < 21 ? '晚上好' : '夜深了';
  document.getElementById('greeting').textContent = `${greet}，尚融 🌟`;
  document.getElementById('hero-date').textContent = today();
  
  // 加载数据
  const [diary, shines, progress] = await Promise.all([
    api('GET', '/diary'),
    api('GET', '/shines'),
    api('GET', '/progress')
  ]);
  
  // 统计数据
  const omCount = progress.doneOM ? progress.doneOM.length : 0;
  const unitCount = progress.doneUnits ? progress.doneUnits.length : 0;
  document.getElementById('stat-diary').textContent = diary.length;
  document.getElementById('stat-shine').textContent = shines.length;
  
  // 计算等级（每3篇日记或2个闪光+1个学习单元升一级）
  const level = Math.min(10, Math.floor((diary.length * 1 + shines.length * 1.5 + unitCount * 0.5 + omCount * 0.3) / 3));
  document.getElementById('level-num').textContent = level || 1;
  const pct = Math.min(100, (diary.length * 1 + shines.length * 1.5 + unitCount * 0.5 + omCount * 0.3) / 30 * 100);
  document.getElementById('level-circle').style.strokeDashoffset = 213.6 * (1 - pct / 100);
  
  // 快捷卡片进度
  const totalUnits = 8 + 6 + 6 + 20; // 语文+数学+英语+奥数
  const doneUnits = unitCount + omCount;
  document.getElementById('learn-bar').style.width = (doneUnits / totalUnits * 100) + '%';
  document.getElementById('learn-count').textContent = `${Math.round(doneUnits / totalUnits * 100)}% 完成`;
  
  document.getElementById('guitar-count').textContent = '1 首开始';
  
  const shinePct = Math.min(100, shines.length * 10);
  document.getElementById('shine-bar').style.width = shinePct + '%';
  document.getElementById('shine-count').textContent = shines.length + ' 个闪光';
  
  // 今日任务
  loadTodayTasks();
  
  // 最近日记
  if (diary.length === 0) {
    document.getElementById('home-diary').innerHTML = '<div class="news-item"><span class="news-icon">📝</span><div class="news-body"><div class="news-title">还没有日记</div><div class="news-date">点击右上角写一篇吧</div></div></div>';
  } else {
    document.getElementById('home-diary').innerHTML = diary.slice(0, 4).map(d => `
      <div class="news-item" onclick="switchPage('diary')">
        <span class="news-icon">${d.mood}</span>
        <div class="news-body">
          <div class="news-title">${d.title}</div>
          <div class="news-date">${formatDate(d.date)}</div>
        </div>
      </div>
    `).join('');
  }
  
  // 最近闪光
  if (shines.length === 0) {
    document.getElementById('home-shines').innerHTML = '<div class="news-item"><span class="news-icon">✨</span><div class="news-body"><div class="news-title">还没有闪光时刻</div><div class="news-date">记录第一个精彩瞬间吧</div></div></div>';
  } else {
    document.getElementById('home-shines').innerHTML = `
      <div class="photo-scroll">
        ${shines.slice(0, 6).map(s => `
          <div class="photo-thumb" ${s.photoUrl ? `onclick="openLightbox('${s.photoUrl}')"` : ''}>
            ${s.photoUrl ? `<img src="${s.photoUrl}" alt="${s.title}">` : `<div style="padding:20px;text-align:center;font-size:24px">${s.icon || '✨'}</div>`}
            <div class="photo-caption">${s.title}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// ============================================================
// 今日任务
// ============================================================

function loadTodayTasks() {
  const tasks = JSON.parse(localStorage.getItem(TODAY_KEY) || '{"diary":false,"guitar":false,"om":false,"read":false}');
  document.querySelectorAll('.today-task').forEach(el => {
    const task = el.dataset.task;
    el.classList.toggle('done', tasks[task]);
    el.querySelector('.task-check').textContent = tasks[task] ? '✓' : '○';
  });
  updateTaskProgress();
}

function toggleTask(el) {
  const task = el.dataset.task;
  const tasks = JSON.parse(localStorage.getItem(TODAY_KEY) || '{"diary":false,"guitar":false,"om":false,"read":false}');
  tasks[task] = !tasks[task];
  localStorage.setItem(TODAY_KEY, JSON.stringify(tasks));
  el.classList.toggle('done', tasks[task]);
  el.querySelector('.task-check').textContent = tasks[task] ? '✓' : '○';
  updateTaskProgress();
  
  if (tasks[task]) {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'taskDone 0.3s ease';
  }
}

function updateTaskProgress() {
  const tasks = JSON.parse(localStorage.getItem(TODAY_KEY) || '{"diary":false,"guitar":false,"om":false,"read":false}');
  const done = Object.values(tasks).filter(Boolean).length;
  document.getElementById('today-progress').textContent = `${done}/4`;
}

// ============================================================
// 日记
// ============================================================

function renderMoodPicker() {
  document.getElementById('mood-picker').innerHTML = MOODS.map(m =>
    `<span class="mood-opt${m===selectedMood?' selected':''}" onclick="pickMood('${m}')">${m}</span>`
  ).join('');
}

function pickMood(m) {
  selectedMood = m;
  renderMoodPicker();
}

async function renderDiary() {
  const diary = await api('GET', '/diary');
  if (diary.length === 0) {
    document.getElementById('diary-list').innerHTML = `
      <div class="empty-state">
        <span class="emoji">📝</span>
        <p>还没有日记<br>点击右上角写一篇吧</p>
      </div>
    `;
    return;
  }
  
  document.getElementById('diary-list').innerHTML = diary.map(d => `
    <div class="diary-item" onclick="viewDiaryDetail(${d.id})">
      <span class="diary-mood">${d.mood}</span>
      <div class="diary-body">
        <div class="diary-meta">
          <span class="diary-date">${formatDate(d.date)}</span>
        </div>
        <div class="diary-title">${d.title}</div>
        <div class="diary-preview">${d.content}</div>
        <div class="diary-actions">
          <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteDiary(${d.id})">🗑️ 删除</button>
        </div>
      </div>
    </div>
  `).join('');
}

function viewDiaryDetail(id) {
  // 简单显示详情
  alert('日记详情开发中...');
}

async function saveDiary() {
  const title = document.getElementById('diary-title').value.trim();
  const content = document.getElementById('diary-content').value.trim();
  if (!title) {
    alert('请输入标题');
    return;
  }
  
  await api('POST', '/diary', { mood: selectedMood, title, content, date: today() });
  document.getElementById('diary-title').value = '';
  document.getElementById('diary-content').value = '';
  closeModal('modal-diary');
  renderDiary();
  
  // 标记日记任务完成
  const tasks = JSON.parse(localStorage.getItem(TODAY_KEY) || '{}');
  tasks.diary = true;
  localStorage.setItem(TODAY_KEY, JSON.stringify(tasks));
  loadTodayTasks();
}

async function deleteDiary(id) {
  if (!confirm('确定删除这篇日记吗？')) return;
  await api('DELETE', `/diary/${id}`);
  renderDiary();
}

// ============================================================
// 学习
// ============================================================

const SUBJECTS = {
  chinese: { name: '语文', icon: '📖', units: 8, color: 'var(--accent)' },
  math: { name: '数学', icon: '🔢', units: 6, color: 'var(--accent2)' },
  english: { name: '英语', icon: '🔤', units: 6, color: 'var(--pink)' },
  olympiad: { name: '奥数', icon: '🧮', units: 20, color: 'var(--yellow)' }
};

async function renderLearn() {
  const progress = await api('GET', '/progress');
  const done = new Set([...(progress.doneUnits||[]), ...(progress.doneOM||[])]);
  
  let html = '';
  for (const [key, sub] of Object.entries(SUBJECTS)) {
    const unitCount = sub.units;
    const completed = [...Array(unitCount)].filter((_, i) => done.has(`${key}_${i+1}`)).length;
    const pct = unitCount > 0 ? Math.round(completed / unitCount * 100) : 0;
    
    html += `
      <div class="learn-section">
        <h3 class="learn-section-title">${sub.icon} ${sub.name}</h3>
        <div class="learn-progress">
          <div class="progress-header">
            <span class="progress-title">${sub.icon} ${sub.name}</span>
            <span style="color:var(--text2);font-size:12px">${completed}/${unitCount}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%;background:linear-gradient(90deg,${sub.color},${sub.color}88)"></div>
          </div>
          <div class="progress-pct">${pct}% 完成</div>
          <div class="unit-grid">
            ${[...Array(unitCount)].map((_, i) => {
              const uid = `${key}_${i+1}`;
              const isDone = done.has(uid);
              return `<button class="unit-btn${isDone?' done':''}" onclick="toggleUnit('${key}','${uid}',${!isDone})">${i+1}</button>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }
  
  document.getElementById('learn-content').innerHTML = html;
}

async function toggleUnit(subject, unit, completed) {
  if (completed) {
    await api('POST', `/progress/${subject}/${unit}`);
  } else {
    await api('DELETE', `/progress/${subject}/${unit}`);
  }
  renderLearn();
}

// ============================================================
// 吉他
// ============================================================

async function updateGuitarPage() {
  // 获取练习次数（从闪光时刻中统计吉他相关）
  const shines = await api('GET', '/shines');
  const guitarShines = shines.filter(s => s.type && s.type.includes('吉他'));
  document.getElementById('guitar-total').textContent = guitarShines.length;
  
  // 简单统计已学曲目
  const songsLearned = guitarShines.filter(s => s.title && (s.title.includes('两只老虎') || s.title.includes('完成'))).length;
  document.getElementById('guitar-songs').textContent = songsLearned;
}

// ============================================================
// 闪光时刻
// ============================================================

async function renderShine() {
  const shines = await api('GET', '/shines');
  
  if (shines.length === 0) {
    document.getElementById('shine-wall').innerHTML = `
      <div class="empty-state">
        <span class="emoji">✨</span>
        <p>还没有闪光时刻<br>点击右上角添加第一个吧</p>
      </div>
    `;
    return;
  }
  
  document.getElementById('shine-wall').innerHTML = shines.map(s => {
    const typeClass = s.type ? s.type.includes('荣誉') ? 'yellow' : 
                             s.type.includes('吉他') ? 'green' :
                             s.type.includes('运动') ? 'orange' :
                             s.type.includes('绘画') ? 'purple' : '' : '';
    return `
      <div class="shine-card">
        ${s.photoUrl ? `<img src="${s.photoUrl}" class="shine-photo" onclick="openLightbox('${s.photoUrl}')">` : 
          `<div class="shine-placeholder">${s.icon || '✨'}</div>`}
        <div class="shine-info">
          <span class="shine-icon-tag tag ${typeClass}">${s.type || '💡'}</span>
          <div class="shine-title">${s.title}</div>
          <div class="shine-desc">${s.description || ''}</div>
          <span class="shine-date">${formatDate(s.date)}</span>
        </div>
        <button class="shine-delete" onclick="event.stopPropagation();deleteShine(${s.id})">🗑️</button>
      </div>
    `;
  }).join('');
}

async function saveShine() {
  const title = document.getElementById('shine-title').value.trim();
  const type = document.getElementById('shine-type').value;
  const desc = document.getElementById('shine-desc').value.trim();
  const photo = document.getElementById('shine-photo').files[0];
  
  if (!title) {
    alert('请输入标题');
    return;
  }
  
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
}

async function deleteShine(id) {
  if (!confirm('确定删除这个闪光时刻吗？')) return;
  await api('DELETE', `/shines/${id}`);
  renderShine();
}

// ============================================================
// 科技探索
// ============================================================

async function renderTech() {
  const techs = await api('GET', '/tech');
  
  if (techs.length === 0) {
    document.getElementById('tech-list').innerHTML = `
      <div class="empty-state">
        <span class="emoji">🔬</span>
        <p>还没有科技探索<br>点击右上角添加吧</p>
      </div>
    `;
    return;
  }
  
  document.getElementById('tech-list').innerHTML = techs.map(t => `
    <div class="tech-card">
      <span class="tech-icon">🔬</span>
      <div class="tech-body">
        <div class="tech-title">${t.title}</div>
        <div class="tech-summary">${t.summary || ''}</div>
        <div class="tech-meta">
          <span class="tech-date">${formatDate(t.date)}</span>
          <button class="btn btn-sm btn-danger" onclick="deleteTech(${t.id})">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function saveTech() {
  const title = document.getElementById('tech-title').value.trim();
  const summary = document.getElementById('tech-summary').value.trim();
  
  if (!title) {
    alert('请输入标题');
    return;
  }
  
  await api('POST', '/tech', { title, summary, source: '', date: today() });
  document.getElementById('tech-title').value = '';
  document.getElementById('tech-summary').value = '';
  closeModal('modal-tech');
  renderTech();
}

async function deleteTech(id) {
  if (!confirm('确定删除吗？')) return;
  await api('DELETE', `/tech/${id}`);
  renderTech();
}

// ============================================================
// 初始化
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  updateHomePage();
  
  // 移动端默认收起
  if (window.innerWidth < 768) {
    document.getElementById('sidebar').classList.add('collapsed');
  }
});

// CSS动画
const style = document.createElement('style');
style.textContent = `
  @keyframes taskDone {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);
