// ============================================================
// 尚融成长网站 - JavaScript v4.0 (页面分离版)
// 职责：路由 + 数据获取 + 事件绑定
// HTML 内容在 pages/*.html，样式在 style.css
// ============================================================

// 科技感粒子初始化
function initTechParticles() {
  const container = document.getElementById('tech-particles');
  if (!container) return;
  
  const particleCount = 30;
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'tech-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 12) + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    p.style.opacity = Math.random() * 0.5 + 0.2;
    
    // 随机颜色：绿、紫、青
    const colors = ['var(--accent)', 'var(--accent2)', 'var(--cyan)'];
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.boxShadow = `0 0 6px ${p.style.background}`;
    
    container.appendChild(p);
  }
}

const API = window.location.origin;

// ============================================================
// 今日任务系统（本地存储）
// ============================================================

function getTodayKey() {
  return 'tasks_' + new Date().toISOString().slice(0, 10);
}

function saveTaskStatus(taskId, completed) {
  const key = getTodayKey();
  const tasks = JSON.parse(localStorage.getItem(key) || '{}');
  tasks[taskId] = completed;
  localStorage.setItem(key, JSON.stringify(tasks));
}

function loadTaskStatus(taskId) {
  const key = getTodayKey();
  const tasks = JSON.parse(localStorage.getItem(key) || '{}');
  return tasks[taskId] || false;
}

function loadTodayTasks() {
  document.querySelectorAll('.today-task').forEach(t => {
    const taskId = t.dataset.task;
    if (!taskId) return;
    
    const isCompleted = loadTaskStatus(taskId);
    if (isCompleted) {
      t.classList.add('completed');
      const check = t.querySelector('.task-check');
      if (check) check.textContent = '✅';
    }
  });
}

// 清理旧任务数据（保留最近7天）
function cleanupOldTasks() {
  const today = new Date();
  for (let i = 7; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = 'tasks_' + d.toISOString().slice(0, 10);
    localStorage.removeItem(key);
  }
}

// 检查是否所有任务都完成
function checkAllTasksComplete() {
  const allTasks = document.querySelectorAll('.today-task');
  const completedTasks = document.querySelectorAll('.today-task.completed');
  
  if (allTasks.length > 0 && allTasks.length === completedTasks.length) {
    // 所有任务完成！触发庆祝效果
    showConfetti();
    showToast('🎉 太棒了！今日任务全部完成！');
    
    // 给任务区域添加庆祝样式
    const taskSection = document.getElementById('today-tasks');
    if (taskSection) {
      taskSection.classList.add('all-tasks-complete');
      setTimeout(() => {
        taskSection.classList.remove('all-tasks-complete');
      }, 3000);
    }
  }
}

// 彩带庆祝效果
function showConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  
  const colors = ['#4ade80', '#818cf8', '#f472b6', '#fbbf24', '#22d3ee', '#fb923c'];
  
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 2 + 's';
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    container.appendChild(piece);
  }
  
  document.body.appendChild(container);
  
  // 3秒后清理
  setTimeout(() => {
    container.remove();
  }, 5000);
}

// 启动时清理旧数据
cleanupOldTasks();

// ============================================================
// 欢迎弹窗
// ============================================================

function checkWelcomePopup() {
  const lastVisit = localStorage.getItem('last_visit');
  const today = new Date().toISOString().slice(0, 10);
  
  if (lastVisit !== today) {
    localStorage.setItem('last_visit', today);
    
    // 计算连续访问天数
    let streak = parseInt(localStorage.getItem('visit_streak') || '0');
    const lastDate = new Date(lastVisit || today);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      streak = 1;
    }
    localStorage.setItem('visit_streak', streak);
    
    // 显示欢迎弹窗
    setTimeout(() => {
      const popup = document.getElementById('welcome-popup');
      const dayEl = document.getElementById('welcome-day');
      if (popup && dayEl) {
        dayEl.textContent = streak;
        popup.style.display = 'flex';
      }
    }, 1000);
  }
}

function closeWelcome() {
  const popup = document.getElementById('welcome-popup');
  if (popup) {
    popup.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
      popup.style.display = 'none';
    }, 300);
  }
}
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
  const main = document.getElementById('main-content');
  if (main) {
    // 添加退出动画
    main.classList.add('page-exit');
    
    setTimeout(() => {
      window.history.pushState({}, '', path);
      renderRoute();
    }, 200);
  } else {
    window.history.pushState({}, '', path);
    renderRoute();
  }
}

// 显示/隐藏加载动画
function showLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) loader.classList.remove('hidden');
}

function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) loader.classList.add('hidden');
}

// 加载页面 HTML 并渲染
async function renderRoute() {
  const page = getRoute();
  console.log('渲染页面:', page);
  updateNavActive(page);
  
  const main = document.getElementById('main-content');
  if (!main) {
    console.error('找不到 main-content 元素');
    return;
  }
  
  // 显示加载动画
  showLoader();
  
  // 加载对应页面 HTML
  try {
    const response = await fetch(`/pages/${page}.html`);
    console.log('页面加载状态:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    console.log('页面内容长度:', html.length);
    
    // 模拟加载延迟，让动画更明显
    await new Promise(r => setTimeout(r, 300));
    
    main.innerHTML = html;
    
    // 移除退出动画，添加入场动画
    main.classList.remove('page-exit');
    main.classList.add('page-enter');
    
    // 动画结束后清理类
    setTimeout(() => {
      main.classList.remove('page-enter');
    }, 500);
    
    // 绑定页面内的事件
    bindPageEvents(page);
    
    // 加载页面数据
    await loadPageData(page);
    
    // 隐藏加载动画
    hideLoader();
    
  } catch (err) {
    console.error('加载页面失败:', err);
    hideLoader();
    main.innerHTML = `
      <div class="error-page">
        <div class="error-emoji">🚀</div>
        <h2 class="error-title">页面迷路了</h2>
        <p class="error-desc">好像飞到了外太空，找不到这个页面呢</p>
        <div class="error-actions">
          <button class="btn btn-primary" onclick="navigate('/')">🏠 回首页</button>
          <button class="btn" onclick="window.location.reload()">🔄 刷新试试</button>
        </div>
      </div>
    `;
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
    // 检查欢迎弹窗
    checkWelcomePopup();
    
    // 加载今日任务状态
    loadTodayTasks();
    
    document.querySelectorAll('.today-task').forEach(t => {
      t.addEventListener('click', () => {
        const taskId = t.dataset.task;
        const isCompleted = t.classList.toggle('completed');
        const check = t.querySelector('.task-check');
        if (check) check.textContent = isCompleted ? '✅' : '⭕';
        
        // 保存到本地存储
        saveTaskStatus(taskId, isCompleted);
        
        // 添加完成动画和庆祝效果
        if (isCompleted) {
          t.style.animation = 'pulse 0.5s ease';
          setTimeout(() => { t.style.animation = ''; }, 500);
          
          // 检查是否所有任务都完成了
          checkAllTasksComplete();
        }
      });
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
  
  // 吉他页事件
  if (page === 'guitar') {
    const btn = document.getElementById('btn-upload-guitar');
    if (btn) btn.addEventListener('click', () => openModal('modal-guitar'));
  }
  
  // 科技页事件
  if (page === 'tech') {
    const btn = document.getElementById('btn-add-tech');
    if (btn) btn.addEventListener('click', () => openModal('modal-tech'));
    
    // 分类筛选
    document.querySelectorAll('.tech-filter').forEach(f => {
      f.addEventListener('click', () => {
        document.querySelectorAll('.tech-filter').forEach(x => x.classList.remove('active'));
        f.classList.add('active');
        filterTech(f.dataset.filter);
      });
    });
  }
}

// 科技新闻筛选
function filterTech(category) {
  const cards = document.querySelectorAll('.tech-card');
  cards.forEach(card => {
    const cat = card.querySelector('.tech-category')?.textContent || '';
    if (category === 'all' || cat.includes(category.replace(/[🔬🤖🚀💻🔋]/g, '').trim())) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
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
  // 初始化科技感粒子
  initTechParticles();
  
  updateGreeting();
  updateTodayDate();
  
  try {
    console.log('开始加载首页数据...');
    const [diary, shines, guitar, tech, progress] = await Promise.all([
      api('GET', '/diary').catch(e => { console.error('日记API失败:', e); return []; }),
      api('GET', '/shines').catch(e => { console.error('闪光API失败:', e); return []; }),
      api('GET', '/guitar').catch(e => { console.error('吉他API失败:', e); return []; }),
      api('GET', '/tech').catch(e => { console.error('科技API失败:', e); return []; }),
      api('GET', '/progress').catch(e => { console.error('进度API失败:', e); return {}; })
    ]);
    console.log('数据加载完成:', { diary: diary?.length, shines: shines?.length, guitar: guitar?.length, tech: tech?.length });
    
    // 统计卡片
    const diaryCountEl = document.getElementById('home-diary-count');
    if (diaryCountEl) diaryCountEl.textContent = diary?.length || 0;
    
    const shineCountEl = document.getElementById('home-shine-count');
    if (shineCountEl) shineCountEl.textContent = shines?.length || 0;
    
    const guitarCountEl = document.getElementById('home-guitar-count');
    if (guitarCountEl) guitarCountEl.textContent = guitar?.length || 0;
    
    const techCountEl = document.getElementById('home-tech-count');
    if (techCountEl) techCountEl.textContent = tech?.length || 0;
    
    // 本周趋势
    const diaryTrendEl = document.getElementById('diary-trend');
    if (diaryTrendEl) diaryTrendEl.textContent = '+' + countThisWeek(diary) + ' 本周';
    
    const shineTrendEl = document.getElementById('shine-trend');
    if (shineTrendEl) shineTrendEl.textContent = '+' + countThisWeek(shines) + ' 本周';
    
    const guitarTrendEl = document.getElementById('guitar-trend');
    if (guitarTrendEl) guitarTrendEl.textContent = '+' + countThisWeek(guitar) + ' 本周';
    
    const techTrendEl = document.getElementById('tech-trend');
    if (techTrendEl) techTrendEl.textContent = '+' + countThisWeek(tech) + ' 本周';
    
    // 快速入口
    const quickDiaryEl = document.getElementById('diary-count');
    if (quickDiaryEl) quickDiaryEl.textContent = (diary?.length || 0) + ' 篇';
    
    const quickShineEl = document.getElementById('shine-count');
    if (quickShineEl) quickShineEl.textContent = (shines?.length || 0) + ' 个';
    
    const quickGuitarEl = document.getElementById('guitar-count');
    if (quickGuitarEl) quickGuitarEl.textContent = (guitar?.length || 0) + ' 次';
    
    const quickTechEl = document.getElementById('tech-count');
    if (quickTechEl) quickTechEl.textContent = (tech?.length || 0) + ' 条';
    
    // 学习进度
    const doneUnits = progress?.doneUnits || [];
    const doneOM = progress?.doneOM || [];
    updateSubjectProgress('chinese', doneUnits, 'chinese_', 8, 8);
    updateSubjectProgress('math', doneUnits, 'math_', 6, 6);
    updateSubjectProgress('english', doneUnits, 'english_', 6, 6);
    updateOlympiadProgress(doneOM);
    
    // 活跃度图表
    renderActivityChart(diary, shines, guitar);
    
    // 心情趋势
    renderMoodTimeline(diary);
    
    // 成就徽章
    renderBadges(diary, shines, guitar, tech, progress);
    
    // 每日一句
    renderDailyQuote();
    
    // 艾宾浩斯复习提醒
    renderReviewReminders(progress);
    
    // 最近日记
    const recentDiaryEl = document.getElementById('recent-diary');
    if (recentDiaryEl) {
      const recentDiary = (diary || []).slice(0, 3);
      recentDiaryEl.innerHTML = recentDiary.length 
        ? recentDiary.map(d => createDiaryCard(d)).join('')
        : '<p style="color:var(--text3)">还没有日记</p>';
    }
    
    // 最近闪光
    const recentShineEl = document.getElementById('recent-shine');
    if (recentShineEl) {
      const recentShine = (shines || []).slice(0, 3);
      recentShineEl.innerHTML = recentShine.length
        ? recentShine.map(s => createShineCard(s)).join('')
        : '<p style="color:var(--text3)">还没有闪光时刻</p>';
    }
    
    console.log('首页数据渲染完成');
      
  } catch (err) {
    console.error('加载首页数据失败:', err);
  }
}

function updateTodayDate() {
  const el = document.getElementById('today-date');
  if (el) {
    const d = new Date();
    const days = ['周日','周一','周二','周三','周四','周五','周六'];
    el.textContent = `${d.getMonth()+1}月${d.getDate()}日 ${days[d.getDay()]}`;
  }
}

function countThisWeek(items) {
  if (!items?.length) return 0;
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  return items.filter(i => i.date >= weekAgo).length;
}

function updateSubjectProgress(subject, doneUnits, prefix, total, units) {
  const done = doneUnits.filter(u => u.startsWith(prefix)).length;
  const percent = Math.round((done / total) * 100);
  const bar = document.getElementById('bar-' + subject);
  const label = document.getElementById('progress-' + subject);
  if (bar) bar.style.width = percent + '%';
  if (label) label.textContent = percent + '%';
}

function updateOlympiadProgress(doneOM) {
  const total = 20;
  const done = doneOM?.length || 0;
  const percent = Math.round((done / total) * 100);
  const bar = document.getElementById('bar-olympiad');
  const label = document.getElementById('progress-olympiad');
  if (bar) bar.style.width = percent + '%';
  if (label) label.textContent = percent + '%';
}

function renderActivityChart(diary, shines, guitar) {
  const chart = document.getElementById('activity-chart');
  if (!chart) return;
  
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(d.toISOString().split('T')[0]);
  }
  
  const dayLabels = ['一','二','三','四','五','六','日'];
  const today = new Date().getDay();
  
  chart.innerHTML = days.map((date, idx) => {
    const dCount = diary?.filter(d => d.date === date).length || 0;
    const sCount = shines?.filter(s => s.date === date).length || 0;
    const gCount = guitar?.filter(g => g.date === date).length || 0;
    const total = dCount + sCount + gCount;
    const maxHeight = 120;
    
    const dayIndex = (today - 6 + idx + 7) % 7;
    const label = dayLabels[dayIndex === 0 ? 6 : dayIndex - 1];
    const isToday = idx === 6;
    
    // 计算每根柱子的高度（最多3条记录就满高度）
    const getHeight = (count) => count ? Math.max(4, Math.min(maxHeight, (count / 3) * maxHeight)) : 0;
    
    return `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="display:flex;gap:2px;align-items:flex-end;height:${maxHeight}px;">
          <div class="activity-bar" style="width:8px;height:${getHeight(dCount)}px;background:var(--accent);" data-value="${dCount}" title="日记 ${dCount}"></div>
          <div class="activity-bar" style="width:8px;height:${getHeight(sCount)}px;background:var(--accent2);" data-value="${sCount}" title="闪光 ${sCount}"></div>
          <div class="activity-bar" style="width:8px;height:${getHeight(gCount)}px;background:var(--yellow);" data-value="${gCount}" title="吉他 ${gCount}"></div>
        </div>
        <span style="font-size:11px;color:${isToday ? 'var(--accent)' : 'var(--text3)'};font-weight:${isToday ? 700 : 400};">${label}</span>
      </div>`;
  }).join('');
}

function renderMoodTimeline(diary) {
  const timeline = document.getElementById('mood-timeline');
  const statsEl = document.getElementById('mood-stats');
  const chartEl = document.getElementById('mood-chart-bars');
  
  if (!diary?.length) {
    if (timeline) timeline.innerHTML = '<p style="color:var(--text3)">暂无心情数据</p>';
    if (statsEl) statsEl.innerHTML = '';
    if (chartEl) chartEl.innerHTML = '';
    return;
  }
  
  // 统计心情分布
  const moodStats = {};
  diary.forEach(d => {
    const mood = d.mood || '😊';
    moodStats[mood] = (moodStats[mood] || 0) + 1;
  });
  
  // 心情分类映射
  const moodCategories = {
    '😄': { label: '开心', class: 'mood-happy' },
    '🤩': { label: '兴奋', class: 'mood-excited' },
    '😊': { label: '愉快', class: 'mood-calm' },
    '🙂': { label: '平静', class: 'mood-neutral' },
    '😐': { label: '一般', class: 'mood-neutral' },
    '😔': { label: '难过', class: 'mood-sad' },
    '😤': { label: '生气', class: 'mood-angry' },
    '😢': { label: '伤心', class: 'mood-sad' }
  };
  
  // 渲染统计卡片
  if (statsEl) {
    const sortedMoods = Object.entries(moodStats).sort((a, b) => b[1] - a[1]).slice(0, 4);
    statsEl.innerHTML = sortedMoods.map(([mood, count]) => `
      <div class="mood-stat-item">
        <div class="mood-stat-emoji">${mood}</div>
        <div class="mood-stat-count">${count}</div>
        <div class="mood-stat-label">${moodCategories[mood]?.label || '其他'}</div>
      </div>
    `).join('');
  }
  
  // 渲染7天心情时间轴
  if (timeline) {
    const recent = diary.slice(-7);
    timeline.innerHTML = recent.map(d => `
      <div class="mood-day">
        <div class="mood-emoji">${d.mood || '😊'}</div>
        <span class="mood-date">${d.date?.slice(5) || ''}</span>
      </div>
    `).join('');
  }
  
  // 渲染心情分布条形图
  if (chartEl) {
    const total = diary.length;
    const sortedAll = Object.entries(moodStats).sort((a, b) => b[1] - a[1]);
    const maxCount = Math.max(...Object.values(moodStats));
    
    chartEl.innerHTML = `
      <div class="mood-chart-title">📊 心情分布（共 ${total} 篇日记）</div>
      ${sortedAll.map(([mood, count]) => {
        const percent = Math.round((count / total) * 100);
        const width = Math.max(5, (count / maxCount) * 100);
        const cat = moodCategories[mood] || { label: '其他', class: 'mood-neutral' };
        return `
          <div class="mood-bar-item">
            <div class="mood-bar-emoji">${mood}</div>
            <div class="mood-bar-track">
              <div class="mood-bar-fill ${cat.class}" style="width: ${width}%">
                <span class="mood-bar-count">${count}</span>
              </div>
            </div>
            <div class="mood-bar-percent">${percent}%</div>
          </div>
        `;
      }).join('')}
    `;
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

// --- 成就徽章系统 ---
const BADGES = [
  // === 日记系列 ===
  { id: 'first_diary', icon: '📝', name: '初识笔墨', desc: '写下第一篇日记', check: (d) => d?.length >= 1 },
  { id: 'diary_10', icon: '📄', name: '日积月累', desc: '累计10篇日记', check: (d) => d?.length >= 10 },
  { id: 'diary_30', icon: '📚', name: '笔耕不辍', desc: '累计30篇日记', check: (d) => d?.length >= 30 },
  { id: 'diary_60', icon: '📖', name: '日记达人', desc: '累计60篇日记', check: (d) => d?.length >= 60 },
  { id: 'diary_100', icon: '🏆', name: '文思泉涌', desc: '累计100篇日记', check: (d) => d?.length >= 100 },
  { id: 'diary_365', icon: '👑', name: '年度记录者', desc: '累计365篇日记', check: (d) => d?.length >= 365 },
  
  // === 闪光时刻系列 ===
  { id: 'first_shine', icon: '✨', name: '闪光初现', desc: '记录第一个闪光时刻', check: (s) => s?.length >= 1 },
  { id: 'shine_10', icon: '🌟', name: '星光点点', desc: '累计10个闪光时刻', check: (s) => s?.length >= 10 },
  { id: 'shine_30', icon: '🌠', name: '星光璀璨', desc: '累计30个闪光时刻', check: (s) => s?.length >= 30 },
  { id: 'shine_50', icon: '🎆', name: '闪耀全场', desc: '累计50个闪光时刻', check: (s) => s?.length >= 50 },
  { id: 'shine_100', icon: '💫', name: '传奇时刻', desc: '累计100个闪光时刻', check: (s) => s?.length >= 100 },
  
  // === 吉他练习系列 ===
  { id: 'first_guitar', icon: '🎸', name: '弦音初鸣', desc: '完成第一次吉他练习', check: (g) => g?.length >= 1 },
  { id: 'guitar_10', icon: '🎵', name: '渐入佳境', desc: '累计10次吉他练习', check: (g) => g?.length >= 10 },
  { id: 'guitar_30', icon: '🎶', name: '音乐之路', desc: '累计30次吉他练习', check: (g) => g?.length >= 30 },
  { id: 'guitar_50', icon: '🎤', name: '吉他高手', desc: '累计50次吉他练习', check: (g) => g?.length >= 50 },
  { id: 'guitar_100', icon: '🎼', name: '音乐大师', desc: '累计100次吉他练习', check: (g) => g?.length >= 100 },
  
  // === 科技探索系列 ===
  { id: 'first_tech', icon: '🔬', name: '科技先锋', desc: '收藏第一条科技新闻', check: (t) => t?.length >= 1 },
  { id: 'tech_10', icon: '🔭', name: '探索者', desc: '累计10条科技新闻', check: (t) => t?.length >= 10 },
  { id: 'tech_30', icon: '🚀', name: '未来探索者', desc: '累计30条科技新闻', check: (t) => t?.length >= 30 },
  { id: 'tech_50', icon: '🛸', name: '星际旅行者', desc: '累计50条科技新闻', check: (t) => t?.length >= 50 },
  { id: 'tech_100', icon: '🌌', name: '宇宙智者', desc: '累计100条科技新闻', check: (t) => t?.length >= 100 },
  
  // === 连续打卡系列 ===
  { id: 'week_streak', icon: '🔥', name: '持之以恒', desc: '连续7天有记录', check: (d, s, g) => checkStreak(d, s, g, 7) },
  { id: 'month_streak', icon: '⚡', name: '坚持不懈', desc: '连续30天有记录', check: (d, s, g) => checkStreak(d, s, g, 30) },
  { id: 'quarter_streak', icon: '🌞', name: '日出而作', desc: '连续90天有记录', check: (d, s, g) => checkStreak(d, s, g, 90) },
  { id: 'year_streak', icon: '🌅', name: '全年无休', desc: '连续365天有记录', check: (d, s, g) => checkStreak(d, s, g, 365) },
  
  // === 学习进度系列 ===
  { id: 'first_subject', icon: '📖', name: '学有所成', desc: '完成第一个学习单元', check: (d, s, g, t, p) => (p?.doneUnits || []).length >= 1 },
  { id: 'half_chinese', icon: '📜', name: '语文小能手', desc: '语文完成50%', check: (d, s, g, t, p) => checkSubjectProgress(p, 'chinese_', 4, 8) },
  { id: 'full_chinese', icon: '📿', name: '语文大师', desc: '语文全部完成', check: (d, s, g, t, p) => checkSubjectProgress(p, 'chinese_', 8, 8) },
  { id: 'half_math', icon: '🔢', name: '数学小能手', desc: '数学完成50%', check: (d, s, g, t, p) => checkSubjectProgress(p, 'math_', 3, 6) },
  { id: 'full_math', icon: '🧮', name: '数学大师', desc: '数学全部完成', check: (d, s, g, t, p) => checkSubjectProgress(p, 'math_', 6, 6) },
  { id: 'half_english', icon: '🔤', name: '英语小能手', desc: '英语完成50%', check: (d, s, g, t, p) => checkSubjectProgress(p, 'english_', 3, 6) },
  { id: 'full_english', icon: '🌍', name: '英语大师', desc: '英语全部完成', check: (d, s, g, t, p) => checkSubjectProgress(p, 'english_', 6, 6) },
  { id: 'olympiad_5', icon: '🧩', name: '奥数新手', desc: '完成5个奥数专题', check: (d, s, g, t, p) => (p?.doneOM || []).length >= 5 },
  { id: 'olympiad_10', icon: '🎯', name: '奥数高手', desc: '完成10个奥数专题', check: (d, s, g, t, p) => (p?.doneOM || []).length >= 10 },
  { id: 'olympiad_20', icon: '🏅', name: '奥数冠军', desc: '完成全部20个奥数专题', check: (d, s, g, t, p) => (p?.doneOM || []).length >= 20 },
  { id: 'all_subjects', icon: '📊', name: '全面发展', desc: '所有科目都有进度', check: (d, s, g, t, p) => {
    const done = p?.doneUnits || [];
    return done.some(u => u.startsWith('chinese_')) && 
           done.some(u => u.startsWith('math_')) && 
           done.some(u => u.startsWith('english_')) && 
           (p?.doneOM || []).length > 0;
  }},
  
  // === 特殊成就 ===
  { id: 'early_bird', icon: '🐦', name: '早起的鸟', desc: '早上8点前写日记', check: (d) => (d || []).some(i => new Date(i.created || i.date).getHours() < 8) },
  { id: 'night_owl', icon: '🦉', name: '夜猫子', desc: '晚上10点后写日记', check: (d) => (d || []).some(i => new Date(i.created || i.date).getHours() >= 22) },
  { id: 'weekend_warrior', icon: '🎉', name: '周末战士', desc: '周六日都有记录', check: (d, s, g) => {
    const allDates = new Set([...(d||[]), ...(s||[]), ...(g||[])].map(i => i.date));
    const hasSat = [...allDates].some(d => new Date(d).getDay() === 6);
    const hasSun = [...allDates].some(d => new Date(d).getDay() === 0);
    return hasSat && hasSun;
  }},
  { id: 'mood_master', icon: '😄', name: '乐天派', desc: '连续10篇日记都是好心情', check: (d) => {
    if (!d || d.length < 10) return false;
    const goodMoods = ['😊','😄','🤩','😎','🥳'];
    return d.slice(-10).every(i => goodMoods.includes(i.mood));
  }},
  { id: 'collector', icon: '🏆', name: '收藏家', desc: '解锁10个成就徽章', check: (d, s, g, t, p, unlocked) => unlocked >= 10 },
  { id: 'master', icon: '💎', name: '成就大师', desc: '解锁25个成就徽章', check: (d, s, g, t, p, unlocked) => unlocked >= 25 },
  { id: 'legend', icon: '👑', name: '传奇人物', desc: '解锁全部成就徽章', check: (d, s, g, t, p, unlocked, total) => unlocked >= total }
];

function checkStreak(d, s, g, targetDays) {
  const allDates = new Set();
  [...(d||[]), ...(s||[]), ...(g||[])].forEach(i => { if(i.date) allDates.add(i.date); });
  const sorted = [...allDates].sort();
  if (sorted.length < targetDays) return false;
  let streak = 1, maxStreak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i-1])) / 86400000;
    if (diff === 1) { streak++; maxStreak = Math.max(maxStreak, streak); }
    else streak = 1;
  }
  return maxStreak >= targetDays;
}

function checkSubjectProgress(progress, prefix, target, total) {
  const done = (progress?.doneUnits || []).filter(u => u.startsWith(prefix)).length;
  return done >= target;
}

function renderBadges(diary, shines, guitar, tech, progress) {
  const grid = document.getElementById('badges-grid');
  const progressEl = document.getElementById('badge-progress');
  if (!grid) return;
  
  // 先计算已解锁数量（用于依赖unlocked的徽章）
  let unlockedCount = 0;
  const unlockedMap = new Map();
  
  BADGES.forEach(badge => {
    const isUnlocked = badge.check(diary, shines, guitar, tech, progress, unlockedCount, BADGES.length);
    unlockedMap.set(badge.id, isUnlocked);
    if (isUnlocked) unlockedCount++;
  });
  
  // 重新计算（因为有些徽章依赖unlocked数量）
  let finalUnlocked = 0;
  BADGES.forEach(badge => {
    const isUnlocked = badge.check(diary, shines, guitar, tech, progress, finalUnlocked, BADGES.length);
    unlockedMap.set(badge.id, isUnlocked);
    if (isUnlocked) finalUnlocked++;
  });
  
  const html = BADGES.map(badge => {
    const isUnlocked = unlockedMap.get(badge.id);
    
    return `
      <div class="badge-item ${isUnlocked ? 'unlocked' : 'locked'}" title="${badge.desc}">
        <div class="badge-glow"></div>
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
      </div>
    `;
  }).join('');
  
  grid.innerHTML = html;
  if (progressEl) progressEl.textContent = `${finalUnlocked}/${BADGES.length}`;
}

// --- 每日一句 ---
const QUOTES = [
  { text: '千里之行，始于足下。', author: '老子' },
  { text: '学而时习之，不亦说乎？', author: '孔子' },
  { text: '天才就是百分之一的灵感加上百分之九十九的汗水。', author: '爱迪生' },
  { text: '书山有路勤为径，学海无涯苦作舟。', author: '韩愈' },
  { text: '不积跬步，无以至千里；不积小流，无以成江海。', author: '荀子' },
  { text: '知之者不如好之者，好之者不如乐之者。', author: '孔子' },
  { text: '业精于勤，荒于嬉；行成于思，毁于随。', author: '韩愈' },
  { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
  { text: '宝剑锋从磨砺出，梅花香自苦寒来。', author: '古诗' },
  { text: '少年易老学难成，一寸光阴不可轻。', author: '朱熹' },
  { text: '纸上得来终觉浅，绝知此事要躬行。', author: '陆游' },
  { text: '问渠那得清如许？为有源头活水来。', author: '朱熹' },
  { text: '欲穷千里目，更上一层楼。', author: '王之涣' },
  { text: '海内存知己，天涯若比邻。', author: '王勃' },
  { text: '天生我材必有用，千金散尽还复来。', author: '李白' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
  { text: 'Success is not final, failure is not fatal.', author: 'Winston Churchill' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' }
];

function renderDailyQuote() {
  const textEl = document.getElementById('daily-quote');
  const authorEl = document.getElementById('quote-author');
  if (!textEl) return;
  
  // 根据日期选择固定的句子（每天不同）
  const dayIndex = Math.floor(Date.now() / 86400000) % QUOTES.length;
  const quote = QUOTES[dayIndex];
  
  textEl.textContent = quote.text;
  if (authorEl) authorEl.textContent = '—— ' + quote.author;
}

function refreshQuote() {
  const textEl = document.getElementById('daily-quote');
  const authorEl = document.getElementById('quote-author');
  if (!textEl) return;
  
  // 随机选择
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  
  // 淡出淡入效果
  textEl.style.opacity = '0';
  setTimeout(() => {
    textEl.textContent = quote.text;
    if (authorEl) authorEl.textContent = '—— ' + quote.author;
    textEl.style.opacity = '1';
  }, 200);
}

// --- 艾宾浩斯复习提醒 ---
// 艾宾浩斯复习间隔：3天、7天、15天、30天、60天、90天（去掉太频繁的1/2天）
const REVIEW_INTERVALS = [3, 7, 15, 30, 60, 90];
const STAGE_NAMES = ['第1次复习', '第2次复习', '第3次复习', '第4次复习', '第5次复习', '第6次复习'];
const STAGE_EMOJIS = ['🌱', '🌿', '🌲', '🌳', '🏆', '👑'];

// 示例知识点数据（后续可从后端获取）
let reviewItems = JSON.parse(localStorage.getItem('reviewItems') || '[]');

function getTodayReviews() {
  const today = new Date().toISOString().split('T')[0];
  const reviews = [];
  
  reviewItems.forEach(item => {
    const learnDate = new Date(item.learnDate);
    item.stages.forEach((stageDate, idx) => {
      if (stageDate === today && !item.completedStages.includes(idx)) {
        reviews.push({
          id: item.id + '_' + idx,
          itemId: item.id,
          stageIndex: idx,
          title: item.title,
          subject: item.subject,
          learnDate: item.learnDate,
          stage: STAGE_NAMES[idx],
          emoji: STAGE_EMOJIS[idx]
        });
      }
    });
  });
  
  return reviews;
}

function addReviewItem(title, subject, learnDate) {
  const item = {
    id: Date.now().toString(),
    title,
    subject,
    learnDate,
    stages: REVIEW_INTERVALS.map(days => {
      const d = new Date(learnDate);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    }),
    completedStages: []
  };
  reviewItems.push(item);
  saveReviewItems();
  return item;
}

function completeReview(itemId, stageIndex) {
  const item = reviewItems.find(i => i.id === itemId);
  if (item && !item.completedStages.includes(stageIndex)) {
    item.completedStages.push(stageIndex);
    saveReviewItems();
    renderReviewReminders();
    showToast('✅ 复习完成！继续保持！');
  }
}

function saveReviewItems() {
  localStorage.setItem('reviewItems', JSON.stringify(reviewItems));
}

function renderReviewReminders() {
  const list = document.getElementById('review-list');
  const countEl = document.getElementById('review-count');
  if (!list) return;
  
  const reviews = getTodayReviews();
  
  if (countEl) {
    countEl.textContent = reviews.length > 0 
      ? `${reviews.length} 个知识点待复习` 
      : '今日复习已完成 🎉';
  }
  
  if (reviews.length === 0) {
    list.innerHTML = `
      <div class="review-empty">
        <span class="emoji">🎉</span>
        <p>太棒了！今天没有待复习的知识点</p>
        <p style="font-size:12px;margin-top:4px;">新知识会自动出现在这里</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = reviews.map(r => `
    <div class="review-item" data-id="${r.itemId}" data-stage="${r.stageIndex}">
      <div class="review-check" onclick="completeReview('${r.itemId}', ${r.stageIndex})"></div>
      <div class="review-info">
        <div class="review-title">${r.title}</div>
        <div class="review-meta">
          <span>📚 ${r.subject}</span>
          <span>📅 ${r.learnDate} 学习</span>
        </div>
      </div>
      <div class="review-stage stage-${r.stageIndex + 1}">
        ${r.emoji} ${r.stage}
      </div>
    </div>
  `).join('') + `
    <button class="add-review-btn" onclick="showAddReviewModal()">
      <span>+</span> 添加新知识点
    </button>
  `;
}

function showAddReviewModal() {
  const title = prompt('请输入知识点名称：');
  if (!title) return;
  
  const subjects = ['语文', '数学', '英语', '奥数', '科学', '其他'];
  const subject = prompt('请选择科目（' + subjects.join('/') + '）：');
  if (!subject || !subjects.includes(subject)) {
    alert('请输入正确的科目名称');
    return;
  }
  
  addReviewItem(title, subject, new Date().toISOString().split('T')[0]);
  renderReviewReminders();
  showToast('✅ 知识点已添加，将按照艾宾浩斯曲线提醒复习');
}

// 初始化一些示例数据
function initReviewData() {
  if (reviewItems.length === 0) {
    // 添加示例数据（过去学习的知识点）
    const today = new Date();
    
    // 3天前学习的（今天第1次复习）
    const d3 = new Date(today);
    d3.setDate(d3.getDate() - 3);
    addReviewItem('古诗词《静夜思》', '语文', d3.toISOString().split('T')[0]);
    
    // 7天前学习的（今天第2次复习）
    const d7 = new Date(today);
    d7.setDate(d7.getDate() - 7);
    addReviewItem('和差问题公式', '奥数', d7.toISOString().split('T')[0]);
    
    // 15天前学习的（今天第3次复习）
    const d15 = new Date(today);
    d15.setDate(d15.getDate() - 15);
    addReviewItem('英语Unit 3单词', '英语', d15.toISOString().split('T')[0]);
    
    // 30天前学习的（今天第4次复习）
    const d30 = new Date(today);
    d30.setDate(d30.getDate() - 30);
    addReviewItem('角的分类与度量', '数学', d30.toISOString().split('T')[0]);
    
    console.log('艾宾浩斯复习数据已初始化');
  }
}

// 页面加载时初始化
initReviewData();

// Toast提示
function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface2);
    color: var(--accent);
    padding: 12px 24px;
    border-radius: 12px;
    border: 1px solid var(--accent);
    font-size: 14px;
    font-weight: 600;
    z-index: 9999;
    animation: toastIn 0.3s var(--ease-spring);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Toast动画
const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes toastOut {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to { opacity: 0; transform: translateX(-50%) translateY(20px); }
  }
`;
document.head.appendChild(toastStyle);

// --- 日记数据 ---
// 日记数据缓存（用于筛选）
let diaryCache = [];
let currentDiaryFilter = 'all';

async function loadDiaryData() {
  try {
    const diary = await api('GET', '/diary');
    diaryCache = diary || [];
    const container = document.getElementById('diary-list');
    if (!container) return;
    
    // 渲染心情墙
    renderMoodWall(diary);
    
    // 渲染日记列表（支持筛选）
    renderDiaryList();
    
    // 绑定筛选事件
    bindDiaryFilterEvents();
    
    // 更新统计
    updateDiaryStats(diary);
  } catch (err) {
    console.error('加载日记失败:', err);
  }
}

function renderDiaryList() {
  const container = document.getElementById('diary-list');
  if (!container) return;
  
  let filtered = diaryCache;
  if (currentDiaryFilter !== 'all') {
    filtered = diaryCache.filter(d => d.mood === currentDiaryFilter);
  }
  
  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="emoji">📝</span>
        <p>${currentDiaryFilter === 'all' ? '还没有日记' : '该心情下没有日记'}<br>点击右上角写一篇吧</p>
      </div>`;
    return;
  }
  
  container.innerHTML = filtered.map(d => createDiaryCard(d)).join('');
}

function bindDiaryFilterEvents() {
  document.querySelectorAll('.diary-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diary-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDiaryFilter = btn.dataset.filter || 'all';
      renderDiaryList();
    });
  });
}

function updateDiaryStats(diary) {
  const totalEl = document.getElementById('diary-total-count');
  const streakEl = document.getElementById('diary-streak');
  const monthEl = document.getElementById('diary-this-month');
  
  if (totalEl) totalEl.textContent = diary?.length || 0;
  if (streakEl) streakEl.textContent = calculateDiaryStreak(diary);
  if (monthEl) monthEl.textContent = countThisMonth(diary);
}

function calculateDiaryStreak(diary) {
  if (!diary?.length) return 0;
  const dates = [...new Set(diary.map(d => d.date))].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // 检查今天或昨天是否有记录
  if (dates[0] === today || dates[0] === yesterday) {
    streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i-1]);
      const curr = new Date(dates[i]);
      const diff = (prev - curr) / 86400000;
      if (diff === 1) streak++;
      else break;
    }
  }
  return streak;
}

function countThisMonth(items) {
  if (!items?.length) return 0;
  const thisMonth = new Date().toISOString().slice(0, 7);
  return items.filter(i => i.date?.startsWith(thisMonth)).length;
}

function renderMoodWall(diary) {
  const container = document.getElementById('mood-wall-items');
  if (!container) return;
  
  if (!diary?.length) {
    container.innerHTML = '<span style="color:var(--text3)">还没有日记</span>';
    return;
  }
  
  // 取最近14条日记的心情
  const recent = diary.slice(-14).reverse();
  container.innerHTML = recent.map(d => `
    <div class="mood-wall-item" title="${d.title}">
      <span class="mood-wall-emoji">${d.mood || '😊'}</span>
      <span class="mood-wall-date">${d.date?.slice(5) || ''}</span>
    </div>
  `).join('');
}

function createDiaryCard(d) {
  // 根据心情获取标签文字
  const moodLabels = {
    '😄': '开心',
    '🤩': '超棒',
    '😊': '不错',
    '🙂': '还好',
    '😐': '一般',
    '😔': '难过',
    '😤': '生气',
    '😢': '伤心'
  };
  
  return `
    <div class="diary-card" data-id="${d.id}" data-mood="${d.mood}">
      <div class="diary-card-header">
        <span class="diary-card-mood">${d.mood}</span>
        <span class="diary-card-date">${formatDate(d.date)}</span>
      </div>
      <div class="diary-card-title">${d.title}</div>
      <div class="diary-card-content">${d.content}</div>
      <div class="diary-card-footer">
        <span class="diary-card-tag">${moodLabels[d.mood] || '心情'}</span>
        <span class="diary-card-tag">📖 ${d.content?.length || 0} 字</span>
      </div>
    </div>`;
}

// --- 科目配置（全局可用）---
const SUBJECT_CONFIG = {
  chinese: {
    title: '语文',
    color: 'var(--accent)',
    total: 8,
    units: [
      { id: 'ch_1', name: '第一单元：自然之美', desc: '边读边想象画面', keyPoints: ['《观潮》天下奇观', '《走月亮》温馨亲情', '《秋晚的江上》《花牛歌》现代诗', '口语交际：我们与环境', '习作：推荐一个好地方'] },
      { id: 'ch_2', name: '第二单元：提问策略', desc: '阅读时尝试从不同角度思考', keyPoints: ['《一个豆荚里的五粒豆》生命力量', '《夜间飞行的秘密》科学原理', '《呼风唤雨的世纪》科技改变生活', '《蝴蝶的家》观察与思考', '习作：小小"动物园"'] },
      { id: 'ch_3', name: '第三单元：连续观察', desc: '体会文章准确生动的表达', keyPoints: ['《古诗三首》暮江吟/题西林壁/雪梅', '《爬山虎的脚》细致观察', '《蟋蟀的住宅》昆虫建筑师', '口语交际：爱护眼睛保护视力', '习作：写观察日记'] },
      { id: 'ch_4', name: '第四单元：神话故事', desc: '了解故事的起因、经过、结果', keyPoints: ['《盘古开天地》创世神话', '《精卫填海》坚持不懈', '《普罗米修斯》希腊英雄', '《女娲补天》中华神话', '习作：我和____过一天'] },
      { id: 'ch_5', name: '第五单元：写清楚一件事', desc: '了解作者是怎样把事情写清楚的', keyPoints: ['《麻雀》母爱伟大', '《爬天都峰》战胜困难', '交流平台：按顺序写事', '初试身手：把经过写清楚', '习作：生活万花筒'] },
      { id: 'ch_6', name: '第六单元：童年生活', desc: '学习用批注的方法阅读', keyPoints: ['《牛和鹅》换个角度看问题', '《一只窝囊的大老虎》童年趣事', '《陀螺》童年玩具与感悟', '口语交际：安慰', '习作：记一次游戏'] },
      { id: 'ch_7', name: '第七单元：家国情怀', desc: '关注主要人物和事件', keyPoints: ['《古诗三首》出塞/凉州词/夏日绝句', '《为中华之崛起而读书》少年志向', '《梅兰芳蓄须》民族气节', '《延安，我把你追寻》革命精神', '习作：写信'] },
      { id: 'ch_8', name: '第八单元：历史传说', desc: '了解故事情节，简要复述', keyPoints: ['《王戎不取道旁李》善于观察', '《西门豹治邺》破除迷信', '《故事二则》扁鹊治病/纪昌学射', '口语交际：讲历史人物故事', '习作：我的心儿怦怦跳'] }
    ]
  },
  math: {
    title: '数学',
    color: 'var(--accent2)',
    total: 8,
    units: [
      { id: 'math_1', name: '第一单元：升和毫升', desc: '认识容量单位', keyPoints: ['认识升和毫升', '升与毫升的进率(1升=1000毫升)', '测量液体的多少', '解决实际问题'] },
      { id: 'math_2', name: '第二单元：两、三位数除以两位数', desc: '掌握除法运算', keyPoints: ['除数是整十数的口算和笔算', '用"四舍"法试商', '用"五入"法试商', '商不变的规律', '被除数和除数末尾有0的除法'] },
      { id: 'math_3', name: '第三单元：观察物体', desc: '从不同方向观察物体', keyPoints: ['从前面、右面、上面观察', '辨认不同方向的视图', '用小正方体摆物体', '根据视图还原物体'] },
      { id: 'math_4', name: '第四单元：统计表和条形统计图', desc: '学习数据整理与表示', keyPoints: ['简单的统计表', '条形统计图的认识', '绘制条形统计图', '平均数的意义和求法', '分段整理数据'] },
      { id: 'math_5', name: '第五单元：解决问题的策略', desc: '学习列表和画图策略', keyPoints: ['用列表法整理信息', '用画图法分析数量关系', '从条件想起', '从问题想起'] },
      { id: 'math_6', name: '第六单元：可能性', desc: '认识可能性大小', keyPoints: ['认识可能性', '可能性的大小', '用"一定""可能""不可能"描述', '游戏规则的公平性'] },
      { id: 'math_7', name: '第七单元：整数四则混合运算', desc: '掌握运算顺序', keyPoints: ['不含括号的三步混合运算', '含有小括号的三步混合运算', '含有中括号的三步混合运算', '运算顺序规则'] },
      { id: 'math_8', name: '第八单元：垂线与平行线', desc: '认识线与角', keyPoints: ['射线、直线和角', '角的度量', '角的分类和画角', '认识垂线', '认识平行线', '画垂线和平行线'] }
    ]
  },
  english: {
    title: '英语',
    color: '#f472b6',
    total: 8,
    units: [
      { id: 'en_1', name: 'Unit 1: I like dogs', desc: '谈论喜欢的动物', keyPoints: ['动物类词汇: dog, cat, panda, horse', 'like的用法: I like... / Do you like...?', '复数形式', 'Sound time: 字母g的发音'] },
      { id: 'en_2', name: 'Unit 2: Let\'s make a fruit salad', desc: '制作水果沙拉', keyPoints: ['水果词汇: mango, pineapple, banana', 'have的用法: I have... / Do you have...?', 'some和any的用法', 'Sound time: 字母h的发音'] },
      { id: 'en_3', name: 'Unit 3: How many?', desc: '询问数量', keyPoints: ['数字13-19和整十数', 'How many...? 句型', '玩具类词汇: sticker, ball, doll', 'Sound time: 字母l的发音'] },
      { id: 'en_4', name: 'Unit 4: I can play basketball', desc: '谈论运动能力', keyPoints: ['运动词汇: basketball, football, skate', 'can的用法: I can... / Can you...?', 'play + 球类运动', 'Sound time: 字母f的发音'] },
      { id: 'en_5', name: 'Unit 5: Our new home', desc: '介绍家居物品', keyPoints: ['家居词汇: sofa, table, fridge, clock', 'Where\'s/Where are...? 句型', '介词: in, on, under, behind', 'Sound time: 字母k的发音'] },
      { id: 'en_6', name: 'Unit 6: At the snack bar', desc: '点餐用语', keyPoints: ['食物饮料: hamburger, sandwich, rice, milk', 'What would you like? 点餐', 'Anything else?', 'Sound time: 字母x的发音'] },
      { id: 'en_7', name: 'Unit 7: How much?', desc: '询问价格', keyPoints: ['衣物词汇: shoe, sock, umbrella, fan', 'How much is/are...? 问价格', '购物用语', 'Sound time: 字母v的发音'] },
      { id: 'en_8', name: 'Unit 8: Dolls', desc: '描述玩具特征', keyPoints: ['形容词: big, small, long, short, fat, thin', '描述外貌特征', 'Her/His... 句型', 'Sound time: 字母s的发音', 'Review: 综合复习'] }
    ]
  }
};

// --- 语文详细数据（部编版四年级上册）---
const CHINESE_DETAIL = {
  'ch_1': {
    lessons: [
      { num: 1, title: '观潮', author: '赵宗成、朱明元', desc: '描写钱塘江大潮的壮观景象' },
      { num: 2, title: '走月亮', author: '吴然', desc: '描绘月夜漫步的温馨画面' },
      { num: 3, title: '现代诗二首', author: '刘大白、徐志摩', desc: '《秋晚的江上》《花牛歌》' },
      { num: 4, title: '繁星', author: '巴金', desc: '对星空的深情描写' }
    ],
    poems: [
      { title: '鹿柴', author: '王维', content: '空山不见人，但闻人语响。\n返景入深林，复照青苔上。' }
    ],
    knowledge: ['边读边想象画面', '调动多种感官', '体会优美生动的语句'],
    writing: '推荐一个好地方：写清楚推荐理由'
  },
  'ch_2': {
    lessons: [
      { num: 5, title: '一个豆荚里的五粒豆', author: '安徒生', desc: '生命的力量与希望' },
      { num: 6, title: '夜间飞行的秘密', author: '', desc: '蝙蝠与雷达的科学原理' },
      { num: 7, title: '呼风唤雨的世纪', author: '', desc: '科技改变生活' },
      { num: 8, title: '蝴蝶的家', author: '', desc: '观察与思考' }
    ],
    poems: [
      { title: '暮江吟', author: '白居易', content: '一道残阳铺水中，半江瑟瑟半江红。\n可怜九月初三夜，露似真珠月似弓。' }
    ],
    knowledge: ['阅读时尝试从不同角度思考', '提出问题并解决', '理解课文内容'],
    writing: '小小"动物园"：把家人比作动物'
  },
  'ch_3': {
    lessons: [
      { num: 9, title: '古诗三首', author: '', desc: '《暮江吟》《题西林壁》《雪梅》' },
      { num: 10, title: '爬山虎的脚', author: '叶圣陶', desc: '细致观察植物' },
      { num: 11, title: '蟋蟀的住宅', author: '法布尔', desc: '昆虫的建筑艺术' }
    ],
    poems: [
      { title: '题西林壁', author: '苏轼', content: '横看成岭侧成峰，远近高低各不同。\n不识庐山真面目，只缘身在此山中。' }
    ],
    knowledge: ['体会文章准确生动的表达', '连续细致的观察', '写观察日记'],
    writing: '写观察日记：记录连续观察'
  },
  'ch_4': {
    lessons: [
      { num: 12, title: '盘古开天地', author: '', desc: '中国古代神话故事' },
      { num: 13, title: '精卫填海', author: '', desc: '坚持不懈的精神' },
      { num: 14, title: '普罗米修斯', author: '', desc: '希腊神话中的英雄' },
      { num: 15, title: '女娲补天', author: '', desc: '中华神话' }
    ],
    poems: [
      { title: '嫦娥', author: '李商隐', content: '云母屏风烛影深，长河渐落晓星沉。\n嫦娥应悔偷灵药，碧海青天夜夜心。' }
    ],
    knowledge: ['了解故事的起因、经过、结果', '感受神话中神奇的想象', '复述故事'],
    writing: '我和____过一天：想象作文'
  },
  'ch_5': {
    lessons: [
      { num: 16, title: '麻雀', author: '屠格涅夫', desc: '母爱的伟大力量' },
      { num: 17, title: '爬天都峰', author: '黄亦波', desc: '战胜困难的勇气' }
    ],
    poems: [
      { title: '雪梅', author: '卢钺', content: '梅雪争春未肯降，骚人阁笔费评章。\n梅须逊雪三分白，雪却输梅一段香。' }
    ],
    knowledge: ['了解作者是怎样把事情写清楚的', '按顺序写一件事', '把事情的经过写清楚'],
    writing: '生活万花筒：写一件印象深刻的事'
  },
  'ch_6': {
    lessons: [
      { num: 18, title: '牛和鹅', author: '任大霖', desc: '换个角度看问题' },
      { num: 19, title: '一只窝囊的大老虎', author: '叶至善', desc: '童年的趣事' },
      { num: 20, title: '陀螺', author: '高洪波', desc: '童年的玩具与感悟' }
    ],
    poems: [
      { title: '出塞', author: '王昌龄', content: '秦时明月汉时关，万里长征人未还。\n但使龙城飞将在，不教胡马度阴山。' }
    ],
    knowledge: ['学习用批注的方法阅读', '通过人物的动作、语言、神态体会心情', '记一次游戏'],
    writing: '记一次游戏：把游戏过程写清楚'
  },
  'ch_7': {
    lessons: [
      { num: 21, title: '古诗三首', author: '', desc: '《出塞》《凉州词》《夏日绝句》' },
      { num: 22, title: '为中华之崛起而读书', author: '', desc: '周恩来的少年志向' },
      { num: 23, title: '梅兰芳蓄须', author: '', desc: '艺术家的民族气节' },
      { num: 24, title: '延安，我把你追寻', author: '', desc: '革命精神' }
    ],
    poems: [
      { title: '凉州词', author: '王翰', content: '葡萄美酒夜光杯，欲饮琵琶马上催。\n醉卧沙场君莫笑，古来征战几人回。' }
    ],
    knowledge: ['关注主要人物和事件', '学习把握文章的主要内容', '写信'],
    writing: '写信：注意书信格式'
  },
  'ch_8': {
    lessons: [
      { num: 25, title: '王戎不取道旁李', author: '', desc: '《世说新语》中的智慧' },
      { num: 26, title: '西门豹治邺', author: '', desc: '破除迷信、兴修水利' },
      { num: 27, title: '故事二则', author: '', desc: '《扁鹊治病》《纪昌学射》' }
    ],
    poems: [
      { title: '夏日绝句', author: '李清照', content: '生当作人杰，死亦为鬼雄。\n至今思项羽，不肯过江东。' }
    ],
    knowledge: ['了解故事情节', '简要复述课文', '写心得体会'],
    writing: '我的心儿怦怦跳：写一件让自己心跳的事'
  }
};

// --- 好词好句数据 ---
const GOOD_WORDS = {
  'ch_1': {
    words: ['浩浩荡荡', '山崩地裂', '人声鼎沸', '风号浪吼', '水天相接'],
    sentences: [
      '浪潮越来越近，犹如千万匹白色战马齐头并进，浩浩荡荡地飞奔而来。',
      '细细的溪水，流着山草和野花的香味，流着月光。'
    ]
  },
  'ch_2': {
    words: ['横七竖八', '聚精会神', '百思不得其解', '出乎意料'],
    sentences: [
      '20世纪的成就，真可以用"忽如一夜春风来，千树万树梨花开"来形容。',
      '蝙蝠就像没头苍蝇似的到处乱撞，挂在绳子上的铃铛响个不停。'
    ]
  },
  'ch_3': {
    words: ['引人注意', '毫不可惜', '随遇而安', '慎重选择'],
    sentences: [
      '爬山虎的脚触着墙的时候，六七根细丝的头上就变成小圆片，巴住墙。',
      '当四周很安静的时候，蟋蟀就在这平台上弹琴。'
    ]
  },
  'ch_4': {
    words: ['精疲力竭', '奔流不息', '气急败坏', '愤愤不平'],
    sentences: [
      '盘古倒下以后，他的身体发生了巨大的变化。',
      '女娲先从各地拣来赤、青、黄、白、黑五种颜色的石头，燃起神火熔炼。'
    ]
  },
  'ch_5': {
    words: ['无可奈何', '白发苍苍', '摇摇晃晃', '安然无恙'],
    sentences: [
      '突然，一只老麻雀从一棵树上飞下来，像一块石头似的落在猎狗面前。',
      '我奋力向峰顶爬去，一会儿攀着铁链上，一会儿手脚并用向上爬。'
    ]
  },
  'ch_6': {
    words: ['通情达理', '哄堂大笑', '垂头丧气', '得心应手'],
    sentences: [
      '金奎叔是个结实的汉子，他的胳膊比我的腿还粗。',
      '这真应了一句古话：人不可貌相，海水不可斗量。'
    ]
  },
  'ch_7': {
    words: ['志存高远', '精忠报国', '大义凛然', '英勇无畏'],
    sentences: [
      '为中华之崛起而读书！',
      '梅兰芳先生是闻名世界的京剧表演艺术家。'
    ]
  },
  'ch_8': {
    words: ['眉清目秀', '亭亭玉立', '明眸皓齿', '文质彬彬'],
    sentences: [
      '王戎七岁，尝与诸小儿游。看道边李树多子折枝，诸儿竞走取之，唯戎不动。',
      '西门豹说："把新娘领来让我看看。"'
    ]
  }
};

// --- 重点字词数据 ---
const KEY_WORDS = {
  'ch_1': {
    characters: [
      { char: '潮', pinyin: 'cháo', meaning: '潮水', example: '观潮' },
      { char: '据', pinyin: 'jù', meaning: '根据', example: '据说' },
      { char: '堤', pinyin: 'dī', meaning: '河堤', example: '大堤' },
      { char: '阔', pinyin: 'kuò', meaning: '宽阔', example: '宽阔' },
      { char: '盼', pinyin: 'pàn', meaning: '盼望', example: '盼望' }
    ],
    words: ['潮水', '据说', '大堤', '宽阔', '盼望', '滚动', '顿时', '逐渐', '犹如', '山崩地裂']
  },
  'ch_2': {
    characters: [
      { char: '豌', pinyin: 'wān', meaning: '豌豆', example: '豌豆' },
      { char: '按', pinyin: 'àn', meaning: '按照', example: '按照' },
      { char: '舒', pinyin: 'shū', meaning: '舒服', example: '舒适' },
      { char: '僵', pinyin: 'jiāng', meaning: '僵硬', example: '僵硬' },
      { char: '硬', pinyin: 'yìng', meaning: '坚硬', example: '坚硬' }
    ],
    words: ['豌豆', '按照', '舒适', '僵硬', '虚弱', '耐心', '恐怕', '曾经', '雷达', '证明']
  },
  'ch_3': {
    characters: [
      { char: '操', pinyin: 'cāo', meaning: '操场', example: '操场' },
      { char: '占', pinyin: 'zhàn', meaning: '占领', example: '占领' },
      { char: '嫩', pinyin: 'nèn', meaning: '嫩绿', example: '嫩红' },
      { char: '顺', pinyin: 'shùn', meaning: '顺利', example: '顺利' },
      { char: '叠', pinyin: 'dié', meaning: '重叠', example: '重叠' }
    ],
    words: ['操场', '占领', '嫩红', '舒服', '均匀', '重叠', '空隙', '茎叶', '住宅', '隐蔽']
  },
  'ch_4': {
    characters: [
      { char: '睁', pinyin: 'zhēng', meaning: '睁眼', example: '睁眼' },
      { char: '翻', pinyin: 'fān', meaning: '翻身', example: '翻身' },
      { char: '斧', pinyin: 'fǔ', meaning: '斧头', example: '斧头' },
      { char: '劈', pinyin: 'pī', meaning: '劈开', example: '劈开' },
      { char: '缓', pinyin: 'huǎn', meaning: '缓慢', example: '缓缓' }
    ],
    words: ['睁眼', '翻身', '斧头', '劈开', '缓缓', '浑浊', '支撑', '劳累', '血液', '奔流不息']
  },
  'ch_5': {
    characters: [
      { char: '嗅', pinyin: 'xiù', meaning: '嗅觉', example: '嗅到' },
      { char: '呆', pinyin: 'dāi', meaning: '发呆', example: '发呆' },
      { char: '奈', pinyin: 'nài', meaning: '无奈', example: '无奈' },
      { char: '巢', pinyin: 'cháo', meaning: '鸟巢', example: '鸟巢' },
      { char: '齿', pinyin: 'chǐ', meaning: '牙齿', example: '牙齿' }
    ],
    words: ['嗅觉', '发呆', '无奈', '鸟巢', '牙齿', '身躯', '掩护', '幼儿', '搏斗', '庞大']
  },
  'ch_6': {
    characters: [
      { char: '段', pinyin: 'duàn', meaning: '段落', example: '段落' },
      { char: '俩', pinyin: 'liǎ', meaning: '咱俩', example: '咱俩' },
      { char: '练', pinyin: 'liàn', meaning: '练习', example: '练习' },
      { char: '裤', pinyin: 'kù', meaning: '裤子', example: '裤子' },
      { char: '逃', pinyin: 'táo', meaning: '逃跑', example: '逃跑' }
    ],
    words: ['段落', '咱俩', '练习', '裤子', '逃跑', '亏得', '挖洞', '砸锅', '否则', '帅气']
  },
  'ch_7': {
    characters: [
      { char: '肃', pinyin: 'sù', meaning: '严肃', example: '严肃' },
      { char: '晰', pinyin: 'xī', meaning: '清晰', example: '清晰' },
      { char: '振', pinyin: 'zhèn', meaning: '振动', example: '振兴' },
      { char: '胸', pinyin: 'xiōng', meaning: '胸膛', example: '胸怀' },
      { char: '怀', pinyin: 'huái', meaning: '怀抱', example: '怀抱' }
    ],
    words: ['严肃', '清晰', '振兴', '胸怀', '赞叹', '抱负', '屈辱', '租赁', '纠缠', '邀请']
  },
  'ch_8': {
    characters: [
      { char: '戎', pinyin: 'róng', meaning: '戎装', example: '王戎' },
      { char: '尝', pinyin: 'cháng', meaning: '尝试', example: '尝试' },
      { char: '诸', pinyin: 'zhū', meaning: '诸位', example: '诸位' },
      { char: '竞', pinyin: 'jìng', meaning: '竞争', example: '竞走' },
      { char: '唯', pinyin: 'wéi', meaning: '唯一', example: '唯一' }
    ],
    words: ['王戎', '尝试', '诸位', '竞走', '唯一', '媳妇', '淹没', '干旱', '迎接', '灌溉']
  }
};

// --- 数学思维导图数据 (苏教版四年级上册) ---
const MATH_FORMULAS = {
  'math_1': [
    { name: '升与毫升', formula: '1升 = 1000毫升', type: '换算' },
    { name: '容量比较', formula: '升 > 毫升 (1升=1000毫升)', type: '概念' }
  ],
  'math_2': [
    { name: '除法试商', formula: '四舍五入法试商', type: '方法' },
    { name: '商不变规律', formula: '被除数和除数同时×或÷相同数(0除外)，商不变', type: '规律' }
  ],
  'math_3': [
    { name: '观察物体', formula: '前面、右面、上面三个方向', type: '概念' },
    { name: '视图还原', formula: '根据视图摆小正方体', type: '方法' }
  ],
  'math_4': [
    { name: '平均数', formula: '平均数 = 总数 ÷ 份数', type: '公式' },
    { name: '条形统计图', formula: '一格可以表示多个单位', type: '概念' }
  ],
  'math_5': [
    { name: '列表法', formula: '整理已知条件和问题', type: '策略' },
    { name: '画图法', formula: '用线段图分析数量关系', type: '策略' }
  ],
  'math_6': [
    { name: '可能性', formula: '一定、可能、不可能', type: '概念' },
    { name: '游戏公平', formula: '各方可能性相等才公平', type: '规则' }
  ],
  'math_7': [
    { name: '运算顺序', formula: '先乘除后加减，有括号先算括号内', type: '规则' },
    { name: '中括号', formula: '先算小括号，再算中括号', type: '规则' }
  ],
  'math_8': [
    { name: '角的度量', formula: '1°的角 → 量角器', type: '方法' },
    { name: '平行与垂直', formula: '平行:不相交 垂直:相交成直角', type: '概念' }
  ]
};

const MATH_MISTAKES = [];

// --- 英语单词与对话数据 ---
const ENGLISH_VOCAB = {
  'en_1': [
    { word: 'dog', phonetic: '/dɒɡ/', meaning: '狗', example: 'I like dogs.' },
    { word: 'cat', phonetic: '/kæt/', meaning: '猫', example: 'Do you like cats?' },
    { word: 'panda', phonetic: '/ˈpændə/', meaning: '熊猫', example: 'Look at that panda!' },
    { word: 'horse', phonetic: '/hɔːs/', meaning: '马', example: 'I have a toy horse.' },
    { word: 'cute', phonetic: '/kjuːt/', meaning: '可爱的', example: 'It\'s cute.' }
  ],
  'en_2': [
    { word: 'mango', phonetic: '/ˈmæŋɡəʊ/', meaning: '芒果', example: 'Do you have a mango?' },
    { word: 'pineapple', phonetic: '/ˈpaɪnæpl/', meaning: '菠萝', example: 'I have a pineapple.' },
    { word: 'banana', phonetic: '/bəˈnɑːnə/', meaning: '香蕉', example: 'Let\'s make a fruit salad.' },
    { word: 'grape', phonetic: '/ɡreɪp/', meaning: '葡萄', example: 'Have some grapes.' },
    { word: 'salad', phonetic: '/ˈsæləd/', meaning: '沙拉', example: 'Let\'s make a fruit salad.' }
  ],
  'en_3': [
    { word: 'thirteen', phonetic: '/ˌθɜːˈtiːn/', meaning: '十三', example: 'I have thirteen stickers.' },
    { word: 'fifteen', phonetic: '/ˌfɪfˈtiːn/', meaning: '十五', example: 'How many balls? Fifteen.' },
    { word: 'sticker', phonetic: '/ˈstɪkə/', meaning: '贴纸', example: 'I have many stickers.' },
    { word: 'can', phonetic: '/kæn/', meaning: '罐子', example: 'How many cans?' },
    { word: 'many', phonetic: '/ˈmeni/', meaning: '许多', example: 'How many do you have?' }
  ],
  'en_4': [
    { word: 'basketball', phonetic: '/ˈbɑːskɪtbɔːl/', meaning: '篮球', example: 'I can play basketball.' },
    { word: 'football', phonetic: '/ˈfʊtbɔːl/', meaning: '足球', example: 'Can you play football?' },
    { word: 'skate', phonetic: '/skeɪt/', meaning: '滑冰', example: 'I can skate.' },
    { word: 'swim', phonetic: '/swɪm/', meaning: '游泳', example: 'Can you swim?' },
    { word: 'jump', phonetic: '/dʒʌmp/', meaning: '跳', example: 'I can jump.' }
  ],
  'en_5': [
    { word: 'sofa', phonetic: '/ˈsəʊfə/', meaning: '沙发', example: 'The sofa is in the living room.' },
    { word: 'fridge', phonetic: '/frɪdʒ/', meaning: '冰箱', example: 'It\'s in the fridge.' },
    { word: 'clock', phonetic: '/klɒk/', meaning: '钟', example: 'Where\'s the clock?' },
    { word: 'table', phonetic: '/ˈteɪbl/', meaning: '桌子', example: 'It\'s on the table.' },
    { word: 'bathroom', phonetic: '/ˈbɑːθruːm/', meaning: '浴室', example: 'It\'s in the bathroom.' }
  ],
  'en_6': [
    { word: 'hamburger', phonetic: '/ˈhæmbɜːɡə/', meaning: '汉堡', example: 'I\'d like a hamburger.' },
    { word: 'sandwich', phonetic: '/ˈsænwɪdʒ/', meaning: '三明治', example: 'A sandwich, please.' },
    { word: 'rice', phonetic: '/raɪs/', meaning: '米饭', example: 'Some rice, please.' },
    { word: 'milk', phonetic: '/mɪlk/', meaning: '牛奶', example: 'I\'d like some milk.' },
    { word: 'noodles', phonetic: '/ˈnuːdlz/', meaning: '面条', example: 'Noodles, please.' }
  ],
  'en_7': [
    { word: 'shoe', phonetic: '/ʃuː/', meaning: '鞋', example: 'How much are the shoes?' },
    { word: 'sock', phonetic: '/sɒk/', meaning: '袜子', example: 'I\'d like these socks.' },
    { word: 'umbrella', phonetic: '/ʌmˈbrelə/', meaning: '伞', example: 'It\'s only nineteen yuan.' },
    { word: 'fan', phonetic: '/fæn/', meaning: '扇子', example: 'I\'d like that fan.' },
    { word: 'twenty', phonetic: '/ˈtwenti/', meaning: '二十', example: 'It\'s twenty yuan.' }
  ],
  'en_8': [
    { word: 'doll', phonetic: '/dɒl/', meaning: '洋娃娃', example: 'Look at my doll.' },
    { word: 'big', phonetic: '/bɪɡ/', meaning: '大的', example: 'Her eyes are big.' },
    { word: 'small', phonetic: '/smɔːl/', meaning: '小的', example: 'His mouth is small.' },
    { word: 'long', phonetic: '/lɒŋ/', meaning: '长的', example: 'Her hair is long.' },
    { word: 'short', phonetic: '/ʃɔːt/', meaning: '短的/矮的', example: 'His nose is small.' }
  ]
};

const ENGLISH_DIALOGUES = {
  'en_1': [
    { title: '谈论动物', a: 'Do you like dogs?', b: 'Yes, I do. They\'re cute.' },
    { title: '询问喜好', a: 'What animals do you like?', b: 'I like pandas. They\'re cute and fat.' }
  ],
  'en_2': [
    { title: '制作沙拉', a: 'Let\'s make a fruit salad.', b: 'Great! Do you have any bananas?' },
    { title: '询问物品', a: 'Do you have any pineapples?', b: 'Yes, I do. / No, I don\'t.' }
  ],
  'en_3': [
    { title: '询问数量', a: 'How many stickers do you have?', b: 'I have fifteen stickers.' },
    { title: '谈论玩具', a: 'What do you have?', b: 'I have some balls.' }
  ],
  'en_4': [
    { title: '谈论能力', a: 'Can you play basketball?', b: 'Yes, I can. / No, I can\'t.' },
    { title: '邀请运动', a: 'Let\'s go and play football.', b: 'Sorry, I can\'t. I have a swimming lesson.' }
  ],
  'en_5': [
    { title: '寻找物品', a: 'Where\'s the bag?', b: 'It\'s in the bedroom.' },
    { title: '介绍家居', a: 'Look at our new home.', b: 'It\'s nice! I like the living room.' }
  ],
  'en_6': [
    { title: '点餐用语', a: 'What would you like?', b: 'I\'d like a hamburger and a glass of milk.' },
    { title: '用餐对话', a: 'Anything else?', b: 'Yes, I\'d like some noodles, please.' }
  ],
  'en_7': [
    { title: '询问价格', a: 'Can I help you?', b: 'I\'d like these shoes. How much are they?' },
    { title: '购物对话', a: 'They\'re thirty yuan.', b: 'OK. I\'ll take them.' }
  ],
  'en_8': [
    { title: '描述玩具', a: 'Look at my doll.', b: 'She\'s beautiful! Her eyes are big.' },
    { title: '介绍特征', a: 'His mouth is small.', b: 'Yes, and his nose is small too.' }
  ]
};

const ENGLISH_SCENES = [
  { id: 'en_1', name: 'I like dogs', icon: '🐕', color: '#818cf8', desc: '谈论喜欢的动物' },
  { id: 'en_2', name: 'Let\'s make a fruit salad', icon: '🥗', color: '#f472b6', desc: '制作水果沙拉' },
  { id: 'en_3', name: 'How many?', icon: '🔢', color: '#4ade80', desc: '询问数量' },
  { id: 'en_4', name: 'I can play basketball', icon: '🏀', color: '#fbbf24', desc: '谈论运动能力' },
  { id: 'en_5', name: 'Our new home', icon: '🏠', color: '#f87171', desc: '介绍家居物品' },
  { id: 'en_6', name: 'At the snack bar', icon: '🍔', color: '#a78bfa', desc: '点餐用语' },
  { id: 'en_7', name: 'How much?', icon: '💰', color: '#38bdf8', desc: '询问价格' },
  { id: 'en_8', name: 'Dolls', icon: '🎎', color: '#fb923c', desc: '描述玩具特征' }
];

// --- 科目数据加载 ---
async function loadSubjectData(subject) {
  try {
    const progress = await api('GET', '/progress');
    const doneUnits = progress?.doneUnits || [];
    const cfg = SUBJECT_CONFIG[subject];
    if (!cfg) return;
    
    // 计算进度
    const prefix = subject === 'chinese' ? 'ch_' : subject === 'math' ? 'math_' : 'en_';
    const subjectDone = doneUnits.filter(u => u.startsWith(prefix));
    const done = subjectDone.length;
    const percent = Math.round((done / cfg.total) * 100);
    
    // 更新进度环
    const ring = document.getElementById(subject + '-progress-ring');
    if (ring) {
      const circumference = 2 * Math.PI * 54; // 339.292
      const offset = circumference - (percent / 100) * circumference;
      // 确保 stroke-dasharray 已设置
      ring.setAttribute('stroke-dasharray', circumference);
      ring.style.strokeDashoffset = offset;
      ring.style.stroke = cfg.color;
    }
    
    const percentEl = document.getElementById(subject + '-percent');
    if (percentEl) {
      percentEl.textContent = percent + '%';
      percentEl.style.color = cfg.color;
    }
    
    const doneEl = document.getElementById(subject + '-done');
    if (doneEl) {
      doneEl.textContent = done;
      doneEl.style.color = cfg.color;
    }
    
    // 根据学科渲染不同布局
    if (subject === 'chinese') {
      renderChineseFishbone(cfg, doneUnits);
    } else if (subject === 'math') {
      renderMathMindmap(cfg, doneUnits);
    } else if (subject === 'english') {
      renderEnglishScenes(cfg, doneUnits);
    }
    
  } catch (err) {
    console.error('加载科目数据失败:', err);
  }
}

// 渲染语文横向鱼骨图
function renderChineseFishbone(cfg, doneUnits) {
  const container = document.getElementById('chinese-fishbone-h');
  if (!container) return;
  
  const startEl = container.querySelector('.fishbone-h-start');
  const endEl = container.querySelector('.fishbone-h-end');
  container.querySelectorAll('.fishbone-h-node').forEach(n => n.remove());
  
  cfg.units.forEach((u, idx) => {
    const isDone = doneUnits.includes(u.id);
    const node = document.createElement('div');
    node.className = `fishbone-h-node ${isDone ? 'done' : ''}`;
    node.style.setProperty('--node-color', cfg.color);
    node.innerHTML = `
      <div class="fishbone-h-node-dot">${isDone ? '✓' : idx + 1}</div>
      <div class="fishbone-h-node-label">${u.name.split('：')[0]}</div>
      <div class="fishbone-h-node-desc">${isDone ? '已完成' : '进行中'}</div>
    `;
    node.onclick = () => showChineseDetail(u.id, cfg.color);
    container.insertBefore(node, endEl);
  });
  
  const closeBtn = document.getElementById('chinese-detail-close');
  if (closeBtn) closeBtn.onclick = () => closeChineseDetail();
}

// 渲染数学思维导图
function renderMathMindmap(cfg, doneUnits) {
  const container = document.getElementById('math-mindmap');
  if (!container) return;
  
  container.innerHTML = cfg.units.map((u, idx) => {
    const isDone = doneUnits.includes(u.id);
    const formulas = MATH_FORMULAS[u.id] || [];
    return `
      <div class="mindmap-node ${isDone ? 'done' : ''}" onclick="showMathDetail('${u.id}')">
        <div class="mindmap-node-header">
          <span class="mindmap-num">${idx + 1}</span>
          <span class="mindmap-status">${isDone ? '✓' : '○'}</span>
        </div>
        <h3 class="mindmap-title">${u.name.split('：')[1] || u.name}</h3>
        <p class="mindmap-desc">${u.desc}</p>
        <div class="mindmap-formula-preview">
          ${formulas.slice(0, 1).map(f => `<span class="formula-badge">${f.name}</span>`).join('')}
        </div>
      </div>`;
  }).join('');
}

// 渲染英语情景场景
function renderEnglishScenes(cfg, doneUnits) {
  const container = document.getElementById('english-scenes');
  if (!container) return;
  
  container.innerHTML = ENGLISH_SCENES.map((scene, idx) => {
    const isDone = doneUnits.includes(scene.id);
    return `
      <div class="scene-card ${isDone ? 'done' : ''}" onclick="showEnglishDetail('${scene.id}')" style="--scene-color: ${scene.color}">
        <div class="scene-icon">${scene.icon}</div>
        <h3 class="scene-name">${scene.name}</h3>
        <p class="scene-desc">${scene.desc}</p>
        <div class="scene-status">${isDone ? '✅ 已完成' : '⭕ 学习中'}</div>
      </div>`;
  }).join('');
}

// 显示语文单元详情（横向鱼骨图下方展开）
function showChineseDetail(unitId, color) {
  const detail = document.getElementById('chinese-detail');
  const content = document.getElementById('chinese-detail-content');
  const data = CHINESE_DETAIL[unitId];
  if (!detail || !content || !data) return;
  
  // 计算箭头位置（根据单元索引）
  const unitIndex = parseInt(unitId.split('_')[1]) - 1;
  const nodes = document.querySelectorAll('#chinese-fishbone-h .fishbone-h-node');
  if (nodes[unitIndex]) {
    const rect = nodes[unitIndex].getBoundingClientRect();
    const containerRect = document.getElementById('chinese-fishbone-h').getBoundingClientRect();
    const left = rect.left - containerRect.left + rect.width / 2;
    detail.style.setProperty('--arrow-left', left + 'px');
  }
  
  // 构建详情内容
  let html = `
    <h3 style="color: ${color}">📖 ${data.lessons[0]?.title || '单元详情'}</h3>
    <p class="detail-subtitle">第${unitId.split('_')[1]}单元 · 包含 ${data.lessons.length} 篇课文</p>
  `;
  
  // 课文列表
  if (data.lessons.length > 0) {
    html += '<div class="lesson-list">';
    data.lessons.forEach(l => {
      html += `
        <div class="lesson-item">
          <div class="lesson-num">${l.num}</div>
          <div class="lesson-info">
            <h4>${l.title}</h4>
            <p>${l.author ? l.author + ' · ' : ''}${l.desc}</p>
          </div>
        </div>`;
    });
    html += '</div>';
  }
  
  // 古诗词 - 使用新样式
  if (data.poems.length > 0) {
    html += '<div class="poem-section">';
    html += '<h4>🌸 古诗词</h4>';
    data.poems.forEach(p => {
      html += `
        <div class="chinese-poem-card">
          <div class="poem-title-large">${p.title}</div>
          <div class="poem-author-large">[${p.author}]</div>
          <div class="poem-content-large">${p.content.replace(/\n/g, '<br>')}</div>
        </div>`;
    });
    html += '</div>';
  }
  
  // 好词好句 - 使用新样式
  const goodWords = GOOD_WORDS[unitId];
  if (goodWords) {
    html += '<div class="good-words-section">';
    html += '<h4>🌟 好词好句积累</h4>';
    
    // 好词 - 使用气泡样式
    if (goodWords.words.length > 0) {
      html += '<div class="word-tags">';
      html += '<h5>✨ 好词</h5>';
      html += '<div class="tags">';
      goodWords.words.forEach(w => {
        html += `<span class="good-word-bubble">${w}</span>`;
      });
      html += '</div></div>';
    }
    
    // 好句 - 使用高亮样式
    if (goodWords.sentences.length > 0) {
      html += '<div class="sentence-list">';
      html += '<h5>📝 好句</h5>';
      goodWords.sentences.forEach(s => {
        html += `<div class="sentence-highlight">${s}</div>`;
      });
      html += '</div>';
    }
    html += '</div>';
  }
  
  // 重点字词 - 使用新样式
  const keyWords = KEY_WORDS[unitId];
  if (keyWords) {
    html += '<div class="key-words-section">';
    html += '<h4>📖 重点字词</h4>';
    
    // 生字 - 使用增强卡片样式
    if (keyWords.characters.length > 0) {
      html += '<div class="char-grid">';
      html += '<h5>🎯 生字表</h5>';
      html += '<div class="char-list">';
      keyWords.characters.forEach(c => {
        html += `
          <div class="char-card-enhanced">
            <div class="char-stroke">${c.char}</div>
            <div class="char-detail">
              <div style="color:var(--accent);font-weight:600;">${c.pinyin}</div>
              <div style="color:var(--text2);">${c.meaning}</div>
              <div style="color:var(--text3);font-size:11px;">${c.example}</div>
            </div>
          </div>`;
      });
      html += '</div></div>';
    }
    
    // 词语
    if (keyWords.words.length > 0) {
      html += '<div class="word-list">';
      html += '<h5>📚 词语表</h5>';
      html += '<div class="word-tags">';
      keyWords.words.forEach(w => {
        html += `<span class="word-tag primary">${w}</span>`;
      });
      html += '</div></div>';
    }
    html += '</div>';
  }
  
  // 错别字记录
  html += '<div class="typo-section">';
  html += '<h4>⚠️ 错别字记录</h4>';
  html += '<div id="typo-list-' + unitId + '" class="typo-list">';
  html += '<p class="typo-empty">暂无记录</p>';
  html += '</div>';
  html += '<div class="typo-hint">💡 在微信对话中发送默写图片，我会帮你记录到这里</div>';
  html += '</div>';
  
  // 知识点
  if (data.knowledge.length > 0) {
    html += '<div class="knowledge-section">';
    html += '<div class="knowledge-card">';
    html += '<h5>📌 单元重点</h5>';
    html += '<ul>';
    data.knowledge.forEach(k => {
      html += `<li>${k}</li>`;
    });
    html += '</ul></div>';
    
    // 习作
    if (data.writing) {
      html += '<div class="knowledge-card">';
      html += '<h5>✍️ 习作要求</h5>';
      html += `<p style="font-size:14px;color:var(--text2);line-height:1.6">${data.writing}</p>`;
      html += '</div>';
    }
    html += '</div>';
  }
  
  content.innerHTML = html;
  detail.style.display = 'block';
  detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 关闭语文详情
function closeChineseDetail() {
  const detail = document.getElementById('chinese-detail');
  if (detail) detail.style.display = 'none';
}

// 添加错别字记录（从微信对话中添加）
async function addTypoRecord(unitId, word, correct) {
  try {
    const res = await api('POST', '/chinese/typo', {
      unitId,
      word,
      correct: correct || '',
      date: new Date().toISOString().split('T')[0]
    });
    
    if (res.ok) {
      // 刷新显示
      loadTypoList(unitId);
    }
  } catch (err) {
    console.error('添加错别字记录失败:', err);
  }
}

// 加载错别字列表
async function loadTypoList(unitId) {
  try {
    const res = await api('GET', `/chinese/typo/${unitId}`);
    showTypoList(unitId, res.typos || []);
  } catch (err) {
    console.error('加载错别字失败:', err);
  }
}



// 显示数学单元详情
function showMathDetail(unitId) {
  const container = document.getElementById('math-formulas');
  if (!container) return;
  
  const formulas = MATH_FORMULAS[unitId] || [];
  const cfg = SUBJECT_CONFIG.math;
  const unit = cfg.units.find(u => u.id === unitId);
  
  // 滚动到公式区
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  container.innerHTML = `
    <div class="formula-unit-header">
      <h3 style="color: ${cfg.color}">📐 ${unit?.name || '单元公式'}</h3>
      <button class="btn btn-sm" onclick="renderMathFormulas()">返回全部</button>
    </div>
    <div class="formula-cards">
      ${formulas.map(f => `
        <div class="math-formula-card">
          <div class="formula-name">${f.name}</div>
          <div class="formula-math">${f.formula}</div>
          <div class="formula-desc">${f.type} · 点击收藏到错题本</div>
        </div>
      `).join('')}
    </div>
    <div class="formula-actions">
      <button class="btn btn-primary" onclick="toggleSubjectUnit('math', '${unitId}', false)">
        ✅ 标记完成
      </button>
    </div>
  `;
}

// 渲染所有数学公式
function renderMathFormulas() {
  const container = document.getElementById('math-formulas');
  if (!container) return;
  
  const allFormulas = [];
  Object.entries(MATH_FORMULAS).forEach(([unitId, formulas]) => {
    const unit = SUBJECT_CONFIG.math.units.find(u => u.id === unitId);
    formulas.forEach(f => {
      allFormulas.push({ ...f, unitName: unit?.name?.split('：')[1] || '' });
    });
  });
  
  container.innerHTML = `
    <div class="formula-cards">
      ${allFormulas.map(f => `
        <div class="math-formula-card">
          <div class="formula-name">${f.name}</div>
          <div class="formula-math">${f.formula}</div>
          <div class="formula-desc">${f.type} · ${f.unitName}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// 显示英语单元详情
function showEnglishDetail(unitId) {
  const vocabContainer = document.getElementById('english-vocab');
  const dialogueContainer = document.getElementById('english-dialogues');
  
  const vocabs = ENGLISH_VOCAB[unitId] || [];
  const dialogues = ENGLISH_DIALOGUES[unitId] || [];
  const scene = ENGLISH_SCENES.find(s => s.id === unitId);
  
  // 渲染单词卡片 - 使用新样式
  if (vocabContainer) {
    vocabContainer.innerHTML = `
      <div class="vocab-scene-header" style="--scene-color: ${scene?.color || '#f472b6'}">
        <span class="vocab-scene-icon">${scene?.icon || '🌍'}</span>
        <h3>${scene?.name || 'Unit'}</h3>
      </div>
      <div class="vocab-flip-grid">
        ${vocabs.map((v, idx) => `
          <div class="english-word-card" onclick="this.classList.toggle('flipped')">
            <div class="word-card-inner">
              <div class="word-card-front">
                <span class="word-text">${v.word}</span>
                <span class="word-phonetic">${v.phonetic}</span>
                <span class="word-hint">点击翻转</span>
              </div>
              <div class="word-card-back">
                <span class="word-meaning">${v.meaning}</span>
                <span class="word-example">${v.example}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // 渲染情景对话 - 使用新样式
  if (dialogueContainer) {
    dialogueContainer.innerHTML = dialogues.map((d, idx) => `
      <div class="english-dialogue-scene">
        <div class="dialogue-scene-title">${d.title}</div>
        <div class="dialogue-bubbles">
          <div class="dialogue-bubble bubble-left">
            <div class="dialogue-avatar">👦</div>
            <div class="dialogue-text">${d.a}</div>
          </div>
          <div class="dialogue-bubble bubble-right">
            <div class="dialogue-avatar">👧</div>
            <div class="dialogue-text">${d.b}</div>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // 滚动到单词区
  if (vocabContainer) vocabContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 显示错别字列表
function showTypoList(unitId, typos) {
  const listEl = document.getElementById('typo-list-' + unitId);
  if (!listEl) return;
  
  if (!typos || typos.length === 0) {
    listEl.innerHTML = '<p class="typo-empty">暂无错别字记录 👍</p>';
    return;
  }
  
  listEl.innerHTML = typos.map((t, idx) => `
    <div class="typo-item">
      <span class="typo-num">${idx + 1}</span>
      <span class="typo-word wrong">${t.word}</span>
      <span class="typo-arrow">→</span>
      <input type="text" class="typo-input" placeholder="正确写法" value="${t.correct || ''}" 
        onchange="updateTypoCorrect('${unitId}', ${idx}, this.value)">
      <span class="typo-date">${t.date?.slice(5) || ''}</span>
      <button class="typo-delete" onclick="deleteTypo('${unitId}', ${idx})">✕</button>
    </div>
  `).join('');
}

// 更新正确写法
async function updateTypoCorrect(unitId, idx, correct) {
  try {
    await api('PUT', `/chinese/typo/${unitId}/${idx}`, { correct });
  } catch (err) {
    console.error('更新失败:', err);
  }
}

// 删除错别字记录
async function deleteTypo(unitId, idx) {
  if (!confirm('确定删除这条记录吗？')) return;
  try {
    await api('DELETE', `/chinese/typo/${unitId}/${idx}`);
    // 刷新列表
    const listEl = document.getElementById('typo-list-' + unitId);
    if (listEl) {
      const items = listEl.querySelectorAll('.typo-item');
      if (items[idx]) items[idx].remove();
    }
  } catch (err) {
    console.error('删除失败:', err);
  }
}

// 展开/收起单元详情（旧版时间轴用，保留兼容）
function toggleUnitDetail(subject, unitId) {
  const detail = document.getElementById('detail-' + unitId);
  if (!detail) return;
  const isVisible = detail.style.display !== 'none';
  
  // 先收起所有其他详情
  document.querySelectorAll('.timeline-detail').forEach(d => {
    if (d.id !== 'detail-' + unitId) d.style.display = 'none';
  });
  
  detail.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) {
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// 标记科目单元完成
async function toggleSubjectUnit(subject, unit, isDone) {
  try {
    if (isDone) {
      await api('DELETE', `/progress/${subject}/${unit}`);
    } else {
      await api('POST', `/progress/${subject}/${unit}`);
    }
    loadSubjectData(subject);
    // 同时刷新首页统计
    if (getRoute() === 'home') loadHomeData();
  } catch (err) {
    console.error('标记失败:', err);
  }
}

// --- 奥数配置 ---
const OLYMPIAD_CONFIG = [
  {
    category: '基础应用题',
    color: '#4ade80',
    topics: [
      { 
        id: 'om_1_1', 
        name: '和差问题', 
        desc: '已知两数的和与差，求这两个数',
        difficulty: 'easy',
        method: '大数=(和+差)÷2，小数=(和-差)÷2',
        steps: [
          { title: '理解题意', desc: '找出题目中给出的两个数的和与差' },
          { title: '确定公式', desc: '大数 = (和 + 差) ÷ 2', formula: '大数 = (和 + 差) ÷ 2' },
          { title: '计算小数', desc: '小数 = (和 - 差) ÷ 2 或 小数 = 和 - 大数', formula: '小数 = (和 - 差) ÷ 2' },
          { title: '验证答案', desc: '检查：大数 + 小数 = 和，大数 - 小数 = 差' }
        ],
        example: {
          question: '甲乙两数和为50，差为10，求甲乙各是多少？',
          answer: [
            { label: '大数(甲)', value: '(50 + 10) ÷ 2 = 30' },
            { label: '小数(乙)', value: '(50 - 10) ÷ 2 = 20' },
            { label: '验证', value: '30 + 20 = 50 ✓，30 - 20 = 10 ✓' }
          ]
        }
      },
      { 
        id: 'om_1_2', 
        name: '和倍问题', 
        desc: '已知两数的和与倍数关系',
        difficulty: 'easy',
        method: '小数=和÷(倍数+1)，大数=小数×倍数',
        steps: [
          { title: '理解题意', desc: '找出两数的和以及它们之间的倍数关系' },
          { title: '画线段图', desc: '小数画1段，大数画相应的倍数段' },
          { title: '计算小数', desc: '小数 = 和 ÷ (倍数 + 1)', formula: '小数 = 和 ÷ (倍数 + 1)' },
          { title: '计算大数', desc: '大数 = 小数 × 倍数', formula: '大数 = 小数 × 倍数' }
        ],
        example: {
          question: '甲乙和为60，甲是乙的2倍，求甲乙各是多少？',
          answer: [
            { label: '小数(乙)', value: '60 ÷ (2 + 1) = 20' },
            { label: '大数(甲)', value: '20 × 2 = 40' },
            { label: '验证', value: '40 + 20 = 60 ✓' }
          ]
        }
      },
      { 
        id: 'om_1_3', 
        name: '差倍问题', 
        desc: '已知两数的差与倍数关系',
        difficulty: 'medium',
        method: '小数=差÷(倍数-1)，大数=小数×倍数',
        steps: [
          { title: '理解题意', desc: '找出两数的差以及它们之间的倍数关系' },
          { title: '分析差值', desc: '大数比小数多(倍数-1)倍' },
          { title: '计算小数', desc: '小数 = 差 ÷ (倍数 - 1)', formula: '小数 = 差 ÷ (倍数 - 1)' },
          { title: '计算大数', desc: '大数 = 小数 × 倍数', formula: '大数 = 小数 × 倍数' }
        ],
        example: {
          question: '甲比乙大30，甲是乙的4倍，求甲乙各是多少？',
          answer: [
            { label: '小数(乙)', value: '30 ÷ (4 - 1) = 10' },
            { label: '大数(甲)', value: '10 × 4 = 40' },
            { label: '验证', value: '40 - 10 = 30 ✓' }
          ]
        }
      }
    ]
  },
  {
    category: '生活应用题',
    color: '#38bdf8',
    topics: [
      { 
        id: 'om_2_1', 
        name: '年龄问题', 
        desc: '利用年龄差不变解题',
        difficulty: 'medium',
        method: '年龄差永远不变，画线段图分析',
        steps: [
          { title: '找出关键', desc: '年龄差是永远不变的' },
          { title: '画线段图', desc: '用线段表示现在或未来的年龄关系' },
          { title: '列方程', desc: '根据倍数关系列出等式' },
          { title: '求解验证', desc: '解方程并验证是否符合题意' }
        ],
        example: {
          question: '爸爸35岁，儿子5岁，几年后爸爸是儿子的3倍？',
          answer: [
            { label: '年龄差', value: '35 - 5 = 30岁（永远不变）' },
            { label: '倍数时差', value: '30 ÷ (3 - 1) = 15岁（儿子）' },
            { label: '经过年数', value: '15 - 5 = 10年' },
            { label: '验证', value: '45 ÷ 15 = 3 ✓' }
          ]
        }
      },
      { 
        id: 'om_2_2', 
        name: '植树问题', 
        desc: '间隔与棵数的关系',
        difficulty: 'easy',
        method: '两端都植：棵数=间隔数+1；一端植：棵数=间隔数',
        steps: [
          { title: '判断类型', desc: '确定是两端都植、一端植还是两端不植' },
          { title: '计算间隔', desc: '间隔数 = 总长度 ÷ 间隔长度' },
          { title: '应用公式', desc: '根据类型选择正确的棵数公式' },
          { title: '验证答案', desc: '画图验证棵数是否正确' }
        ],
        example: {
          question: '100米路每隔5米植树，两端都植，需多少棵？',
          answer: [
            { label: '间隔数', value: '100 ÷ 5 = 20个' },
            { label: '棵数', value: '20 + 1 = 21棵（两端都植）' },
            { label: '验证', value: '21棵树有20个间隔，20×5=100米 ✓' }
          ]
        }
      },
      { 
        id: 'om_2_3', 
        name: '盈亏问题', 
        desc: '分配中的盈与亏',
        difficulty: 'hard',
        method: '(盈+亏)÷两次分配差=人数',
        steps: [
          { title: '理解盈和亏', desc: '盈是多出来的，亏是不够的部分' },
          { title: '找出分配差', desc: '两次分配中每人分得的数量差' },
          { title: '计算人数', desc: '人数 = (盈 + 亏) ÷ 分配差', formula: '人数 = (盈 + 亏) ÷ 分配差' },
          { title: '计算总量', desc: '根据人数和任意一次分配计算总量' }
        ],
        example: {
          question: '每人分5个多10个，每人分7个少6个，有多少人？',
          answer: [
            { label: '盈', value: '+10个' },
            { label: '亏', value: '-6个' },
            { label: '人数', value: '(10 + 6) ÷ (7 - 5) = 8人' },
            { label: '验证', value: '5×8+10=50，7×8-6=50 ✓' }
          ]
        }
      }
    ]
  },
  {
    category: '数量关系',
    color: '#f472b6',
    topics: [
      { 
        id: 'om_3_1', 
        name: '平均数问题', 
        desc: '求平均数的方法',
        difficulty: 'easy',
        method: '总数÷份数=平均数，移多补少',
        steps: [
          { title: '理解概念', desc: '平均数 = 总数 ÷ 份数' },
          { title: '计算总数', desc: '把所有数相加得到总和' },
          { title: '计算平均', desc: '平均数 = 总数 ÷ 个数', formula: '平均数 = 总数 ÷ 个数' },
          { title: '移多补少', desc: '多的给少的，使每个数相等' }
        ],
        example: {
          question: '三门成绩分别是85、90、95，平均分是多少？',
          answer: [
            { label: '总数', value: '85 + 90 + 95 = 270' },
            { label: '平均数', value: '270 ÷ 3 = 90分' },
            { label: '移多补少', value: '95给85各5分，三人都得90分' }
          ]
        }
      },
      { 
        id: 'om_3_2', 
        name: '归一问题', 
        desc: '先求单一量',
        difficulty: 'easy',
        method: '先求1份的量，再求多份的量',
        steps: [
          { title: '理解题意', desc: '找出总量和对应的份数' },
          { title: '求单一量', desc: '单一量 = 总量 ÷ 份数', formula: '单一量 = 总量 ÷ 份数' },
          { title: '求新总量', desc: '新总量 = 单一量 × 新份数', formula: '新总量 = 单一量 × 新份数' },
          { title: '验证答案', desc: '检查单位是否一致' }
        ],
        example: {
          question: '3小时做12个零件，5小时做多少个？',
          answer: [
            { label: '单一量', value: '12 ÷ 3 = 4个/小时' },
            { label: '新总量', value: '4 × 5 = 20个' },
            { label: '验证', value: '20 ÷ 5 = 4个/小时 ✓' }
          ]
        }
      },
      { 
        id: 'om_3_3', 
        name: '归总问题', 
        desc: '总量不变的问题',
        difficulty: 'medium',
        method: '总量=单一量×份数，新单一量=总量÷新份数',
        steps: [
          { title: '理解题意', desc: '总量不变，单一量和份数成反比' },
          { title: '计算总量', desc: '总量 = 单一量 × 份数', formula: '总量 = 单一量 × 份数' },
          { title: '计算新量', desc: '新单一量 = 总量 ÷ 新份数', formula: '新单一量 = 总量 ÷ 新份数' },
          { title: '验证答案', desc: '检查总量是否相等' }
        ],
        example: {
          question: '每天读20页，15天读完；每天读25页，几天读完？',
          answer: [
            { label: '总量', value: '20 × 15 = 300页' },
            { label: '新天数', value: '300 ÷ 25 = 12天' },
            { label: '验证', value: '25 × 12 = 300页 ✓' }
          ]
        }
      }
    ]
  },
  {
    category: '行程问题',
    color: '#fbbf24',
    topics: [
      { 
        id: 'om_4_1', 
        name: '行程问题', 
        desc: '路程、速度、时间',
        difficulty: 'easy',
        method: '路程=速度×时间，速度=路程÷时间',
        steps: [
          { title: '理解公式', desc: '路程 = 速度 × 时间' },
          { title: '找出已知', desc: '确定题目中已知哪两个量' },
          { title: '选择公式', desc: '求路程用乘法，求速度或时间用除法' },
          { title: '单位统一', desc: '确保速度、时间单位匹配' }
        ],
        example: {
          question: '速度60km/h，行驶3小时，路程是多少？',
          answer: [
            { label: '公式', value: '路程 = 速度 × 时间' },
            { label: '计算', value: '60 × 3 = 180km' },
            { label: '验证', value: '180 ÷ 3 = 60km/h ✓' }
          ]
        }
      },
      { 
        id: 'om_4_2', 
        name: '相遇问题', 
        desc: '两人相向而行',
        difficulty: 'medium',
        method: '相遇时间=总路程÷速度和',
        steps: [
          { title: '理解运动', desc: '两人相向而行，距离越来越近' },
          { title: '计算速度和', desc: '速度和 = 甲速 + 乙速', formula: '速度和 = 甲速 + 乙速' },
          { title: '计算时间', desc: '相遇时间 = 总路程 ÷ 速度和', formula: '相遇时间 = 总路程 ÷ 速度和' },
          { title: '计算路程', desc: '各自行程 = 各自速度 × 时间' }
        ],
        example: {
          question: 'AB相距300km，甲速60km/h，乙速40km/h，几小时相遇？',
          answer: [
            { label: '速度和', value: '60 + 40 = 100km/h' },
            { label: '相遇时间', value: '300 ÷ 100 = 3小时' },
            { label: '验证', value: '60×3 + 40×3 = 300km ✓' }
          ]
        }
      },
      { 
        id: 'om_4_3', 
        name: '追及问题', 
        desc: '同向而行的追赶',
        difficulty: 'hard',
        method: '追及时间=路程差÷速度差',
        steps: [
          { title: '理解运动', desc: '两人同向而行，快者追赶慢者' },
          { title: '计算路程差', desc: '先走的路程 = 先走时间 × 速度' },
          { title: '计算速度差', desc: '速度差 = 快者速度 - 慢者速度', formula: '速度差 = 快速 - 慢速' },
          { title: '计算时间', desc: '追及时间 = 路程差 ÷ 速度差', formula: '追及时间 = 路程差 ÷ 速度差' }
        ],
        example: {
          question: '甲先走2小时，速度40km/h，乙速度60km/h，几小时追上？',
          answer: [
            { label: '路程差', value: '40 × 2 = 80km' },
            { label: '速度差', value: '60 - 40 = 20km/h' },
            { label: '追及时间', value: '80 ÷ 20 = 4小时' },
            { label: '验证', value: '60×4 = 40×(2+4) = 240km ✓' }
          ]
        }
      }
    ]
  },
  {
    category: '经典趣题',
    color: '#a78bfa',
    topics: [
      { 
        id: 'om_5_1', 
        name: '鸡兔同笼', 
        desc: '经典假设法',
        difficulty: 'medium',
        method: '假设全是鸡，多出来的脚÷2=兔数',
        steps: [
          { title: '理解题意', desc: '知道头的总数和脚的总数，求鸡兔各多少' },
          { title: '假设全是鸡', desc: '假设所有动物都是鸡（2只脚）' },
          { title: '计算脚差', desc: '实际脚数 - 假设脚数 = 多出来的脚', formula: '多出来的脚 = 实际脚 - 2×头数' },
          { title: '求兔数', desc: '兔数 = 多出来的脚 ÷ 2', formula: '兔数 = 多出来的脚 ÷ 2' },
          { title: '求鸡数', desc: '鸡数 = 头数 - 兔数' }
        ],
        example: {
          question: '头35个，脚94只，鸡兔各多少？',
          answer: [
            { label: '假设全是鸡', value: '35 × 2 = 70只脚' },
            { label: '多出来的脚', value: '94 - 70 = 24只' },
            { label: '兔数', value: '24 ÷ 2 = 12只' },
            { label: '鸡数', value: '35 - 12 = 23只' },
            { label: '验证', value: '23×2 + 12×4 = 46+48=94 ✓' }
          ]
        }
      },
      { 
        id: 'om_5_2', 
        name: '牛吃草问题', 
        desc: '生长与消耗',
        difficulty: 'hard',
        method: '草每天生长量=(牛1×天1-牛2×天2)÷(天1-天2)',
        steps: [
          { title: '理解题意', desc: '草每天都在生长，牛每天都在吃草' },
          { title: '假设变量', desc: '设原有草为G，每天生长量为g' },
          { title: '列方程组', desc: '根据两次不同情况列出方程' },
          { title: '求解生长量', desc: '草每天生长量 = (牛1×天1 - 牛2×天2) ÷ (天1 - 天2)' },
          { title: '求解原有草', desc: '原有草 = 牛×天数 - 生长量×天数' }
        ],
        example: {
          question: '10头牛20天吃完，15头牛10天吃完，25头牛几天吃完？',
          answer: [
            { label: '每天生长量', value: '(10×20 - 15×10) ÷ (20-10) = 5份/天' },
            { label: '原有草量', value: '10×20 - 5×20 = 100份' },
            { label: '25头牛', value: '5头吃新草，20头吃旧草' },
            { label: '天数', value: '100 ÷ 20 = 5天' }
          ]
        }
      },
      { 
        id: 'om_5_3', 
        name: '工程问题', 
        desc: '工作效率问题',
        difficulty: 'medium',
        method: '工效=1÷工时，合作工效=工效和',
        steps: [
          { title: '设总量为1', desc: '把工程总量看作单位"1"' },
          { title: '计算工效', desc: '工作效率 = 1 ÷ 完成时间', formula: '工效 = 1 ÷ 工时' },
          { title: '计算合作工效', desc: '合作工效 = 各工效之和', formula: '合作工效 = 甲工效 + 乙工效' },
          { title: '计算时间', desc: '合作时间 = 1 ÷ 合作工效', formula: '合作时间 = 1 ÷ 合作工效' }
        ],
        example: {
          question: '甲10天完成，乙15天完成，合作几天完成？',
          answer: [
            { label: '甲工效', value: '1/10（每天完成1/10）' },
            { label: '乙工效', value: '1/15（每天完成1/15）' },
            { label: '合作工效', value: '1/10 + 1/15 = 1/6' },
            { label: '合作时间', value: '1 ÷ 1/6 = 6天' }
          ]
        }
      }
    ]
  },
  {
    category: '分数与比例',
    color: '#fb923c',
    topics: [
      { 
        id: 'om_6_1', 
        name: '分数应用题', 
        desc: '分数的乘除应用',
        difficulty: 'medium',
        method: '找单位"1"，画线段图，列方程',
        steps: [
          { title: '找单位"1"', desc: '确定谁是整体，通常"的"字前面是单位"1"' },
          { title: '画线段图', desc: '把单位"1"画成线段，标出已知分数' },
          { title: '确定运算', desc: '已知单位"1"用乘法，求单位"1"用除法' },
          { title: '列式计算', desc: '根据数量关系列出算式' }
        ],
        example: {
          question: '一本书看了3/5，还剩80页，全书多少页？',
          answer: [
            { label: '单位"1"', value: '全书页数' },
            { label: '剩余比例', value: '1 - 3/5 = 2/5' },
            { label: '全书页数', value: '80 ÷ 2/5 = 200页' },
            { label: '验证', value: '200 × 3/5 = 120页，200-120=80 ✓' }
          ]
        }
      },
      { 
        id: 'om_6_2', 
        name: '百分数应用', 
        desc: '百分数的实际应用',
        difficulty: 'easy',
        method: '百分数=部分÷整体×100%',
        steps: [
          { title: '理解百分数', desc: '百分数表示一个数是另一个数的百分之几' },
          { title: '找出整体', desc: '确定单位"1"（整体）是多少' },
          { title: '计算百分数', desc: '百分数 = 部分 ÷ 整体 × 100%', formula: '百分数 = 部分 ÷ 整体 × 100%' },
          { title: '实际应用', desc: '折扣、利率、税率等实际问题' }
        ],
        example: {
          question: '原价200元，打8折，现价多少？',
          answer: [
            { label: '折扣含义', value: '8折 = 80% = 0.8' },
            { label: '现价', value: '200 × 0.8 = 160元' },
            { label: '节省', value: '200 - 160 = 40元' }
          ]
        }
      },
      { 
        id: 'om_6_3', 
        name: '比和比例', 
        desc: '按比例分配',
        difficulty: 'easy',
        method: '总量÷总份数=每份量',
        steps: [
          { title: '理解比', desc: '比表示两个数的倍数关系' },
          { title: '计算总份数', desc: '把比的前项和后项相加', formula: '总份数 = 前项 + 后项' },
          { title: '计算每份', desc: '每份量 = 总量 ÷ 总份数', formula: '每份量 = 总量 ÷ 总份数' },
          { title: '分配数量', desc: '各部分 = 每份量 × 各自份数' }
        ],
        example: {
          question: '甲乙丙按2:3:5分100元，各得多少？',
          answer: [
            { label: '总份数', value: '2 + 3 + 5 = 10份' },
            { label: '每份', value: '100 ÷ 10 = 10元' },
            { label: '甲', value: '10 × 2 = 20元' },
            { label: '乙', value: '10 × 3 = 30元' },
            { label: '丙', value: '10 × 5 = 50元' }
          ]
        }
      }
    ]
  },
  {
    category: '几何专题',
    color: '#22d3ee',
    topics: [
      { 
        id: 'om_7_1', 
        name: '几何初步', 
        desc: '周长与面积',
        difficulty: 'easy',
        method: '长方形周长=2×(长+宽)，面积=长×宽',
        steps: [
          { title: '识别图形', desc: '确定是长方形、正方形还是其他图形' },
          { title: '找出尺寸', desc: '确定长和宽（或边长）' },
          { title: '选择公式', desc: '周长公式或面积公式' },
          { title: '单位统一', desc: '确保所有长度单位一致' }
        ],
        example: {
          question: '长8cm宽5cm的长方形，求周长和面积',
          answer: [
            { label: '周长', value: '2 × (8 + 5) = 26cm' },
            { label: '面积', value: '8 × 5 = 40cm²' },
            { label: '验证', value: '周长 = 8+5+8+5 = 26cm ✓' }
          ]
        }
      },
      { 
        id: 'om_7_2', 
        name: '立体几何', 
        desc: '体积与表面积',
        difficulty: 'medium',
        method: '长方体体积=长×宽×高，表面积=2×(lw+lh+wh)',
        steps: [
          { title: '识别立体', desc: '确定是长方体、正方体还是圆柱' },
          { title: '找出尺寸', desc: '确定长、宽、高（或棱长、半径）' },
          { title: '计算体积', desc: '体积 = 长 × 宽 × 高', formula: 'V = l × w × h' },
          { title: '计算表面积', desc: '表面积 = 2×(lw + lh + wh)' }
        ],
        example: {
          question: '棱长3cm的正方体，求体积和表面积',
          answer: [
            { label: '体积', value: '3 × 3 × 3 = 27cm³' },
            { label: '表面积', value: '6 × (3 × 3) = 54cm²' },
            { label: '验证', value: '正方体6个面，每个面9cm² ✓' }
          ]
        }
      }
    ]
  }
];

// --- 奥数数据（鱼骨图版）---
async function loadOlympiadData() {
  try {
    const progress = await api('GET', '/progress');
    const doneOM = progress?.doneOM || [];
    const total = 20;
    const done = doneOM.length;
    const percent = Math.round((done / total) * 100);
    
    // 更新进度环
    const ring = document.getElementById('olympiad-progress-ring');
    if (ring) {
      const circumference = 2 * Math.PI * 54;
      const offset = circumference - (percent / 100) * circumference;
      ring.setAttribute('stroke-dasharray', circumference);
      ring.style.strokeDashoffset = offset;
    }
    
    const percentEl = document.getElementById('olympiad-percent');
    if (percentEl) percentEl.textContent = percent + '%';
    
    const doneEl = document.getElementById('olympiad-done');
    if (doneEl) doneEl.textContent = done;
    
    // 渲染鱼骨图
    const container = document.getElementById('olympiad-fishbone');
    if (!container) return;
    
    container.innerHTML = `
      <div class="fishbone-spine">
        <div class="fishbone-head">🎯 奥数知识体系</div>
        ${OLYMPIAD_CONFIG.map((cat, catIdx) => `
          <div class="fishbone-category ${catIdx % 2 === 0 ? 'up' : 'down'}">
            <div class="fishbone-bone" style="--bone-color: ${cat.color}">
              <div class="fishbone-category-label">${cat.category}</div>
              <div class="fishbone-topics">
                ${cat.topics.map(t => {
                  const isDone = doneOM.includes(t.id);
                  return `
                    <div class="fishbone-topic ${isDone ? 'done' : ''}" 
                      onclick="toggleOlympiadDetail('${t.id}')"
                      style="--topic-color: ${cat.color}">
                      <span class="topic-icon">${isDone ? '✅' : '🔸'}</span>
                      <span class="topic-name">${t.name}</span>
                    </div>
                    <div class="fishbone-detail" id="om-detail-${t.id}" style="display:none">
                      <div class="fishbone-detail-content">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                          <h4 style="margin:0;">${t.name}</h4>
                          <span class="difficulty-badge difficulty-${t.difficulty}">
                            ${t.difficulty === 'easy' ? '⭐ 简单' : t.difficulty === 'medium' ? '⭐⭐ 中等' : '⭐⭐⭐ 困难'}
                          </span>
                        </div>
                        <p class="detail-desc">${t.desc}</p>
                        
                        <div class="detail-section">
                          <h5>📝 解题步骤</h5>
                          <div class="solution-steps">
                            ${t.steps.map((step, idx) => `
                              <div class="solution-step">
                                <div class="step-number">${idx + 1}</div>
                                <div class="step-content">
                                  <div class="step-title">${step.title}</div>
                                  <div class="step-desc">${step.desc}</div>
                                  ${step.formula ? `<div class="step-formula">${step.formula}</div>` : ''}
                                </div>
                              </div>
                            `).join('')}
                          </div>
                        </div>
                        
                        <div class="detail-section">
                          <h5>💡 典型例题</h5>
                          <div class="example-card">
                            <div class="example-header">
                              <span>🎯</span>
                              <span>例题解析</span>
                            </div>
                            <div class="example-question">${t.example.question}</div>
                            <div class="example-answer">
                              ${t.example.answer.map(a => `
                                <div class="answer-row">
                                  <span class="answer-label">${a.label}：</span>
                                  <span class="answer-value">${a.value}</span>
                                </div>
                              `).join('')}
                            </div>
                          </div>
                        </div>
                        
                        <div class="method-tags">
                          <span class="method-tag">📐 ${t.category}</span>
                          <span class="method-tag">🔢 ${t.method.split('，')[0]}</span>
                        </div>
                        
                        <button class="btn btn-sm ${isDone ? 'btn-done' : 'btn-primary'}" 
                          onclick="event.stopPropagation(); toggleTopic('${t.id}', ${isDone})"
                          style="margin-top:16px;">
                          ${isDone ? '✅ 标记未完成' : '⭕ 标记完成'}
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        `).join('')}
        <div class="fishbone-tail">🏆</div>
      </div>
    `;
    
  } catch (err) {
    console.error('加载奥数数据失败:', err);
  }
}

// 展开/收起奥数专题详情
function toggleOlympiadDetail(topicId) {
  const detail = document.getElementById('om-detail-' + topicId);
  if (!detail) return;
  const isVisible = detail.style.display !== 'none';
  
  // 先收起所有其他详情
  document.querySelectorAll('.fishbone-detail').forEach(d => {
    if (d.id !== 'om-detail-' + topicId) d.style.display = 'none';
  });
  
  detail.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) {
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// --- 吉他数据 ---
async function loadGuitarData() {
  try {
    const videos = await api('GET', '/guitar');
    
    // 更新统计
    const totalEl = document.getElementById('guitar-total');
    const durationEl = document.getElementById('guitar-duration');
    const songsEl = document.getElementById('guitar-songs');
    const streakEl = document.getElementById('guitar-streak');
    
    if (totalEl) totalEl.textContent = videos?.length || 0;
    
    let totalDuration = 0;
    const songs = new Set();
    const dates = new Set();
    (videos || []).forEach(v => {
      if (v.duration) totalDuration += parseInt(v.duration);
      if (v.title) songs.add(v.title);
      if (v.date) dates.add(v.date.split('T')[0]);
    });
    
    if (durationEl) durationEl.textContent = Math.round(totalDuration / 60);
    if (songsEl) songsEl.textContent = songs.size;
    if (streakEl) streakEl.textContent = calcStreakDays(dates);
    
    // 更新目标进度（传入视频数组，计算本周次数）
    updateGoalProgress(videos || []);
    
    // 最新视频
    const latestEl = document.getElementById('guitar-latest');
    if (latestEl) {
      if (videos && videos.length > 0) {
        const latest = videos[0];
        latestEl.innerHTML = `
          <div class="guitar-latest-card">
            <video controls class="guitar-video" poster="">
              <source src="/uploads/${latest.video_path}" type="video/mp4">
            </video>
            <div class="guitar-video-info">
              <div class="guitar-video-title">${latest.title}</div>
              <div class="guitar-video-meta">
                <span>📅 ${formatDate(latest.date)}</span>
                ${latest.bpm ? `<span>🎵 ${latest.bpm} BPM</span>` : ''}
                ${latest.key_sig ? `<span>🎼 ${latest.key_sig}</span>` : ''}
                ${latest.duration ? `<span>⏱️ ${Math.round(latest.duration/60)}分钟</span>` : ''}
              </div>
              ${latest.notes ? `<div class="guitar-video-notes">${latest.notes}</div>` : ''}
            </div>
          </div>`;
      } else {
        latestEl.innerHTML = `
          <div class="empty-state">
            <span class="emoji">🎸</span>
            <p>还没有练习视频</p>
            <span class="hint">点击右上角上传你的第一次练习</span>
          </div>`;
      }
    }
    
    // 音乐分析
    const analysisEl = document.getElementById('guitar-analysis');
    if (analysisEl) {
      if (videos && videos.length > 0) {
        const latest = videos[0];
        analysisEl.innerHTML = `
          <div class="analysis-grid">
            <div class="analysis-card">
              <div class="analysis-icon">🎵</div>
              <div class="analysis-label">速度</div>
              <div class="analysis-value">${latest.bpm || '--'} BPM</div>
            </div>
            <div class="analysis-card">
              <div class="analysis-icon">🎼</div>
              <div class="analysis-label">调性</div>
              <div class="analysis-value">${latest.key_sig || '--'}</div>
            </div>
            <div class="analysis-card">
              <div class="analysis-icon">⏱️</div>
              <div class="analysis-label">时长</div>
              <div class="analysis-value">${latest.duration ? Math.round(latest.duration/60) + '分钟' : '--'}</div>
            </div>
            <div class="analysis-card">
              <div class="analysis-icon">📈</div>
              <div class="analysis-label">练习次数</div>
              <div class="analysis-value">${videos.length}次</div>
            </div>
          </div>`;
      } else {
        analysisEl.innerHTML = `
          <div class="empty-state">
            <span class="emoji">📊</span>
            <p>上传视频后将显示音乐分析</p>
          </div>`;
      }
    }
    
    // 历史列表
    const listEl = document.getElementById('guitar-list');
    if (listEl) {
      if (videos && videos.length > 0) {
        listEl.innerHTML = videos.map((v, idx) => `
          <div class="guitar-item ${idx === 0 ? 'guitar-item-latest' : ''}" data-id="${v.id}">
            <div class="guitar-item-index">${idx + 1}</div>
            <div class="guitar-item-info">
              <div class="guitar-item-title">${v.title}</div>
              <div class="guitar-item-meta">
                <span>📅 ${formatDate(v.date)}</span>
                ${v.duration ? `<span>⏱️ ${Math.round(v.duration/60)}分钟</span>` : ''}
                ${v.bpm ? `<span>🎵 ${v.bpm}BPM</span>` : ''}
              </div>
            </div>
            <div class="guitar-item-arrow">→</div>
          </div>`).join('');
      } else {
        listEl.innerHTML = `
          <div class="empty-state">
            <span class="emoji">📚</span>
            <p>暂无历史记录</p>
          </div>`;
      }
    }
    
    // 曲目库
    const songsLibraryEl = document.getElementById('song-list');
    if (songsLibraryEl) {
      if (songs.size > 0) {
        const songArray = Array.from(songs);
        songsLibraryEl.innerHTML = songArray.map(song => {
          const songVideos = videos.filter(v => v.title === song);
          const latestPractice = songVideos[0];
          const practiceCount = songVideos.length;
          return `
            <div class="song-item">
              <div class="song-icon">🎵</div>
              <div class="song-info">
                <div class="song-name">${song}</div>
                <div class="song-meta">
                  <span>练习 ${practiceCount} 次</span>
                  <span>最近 ${formatDate(latestPractice.date)}</span>
                </div>
              </div>
              <div class="song-status ${practiceCount >= 5 ? 'mastered' : 'learning'}">
                ${practiceCount >= 5 ? '✅ 已掌握' : '📖 练习中'}
              </div>
            </div>`;
        }).join('');
      } else {
        songsLibraryEl.innerHTML = `
          <div class="empty-state">
            <span class="emoji">🎵</span>
            <p>曲目库为空</p>
            <span class="hint">开始练习后自动收录</span>
          </div>`;
      }
    }
    
  } catch (err) {
    console.error('加载吉他数据失败:', err);
  }
}

// 计算连续练习天数
function calcStreakDays(dates) {
  if (!dates || dates.size === 0) return 0;
  const sorted = Array.from(dates).sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // 检查今天或昨天是否有练习
  if (!sorted.includes(today) && !sorted.includes(yesterday)) return 0;
  
  let checkDate = sorted.includes(today) ? today : yesterday;
  for (const date of sorted) {
    if (date === checkDate) {
      streak++;
      const nextDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0];
      checkDate = nextDate;
    } else if (new Date(date) < new Date(checkDate)) {
      break;
    }
  }
  return streak;
}

// 计算本周练习次数（从周日开始算一周）
function calcWeeklyCount(videos) {
  if (!videos || videos.length === 0) return 0;
  
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=周日, 1=周一, ...
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  return videos.filter(v => {
    if (!v.date) return false;
    const videoDate = new Date(v.date);
    return videoDate >= startOfWeek;
  }).length;
}

// 更新目标进度
function updateGoalProgress(videos) {
  const goalCurrent = document.getElementById('goal-current');
  const goalFill = document.getElementById('goal-fill');
  const goalTarget = document.getElementById('goal-target');
  
  if (!goalCurrent || !goalFill) return;
  
  const target = parseInt(localStorage.getItem('guitar-goal-target') || '3');
  const weeklyCount = calcWeeklyCount(videos);
  
  if (goalTarget) goalTarget.textContent = target;
  goalCurrent.textContent = Math.min(weeklyCount, target);
  
  const percent = Math.min((weeklyCount / target) * 100, 100);
  goalFill.style.width = percent + '%';
  
  // 根据进度设置不同颜色
  if (percent >= 100) {
    goalFill.style.background = 'linear-gradient(90deg, var(--accent), var(--yellow))';
    goalFill.style.boxShadow = '0 0 12px rgba(74,222,128,0.4)';
  } else if (percent >= 60) {
    goalFill.style.background = 'linear-gradient(90deg, var(--accent), var(--cyan))';
    goalFill.style.boxShadow = 'none';
  } else {
    goalFill.style.background = 'var(--accent)';
    goalFill.style.boxShadow = 'none';
  }
}

// 编辑目标
function editGoal() {
  const modal = document.getElementById('modal-goal');
  if (modal) modal.classList.add('active');
}

// 保存目标
function saveGoal() {
  const target = document.getElementById('goal-input')?.value || '3';
  const duration = document.getElementById('goal-duration')?.value || '30';
  localStorage.setItem('guitar-goal-target', target);
  localStorage.setItem('guitar-goal-duration', duration);
  closeModal('modal-goal');
  
  // 刷新显示 - 重新加载吉他数据以获取最新进度
  loadGuitarData();
}

// --- 闪光时刻数据 ---
async function loadShineData() {
  try {
    const shines = await api('GET', '/shines');
    const wall = document.getElementById('shine-wall');
    const statsWrap = document.getElementById('shine-stats');
    if (!wall) return;
    
    // 更新统计
    if (statsWrap) {
      document.getElementById('shine-count').textContent = shines?.length || 0;
      document.getElementById('shine-streak').textContent = calcStreak(shines);
      document.getElementById('shine-fav').textContent = shines?.filter(s => s.fav).length || 0;
    }
    
    if (!shines || !shines.length) {
      wall.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <span class="emoji">✨</span>
          <p>还没有闪光时刻<br>点击右上角记录一个吧</p>
        </div>`;
      return;
    }
    
    // 获取当前筛选
    const activeFilter = document.querySelector('#shine-filters .tech-filter.active');
    const filter = activeFilter?.dataset.filter || 'all';
    
    const filtered = filter === 'all' ? shines : shines.filter(s => s.type === filter);
    
    wall.innerHTML = filtered.map(s => createPhotoCard(s)).join('');
    
    // 绑定筛选事件
    document.querySelectorAll('#shine-filters .tech-filter').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('#shine-filters .tech-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadShineData();
      };
    });
    
  } catch (err) {
    console.error('加载闪光时刻失败:', err);
  }
}

function createPhotoCard(s) {
  const typeLabels = {
    award: '🏆 获奖',
    sport: '⚽ 运动', 
    art: '🎨 创意',
    talent: '🎸 才艺',
    progress: '📈 进步',
    other: '💫 其他'
  };
  
  // 处理多张照片
  let photos = [];
  if (s.photo) {
    try {
      const parsed = JSON.parse(s.photo);
      photos = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      photos = [s.photo];
    }
  }
  if (s.image) photos.push(s.image);
  
  // 生成图片 HTML
  let imgHtml = '';
  if (photos.length === 0) {
    imgHtml = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:48px;">✨</div>`;
  } else if (photos.length === 1) {
    imgHtml = `<img src="${photos[0]}" class="photo-img" alt="${s.title}" loading="lazy">`;
  } else {
    // 多张照片 - 显示缩略图网格
    imgHtml = `
      <div class="photo-grid-multi">
        ${photos.slice(0, 4).map((p, i) => `
          <div class="photo-grid-item ${i === 0 ? 'photo-grid-main' : ''}">
            <img src="${p}" alt="${s.title}" loading="lazy">
            ${i === 3 && photos.length > 4 ? `<div class="photo-grid-more">+${photos.length - 3}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }
  
  return `
    <div class="photo-card" data-id="${s.id}" data-photos='${JSON.stringify(photos)}'>
      <div class="photo-img-wrap">
        ${imgHtml}
        <div class="photo-overlay">
          <span class="photo-date">${formatDate(s.date)}</span>
          ${photos.length > 1 ? `<span class="photo-count">📸 ${photos.length}</span>` : ''}
        </div>
        <button class="photo-fav-btn ${s.fav ? 'fav-active' : ''}" onclick="toggleShineFav(event, ${s.id})" title="${s.fav ? '取消精选' : '设为精选'}">
          ${s.fav ? '⭐' : '☆'}
        </button>
      </div>
      <div class="photo-info">
        <div class="photo-title">${s.title}</div>
        <div class="photo-tags">
          <span class="photo-tag ${s.type || 'other'}">${typeLabels[s.type] || '💫 其他'}</span>
          ${s.fav ? '<span class="photo-tag" style="background:rgba(251,191,36,0.2);color:var(--yellow);">⭐ 精选</span>' : ''}
        </div>
      </div>
    </div>`;
}

// 切换闪光时刻精选状态
async function toggleShineFav(event, id) {
  event.stopPropagation();
  
  try {
    const shines = await api('GET', '/shines');
    const shine = shines.find(s => s.id === id);
    if (!shine) return;
    
    const newFav = !shine.fav;
    await api('POST', '/shines/' + id + '/fav', { fav: newFav });
    
    // 更新本地显示
    const card = document.querySelector(`.photo-card[data-id="${id}"]`);
    if (card) {
      const btn = card.querySelector('.photo-fav-btn');
      if (btn) {
        btn.classList.toggle('fav-active', newFav);
        btn.innerHTML = newFav ? '⭐' : '☆';
        btn.title = newFav ? '取消精选' : '设为精选';
      }
      
      // 更新标签
      const tags = card.querySelector('.photo-tags');
      if (tags) {
        const existingFavTag = tags.querySelector('.photo-tag[style*="yellow"]');
        if (newFav && !existingFavTag) {
          tags.innerHTML += '<span class="photo-tag" style="background:rgba(251,191,36,0.2);color:var(--yellow);">⭐ 精选</span>';
        } else if (!newFav && existingFavTag) {
          existingFavTag.remove();
        }
      }
    }
    
    // 更新统计
    const favCount = document.getElementById('shine-fav');
    if (favCount) {
      const count = shines.filter(s => s.id === id ? newFav : s.fav).length;
      favCount.textContent = count;
    }
    
    showToast(newFav ? '⭐ 已设为精选' : '☆ 已取消精选');
  } catch (err) {
    console.error('切换精选状态失败:', err);
    showToast('❌ 操作失败，请重试');
  }
}

function calcStreak(shines) {
  if (!shines?.length) return 0;
  const dates = [...new Set(shines.map(s => s.date).filter(Boolean))].sort().reverse();
  if (!dates.length) return 0;
  
  let streak = 1;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i-1]);
    const curr = new Date(dates[i]);
    const diff = (prev - curr) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// 科技新闻来源图标映射
const TECH_SOURCE_ICONS = {
  '新华社': '🏛️',
  '人民日报': '📰',
  '科技日报': '🔬',
  '科学网': '🧪',
  'Nature': '📚',
  'Science': '📖',
  'IEEE': '💻',
  'MIT': '🎓',
  'OpenAI': '🤖',
  'Google': '🔍',
  '微软': '🪟',
  '苹果': '🍎',
  '华为': '🇨🇳',
  '腾讯': '🐧',
  '阿里': '🐱',
  '字节跳动': '🎵',
  'SpaceX': '🚀',
  'NASA': '🌌',
  'CNSA': '🛰️',
  '知乎': '💡',
  'B站': '📺',
  '微博': '📱',
  '默认': '📡'
};

// 获取新闻来源图标
function getTechSourceIcon(source) {
  if (!source) return TECH_SOURCE_ICONS['默认'];
  for (const [key, icon] of Object.entries(TECH_SOURCE_ICONS)) {
    if (source.includes(key)) return icon;
  }
  return TECH_SOURCE_ICONS['默认'];
}

// --- 科技数据 ---
async function loadTechData() {
  try {
    const news = await api('GET', '/tech');
    const container = document.getElementById('tech-content');
    if (!container) return;
    
    if (!news || !news.length) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="emoji">🔬</span>
          <p>还没有科技新闻<br>点击右上角添加一条吧</p>
        </div>`;
      return;
    }
    
    container.innerHTML = news.map(t => {
      const sourceIcon = getTechSourceIcon(t.source);
      return `
      <div class="tech-card ${t.fav ? 'fav' : ''}" data-id="${t.id}">
        <div class="tech-card-header">
          <div class="tech-category">${t.category || '🔬 科学'}</div>
          <div class="tech-actions">
            <button class="btn-icon" onclick="toggleTechFav(${t.id})" title="收藏">
              ${t.fav ? '⭐' : '☆'}
            </button>
            <button class="btn-icon" onclick="deleteTech(${t.id})" title="删除">🗑️</button>
          </div>
        </div>
        <div class="tech-title">${t.title}</div>
        <div class="tech-summary">${t.summary || ''}</div>
        <div class="tech-meta">
          <span class="tech-date">${formatDate(t.date)}</span>
          ${t.source ? `<span class="tech-source"><span class="source-icon">${sourceIcon}</span> ${t.source}</span>` : ''}
        </div>
      </div>`;
    }).join('');
      
  } catch (err) {
    console.error('加载科技数据失败:', err);
  }
}

// ============================================================
// 交互函数
// ============================================================

// --- 科技新闻 ---
async function toggleTechFav(id) {
  try {
    await api('PUT', `/tech/${id}/fav`);
    loadTechData();
  } catch (err) {
    console.error('收藏失败:', err);
  }
}

async function deleteTech(id) {
  if (!confirm('确定删除这条新闻吗？')) return;
  try {
    await api('DELETE', `/tech/${id}`);
    loadTechData();
  } catch (err) {
    console.error('删除失败:', err);
  }
}

async function saveTech() {
  const title = document.getElementById('tech-title').value.trim();
  const category = document.getElementById('tech-category').value;
  const summary = document.getElementById('tech-summary').value.trim();
  const source = document.getElementById('tech-source').value.trim();
  
  if (!title) return alert('请输入标题');
  
  try {
    await api('POST', '/tech', { title, category, summary, source, date: new Date().toISOString().slice(0,10) });
    closeModal('modal-tech');
    document.getElementById('tech-title').value = '';
    document.getElementById('tech-summary').value = '';
    document.getElementById('tech-source').value = '';
    loadTechData();
  } catch (err) {
    console.error('保存失败:', err);
    alert('保存失败');
  }
}

// --- 吉他 ---
async function saveGuitar() {
  const title = document.getElementById('guitar-title').value.trim();
  const file = document.getElementById('guitar-video').files[0];
  const notes = document.getElementById('guitar-notes').value.trim();
  
  if (!title) return alert('请输入曲目名称');
  if (!file) return alert('请选择视频文件');
  
  const formData = new FormData();
  formData.append('title', title);
  formData.append('video', file);
  formData.append('notes', notes);
  formData.append('date', new Date().toISOString().slice(0,10));
  
  try {
    const res = await fetch(API + '/api/guitar', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('上传失败');
    closeModal('modal-guitar');
    document.getElementById('guitar-title').value = '';
    document.getElementById('guitar-video').value = '';
    document.getElementById('guitar-notes').value = '';
    loadGuitarData();
  } catch (err) {
    console.error('上传失败:', err);
    alert('上传失败');
  }
}

// --- 奥数 ---
async function toggleTopic(unit, isDone) {
  try {
    if (isDone) {
      await api('DELETE', `/progress/olympiad/${unit}`);
    } else {
      await api('POST', `/progress/olympiad/${unit}`);
    }
    loadOlympiadData();
    // 同时刷新首页统计
    if (getRoute() === 'home') loadHomeData();
  } catch (err) {
    console.error('标记失败:', err);
  }
}

// --- 日记 ---
async function saveDiary() {
  const title = document.getElementById('diary-title').value.trim();
  const content = document.getElementById('diary-content').value.trim();
  
  if (!title || !content) return alert('请填写标题和内容');
  
  try {
    await api('POST', '/diary', {
      mood: selectedMood,
      title,
      content,
      date: new Date().toISOString().slice(0,10)
    });
    closeModal('modal-diary');
    document.getElementById('diary-title').value = '';
    document.getElementById('diary-content').value = '';
    selectMood('😄');
    
    // 刷新当前页
    const page = getRoute();
    if (page === 'diary') loadDiaryData();
    if (page === 'home') loadHomeData();
  } catch (err) {
    console.error('保存日记失败:', err);
    alert('保存失败');
  }
}

function selectMood(mood) {
  selectedMood = mood;
  document.querySelectorAll('.mood-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.mood === mood);
  });
}

// --- 闪光时刻 ---
async function saveShine() {
  const title = document.getElementById('shine-title').value.trim();
  const type = document.getElementById('shine-type').value;
  const description = document.getElementById('shine-desc').value.trim();
  
  if (!title) return alert('请输入标题');
  
  try {
    await api('POST', '/shines', {
      title,
      type,
      description,
      date: new Date().toISOString().slice(0,10)
    });
    closeModal('modal-shine');
    document.getElementById('shine-title').value = '';
    document.getElementById('shine-desc').value = '';
    
    const page = getRoute();
    if (page === 'shine') loadShineData();
    if (page === 'home') loadHomeData();
  } catch (err) {
    console.error('保存失败:', err);
    alert('保存失败');
  }
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
// 导航涟漪效果
// ============================================================
function createRipple(e, element) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  
  element.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
}

// ============================================================
// 初始化
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 已加载');
  console.log('main-content 元素:', document.getElementById('main-content'));
  
  // 拦截导航链接
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        e.preventDefault();
        // 添加涟漪效果
        if (link.classList.contains('nav-item')) {
          createRipple(e, link);
        }
        navigate(href);
      }
    }
  });
  
  // 浏览器前进/后退
  window.addEventListener('popstate', renderRoute);
  
  // 初始渲染
  console.log('开始初始渲染');
  renderRoute();
});
