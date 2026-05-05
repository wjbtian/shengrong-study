// 数据恢复脚本 - 如果数据库为空，自动填充示例数据
const { initDB, run, get } = require('./server/db/init');

async function restore() {
  await initDB();

  // 检查是否已有数据
  const diaryCount = get('SELECT COUNT(*) as c FROM diary');
  if (diaryCount && diaryCount.c > 0) {
    console.log('✅ 数据库已有数据，无需恢复');
    console.log(`   日记: ${diaryCount.c} 条`);
    const shineCount = get('SELECT COUNT(*) as c FROM shines');
    console.log(`   闪光: ${shineCount.c} 条`);
    return;
  }

  console.log('🔄 数据库为空，恢复示例数据...\n');

  // 日记数据
  const diaries = [
    { mood: '😄', title: '开心的一天', content: '今天数学考试考了95分，老师表扬了我！', date: '2026-04-20' },
    { mood: '🎸', title: '吉他练习', content: '今天练习了《两只老虎》，节奏稳多了', date: '2026-04-21' },
    { mood: '📚', title: '阅读时间', content: '读完了《西游记》第三章，孙悟空太厉害了', date: '2026-04-22' },
    { mood: '🏃', title: '运动打卡', content: '和爸爸打了羽毛球，赢了3局！', date: '2026-04-23' },
    { mood: '🌟', title: '奥数挑战', content: '今天解出了一道很难的鸡兔同笼问题', date: '2026-04-24' },
    { mood: '🤩', title: '吉他课又进步了！', content: '今天吉他课学会了G和弦和D和弦！三个和弦连起来弹，终于能弹出《小星星》了，好有成就感！', date: '2026-04-24' },
    { mood: '😊', title: '帮妈妈做家务', content: '今天主动帮妈妈洗碗，妈妈夸我是好孩子', date: '2026-04-19' },
    { mood: '🎨', title: '美术课作品', content: '画了一幅太空画，有火箭和宇航员', date: '2026-04-18' },
    { mood: '📖', title: '背古诗', content: '背会了《静夜思》，明天要默写', date: '2026-04-17' },
    { mood: '🏆', title: '英语听写满分', content: '英语单词听写全对，老师奖励了小星星', date: '2026-04-16' }
  ];

  for (const d of diaries) {
    run('INSERT INTO diary (mood, title, content, date) VALUES (?, ?, ?, ?)',
      [d.mood, d.title, d.content, d.date]);
  }
  console.log(`✅ 日记: ${diaries.length} 条`);

  // 闪光时刻
  const shines = [
    { title: '数学考试95分', type: '🌟 进步', icon: '🌟', description: '数学单元测试考了95分，全班第三！', date: '2026-04-20' },
    { title: '吉他《两只老虎》', type: '🎤 才艺展示', icon: '🎸', description: '完整弹奏《两只老虎》，节奏很稳', date: '2026-04-21' },
    { title: '羽毛球比赛', type: '🚴 运动', icon: '🏸', description: '和爸爸打羽毛球，3:2赢了！', date: '2026-04-22' },
    { title: '绘画作品', type: '🎨 创作', icon: '🎨', description: '画了一幅山水画，老师贴在教室墙上了', date: '2026-04-18' },
    { title: '奥数竞赛', type: '🏆 获奖', icon: '🏆', description: '参加学校奥数竞赛获得二等奖', date: '2026-04-15' },
    { title: '帮助同学', type: '💖 好人好事', icon: '💖', description: '主动帮助同桌补习数学', date: '2026-04-14' }
  ];

  for (const s of shines) {
    run('INSERT INTO shines (title, type, icon, description, date) VALUES (?, ?, ?, ?, ?)',
      [s.title, s.type, s.icon, s.description, s.date]);
  }
  console.log(`✅ 闪光时刻: ${shines.length} 条`);

  // 科技新闻
  const techNews = [
    { title: 'SpaceX星舰成功回收', summary: '人类历史上最大的火箭首次实现海上平台回收', category: '🚀 航天', date: '2026-04-20' },
    { title: 'AI智能体元年', summary: '2026年被称为AI智能体元年，各种智能助手涌现', category: '🤖 AI', date: '2026-04-21' },
    { title: '量子计算机新突破', summary: '中国科学家实现1000量子比特的量子计算机', category: '💻 计算', date: '2026-04-22' },
    { title: '火星探测新发现', summary: '祝融号发现火星地下冰层，未来移民有望', category: '🚀 航天', date: '2026-04-19' },
    { title: '机器人医生', summary: 'AI医生首次独立完成手术，准确率99.9%', category: '🤖 AI', date: '2026-04-18' },
    { title: '深海探测器', summary: '中国深海探测器到达马里亚纳海沟最深处', category: '🔬 科学', date: '2026-04-17' }
  ];

  for (const t of techNews) {
    run('INSERT INTO tech (title, summary, category, date) VALUES (?, ?, ?, ?)',
      [t.title, t.summary, t.category, t.date]);
  }
  console.log(`✅ 科技新闻: ${techNews.length} 条`);

  // 学习进度
  const progress = [
    { subject: 'chinese', unit: 'chinese_1' },
    { subject: 'chinese', unit: 'chinese_2' },
    { subject: 'math', unit: 'math_1' },
    { subject: 'math', unit: 'math_2' },
    { subject: 'math', unit: 'math_3' },
    { subject: 'english', unit: 'english_1' },
    { subject: 'olympiad', unit: 'om_1_1' },
    { subject: 'olympiad', unit: 'om_1_2' }
  ];

  for (const p of progress) {
    run('INSERT OR REPLACE INTO progress (subject, unit, completed, completed_at) VALUES (?, ?, 1, datetime("now","localtime"))',
      [p.subject, p.unit]);
  }
  console.log(`✅ 学习进度: ${progress.length} 个单元`);

  // 吉他视频
  run('INSERT INTO guitar_videos (title, video_path, duration, bpm, key_sig, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['两只老虎 - 第1次练习', 'guitar_2026-04-24.mp4', 65, 117, 'A major', '优秀段: 5-10s, 15-30s, 55-60s | 待改进: 0-5s, 30-50s', '2026-04-24']);
  console.log(`✅ 吉他视频: 1 条`);

  console.log('\n🎉 数据恢复完成！');
  console.log('现在刷新页面即可看到数据');
}

restore().catch(err => {
  console.error('❌ 恢复失败:', err);
  process.exit(1);
});
