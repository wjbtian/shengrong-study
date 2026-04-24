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
  console.log('渲染页面:', page);
  updateNavActive(page);
  
  const main = document.getElementById('main-content');
  if (!main) {
    console.error('找不到 main-content 元素');
    return;
  }
  
  // 加载对应页面 HTML
  try {
    const response = await fetch(`/pages/${page}.html`);
    console.log('页面加载状态:', response.status);
    const html = await response.text();
    console.log('页面内容长度:', html.length);
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
    document.querySelectorAll('.today-task').forEach(t => {
      t.addEventListener('click', () => {
        t.classList.toggle('done');
        const check = t.querySelector('.task-check');
        if (check) check.textContent = t.classList.contains('done') ? '✅' : '⭕';
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
  if (!timeline || !diary?.length) {
    if (timeline) timeline.innerHTML = '<p style="color:var(--text3)">暂无心情数据</p>';
    return;
  }
  
  const recent = diary.slice(-7);
  timeline.innerHTML = recent.map(d => `
    <div class="mood-day">
      <div class="mood-emoji">${d.mood || '😊'}</div>
      <span class="mood-date">${d.date?.slice(5) || ''}</span>
    </div>
  `).join('');
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
    
    // 渲染心情墙
    renderMoodWall(diary);
    
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
      { id: 'ch_1', name: '第一单元：古诗词', desc: '背诵并理解古诗词的意境', keyPoints: ['古诗词的节奏与韵律', '理解诗词中的意象', '背诵《望庐山瀑布》等经典', '体会诗人情感'] },
      { id: 'ch_2', name: '第二单元：现代文阅读', desc: '提高阅读理解能力', keyPoints: ['找出文章中心句', '理解段落大意', '分析人物形象', '概括文章主旨'] },
      { id: 'ch_3', name: '第三单元：写作基础', desc: '学习写作的基本技巧', keyPoints: ['审题与立意', '开头与结尾的写法', '细节描写', '段落之间的过渡'] },
      { id: 'ch_4', name: '第四单元：成语故事', desc: '积累常用成语', keyPoints: ['成语的来源与典故', '近义成语辨析', '成语的正确使用', '积累50个常用成语'] },
      { id: 'ch_5', name: '第五单元：名著导读', desc: '阅读经典名著片段', keyPoints: ['《西游记》主要人物', '《三国演义》经典故事', '名著中的好词好句', '写读后感'] },
      { id: 'ch_6', name: '第六单元：口语交际', desc: '练习表达能力', keyPoints: ['清晰表达观点', '倾听与回应', '演讲的基本技巧', '小组讨论'] },
      { id: 'ch_7', name: '第七单元：综合复习', desc: '巩固所学知识', keyPoints: ['系统梳理知识点', '错题整理', '模拟测试', '查漏补缺'] },
      { id: 'ch_8', name: '第八单元：期末检测', desc: '检验学习成果', keyPoints: ['全面复习', '调整心态', '考试技巧', '总结反思'] }
    ]
  },
  math: {
    title: '数学',
    color: 'var(--accent2)',
    total: 6,
    units: [
      { id: 'math_1', name: '大数的认识', desc: '认识亿以内的数', keyPoints: ['数位顺序表', '亿以内数的读写', '数的大小比较', '近似数与四舍五入'] },
      { id: 'math_2', name: '角的度量', desc: '学习角的分类和度量', keyPoints: ['直线、射线、线段', '角的分类（锐角、直角、钝角）', '用量角器量角', '画指定度数的角'] },
      { id: 'math_3', name: '三位数乘法', desc: '掌握乘法运算', keyPoints: ['口算乘法', '笔算三位数乘两位数', '因数中间有0的乘法', '速度、时间、路程关系'] },
      { id: 'math_4', name: '平行四边形', desc: '认识平行四边形和梯形', keyPoints: ['平行与垂直', '画垂线和平行线', '平行四边形的特征', '梯形的特征'] },
      { id: 'math_5', name: '除数是两位数的除法', desc: '学习除法运算', keyPoints: ['口算除法', '笔算除法', '商的变化规律', '用除法解决实际问题'] },
      { id: 'math_6', name: '统计', desc: '学习条形统计图', keyPoints: ['条形统计图的认识', '绘制条形统计图', '分析统计图数据', '平均数的意义'] }
    ]
  },
  english: {
    title: '英语',
    color: '#f472b6',
    total: 6,
    units: [
      { id: 'en_1', name: 'My Classroom', desc: '教室里的物品', keyPoints: ['classroom, window, door等词汇', 'Where is...? 句型', '介词 in, on, under', '祈使句'] },
      { id: 'en_2', name: 'My Schoolbag', desc: '书包里的文具', keyPoints: ['schoolbag, book, pencil等词汇', 'What\'s in your...?', '颜色词汇', '名词复数'] },
      { id: 'en_3', name: 'My Friends', desc: '描述朋友的外貌', keyPoints: ['tall, short, strong等形容词', 'He/She has...', '描述人物外貌', '一般疑问句'] },
      { id: 'en_4', name: 'My Home', desc: '家里的房间', keyPoints: ['bedroom, kitchen, living room', 'Where are...?', '介词用法', 'There is/are...'] },
      { id: 'en_5', name: 'Dinner\'s Ready', desc: '食物和餐具', keyPoints: ['beef, chicken, noodles等食物', 'What would you like?', '餐具词汇', '用餐礼仪表达'] },
      { id: 'en_6', name: 'Meet My Family', desc: '家庭成员', keyPoints: ['parents, uncle, aunt等', 'How many people...?', '职业词汇', '介绍家人'] }
    ]
  }
};

// --- 语文详细数据（横向鱼骨图用）---
const CHINESE_DETAIL = {
  'ch_1': {
    lessons: [
      { num: 1, title: '观潮', author: '赵宗成、朱明元', desc: '描写钱塘江大潮的壮观景象' },
      { num: 2, title: '走月亮', author: '吴然', desc: '描绘月夜漫步的温馨画面' },
      { num: 3, title: '现代诗二首', author: '刘大白、徐志摩', desc: '《秋晚的江上》《花牛歌》' }
    ],
    poems: [
      { title: '暮江吟', author: '白居易', content: '一道残阳铺水中，半江瑟瑟半江红。\n可怜九月初三夜，露似真珠月似弓。' },
      { title: '题西林壁', author: '苏轼', content: '横看成岭侧成峰，远近高低各不同。\n不识庐山真面目，只缘身在此山中。' }
    ],
    knowledge: ['边读边想象画面', '调动多种感官', '体会优美生动的语句'],
    writing: '推荐一个好地方：写清楚推荐理由'
  },
  'ch_2': {
    lessons: [
      { num: 5, title: '一个豆荚里的五粒豆', author: '安徒生', desc: '生命的力量与希望' },
      { num: 6, title: '夜间飞行的秘密', author: '', desc: '蝙蝠与雷达的科学原理' },
      { num: 7, title: '呼风唤雨的世纪', author: '', desc: '科技改变生活' }
    ],
    poems: [
      { title: '雪梅', author: '卢钺', content: '梅雪争春未肯降，骚人阁笔费评章。\n梅须逊雪三分白，雪却输梅一段香。' }
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
      { title: '嫦娥', author: '李商隐', content: '云母屏风烛影深，长河渐落晓星沉。\n嫦娥应悔偷灵药，碧海青天夜夜心。' }
    ],
    knowledge: ['体会文章准确生动的表达', '连续细致的观察', '写观察日记'],
    writing: '写观察日记：记录连续观察'
  },
  'ch_4': {
    lessons: [
      { num: 12, title: '盘古开天地', author: '', desc: '中国古代神话故事' },
      { num: 13, title: '精卫填海', author: '', desc: '坚持不懈的精神' },
      { num: 14, title: '普罗米修斯', author: '', desc: '希腊神话中的英雄' }
    ],
    poems: [],
    knowledge: ['了解故事的起因、经过、结果', '感受神话中神奇的想象', '复述故事'],
    writing: '我和____过一天：想象作文'
  },
  'ch_5': {
    lessons: [
      { num: 16, title: '麻雀', author: '屠格涅夫', desc: '母爱的伟大力量' },
      { num: 17, title: '爬天都峰', author: '黄亦波', desc: '战胜困难的勇气' }
    ],
    poems: [
      { title: '出塞', author: '王昌龄', content: '秦时明月汉时关，万里长征人未还。\n但使龙城飞将在，不教胡马度阴山。' },
      { title: '凉州词', author: '王翰', content: '葡萄美酒夜光杯，欲饮琵琶马上催。\n醉卧沙场君莫笑，古来征战几人回。' }
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
      { title: '别董大', author: '高适', content: '千里黄云白日曛，北风吹雁雪纷纷。\n莫愁前路无知己，天下谁人不识君。' }
    ],
    knowledge: ['学习用批注的方法阅读', '通过人物的动作、语言、神态体会心情', '记一次游戏'],
    writing: '记一次游戏：把游戏过程写清楚'
  },
  'ch_7': {
    lessons: [
      { num: 21, title: '古诗三首', author: '', desc: '《出塞》《凉州词》《夏日绝句》' },
      { num: 22, title: '为中华之崛起而读书', author: '', desc: '周恩来的少年志向' },
      { num: 23, title: '梅兰芳蓄须', author: '', desc: '艺术家的民族气节' }
    ],
    poems: [
      { title: '夏日绝句', author: '李清照', content: '生当作人杰，死亦为鬼雄。\n至今思项羽，不肯过江东。' }
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
    poems: [],
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

// --- 科目数据（横向鱼骨图版）---
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
      const circumference = 339.292;
      const offset = circumference - (percent / 100) * circumference;
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
    
    // 渲染横向鱼骨图
    const container = document.getElementById(subject + '-fishbone-h');
    if (!container) return;
    
    // 保留开始和结束标记，中间插入单元节点
    const startEl = container.querySelector('.fishbone-h-start');
    const endEl = container.querySelector('.fishbone-h-end');
    
    // 清除旧节点（保留开始和结束）
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
      
      // 插入到结束标记之前
      container.insertBefore(node, endEl);
    });
    
    // 绑定关闭按钮
    const closeBtn = document.getElementById(subject + '-detail-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeChineseDetail();
    }
    
  } catch (err) {
    console.error('加载科目数据失败:', err);
  }
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
  
  // 古诗词
  if (data.poems.length > 0) {
    html += '<div class="poem-section">';
    html += '<h4>🌸 古诗词</h4>';
    data.poems.forEach(p => {
      html += `
        <div class="poem-item">
          <div class="poem-title">${p.title}</div>
          <div class="poem-author">[${p.author}]</div>
          <div class="poem-content">${p.content.replace(/\n/g, '<br>')}</div>
        </div>`;
    });
    html += '</div>';
  }
  
  // 好词好句
  const goodWords = GOOD_WORDS[unitId];
  if (goodWords) {
    html += '<div class="good-words-section">';
    html += '<h4>🌟 好词好句积累</h4>';
    
    // 好词
    if (goodWords.words.length > 0) {
      html += '<div class="word-tags">';
      html += '<h5>✨ 好词</h5>';
      html += '<div class="tags">';
      goodWords.words.forEach(w => {
        html += `<span class="word-tag">${w}</span>`;
      });
      html += '</div></div>';
    }
    
    // 好句
    if (goodWords.sentences.length > 0) {
      html += '<div class="sentence-list">';
      html += '<h5>📝 好句</h5>';
      goodWords.sentences.forEach(s => {
        html += `<div class="sentence-item">"${s}"</div>`;
      });
      html += '</div>';
    }
    html += '</div>';
  }
  
  // 重点字词
  const keyWords = KEY_WORDS[unitId];
  if (keyWords) {
    html += '<div class="key-words-section">';
    html += '<h4>📖 重点字词</h4>';
    
    // 生字
    if (keyWords.characters.length > 0) {
      html += '<div class="char-grid">';
      html += '<h5>🎯 生字表</h5>';
      html += '<div class="char-list">';
      keyWords.characters.forEach(c => {
        html += `
          <div class="char-card">
            <div class="char-big">${c.char}</div>
            <div class="char-pinyin">${c.pinyin}</div>
            <div class="char-meaning">${c.meaning}</div>
            <div class="char-example">${c.example}</div>
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
      { id: 'om_1_1', name: '和差问题', desc: '已知两数的和与差，求这两个数', method: '大数=(和+差)÷2，小数=(和-差)÷2', example: '甲乙两数和为50，差为10，甲=30，乙=20' },
      { id: 'om_1_2', name: '和倍问题', desc: '已知两数的和与倍数关系', method: '小数=和÷(倍数+1)，大数=小数×倍数', example: '甲乙和为60，甲是乙的2倍，乙=20，甲=40' },
      { id: 'om_1_3', name: '差倍问题', desc: '已知两数的差与倍数关系', method: '小数=差÷(倍数-1)，大数=小数×倍数', example: '甲比乙大30，甲是乙的4倍，乙=10，甲=40' }
    ]
  },
  {
    category: '生活应用题',
    color: '#38bdf8',
    topics: [
      { id: 'om_2_1', name: '年龄问题', desc: '利用年龄差不变解题', method: '年龄差永远不变，画线段图分析', example: '爸爸35岁，儿子5岁，几年后爸爸是儿子的3倍？' },
      { id: 'om_2_2', name: '植树问题', desc: '间隔与棵数的关系', method: '两端都植：棵数=间隔数+1；一端植：棵数=间隔数', example: '100米路每隔5米植树，两端都植，需21棵' },
      { id: 'om_2_3', name: '盈亏问题', desc: '分配中的盈与亏', method: '(盈+亏)÷两次分配差=人数', example: '每人分5个多10个，每人分7个少6个，有8人' }
    ]
  },
  {
    category: '数量关系',
    color: '#f472b6',
    topics: [
      { id: 'om_3_1', name: '平均数问题', desc: '求平均数的方法', method: '总数÷份数=平均数，移多补少', example: '三门成绩分别是85、90、95，平均分=90' },
      { id: 'om_3_2', name: '归一问题', desc: '先求单一量', method: '先求1份的量，再求多份的量', example: '3小时做12个，5小时做多少个？先求每小时4个' },
      { id: 'om_3_3', name: '归总问题', desc: '总量不变的问题', method: '总量=单一量×份数，新单一量=总量÷新份数', example: '每天读20页，15天读完；每天读25页，12天读完' }
    ]
  },
  {
    category: '行程问题',
    color: '#fbbf24',
    topics: [
      { id: 'om_4_1', name: '行程问题', desc: '路程、速度、时间', method: '路程=速度×时间，速度=路程÷时间', example: '速度60km/h，行驶3小时，路程=180km' },
      { id: 'om_4_2', name: '相遇问题', desc: '两人相向而行', method: '相遇时间=总路程÷速度和', example: 'AB相距300km，甲速60，乙速40，3小时相遇' },
      { id: 'om_4_3', name: '追及问题', desc: '同向而行的追赶', method: '追及时间=路程差÷速度差', example: '甲先走2小时，速度40，乙速60，4小时追上' }
    ]
  },
  {
    category: '经典趣题',
    color: '#a78bfa',
    topics: [
      { id: 'om_5_1', name: '鸡兔同笼', desc: '经典假设法', method: '假设全是鸡，多出来的脚÷2=兔数', example: '头35个，脚94只，鸡23只，兔12只' },
      { id: 'om_5_2', name: '牛吃草问题', desc: '生长与消耗', method: '草每天生长量=(牛1×天1-牛2×天2)÷(天1-天2)', example: '10牛20天吃完，15牛10天吃完，25牛5天吃完' },
      { id: 'om_5_3', name: '工程问题', desc: '工作效率问题', method: '工效=1÷工时，合作工效=工效和', example: '甲10天完成，乙15天完成，合作6天完成' }
    ]
  },
  {
    category: '分数与比例',
    color: '#fb923c',
    topics: [
      { id: 'om_6_1', name: '分数应用题', desc: '分数的乘除应用', method: '找单位"1"，画线段图，列方程', example: '一本书看了3/5，还剩80页，全书200页' },
      { id: 'om_6_2', name: '百分数应用', desc: '百分数的实际应用', method: '百分数=部分÷整体×100%', example: '原价200元，打8折，现价160元' },
      { id: 'om_6_3', name: '比和比例', desc: '按比例分配', method: '总量÷总份数=每份量', example: '甲乙丙按2:3:5分100元，分别得20、30、50' }
    ]
  },
  {
    category: '几何专题',
    color: '#22d3ee',
    topics: [
      { id: 'om_7_1', name: '几何初步', desc: '周长与面积', method: '长方形周长=2×(长+宽)，面积=长×宽', example: '长8cm宽5cm的长方形，周长26cm，面积40cm²' },
      { id: 'om_7_2', name: '立体几何', desc: '体积与表面积', method: '长方体体积=长×宽×高，表面积=2×(lw+lh+wh)', example: '棱长3cm的正方体，体积27cm³，表面积54cm²' }
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
      const circumference = 339.292;
      const offset = circumference - (percent / 100) * circumference;
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
                        <h4>${t.name}</h4>
                        <p class="detail-desc">${t.desc}</p>
                        <div class="detail-section">
                          <h5>📝 解题方法</h5>
                          <p>${t.method}</p>
                        </div>
                        <div class="detail-section">
                          <h5>💡 典型例题</h5>
                          <p>${t.example}</p>
                        </div>
                        <button class="btn btn-sm ${isDone ? 'btn-done' : 'btn-primary'}" 
                          onclick="event.stopPropagation(); toggleTopic('${t.id}', ${isDone})">
                          ${isDone ? '标记未完成' : '标记完成'}
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
    
    if (totalEl) totalEl.textContent = videos?.length || 0;
    
    let totalDuration = 0;
    const songs = new Set();
    (videos || []).forEach(v => {
      if (v.duration) totalDuration += parseInt(v.duration);
      if (v.title) songs.add(v.title);
    });
    
    if (durationEl) durationEl.textContent = Math.round(totalDuration / 60);
    if (songsEl) songsEl.textContent = songs.size;
    
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
              </div>
              ${latest.notes ? `<div class="guitar-video-notes">${latest.notes}</div>` : ''}
            </div>
          </div>`;
      } else {
        latestEl.innerHTML = '<p style="color:var(--text-3)">还没有练习视频</p>';
      }
    }
    
    // 历史列表
    const listEl = document.getElementById('guitar-list');
    if (listEl) {
      if (videos && videos.length > 1) {
        listEl.innerHTML = videos.slice(1).map(v => `
          <div class="guitar-item" data-id="${v.id}">
            <div class="guitar-item-title">${v.title}</div>
            <div class="guitar-item-meta">
              <span>${formatDate(v.date)}</span>
              ${v.duration ? `<span>${Math.round(v.duration/60)}分钟</span>` : ''}
            </div>
          </div>`).join('');
      } else {
        listEl.innerHTML = '<p style="color:var(--text-3)">暂无更多历史记录</p>';
      }
    }
    
  } catch (err) {
    console.error('加载吉他数据失败:', err);
  }
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
  
  return `
    <div class="photo-card" data-id="${s.id}">
      <div class="photo-img-wrap">
        ${s.image ? `<img src="${s.image}" class="photo-img" alt="${s.title}" loading="lazy">` : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:48px;">✨</div>`}
        <div class="photo-overlay">
          <span class="photo-date">${formatDate(s.date)}</span>
        </div>
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
    
    container.innerHTML = news.map(t => `
      <div class="tech-card ${t.fav ? 'fav' : ''}" data-id="${t.id}">
        <div class="tech-category">${t.category || '🔬 科学'}</div>
        <div class="tech-title">${t.title}</div>
        <div class="tech-summary">${t.summary || ''}</div>
        <div class="tech-meta">
          <span>${formatDate(t.date)}</span>
          ${t.source ? `<span>📰 ${t.source}</span>` : ''}
        </div>
        <div class="tech-actions">
          <button class="btn-icon" onclick="toggleTechFav(${t.id})" title="收藏">
            ${t.fav ? '⭐' : '☆'}
          </button>
          <button class="btn-icon" onclick="deleteTech(${t.id})" title="删除">🗑️</button>
        </div>
      </div>`).join('');
      
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
