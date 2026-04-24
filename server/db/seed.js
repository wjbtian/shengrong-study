// 初始化示例数据
const { initDB, run, all, get } = require('./init');

async function seed() {
  await initDB();

  // 检查是否已有数据
  const diaryCount = get('SELECT COUNT(*) as c FROM diary');
  if (diaryCount && diaryCount.c > 0) {
    console.log('数据库已有数据，跳过初始化');
    return;
  }

  console.log('初始化示例数据...');

  // 日记示例
  const diaryData = [
    { mood: '😄', title: '开心的一天', content: '今天数学考试考了95分，老师表扬了我！', date: '2026-04-20' },
    { mood: '🎸', title: '吉他练习', content: '今天练习了《两只老虎》，节奏稳多了', date: '2026-04-21' },
    { mood: '📚', title: '阅读时间', content: '读完了《西游记》第三章，孙悟空太厉害了', date: '2026-04-22' },
    { mood: '🏃', title: '运动打卡', content: '和爸爸打了羽毛球，赢了3局！', date: '2026-04-23' },
    { mood: '🌟', title: '奥数挑战', content: '今天解出了一道很难的鸡兔同笼问题', date: '2026-04-24' }
  ];

  for (const d of diaryData) {
    run('INSERT INTO diary (mood, title, content, date) VALUES (?, ?, ?, ?)',
      [d.mood, d.title, d.content, d.date]);
  }

  // 闪光时刻示例
  const shinesData = [
    { title: '数学考试95分', type: '🌟 进步', icon: '🌟', description: '数学单元测试考了95分，全班第三！', date: '2026-04-20' },
    { title: '吉他《两只老虎》', type: '🎤 才艺展示', icon: '🎸', description: '完整弹奏《两只老虎》，节奏很稳', date: '2026-04-21' },
    { title: '羽毛球比赛', type: '🚴 运动', icon: '🏸', description: '和爸爸打羽毛球，3:2赢了！', date: '2026-04-22' },
    { title: '绘画作品', type: '🎨 创作', icon: '🎨', description: '画了一幅山水画，老师贴在教室墙上了', date: '2026-04-18' }
  ];

  for (const s of shinesData) {
    run('INSERT INTO shines (title, type, icon, description, date) VALUES (?, ?, ?, ?, ?)',
      [s.title, s.type, s.icon, s.description, s.date]);
  }

  // 科技新闻示例
  const techData = [
    { title: 'SpaceX星舰成功回收', summary: '人类历史上最大的火箭首次实现海上平台回收', category: '🚀 航天', date: '2026-04-20' },
    { title: 'AI智能体元年', summary: '2026年被称为AI智能体元年，各种智能助手涌现', category: '🤖 AI', date: '2026-04-21' },
    { title: '量子计算机新突破', summary: '中国科学家实现1000量子比特的量子计算机', category: '💻 计算', date: '2026-04-22' }
  ];

  for (const t of techData) {
    run('INSERT INTO tech (title, summary, category, date) VALUES (?, ?, ?, ?)',
      [t.title, t.summary, t.category, t.date]);
  }

  // 学习进度示例
  const progressData = [
    { subject: 'chinese', unit: 'chinese_1' },
    { subject: 'chinese', unit: 'chinese_2' },
    { subject: 'math', unit: 'math_1' },
    { subject: 'math', unit: 'math_2' },
    { subject: 'math', unit: 'math_3' },
    { subject: 'english', unit: 'english_1' },
    { subject: 'olympiad', unit: 'om_1_1' },
    { subject: 'olympiad', unit: 'om_1_2' }
  ];

  for (const p of progressData) {
    run('INSERT OR REPLACE INTO progress (subject, unit, completed, completed_at) VALUES (?, ?, 1, datetime("now","localtime"))',
      [p.subject, p.unit]);
  }

  console.log('示例数据初始化完成！');
  console.log('- 日记：5条');
  console.log('- 闪光时刻：4条');
  console.log('- 科技新闻：3条');
  console.log('- 学习进度：8个单元');
}

seed().catch(console.error);
