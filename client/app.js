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
  try {
    // 获取进度
    const progress = await api('GET', '/progress');
    const doneUnits = progress?.doneUnits || [];
    
    // 科目配置
    const config = {
      chinese: {
        title: '语文',
        color: 'var(--accent)',
        total: 8,
        units: [
          { id: 'ch_1', name: '第一单元：古诗词', desc: '背诵并理解古诗词的意境' },
          { id: 'ch_2', name: '第二单元：现代文阅读', desc: '提高阅读理解能力' },
          { id: 'ch_3', name: '第三单元：写作基础', desc: '学习写作的基本技巧' },
          { id: 'ch_4', name: '第四单元：成语故事', desc: '积累常用成语' },
          { id: 'ch_5', name: '第五单元：名著导读', desc: '阅读经典名著片段' },
          { id: 'ch_6', name: '第六单元：口语交际', desc: '练习表达能力' },
          { id: 'ch_7', name: '第七单元：综合复习', desc: '巩固所学知识' },
          { id: 'ch_8', name: '第八单元：期末检测', desc: '检验学习成果' }
        ]
      },
      math: {
        title: '数学',
        color: 'var(--accent2)',
        total: 6,
        units: [
          { id: 'math_1', name: '大数的认识', desc: '认识亿以内的数' },
          { id: 'math_2', name: '角的度量', desc: '学习角的分类和度量' },
          { id: 'math_3', name: '三位数乘法', desc: '掌握乘法运算' },
          { id: 'math_4', name: '平行四边形', desc: '认识平行四边形和梯形' },
          { id: 'math_5', name: '除数是两位数的除法', desc: '学习除法运算' },
          { id: 'math_6', name: '统计', desc: '学习条形统计图' }
        ]
      },
      english: {
        title: '英语',
        color: '#f472b6',
        total: 6,
        units: [
          { id: 'en_1', name: 'My Classroom', desc: '教室里的物品' },
          { id: 'en_2', name: 'My Schoolbag', desc: '书包里的文具' },
          { id: 'en_3', name: 'My Friends', desc: '描述朋友的外貌' },
          { id: 'en_4', name: 'My Home', desc: '家里的房间' },
          { id: 'en_5', name: 'Dinner\'s Ready', desc: '食物和餐具' },
          { id: 'en_6', name: 'Meet My Family', desc: '家庭成员' }
        ]
      }
    };
    
    const cfg = config[subject];
    if (!cfg) return;
    
    // 计算进度
    const subjectDone = doneUnits.filter(u => u.startsWith(subject === 'chinese' ? 'ch_' : subject === 'math' ? 'math_' : 'en_'));
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
    
    // 渲染单元列表
    const container = document.getElementById(subject + '-content');
    if (!container) return;
    
    container.innerHTML = cfg.units.map(u => {
      const isDone = doneUnits.includes(u.id);
      return `
        <div class="topic-card ${isDone ? 'done' : ''}" data-id="${u.id}">
          <div class="topic-status">${isDone ? '✅' : '⭕'}</div>
          <div class="topic-info">
            <div class="topic-name">${u.name}</div>
            <div class="topic-desc">${u.desc}</div>
          </div>
          <button class="btn btn-sm ${isDone ? 'btn-done' : 'btn-primary'}" 
            onclick="toggleSubjectUnit('${subject}', '${u.id}', ${isDone})">
            ${isDone ? '已完成' : '标记完成'}
          </button>
        </div>`;
    }).join('');
    
  } catch (err) {
    console.error('加载科目数据失败:', err);
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

// --- 奥数数据 ---
async function loadOlympiadData() {
  try {
    // 获取进度
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
    
    // 专题列表
    const container = document.getElementById('olympiad-content');
    if (!container) return;
    
    const topics = [
      { id: 'om_1_1', name: '和差问题', desc: '已知两数的和与差，求这两个数' },
      { id: 'om_1_2', name: '和倍问题', desc: '已知两数的和与倍数关系' },
      { id: 'om_1_3', name: '差倍问题', desc: '已知两数的差与倍数关系' },
      { id: 'om_2_1', name: '年龄问题', desc: '利用年龄差不变解题' },
      { id: 'om_2_2', name: '植树问题', desc: '间隔与棵数的关系' },
      { id: 'om_2_3', name: '盈亏问题', desc: '分配中的盈与亏' },
      { id: 'om_3_1', name: '平均数问题', desc: '求平均数的方法' },
      { id: 'om_3_2', name: '归一问题', desc: '先求单一量' },
      { id: 'om_3_3', name: '归总问题', desc: '总量不变的问题' },
      { id: 'om_4_1', name: '行程问题', desc: '路程、速度、时间' },
      { id: 'om_4_2', name: '相遇问题', desc: '两人相向而行' },
      { id: 'om_4_3', name: '追及问题', desc: '同向而行的追赶' },
      { id: 'om_5_1', name: '鸡兔同笼', desc: '经典假设法' },
      { id: 'om_5_2', name: '牛吃草问题', desc: '生长与消耗' },
      { id: 'om_5_3', name: '工程问题', desc: '工作效率问题' },
      { id: 'om_6_1', name: '分数应用题', desc: '分数的乘除应用' },
      { id: 'om_6_2', name: '百分数应用', desc: '百分数的实际应用' },
      { id: 'om_6_3', name: '比和比例', desc: '按比例分配' },
      { id: 'om_7_1', name: '几何初步', desc: '周长与面积' },
      { id: 'om_7_2', name: '立体几何', desc: '体积与表面积' }
    ];
    
    container.innerHTML = topics.map(t => {
      const isDone = doneOM.includes(t.id);
      return `
        <div class="topic-card ${isDone ? 'done' : ''}" data-id="${t.id}">
          <div class="topic-status">${isDone ? '✅' : '⭕'}</div>
          <div class="topic-info">
            <div class="topic-name">${t.name}</div>
            <div class="topic-desc">${t.desc}</div>
          </div>
          <button class="btn btn-sm ${isDone ? 'btn-done' : 'btn-primary'}" 
            onclick="toggleTopic('${t.id}', ${isDone})">
            ${isDone ? '已完成' : '标记完成'}
          </button>
        </div>`;
    }).join('');
    
  } catch (err) {
    console.error('加载奥数数据失败:', err);
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
