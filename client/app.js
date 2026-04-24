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
// 每日成长轨迹数据
// ============================================================

let dailyCheckData = JSON.parse(localStorage.getItem(TODAY_KEY + '_check') || 'null');
let selectedCheckMood = '😊';

function getTodayCheckData() {
  return JSON.parse(localStorage.getItem(TODAY_KEY + '_check') || 'null');
}

function saveTodayCheckData(data) {
  localStorage.setItem(TODAY_KEY + '_check', JSON.stringify(data));
  dailyCheckData = data;
}

// ============================================================
// 首页
// ============================================================

async function updateHomePage() {
  // 设置日期
  document.getElementById('growth-date').textContent = `${today()} ${['周日','周一','周二','周三','周四','周五','周六'][new Date().getDay()]}`;
  
  // 加载统计数据
  const diary = await api('GET', '/diary');
  const shines = await api('GET', '/shines');
  const guitar = await api('GET', '/guitar');
  
  document.getElementById('hero-stat-diary').textContent = diary.length || 0;
  document.getElementById('hero-stat-shine').textContent = shines.length || 0;
  document.getElementById('hero-stat-days').textContent = Math.max(1, diary.length || 1);
  
  // 渲染成长时间轴
  renderGrowthTimeline();
  
  // 更新能量值
  updateEnergyBar();
  
  // 显示每日总结（如果有）
  renderDailySummary();
  
  // 加载最新内容
  renderLatestDiary(diary.slice(0, 3));
  renderLatestShine(shines.slice(0, 2));
  
  // 加载科技新闻
  const tech = await api('GET', '/tech');
  renderLatestTech(tech.slice(0, 3));
  
  // 更新任务进度
  updateTodayProgress();
}

// ============================================================
// 成长时间轴渲染
// ============================================================

function renderGrowthTimeline() {
  const container = document.getElementById('growth-timeline');
  const data = getTodayCheckData();
  
  if (!data || !data.items || data.items.length === 0) {
    container.innerHTML = `
      <div class="growth-empty">
        <div class="growth-empty-icon">🌅</div>
        <p>今天还没有记录哦～</p>
        <p class="growth-empty-hint">点击"记录今日"告诉豆芽今天发生了什么！</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = data.items.map(item => `
    <div class="growth-item">
      <div class="growth-item-time">${item.time}</div>
      <div class="growth-item-content">
        <div class="growth-item-title">
          <span>${item.icon}</span>
          <span>${item.title}</span>
        </div>
        <div class="growth-item-desc">${item.desc}</div>
      </div>
    </div>
  `).join('');
}

// ============================================================
// 能量条更新
// ============================================================

function updateEnergyBar() {
  const data = getTodayCheckData();
  let energy = 0;
  
  if (data) {
    // 基础能量
    energy += 20;
    // 学习记录
    if (data.learn && data.learn.tags) energy += data.learn.tags.length * 15;
    if (data.learn && data.learn.detail) energy += 10;
    // 兴趣记录
    if (data.hobby && data.hobby.tags) energy += data.hobby.tags.length * 10;
    // 心情记录
    if (data.mood) energy += 10;
    // 挑战记录
    if (data.challenge) energy += 15;
  }
  
  energy = Math.min(100, energy);
  document.getElementById('energy-value').textContent = energy + '%';
  document.getElementById('energy-fill').style.width = energy + '%';
  
  // 更新提示语
  const hints = [
    '记录学习、运动、兴趣，能量值会上升哦！',
    '加油！再记录一点就能升级了！',
    '太棒了！今天的能量满满！',
    '哇！超级能量！你是今天最闪亮的星！'
  ];
  const hintIndex = Math.min(3, Math.floor(energy / 25));
  document.getElementById('energy-hint').textContent = hints[hintIndex];
}

// ============================================================
// 每日总结渲染
// ============================================================

function renderDailySummary() {
  const data = getTodayCheckData();
  const summaryEl = document.getElementById('daily-summary');
  
  if (!data || !data.summary) {
    summaryEl.style.display = 'none';
    return;
  }
  
  summaryEl.style.display = 'block';
  document.getElementById('summary-content').innerHTML = data.summary;
}

// ============================================================
// 生成每日总结
// ============================================================

function generateDailySummary(data) {
  const parts = [];
  
  // 开场
  const greetings = ['今天真是充实的一天！', '哇，今天过得好精彩！', '又是成长的一天呢！'];
  parts.push(`<p>${greetings[Math.floor(Math.random() * greetings.length)]}</p>`);
  
  // 学习部分
  if (data.learn && data.learn.tags && data.learn.tags.length > 0) {
    parts.push(`<p>📚 <strong>学习方面：</strong>今天学习了${data.learn.tags.join('、')}，${data.learn.detail || '真棒！'}</p>`);
  }
  
  // 兴趣部分
  if (data.hobby && data.hobby.tags && data.hobby.tags.length > 0) {
    parts.push(`<p>🎸 <strong>兴趣练习：</strong>今天练习了${data.hobby.tags.join('、')}，${data.hobby.detail || '坚持就是胜利！'}</p>`);
  }
  
  // 心情
  if (data.mood) {
    const moodTexts = {
      '😄': '今天心情超级好！',
      '🤩': '今天特别兴奋！',
      '😊': '今天心情不错～',
      '🙂': '今天心情平稳。',
      '😐': '今天有点平淡。',
      '😔': '今天有点低落，没关系，明天会更好！',
      '😤': '今天遇到了挑战，但你很勇敢！',
      '😢': '今天有点难过，抱抱你，明天又是新的一天！'
    };
    parts.push(`<p>${data.mood} <strong>心情：</strong>${moodTexts[data.mood] || ''} ${data.moodDetail || ''}</p>`);
  }
  
  // 挑战
  if (data.challenge) {
    parts.push(`<p>💪 <strong>挑战与突破：</strong>${data.challenge} 你真的很棒，面对困难不放弃！</p>`);
  }
  
  // 结尾鼓励
  const encouragements = [
    '<p>🌟 <strong>豆芽寄语：</strong>每一天的努力都在让你变得更强大，继续保持这份热情，未来可期！</p>',
    '<p>🌟 <strong>豆芽寄语：</strong>你的进步我看在眼里，今天的付出是明天的收获，加油！</p>',
    '<p>🌟 <strong>豆芽寄语：</strong>成长就是每天进步一点点，你已经做得很好了，为自己鼓掌！</p>'
  ];
  parts.push(encouragements[Math.floor(Math.random() * encouragements.length)]);
  
  return parts.join('');
}

// ============================================================
// 每日记录交互
// ============================================================

function toggleCheckTag(el) {
  el.classList.toggle('selected');
}

function selectCheckMood(mood) {
  selectedCheckMood = mood;
  document.querySelectorAll('#check-mood-picker .mood-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.mood === mood);
  });
}

async function saveDailyCheck() {
  // 收集数据
  const learnTags = Array.from(document.querySelectorAll('#check-learn-tags .check-tag.selected')).map(el => el.textContent);
  const learnDetail = document.getElementById('check-learn-detail').value;
  const hobbyTags = Array.from(document.querySelectorAll('#check-hobby-tags .check-tag.selected')).map(el => el.textContent);
  const hobbyDetail = document.getElementById('check-hobby-detail').value;
  const moodDetail = document.getElementById('check-mood-detail').value;
  const challenge = document.getElementById('check-challenge').value;
  
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  
  // 构建时间轴项目
  const items = [];
  if (learnTags.length > 0) {
    items.push({
      time: timeStr,
      icon: '📚',
      title: `学习：${learnTags.join('、')}`,
      desc: learnDetail || '认真学习的一天'
    });
  }
  if (hobbyTags.length > 0) {
    items.push({
      time: timeStr,
      icon: '🎸',
      title: `兴趣：${hobbyTags.join('、')}`,
      desc: hobbyDetail || '坚持练习，进步看得见'
    });
  }
  if (selectedCheckMood) {
    items.push({
      time: timeStr,
      icon: selectedCheckMood,
      title: '心情记录',
      desc: moodDetail || '记录当下的心情'
    });
  }
  if (challenge) {
    items.push({
      time: timeStr,
      icon: '💪',
      title: '挑战与突破',
      desc: challenge
    });
  }
  
  // 生成总结
  const summary = generateDailySummary({
    learn: { tags: learnTags, detail: learnDetail },
    hobby: { tags: hobbyTags, detail: hobbyDetail },
    mood: selectedCheckMood,
    moodDetail: moodDetail,
    challenge: challenge
  });
  
  // 保存数据
  const data = {
    date: today(),
    items: items,
    summary: summary,
    learn: { tags: learnTags, detail: learnDetail },
    hobby: { tags: hobbyTags, detail: hobbyDetail },
    mood: selectedCheckMood,
    moodDetail: moodDetail,
    challenge: challenge
  };
  
  saveTodayCheckData(data);
  
  // 关闭弹窗并刷新
  closeModal('modal-daily-check');
  updateHomePage();
  
  // 显示成功提示
  showToast('🌟 成长记录已保存！能量值上升！');
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface2);
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 14px;
    z-index: 9999;
    animation: slideUp 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// ============================================================
// 预览切换
// ============================================================

function switchPreview(type) {
  document.querySelectorAll('.preview-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.preview-panel').forEach(el => el.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(`preview-${type}-panel`).classList.add('active');
}

// ============================================================
// 渲染最新内容
// ============================================================

function renderLatestDiary(diary) {
  if (diary.length === 0) {
    document.getElementById('home-diary').innerHTML = '<div class="news-item"><span class="news-icon">📝</span><div class="news-body"><div class="news-title">还没有日记</div><div class="news-date">点击右上角写一篇吧</div></div></div>';
    return;
  }
  document.getElementById('home-diary').innerHTML = diary.map(d => `
    <div class="news-item" onclick="switchPage('diary')">
      <span class="news-icon">${d.mood || '📝'}</span>
      <div class="news-body">
        <div class="news-title">${d.title}</div>
        <div class="news-date">${formatDate(d.date)}</div>
      </div>
    </div>
  `).join('');
}

function renderLatestShine(shines) {
  if (shines.length === 0) {
    document.getElementById('home-shines').innerHTML = '<div class="news-item"><span class="news-icon">✨</span><div class="news-body"><div class="news-title">还没有闪光时刻</div><div class="news-date">记录第一个精彩瞬间吧</div></div></div>';
    return;
  }
  document.getElementById('home-shines').innerHTML = `
    <div class="photo-scroll">
      ${shines.map(s => `
        <div class="photo-thumb" ${s.photoUrl ? `onclick="openLightbox('${s.photoUrl}')"` : ''}>
          <div class="shine-card-small">
            <div class="shine-emoji">${s.type ? s.type.split(' ')[0] : '✨'}</div>
            <div class="shine-title-small">${s.title}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLatestTech(tech) {
  if (tech.length === 0) {
    document.getElementById('home-tech').innerHTML = '<div class="news-item"><span class="news-icon">🔬</span><div class="news-body"><div class="news-title">还没有科技新闻</div><div class="news-date">去探索科技世界吧</div></div></div>';
    return;
  }
  document.getElementById('home-tech').innerHTML = tech.map(t => `
    <div class="news-item" onclick="switchPage('tech')">
      <span class="news-icon">🔬</span>
      <div class="news-body">
        <div class="news-title">${t.title}</div>
        <div class="news-date">${t.category || '科技'}</div>
      </div>
    </div>
  `).join('');
}

// ============================================================
// 今日任务
// ============================================================

function updateTodayProgress() {
  const tasks = document.querySelectorAll('.today-task');
  const completed = document.querySelectorAll('.today-task.done').length;
  document.getElementById('today-progress').textContent = `${completed}/${tasks.length}`;
}

function loadTodayTasks() {
  // 从localStorage加载任务状态
  const saved = localStorage.getItem(TODAY_KEY + '_tasks');
  if (saved) {
    const done = JSON.parse(saved);
    document.querySelectorAll('.today-task').forEach(el => {
      if (done.includes(el.dataset.task)) {
        el.classList.add('done');
        el.querySelector('.task-check').textContent = '✓';
      }
    });
  }
  updateTodayProgress();
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
  chinese: { 
    name: '语文', 
    icon: '📖', 
    units: 8, 
    color: 'var(--accent)',
    items: [
      { name: '第一单元生字', desc: '学习8个生字词，练习拼音和书写' },
      { name: '第二单元生字', desc: '掌握更多汉字，练习组词造句' },
      { name: '第三单元生字', desc: '巩固拼音，提升书写能力' },
      { name: '第四单元生字', desc: '强化汉字记忆和运用' },
      { name: '第五单元生字', desc: '提升读写综合能力' },
      { name: '第六单元生字', desc: '扩展词汇量，练习写作' },
      { name: '第七单元生字', desc: '综合练习，巩固所学' },
      { name: '第八单元生字', desc: '期末复习，全面提升' }
    ]
  },
  math: { 
    name: '数学', 
    icon: '🔢', 
    units: 6, 
    color: 'var(--accent2)',
    items: [
      { name: '大数的认识', desc: '学习万以内数的读写和大小比较' },
      { name: '两位数乘除法', desc: '掌握两位数乘除法的计算方法' },
      { name: '角的度量', desc: '认识角，会用量角器画角' },
      { name: '三位数加减法', desc: '学习三位数加减法竖式计算' },
      { name: '图形的认识', desc: '认识长方形、正方形和平行四边形' },
      { name: '统计与可能性', desc: '学习数据收集和简单的统计方法' }
    ]
  },
  english: { 
    name: '英语', 
    icon: '🔤', 
    units: 6, 
    color: 'var(--pink)',
    items: [
      { name: 'Greetings 问候语', desc: 'Hello, Hi, Good morning 等日常问候' },
      { name: 'Colors 颜色', desc: 'Red, Blue, Green 等颜色单词' },
      { name: 'Numbers 数字', desc: '1-20 数字的英语表达' },
      { name: 'Family 家庭', desc: 'Dad, Mom, Brother 等家庭成员' },
      { name: 'Animals 动物', desc: 'Cat, Dog, Bird 等动物单词' },
      { name: 'Food 食物', desc: 'Apple, Bread, Water 等食物单词' }
    ]
  },
  olympiad: { 
    name: '奥数', 
    icon: '🧮', 
    units: 20, 
    color: 'var(--yellow)',
    items: [
      { name: '和差问题', desc: '已知两数之和与差，求两数' },
      { name: '和倍问题', desc: '已知两数之和与倍数关系' },
      { name: '差倍问题', desc: '已知两数之差与倍数关系' },
      { name: '植树问题', desc: '间隔与棵树的关系' },
      { name: '年龄问题', desc: '年龄差倍变化规律' },
      { name: '周期问题', desc: '找规律，算第N个是什么' },
      { name: '还原问题', desc: '从结果倒推原数' },
      { name: '鸡兔同笼', desc: '两种动物，头脚数求只数' },
      { name: '盈亏问题', desc: '分配有余或不足的问题' },
      { name: '行程问题', desc: '速度、时间、路程关系' },
      { name: '工程问题', desc: '合作完成工作的时间' },
      { name: '浓度问题', desc: '配溶液的百分比计算' },
      { name: '利润问题', desc: '成本、定价与利润' },
      { name: '统筹问题', desc: '安排顺序省时间' },
      { name: '数字谜', desc: '竖式中的数字推理' },
      { name: '逻辑推理', desc: '条件与结论的逻辑关系' },
      { name: '排列组合', desc: '数数的有序与无序' },
      { name: '找规律', desc: '数列和图形的变化规律' },
      { name: '火柴棒游戏', desc: '移动火柴棒变算式' },
      { name: '称重问题', desc: '称找出次品的次数' }
    ]
  }
};

async function renderLearn() {
  const progress = await api('GET', '/progress');
  const done = new Set([...(progress.doneUnits||[]), ...(progress.doneOM||[])]);
  
  // 获取当前选中的科目，如果没有则默认选中第一个
  const currentSubject = localStorage.getItem('learn_subject') || 'chinese';
  const sub = SUBJECTS[currentSubject];
  const unitCount = sub.items ? sub.items.length : sub.units;
  const completed = [...Array(unitCount)].filter((_, i) => done.has(`${currentSubject}_${i+1}`)).length;
  const pct = unitCount > 0 ? Math.round(completed / unitCount * 100) : 0;
  
  // 科目切换按钮
  let subjectTabs = '';
  for (const [key, s] of Object.entries(SUBJECTS)) {
    const sDone = [...Array(s.items ? s.items.length : s.units)].filter((_, i) => done.has(`${key}_${i+1}`)).length;
    const sTotal = s.items ? s.items.length : s.units;
    subjectTabs += `<button class="subject-tab${key===currentSubject?' active':''}" onclick="switchSubject('${key}')">${s.icon} ${s.name} <span class="subject-count">${sDone}/${sTotal}</span></button>`;
  }
  
  // 单元列表（卡片式）
  let unitHtml = '';
  if (sub.items) {
    unitHtml = sub.items.map((item, i) => {
      const uid = `${currentSubject}_${i+1}`;
      const isDone = done.has(uid);
      return `
        <div class="unit-card${isDone?' done':''}" onclick="toggleUnit('${currentSubject}','${uid}',${!isDone})">
          <div class="unit-card-check">${isDone?'✓':'○'}</div>
          <div class="unit-card-body">
            <div class="unit-card-name">${item.name}</div>
            <div class="unit-card-desc">${item.desc}</div>
          </div>
          <div class="unit-card-num">${i+1}</div>
        </div>
      `;
    }).join('');
  } else {
    unitHtml = [...Array(unitCount)].map((_, i) => {
      const uid = `${currentSubject}_${i+1}`;
      const isDone = done.has(uid);
      return `<button class="unit-btn${isDone?' done':''}" onclick="toggleUnit('${currentSubject}','${uid}',${!isDone})">${i+1}</button>`;
    }).join('');
  }
  
  document.getElementById('learn-content').innerHTML = `
    <div class="learn-tabs">${subjectTabs}</div>
    <div class="learn-overview">
      <div class="learn-progress">
        <div class="progress-header">
          <span class="progress-title">${sub.icon} ${sub.name}</span>
          <span style="color:var(--text2);font-size:12px">${completed}/${unitCount}</span>
        </div>
        <div class="progress-bar" style="height:12px">
          <div class="progress-fill" style="width:${pct}%;background:linear-gradient(90deg,${sub.color},${sub.color}88)"></div>
        </div>
        <div class="progress-pct">${pct}% 完成</div>
      </div>
    </div>
    <div class="unit-list">
      ${unitHtml}
    </div>
  `;
}

function switchSubject(subject) {
  localStorage.setItem('learn_subject', subject);
  renderLearn();
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
  // 获取吉他视频列表
  const videos = await api('GET', '/guitar');
  
  // 更新统计
  document.getElementById('guitar-total').textContent = videos.length;
  
  // 统计学会曲目（从标题中提取）
  const songs = new Set();
  videos.forEach(v => {
    if (v.title) {
      ['两只老虎', '小星星', '生日快乐', '彩虹'].forEach(song => {
        if (v.title.includes(song)) songs.add(song);
      });
    }
  });
  document.getElementById('guitar-songs').textContent = songs.size;
  
  // 最新视频自动播放
  if (videos.length > 0) {
    const latest = videos[0];
    document.getElementById('latest-player').innerHTML = `
      <video controls autoplay muted playsinline style="width:100%;border-radius:12px;">
        <source src="${latest.videoUrl}" type="video/mp4">
        您的浏览器不支持视频播放
      </video>
      <div class="latest-info">
        <div class="latest-title">${latest.title}</div>
        <div class="latest-meta">${formatDate(latest.date)} · ${latest.duration ? Math.round(latest.duration) + '秒' : ''}</div>
      </div>
    `;
    
    // 更新BPM和主调显示
    if (latest.bpm) document.getElementById('guitar-bpm').textContent = latest.bpm;
    if (latest.key_sig) document.getElementById('guitar-key').textContent = latest.key_sig;
    
    // 更新时间轴
    renderGuitarTimeline(videos);
    
    // 更新反馈（如果有notes）
    if (latest.notes) {
      document.getElementById('guitar-feedback').innerHTML = latest.notes.replace(/\n/g, '<br>');
    }
  } else {
    document.getElementById('latest-player').innerHTML = `
      <div class="empty-state">
        <span class="emoji">🎸</span>
        <p>还没有练习视频<br>点击右下角按钮上传第一个吧</p>
      </div>
    `;
    document.getElementById('guitar-timeline').innerHTML = `
      <div class="empty-state">
        <span class="emoji">📅</span>
        <p>还没有练习记录</p>
      </div>
    `;
  }
}

function renderGuitarTimeline(videos) {
  if (videos.length === 0) return;
  
  const html = videos.map((v, i) => `
    <div class="timeline-item${i === 0 ? ' latest' : ''}">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-date">${formatDate(v.date)}</div>
        <div class="timeline-title">${v.title}</div>
        ${v.bpm ? `<div class="timeline-meta">BPM: ${v.bpm}${v.key_sig ? ' · 调: ' + v.key_sig : ''}</div>` : ''}
        ${v.notes ? `<div class="timeline-notes">${v.notes}</div>` : ''}
        ${v.videoUrl ? `<video controls style="width:100%;max-width:300px;border-radius:8px;margin-top:8px;"><source src="${v.videoUrl}" type="video/mp4"></video>` : ''}
      </div>
    </div>
  `).join('');
  
  document.getElementById('guitar-timeline').innerHTML = html;
}

async function saveGuitarVideo() {
  const title = document.getElementById('guitar-video-title').value.trim();
  const videoFile = document.getElementById('guitar-video-file').files[0];
  const bpm = document.getElementById('guitar-video-bpm').value;
  const keySig = document.getElementById('guitar-video-key').value;
  const notes = document.getElementById('guitar-video-notes').value.trim();
  
  if (!title) {
    alert('请输入曲目名称');
    return;
  }
  if (!videoFile) {
    alert('请选择视频文件');
    return;
  }
  
  const fd = new FormData();
  fd.append('title', title);
  fd.append('video', videoFile);
  fd.append('date', today());
  if (bpm) fd.append('bpm', bpm);
  if (keySig) fd.append('key_sig', keySig);
  if (notes) fd.append('notes', notes);
  
  await api('POST', '/guitar', fd);
  
  // 清空表单
  document.getElementById('guitar-video-title').value = '';
  document.getElementById('guitar-video-file').value = '';
  document.getElementById('guitar-video-bpm').value = '';
  document.getElementById('guitar-video-key').value = '';
  document.getElementById('guitar-video-notes').value = '';
  
  closeModal('modal-guitar');
  updateGuitarPage();
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

// 科技探索默认内容库（适合10岁小孩的科学知识）
const TECH_NEWS_BANK = [
  { title: '🚀 SpaceX 星舰成功回收！', summary: 'SpaceX 的星舰火箭第一次成功用机械臂抓住了返回的助推器，就像用筷子夹住筷子一样厉害！这是人类太空探索的巨大进步。', category: '🚀 太空', source: '科技新闻' },
  { title: '🤖 AI 能帮你写作业吗？', summary: '人工智能越来越聪明，可以回答问题、写文章、画画。但它不是万能的，真正的学习还是要靠自己动脑筋哦！', category: '🤖 AI', source: '科技新闻' },
  { title: '🦕 科学家发现新恐龙化石', summary: '古生物学家在阿根廷发现了一种新的恐龙化石，这种恐龙有长长的脖子和巨大的身体，可能比霸王龙还要大！', category: '🦕 自然', source: '科学发现' },
  { title: '🔋 新型电池充一次跑1000公里', summary: '科学家发明了一种新型固态电池，可以让电动汽车充一次电就跑1000公里，比现在的电池厉害多了！', category: '⚡ 能源', source: '科技新闻' },
  { title: '🌊 海洋深处发现发光生物', summary: '深海探测器在海底3000米处发现了一种会发光的神秘生物，它们像星星一样在黑暗中闪闪发光。', category: '🐟 海洋', source: '自然探索' },
  { title: '📱 手机为什么能定位？', summary: '手机定位靠GPS卫星，天上有很多卫星绕着地球转，它们告诉手机你在哪里，误差只有几米！', category: '📡 通信', source: '科普知识' },
  { title: '🧬 基因是什么？', summary: '基因就像身体的说明书，决定了你长什么样子、有什么特点。每个人的基因都是独一无二的！', category: '🧬 生物', source: '科普知识' },
  { title: '🌍 地球正在变暖', summary: '科学家发现地球的平均温度在慢慢升高，这是因为人类燃烧煤炭和石油产生了太多二氧化碳。保护环境很重要！', category: '🌍 环境', source: '科学新闻' },
  { title: '🚁 无人机送快递', summary: '有些城市已经开始用无人机送快递了！无人机可以飞到楼顶，把包裹准确地送到你手上。', category: '🚁 科技', source: '科技新闻' },
  { title: '🔭 韦伯望远镜拍到最远星系', summary: '詹姆斯·韦伯太空望远镜拍到了距离地球130亿光年的星系，那是宇宙刚诞生不久时的样子！', category: '🌌 天文', source: '天文发现' },
  { title: '🐝 蜜蜂也会做数学题？', summary: '科学家发现蜜蜂能理解"零"的概念，还能做简单的加减法。小小的蜜蜂原来这么聪明！', category: '🐝 动物', source: '科学发现' },
  { title: '💻 量子计算机是什么？', summary: '量子计算机是一种超级快的计算机，它用量子的力量来计算。未来它可能帮助科学家发明新药、解决难题！', category: '💻 计算机', source: '科普知识' },
  { title: '🌋 火山为什么会喷发？', summary: '地球内部很热，岩浆像热汤一样在地下流动。当压力太大时，岩浆就会冲破地壳喷发出来，形成火山。', category: '🌋 地理', source: '科普知识' },
  { title: '🦠 细菌有好有坏', summary: '不是所有细菌都可怕！有些细菌能帮我们消化食物、制造酸奶，还有些能产生抗生素来治病。', category: '🦠 生物', source: '健康科普' },
  { title: '🎮 游戏不只是玩', summary: '有些游戏可以帮助学习，比如编程游戏、数学游戏、历史游戏。玩中学，学中玩！', category: '🎮 教育', source: '教育科技' }
];

// 获取今天的推荐（基于日期选择一条）
function getDailyTech() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return TECH_NEWS_BANK[dayOfYear % TECH_NEWS_BANK.length];
}

async function renderTech() {
  const techs = await api('GET', '/tech');
  
  // 如果是空的，自动填充默认内容
  if (techs.length === 0) {
    await seedTechNews();
    return renderTech(); // 重新渲染
  }
  
  // 检查今天是否有推荐，没有就加一条
  const today = new Date().toISOString().slice(0, 10);
  const hasToday = techs.some(t => t.date === today);
  if (!hasToday) {
    const daily = getDailyTech();
    await api('POST', '/tech', { 
      title: daily.title, 
      summary: daily.summary, 
      source: daily.source,
      category: daily.category,
      date: today 
    });
    return renderTech(); // 重新渲染
  }
  
  document.getElementById('tech-list').innerHTML = techs.map(t => `
    <div class="tech-card ${t.fav ? 'favorited' : ''}">
      <span class="tech-icon">${t.category ? t.category.split(' ')[0] : '🔬'}</span>
      <div class="tech-body">
        <div class="tech-title">${t.title}</div>
        <div class="tech-summary">${t.summary || ''}</div>
        <div class="tech-meta">
          <span class="tech-date">${formatDate(t.date)}</span>
          <span class="tech-category">${t.category || '🔬 科学'}</span>
          <div class="tech-actions">
            <button class="btn btn-sm ${t.fav ? 'btn-fav active' : 'btn-fav'}" onclick="toggleFav(${t.id}, this)" title="收藏">
              ${t.fav ? '❤️' : '🤍'}
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteTech(${t.id})">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function seedTechNews() {
  // 随机选5条作为初始内容
  const shuffled = [...TECH_NEWS_BANK].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);
  const today = new Date().toISOString().slice(0, 10);
  
  for (const item of selected) {
    await api('POST', '/tech', {
      title: item.title,
      summary: item.summary,
      source: item.source,
      category: item.category,
      date: today
    });
  }
}

async function toggleFav(id, btn) {
  const res = await api('PUT', `/tech/${id}/fav`);
  if (res.ok) {
    // 重新渲染
    renderTech();
  }
}

async function saveTech() {
  const title = document.getElementById('tech-title').value.trim();
  const summary = document.getElementById('tech-summary').value.trim();
  const category = document.getElementById('tech-category').value;
  
  if (!title) {
    alert('请输入标题');
    return;
  }
  
  await api('POST', '/tech', { title, summary, source: '', category, date: today() });
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
