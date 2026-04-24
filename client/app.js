// ============================================================
// 尚融成长网站 - JavaScript v3.0 (前端路由版)
// ============================================================

const API = window.location.origin;
let selectedMood = '😄';
const MOODS = ['😄','🤩','😊','🙂','😐','😔','😤','😢'];

// ============================================================
// 路由系统
// ============================================================

const routes = {
  '/': 'home',
  '/diary': 'diary',
  '/chinese': 'chinese',
  '/math': 'math',
  '/english': 'english',
  '/olympiad': 'olympiad',
  '/guitar': 'guitar',
  '/shine': 'shine',
  '/tech': 'tech'
};

function getRoute() {
  const path = window.location.pathname;
  return routes[path] || 'home';
}

function navigate(path) {
  window.history.pushState({}, '', path);
  renderRoute();
}

function renderRoute() {
  const page = getRoute();
  updateNavActive(page);
  
  const main = document.getElementById('main-content');
  if (!main) return;
  
  switch(page) {
    case 'home': renderHome(main); break;
    case 'diary': renderDiaryPage(main); break;
    case 'chinese': renderSubjectPage(main, '语文', '📚', 'chinese'); break;
    case 'math': renderSubjectPage(main, '数学', '🔢', 'math'); break;
    case 'english': renderSubjectPage(main, '英语', '🔤', 'english'); break;
    case 'olympiad': renderOlympiadPage(main); break;
    case 'guitar': renderGuitarPage(main); break;
    case 'shine': renderShinePage(main); break;
    case 'tech': renderTechPage(main); break;
    default: renderHome(main);
  }
  
  window.scrollTo(0, 0);
}

function updateNavActive(page) {
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active');
    const href = n.getAttribute('href');
    if (href === '/' && page === 'home') n.classList.add('active');
    if (href === '/' + page) n.classList.add('active');
  });
}

// ============================================================
// 初始化
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // 拦截所有导航链接
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('http') && !link.getAttribute('href').startsWith('#')) {
      e.preventDefault();
      navigate(link.getAttribute('href'));
    }
  });
  
  // 浏览器前进后退
  window.addEventListener('popstate', renderRoute);
  
  // 初始渲染
  renderRoute();
});

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
// 页面渲染函数
// ============================================================

// --- 首页 ---
async function renderHome(container) {
  container.innerHTML = `
    <div class="hero">
      <div class="hero-greeting" id="greeting">你好</div>
      <h1 class="hero-title">永远的神的星球</h1>
      <p class="hero-subtitle">记录成长，发现光芒 ✨</p>
      <button class="btn btn-primary btn-lg" onclick="openModal('modal-diary')">✍️ 记录今日</button>
    </div>
    
    <div class="home-grid">
      <div class="home-section-card" onclick="navigate('/diary')">
        <div class="home-section-icon">📝</div>
        <div class="home-section-title">成长日记</div>
        <div class="home-section-count" id="diary-count">加载中...</div>
      </div>
      <div class="home-section-card" onclick="navigate('/shine')">
        <div class="home-section-icon">✨</div>
        <div class="home-section-title">闪光时刻</div>
        <div class="home-section-count" id="shine-count">加载中...</div>
      </div>
      <div class="home-section-card" onclick="navigate('/guitar')">
        <div class="home-section-icon">🎸</div>
        <div class="home-section-title">吉他练习</div>
        <div class="home-section-count" id="guitar-count">加载中...</div>
      </div>
      <div class="home-section-card" onclick="navigate('/tech')">
        <div class="home-section-icon">🚀</div>
        <div class="home-section-title">科技探索</div>
        <div class="home-section-count" id="tech-count">加载中...</div>
      </div>
    </div>
    
    <div class="section-header">
      <h2 class="section-title">📋 今日任务</h2>
    </div>
    <div class="task-list" id="today-tasks"></div>
    
    <div class="section-header">
      <h2 class="section-title">📝 最近日记</h2>
      <button class="btn btn-text" onclick="navigate('/diary')">查看全部 →</button>
    </div>
    <div id="recent-diary"></div>
    
    <div class="section-header">
      <h2 class="section-title">✨ 最近闪光</h2>
      <button class="btn btn-text" onclick="navigate('/shine')">查看全部 →</button>
    </div>
    <div id="recent-shine"></div>
  `;
  
  // 加载数据
  updateGreeting();
  loadHomeData();
}

function updateGreeting() {
  const hour = new Date().getHours();
  let text = '你好';
  if (hour < 12) text = '早上好 ☀️';
  else if (hour < 18) text = '下午好 🌤️';
  else text = '晚上好 🌙';
  const el = document.getElementById('greeting');
  if (el) el.textContent = text + '，永远的神！';
}

async function loadHomeData() {
  try {
    const [diary, shines, guitar, tech] = await Promise.all([
      api('GET', '/diary'),
      api('GET', '/shines'),
      api('GET', '/guitar'),
      api('GET', '/tech')
    ]);
    
    document.getElementById('diary-count').textContent = `${diary.length} 篇日记`;
    document.getElementById('shine-count').textContent = `${shines.length} 个闪光`;
    document.getElementById('guitar-count').textContent = `${guitar.length} 次练习`;
    document.getElementById('tech-count').textContent = `${tech.length} 条新闻`;
    
    // 今日任务
    renderTodayTasks();
    
    // 最近日记
    const recentDiary = diary.slice(0, 3);
    document.getElementById('recent-diary').innerHTML = recentDiary.length ? recentDiary.map(d => `
      <div class="diary-item" onclick="navigate('/diary')">
        <span class="diary-mood">${d.mood}</span>
        <div class="diary-body">
          <div class="diary-meta"><span class="diary-date">${formatDate(d.date)}</span></div>
          <div class="diary-title">${d.title}</div>
          <div class="diary-preview">${d.content}</div>
        </div>
      </div>
    `).join('') : '<p style="color:var(--text-3)">还没有日记</p>';
    
    // 最近闪光
    const recentShine = shines.slice(0, 3);
    document.getElementById('recent-shine').innerHTML = recentShine.length ? recentShine.map(s => `
      <div class="shine-card" onclick="navigate('/shine')">
        <div class="shine-title">${s.title}</div>
        <div class="shine-date">${formatDate(s.date)}</div>
      </div>
    `).join('') : '<p style="color:var(--text-3)">还没有闪光时刻</p>';
    
  } catch (err) {
    console.error('加载首页数据失败:', err);
  }
}

function renderTodayTasks() {
  const tasks = [
    { id: 'task-diary', text: '写一篇日记', done: false },
    { id: 'task-guitar', text: '练习吉他15分钟', done: false },
    { id: 'task-olympiad', text: '做一道奥数题', done: false },
    { id: 'task-read', text: '阅读30分钟', done: false }
  ];
  
  document.getElementById('today-tasks').innerHTML = tasks.map(t => `
    <div class="task-item" id="${t.id}" onclick="toggleTask('${t.id}')">
      <div class="task-checkbox"></div>
      <span class="task-text">${t.text}</span>
    </div>
  `).join('');
}

function toggleTask(id) {
  const el = document.getElementById(id);
  el.classList.toggle('done');
}

// --- 日记页 ---
async function renderDiaryPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">📝 成长日记</h1>
      <button class="btn btn-primary" onclick="openModal('modal-diary')">✍️ 写日记</button>
    </div>
    <div id="diary-list"></div>
  `;
  
  try {
    const diary = await api('GET', '/diary');
    console.log('📔 日记数据:', diary);
    
    if (!diary || !Array.isArray(diary) || diary.length === 0) {
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
  } catch (err) {
    console.error('❌ 加载日记失败:', err);
    document.getElementById('diary-list').innerHTML = `
      <div class="empty-state">
        <span class="emoji">⚠️</span>
        <p>加载失败<br>请检查网络连接</p>
      </div>
    `;
  }
}

function viewDiaryDetail(id) {
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
  renderRoute();
}

async function deleteDiary(id) {
  if (!confirm('确定要删除这篇日记吗？')) return;
  await api('DELETE', `/diary/${id}`);
  renderRoute();
}

function selectMood(mood) {
  selectedMood = mood;
  document.querySelectorAll('.mood-item').forEach(m => m.classList.remove('selected'));
  event.target.classList.add('selected');
}

// --- 学科页面 ---
function renderSubjectPage(container, name, icon, key) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${icon} ${name}学习</h1>
    </div>
    <div class="subject-progress">
      <h3>📊 学习进度</h3>
      <div class="progress-bar"><div class="progress-fill" style="width:30%"></div></div>
      <p>已完成 3/10 个单元</p>
    </div>
    <div class="unit-list">
      <div class="unit-card">
        <div class="unit-title">第一单元</div>
        <div class="unit-status">✅ 已完成</div>
      </div>
      <div class="unit-card">
        <div class="unit-title">第二单元</div>
        <div class="unit-status">📝 进行中</div>
      </div>
      <div class="unit-card locked">
        <div class="unit-title">第三单元</div>
        <div class="unit-status">🔒 未解锁</div>
      </div>
    </div>
  `;
}

// --- 奥数页面 ---
function renderOlympiadPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">🧠 奥数挑战</h1>
    </div>
    <div class="olympiad-section">
      <div class="problem-card">
        <div class="problem-title">🎯 今日题目</div>
        <div class="problem-content">
          <p>小明有10颗糖，给了小红3颗，又买了5颗，现在有几颗？</p>
        </div>
        <div class="problem-answer">
          <input type="text" class="input" placeholder="你的答案">
          <button class="btn btn-primary">提交答案</button>
        </div>
      </div>
    </div>
  `;
}

// --- 吉他页面 ---
async function renderGuitarPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">🎸 吉他练习</h1>
      <button class="btn btn-primary" onclick="document.getElementById('guitar-video').click()">📹 上传视频</button>
    </div>
    <input type="file" id="guitar-video" accept="video/*" style="display:none" onchange="uploadGuitarVideo(this)">
    <div id="guitar-content"></div>
  `;
  
  try {
    const practices = await api('GET', '/guitar');
    if (practices.length === 0) {
      document.getElementById('guitar-content').innerHTML = `
        <div class="empty-state">
          <span class="emoji">🎸</span>
          <p>还没有练习记录<br>上传你的第一个视频吧</p>
        </div>
      `;
      return;
    }
    
    const latest = practices[0];
    document.getElementById('guitar-content').innerHTML = `
      <div class="guitar-latest">
        <h3>🎵 最新练习</h3>
        <video controls src="${latest.videoUrl}" style="width:100%;border-radius:12px"></video>
        <div class="guitar-info">
          <p>🎵 曲目: ${latest.song || '未知'}</p>
          <p>📅 日期: ${formatDate(latest.date)}</p>
          <p>⚡ BPM: ${latest.bpm || '-'}</p>
        </div>
      </div>
      <h3>📚 练习历史</h3>
      <div class="guitar-list">
        ${practices.map(p => `
          <div class="guitar-item">
            <span>${p.song || '练习'}</span>
            <span>${formatDate(p.date)}</span>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error('加载吉他数据失败:', err);
  }
}

async function uploadGuitarVideo(input) {
  const file = input.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('video', file);
  formData.append('song', '练习曲');
  
  try {
    await api('POST', '/guitar', formData);
    alert('✅ 视频上传成功！');
    renderRoute();
  } catch (err) {
    alert('❌ 上传失败');
    console.error(err);
  }
}

// --- 闪光时刻页面 ---
async function renderShinePage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">✨ 闪光时刻</h1>
      <button class="btn btn-primary" onclick="openModal('modal-shine')">📸 记录闪光</button>
    </div>
    <div id="shine-list"></div>
  `;
  
  try {
    const shines = await api('GET', '/shines');
    if (!shines || shines.length === 0) {
      document.getElementById('shine-list').innerHTML = `
        <div class="empty-state">
          <span class="emoji">✨</span>
          <p>还没有闪光时刻<br>点击右上角记录一个吧</p>
        </div>
      `;
      return;
    }
    
    document.getElementById('shine-list').innerHTML = shines.map(s => `
      <div class="shine-card">
        <div class="shine-title">${s.title}</div>
        <div class="shine-type">${s.type}</div>
        <div class="shine-date">${formatDate(s.date)}</div>
        ${s.image ? `<img src="${s.image}" style="width:100%;border-radius:8px;margin-top:8px">` : ''}
      </div>
    `).join('');
  } catch (err) {
    console.error('加载闪光时刻失败:', err);
  }
}

async function saveShine() {
  const title = document.getElementById('shine-title').value.trim();
  const type = document.getElementById('shine-type').value;
  const desc = document.getElementById('shine-desc').value.trim();
  
  if (!title) {
    alert('请输入标题');
    return;
  }
  
  await api('POST', '/shines', { title, type, description: desc, date: today() });
  closeModal('modal-shine');
  renderRoute();
}

// --- 科技探索页面 ---
async function renderTechPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">🚀 科技探索</h1>
    </div>
    <div id="tech-list"></div>
  `;
  
  try {
    const news = await api('GET', '/tech');
    if (!news || news.length === 0) {
      document.getElementById('tech-list').innerHTML = `
        <div class="empty-state">
          <span class="emoji">🚀</span>
          <p>还没有科技新闻<br>稍后再来看看吧</p>
        </div>
      `;
      return;
    }
    
    document.getElementById('tech-list').innerHTML = news.map(n => `
      <div class="tech-card">
        <div class="tech-title">${n.title}</div>
        <div class="tech-summary">${n.summary}</div>
        <div class="tech-date">${formatDate(n.date)}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('加载科技新闻失败:', err);
  }
}

// ============================================================
// 弹窗系统
// ============================================================

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// 点击弹窗外部关闭
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.parentElement.classList.remove('active');
  }
});

// ============================================================
// 侧边栏
// ============================================================

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ============================================================
// 打卡系统
// ============================================================

async function checkIn() {
  const today = new Date().toDateString();
  const lastCheckIn = localStorage.getItem('lastCheckIn');
  
  if (lastCheckIn === today) {
    alert('今天已经打卡过了！');
    return;
  }
  
  localStorage.setItem('lastCheckIn', today);
  
  const streak = parseInt(localStorage.getItem('checkInStreak') || '0') + 1;
  localStorage.setItem('checkInStreak', streak);
  
  alert(`🎉 打卡成功！连续打卡 ${streak} 天`);
  renderRoute();
}

// 导出函数供HTML调用
window.navigate = navigate;
window.openModal = openModal;
window.closeModal = closeModal;
window.saveDiary = saveDiary;
window.deleteDiary = deleteDiary;
window.selectMood = selectMood;
window.saveShine = saveShine;
window.uploadGuitarVideo = uploadGuitarVideo;
window.toggleTask = toggleTask;
window.toggleSidebar = toggleSidebar;
window.checkIn = checkIn;
