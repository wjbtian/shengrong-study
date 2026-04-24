// ============================================================
// 尚融成长网站 - JavaScript v4.0 (页面分离版)
// 职责：路由 + 数据获取 + 事件绑定
// HTML 内容在 pages/*.html，样式在 style.css
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
  return routes[window.location.pathname] || 'home';
}

function navigate(path) {
  window.history.pushState({}, '', path);
  renderRoute();
}

// 加载页面 HTML 并渲染
async function renderRoute() {
  const page = getRoute();
  updateNavActive(page);
  
  const main = document.getElementById('main-content');
  if (!main) return;
  
  // 加载对应页面 HTML
  try {
    const response = await fetch(`/pages/${page}.html`);
    const html = await response.text();
    main.innerHTML = html;
    
    // 绑定页面内的事件
    bindPageEvents(page);
    
    // 加载页面数据
    loadPageData(page);
    
  } catch (err) {
    console.error('加载页面失败:', err);
    main.innerHTML = '<div class="empty-state"><span class="emoji">⚠️</span><p>页面加载失败</p></div>';
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
// 事件绑定
// ============================================================

function bindPageEvents(page) {
  // 通用：所有 data-link 元素点击导航
  document.querySelectorAll('[data-link]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.getAttribute('data-link'));
    });
  });
  
  // 首页事件
  if (page === 'home') {
    document.querySelectorAll('.task-item').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('done'));
    });
  }
  
  // 日记页事件
  if (page === 'diary') {
    const btn = document.getElementById('btn-write-diary');
    if (btn) btn.addEventListener('click', () => openModal('modal-diary'));
  }
  
  // 闪光时刻页事件
  if (page === 'shine') {
    const btn = document.getElementById('btn-add-shine');
    if (btn) btn.addEventListener('click', () => openModal('modal-shine'));
  }
}

// ============================================================
// 数据加载
// ============================================================

async function loadPageData(page) {
  switch(page) {
    case 'home': await loadHomeData(); break;
    case 'diary': await loadDiaryData(); break;
    case 'chinese': await loadSubjectData('chinese'); break;
    case 'math': await loadSubjectData('math'); break;
    case 'english': await loadSubjectData('english'); break;
    case 'olympiad': await loadOlympiadData(); break;
    case 'guitar': await loadGuitarData(); break;
    case 'shine': await loadShineData(); break;
    case 'tech': await loadTechData(); break;
  }
}

// --- 首页数据 ---
async function loadHomeData() {
  updateGreeting();
  
  try {
    const [diary, shines, guitar, tech] = await Promise.all([
      api('GET', '/diary'),
      api('GET', '/shines'),
      api('GET', '/guitar'),
      api('GET', '/tech')
    ]);
    
    document.getElementById('diary-count').textContent = (diary?.length || 0) + ' 篇';
    document.getElementById('shine-count').textContent = (shines?.length || 0) + ' 个';
    document.getElementById('guitar-count').textContent = (guitar?.length || 0) + ' 次';
    document.getElementById('tech-count').textContent = (tech?.length || 0) + ' 条';
    
    // 最近日记
    const recentDiary = (diary || []).slice(0, 3);
    document.getElementById('recent-diary').innerHTML = recentDiary.length 
      ? recentDiary.map(d => createDiaryCard(d)).join('')
      : '<p style="color:var(--text-3)">还没有日记</p>';
    
    // 最近闪光
    const recentShine = (shines || []).slice(0, 3);
    document.getElementById('recent-shine').innerHTML = recentShine.length
      ? recentShine.map(s => createShineCard(s)).join('')
      : '<p style="color:var(--text-3)">还没有闪光时刻</p>';
      
  } catch (err) {
    console.error('加载首页数据失败:', err);
  }
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

// --- 日记数据 ---
async function loadDiaryData() {
  try {
    const diary = await api('GET', '/diary');
    const container = document.getElementById('diary-list');
    if (!container) return;
    
    if (!diary || !diary.length) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="emoji">📝</span>
          <p>还没有日记<br>点击右上角写一篇吧</p>
        </div>`;
      return;
    }
    
    container.innerHTML = diary.map(d => createDiaryCard(d)).join('');
  } catch (err) {
    console.error('加载日记失败:', err);
  }
}

function createDiaryCard(d) {
  return `
    <div class="diary-item" data-id="${d.id}">
      <span class="diary-mood">${d.mood}</span>
      <div class="diary-body">
        <div class="diary-meta">
          <span class="diary-date">${formatDate(d.date)}</span>
        </div>
        <div class="diary-title">${d.title}</div>
        <div class="diary-preview">${d.content}</div>
      </div>
    </div>`;
}

// --- 科目数据 ---
async function loadSubjectData(subject) {
  const container = document.getElementById(subject + '-content');
  if (!container) return;
  container.innerHTML = '<p>科目内容加载中...</p>';
}

// --- 奥数数据 ---
async function loadOlympiadData() {
  const container = document.getElementById('olympiad-content');
  if (!container) return;
  container.innerHTML = '<p>奥数内容加载中...</p>';
}

// --- 吉他数据 ---
async function loadGuitarData() {
  const container = document.getElementById('guitar-content');
  if (!container) return;
  container.innerHTML = '<p>吉他内容加载中...</p>';
}

// --- 闪光时刻数据 ---
async function loadShineData() {
  try {
    const shines = await api('GET', '/shines');
    const container = document.getElementById('shine-content');
    if (!container) return;
    
    if (!shines || !shines.length) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="emoji">✨</span>
          <p>还没有闪光时刻<br>点击右上角记录一个吧</p>
        </div>`;
      return;
    }
    
    container.innerHTML = shines.map(s => createShineCard(s)).join('');
  } catch (err) {
    console.error('加载闪光时刻失败:', err);
  }
}

function createShineCard(s) {
  return `
    <div class="shine-card" data-id="${s.id}">
      <div class="shine-title">${s.title}</div>
      <div class="shine-date">${formatDate(s.date)}</div>
    </div>`;
}

// --- 科技数据 ---
async function loadTechData() {
  const container = document.getElementById('tech-content');
  if (!container) return;
  container.innerHTML = '<p>科技内容加载中...</p>';
}

// ============================================================
// 工具函数
// ============================================================

async function api(method, path, data) {
  const opts = { method, headers: {} };
  if (data) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(data);
  }
  const res = await fetch(API + '/api' + path, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return `${date.getMonth()+1}月${date.getDate()}日`;
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// ============================================================
// 初始化
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // 拦截导航链接
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        e.preventDefault();
        navigate(href);
      }
    }
  });
  
  // 浏览器前进/后退
  window.addEventListener('popstate', renderRoute);
  
  // 初始渲染
  renderRoute();
});
