/**
 * Node.js SQLite 数据库模块 (better-sqlite3)
 * 替代 Python 数据库服务
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'shengrong.db');

let db = null;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function initDB() {
  const database = getDB();

  // 日记表
  database.exec(`
    CREATE TABLE IF NOT EXISTS diary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mood TEXT NOT NULL DEFAULT '😄',
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // 闪光时刻表
  database.exec(`
    CREATE TABLE IF NOT EXISTS shines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT '📸 照片',
      icon TEXT NOT NULL DEFAULT '📸',
      description TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      photo TEXT,
      likes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // 学习进度表
  database.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      unit TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      UNIQUE(subject, unit)
    )
  `);

  // 科技新闻表
  database.exec(`
    CREATE TABLE IF NOT EXISTS tech (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      source TEXT,
      category TEXT DEFAULT '🔬 科学',
      fav INTEGER DEFAULT 0,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // 吉他视频表
  database.exec(`
    CREATE TABLE IF NOT EXISTS guitar_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      video_path TEXT NOT NULL,
      duration INTEGER,
      bpm INTEGER,
      key_sig TEXT,
      notes TEXT,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // 照片墙配置表
  database.exec(`
    CREATE TABLE IF NOT EXISTS photo_wall (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      config TEXT NOT NULL DEFAULT '[]'
    )
  `);

  // 生字表（四年级下册）
  database.exec(`
    CREATE TABLE IF NOT EXISTS chinese_chars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      char TEXT NOT NULL,
      pinyin TEXT NOT NULL,
      radical TEXT NOT NULL,
      strokes INTEGER NOT NULL,
      words TEXT NOT NULL DEFAULT '[]',
      sentence TEXT NOT NULL DEFAULT '',
      unit INTEGER DEFAULT 1,
      is_difficult INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // 兼容：如果旧表没有 is_difficient 列，添加它
  try {
    database.exec('ALTER TABLE chinese_chars ADD COLUMN is_difficult INTEGER DEFAULT 0');
  } catch (e) {
    // 列已存在，忽略
  }

  // 生字打卡表
  database.exec(`
    CREATE TABLE IF NOT EXISTS char_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      char_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      practiced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      UNIQUE(char_id, date)
    )
  `);

  // 如果生字表为空，导入四年级下册生字
  const charCount = database.prepare('SELECT COUNT(*) as c FROM chinese_chars').get();
  if (!charCount || charCount.c === 0) {
    console.log('导入四年级下册生字数据...');
    importChineseChars(database);
  }

  
  // 错题本表
  database.exec(`
    CREATE TABLE IF NOT EXISTS errors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '语文',
      category TEXT NOT NULL DEFAULT '字词',
      error_text TEXT NOT NULL DEFAULT '',
      correct_text TEXT NOT NULL DEFAULT '',
      analysis TEXT NOT NULL DEFAULT '',
      error_reason TEXT NOT NULL DEFAULT '概念不清',
      practice_type TEXT NOT NULL DEFAULT '通用',
      mastery TEXT NOT NULL DEFAULT '⚪ 未掌握',
      error_date TEXT NOT NULL DEFAULT (date('now', 'localtime')),
      source TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // 学习报告表
  database.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '综合',
      summary TEXT NOT NULL DEFAULT '',
      details TEXT NOT NULL DEFAULT '[]',
      suggestions TEXT NOT NULL DEFAULT '[]',
      report_date TEXT NOT NULL DEFAULT (date('now', 'localtime')),
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);
  console.log('✅ 数据库初始化完成');
  return database;
}

function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}

// 四年级下册生字数据
function getCharsData() {
  return [
    // 第一单元
    { char: '杂', pinyin: 'zá', radical: '木', strokes: 6, words: ['杂事', '复杂'], sentence: '这些杂事让他忙得不可开交。', unit: 1 },
    { char: '稀', pinyin: 'xī', radical: '禾', strokes: 12, words: ['稀少', '稀奇'], sentence: '这里人烟稀少。', unit: 1 },
    { char: '篱', pinyin: 'lí', radical: '竹', strokes: 16, words: ['篱笆', '篱落'], sentence: '院子周围围着一圈篱笆。', unit: 1 },
    { char: '蜻', pinyin: 'qīng', radical: '虫', strokes: 14, words: ['蜻蜓'], sentence: '蜻蜓在水面上轻轻点水。', unit: 1 },
    { char: '蜓', pinyin: 'tíng', radical: '虫', strokes: 12, words: ['蜻蜓'], sentence: '一只红蜻蜓停在荷叶上。', unit: 1 },
    { char: '蝶', pinyin: 'dié', radical: '虫', strokes: 15, words: ['蝴蝶', '彩蝶'], sentence: '蝴蝶在花丛中翩翩起舞。', unit: 1 },
    { char: '宿', pinyin: 'sù', radical: '宀', strokes: 11, words: ['住宿', '宿舍'], sentence: '我们今晚在山上宿营。', unit: 1 },
    { char: '徐', pinyin: 'xú', radical: '彳', strokes: 10, words: ['徐徐', '徐步'], sentence: '清风徐徐吹来。', unit: 1 },
    { char: '疏', pinyin: 'shū', radical: '疋', strokes: 12, words: ['稀疏', '疏远'], sentence: '树上只剩下稀疏的几片叶子。', unit: 1 },
    { char: '茅', pinyin: 'máo', radical: '艹', strokes: 8, words: ['茅草', '茅屋'], sentence: '那间茅屋已有百年历史。', unit: 1 },
    { char: '檐', pinyin: 'yán', radical: '木', strokes: 17, words: ['屋檐', '房檐'], sentence: '燕子在屋檐下筑巢。', unit: 1 },
    { char: '翁', pinyin: 'wēng', radical: '羽', strokes: 10, words: ['老翁', '渔翁'], sentence: '一位老翁在河边钓鱼。', unit: 1 },
    { char: '锄', pinyin: 'chú', radical: '钅', strokes: 12, words: ['锄头', '锄草'], sentence: '农民用锄头锄草。', unit: 1 },
    { char: '赖', pinyin: 'lài', radical: '贝', strokes: 13, words: ['依赖', '赖皮'], sentence: '我们不能总是依赖父母。', unit: 1 },
    { char: '剥', pinyin: 'bāo', radical: '刂', strokes: 10, words: ['剥皮', '剥开'], sentence: '他正在剥花生吃。', unit: 1 },
    // 第二单元
    { char: '怒', pinyin: 'nù', radical: '心', strokes: 9, words: ['愤怒', '怒火'], sentence: '他愤怒地瞪着对方。', unit: 2 },
    { char: '吼', pinyin: 'hǒu', radical: '口', strokes: 7, words: ['吼叫', '怒吼'], sentence: '狮子在笼中怒吼。', unit: 2 },
    { char: '脂', pinyin: 'zhī', radical: '月', strokes: 10, words: ['脂肪', '脂粉'], sentence: '这种水果含脂肪很少。', unit: 2 },
    { char: '拭', pinyin: 'shì', radical: '扌', strokes: 9, words: ['擦拭', '拂拭'], sentence: '他用纸巾擦拭桌子。', unit: 2 },
    { char: '餐', pinyin: 'cān', radical: '食', strokes: 16, words: ['餐厅', '早餐'], sentence: '我们一家在餐厅吃饭。', unit: 2 },
    { char: '划', pinyin: 'huá', radical: '刂', strokes: 6, words: ['划船', '划动'], sentence: '他们在湖上划船。', unit: 2 },
    { char: '晚', pinyin: 'wǎn', radical: '日', strokes: 11, words: ['晚上', '夜晚'], sentence: '傍晚时分，夕阳西下。', unit: 2 },
    { char: '辣', pinyin: 'là', radical: '辛', strokes: 14, words: ['辣椒', '麻辣'], sentence: '四川菜以麻辣著称。', unit: 2 },
    { char: '渗', pinyin: 'shèn', radical: '氵', strokes: 11, words: ['渗透', '渗入'], sentence: '雨水渗透了泥土。', unit: 2 },
    { char: '挣', pinyin: 'zhèng', radical: '扌', strokes: 9, words: ['挣脱', '挣扎'], sentence: '小鸟挣脱了笼子。', unit: 2 },
    { char: '番', pinyin: 'fān', radical: '田', strokes: 12, words: ['一番', '番茄'], sentence: '经过一番努力，他成功了。', unit: 2 },
    { char: '埋', pinyin: 'mái', radical: '土', strokes: 10, words: ['埋藏', '掩埋'], sentence: '地下埋藏着丰富的矿产。', unit: 2 },
    { char: '刷', pinyin: 'shuā', radical: '刂', strokes: 8, words: ['刷牙', '刷新'], sentence: '每天早晚都要刷牙。', unit: 2 },
    { char: '测', pinyin: 'cè', radical: '氵', strokes: 9, words: ['测试', '测量'], sentence: '科学家们正在测试新发明。', unit: 2 },
    { char: '详', pinyin: 'xiáng', radical: '讠', strokes: 8, words: ['详细', '详情'], sentence: '请详细说明事情的经过。', unit: 2 },
    // 第三单元
    { char: '繁', pinyin: 'fán', radical: '糸', strokes: 17, words: ['繁忙', '繁华'], sentence: '大城市里非常繁华。', unit: 3 },
    { char: '漫', pinyin: 'màn', radical: '氵', strokes: 14, words: ['漫步', '漫画'], sentence: '我们在公园里漫步。', unit: 3 },
    { char: '灭', pinyin: 'miè', radical: '火', strokes: 5, words: ['消灭', '灭火'], sentence: '消防员正在努力灭火。', unit: 3 },
    { char: '藤', pinyin: 'téng', radical: '艹', strokes: 18, words: ['藤蔓', '葡萄藤'], sentence: '葡萄藤爬满了架子。', unit: 3 },
    { char: '萝', pinyin: 'luó', radical: '艹', strokes: 11, words: ['萝卜', '藤萝'], sentence: '妈妈买了一些萝卜。', unit: 3 },
    { char: '膝', pinyin: 'xī', radical: '月', strokes: 15, words: ['膝盖', '屈膝'], sentence: '他摔伤了膝盖。', unit: 3 },
    { char: '涛', pinyin: 'tāo', radical: '氵', strokes: 10, words: ['波涛', '海涛'], sentence: '海面上波涛汹涌。', unit: 3 },
    { char: '躲', pinyin: 'duǒ', radical: '身', strokes: 13, words: ['躲避', '躲藏'], sentence: '他躲在柜子里。', unit: 3 },
    { char: '瓶', pinyin: 'píng', radical: '瓦', strokes: 10, words: ['瓶子', '花瓶'], sentence: '桌上放着一个花瓶。', unit: 3 },
    { char: '挤', pinyin: 'jǐ', radical: '扌', strokes: 9, words: ['拥挤', '挤进'], sentence: '地铁里非常拥挤。', unit: 3 },
    { char: '叉', pinyin: 'chā', radical: '又', strokes: 3, words: ['叉子', '交叉'], sentence: '用叉子吃意大利面。', unit: 3 },
    { char: '挥', pinyin: 'huī', radical: '扌', strokes: 9, words: ['挥手', '指挥'], sentence: '他在向我们挥手告别。', unit: 3 },
    // 第四单元
    { char: '忧', pinyin: 'yōu', radical: '忄', strokes: 7, words: ['忧愁', '忧虑'], sentence: '他脸上带着忧愁的表情。', unit: 4 },
    { char: '虑', pinyin: 'lǜ', radical: '虍', strokes: 10, words: ['考虑', '忧虑'], sentence: '这个问题需要仔细考虑。', unit: 4 },
    { char: '贪', pinyin: 'tān', radical: '贝', strokes: 8, words: ['贪吃', '贪心'], sentence: '不要贪心。', unit: 4 },
    { char: '职', pinyin: 'zhí', radical: '耳', strokes: 11, words: ['职业', '职责'], sentence: '医生是崇高的职业。', unit: 4 },
    { char: '屏', pinyin: 'píng', radical: '尸', strokes: 9, words: ['屏幕', '屏风'], sentence: '他盯着电脑屏幕看。', unit: 4 },
    { char: '蹭', pinyin: 'cèng', radical: '足', strokes: 19, words: ['蹭饭', '磨蹭'], sentence: '他总是磨磨蹭蹭的。', unit: 4 },
    { char: '稿', pinyin: 'gǎo', radical: '禾', strokes: 15, words: ['稿件', '草稿'], sentence: '他正在修改稿子。', unit: 4 },
    { char: '腔', pinyin: 'qiāng', radical: '月', strokes: 12, words: ['口腔', '腔调'], sentence: '他的腔调很奇怪。', unit: 4 },
    { char: '解', pinyin: 'jiě', radical: '角', strokes: 13, words: ['解释', '解决'], sentence: '老师解释了这道题。', unit: 4 },
    { char: '闷', pinyin: 'mèn', radical: '门', strokes: 7, words: ['闷热', '烦闷'], sentence: '今天天气非常闷热。', unit: 4 },
    { char: '蛇', pinyin: 'shé', radical: '虫', strokes: 11, words: ['蛇', '毒蛇'], sentence: '草丛里有一条蛇。', unit: 4 },
    { char: '遭', pinyin: 'zāo', radical: '辶', strokes: 14, words: ['遭遇', '遭受'], sentence: '他遭遇了一场车祸。', unit: 4 },
    { char: '殃', pinyin: 'yāng', radical: '歹', strokes: 9, words: ['遭殃', '灾殃'], sentence: '洪水让村民遭了殃。', unit: 4 },
    { char: '盆', pinyin: 'pén', radical: '皿', strokes: 9, words: ['盆子', '花盆'], sentence: '阳台上放着花盆。', unit: 4 },
    { char: '勃', pinyin: 'bó', radical: '力', strokes: 9, words: ['蓬勃', '生机勃勃'], sentence: '春天万物生机勃勃。', unit: 4 },
    // 第五单元
    { char: '扩', pinyin: 'kuò', radical: '扌', strokes: 6, words: ['扩大', '扩展'], sentence: '他们扩大了工厂规模。', unit: 5 },
    { char: '范', pinyin: 'fàn', radical: '艹', strokes: 8, words: ['范围', '模范'], sentence: '他是我们学习的模范。', unit: 5 },
    { char: '刹', pinyin: 'chà', radical: '刂', strokes: 8, words: ['刹那', '刹车'], sentence: '刹那间，天空被染红。', unit: 5 },
    { char: '镶', pinyin: 'xiāng', radical: '钅', strokes: 22, words: ['镶嵌', '镶边'], sentence: '戒指上镶嵌着钻石。', unit: 5 },
    { char: '浙', pinyin: 'zhè', radical: '氵', strokes: 10, words: ['浙江'], sentence: '浙江省在东部沿海。', unit: 5 },
    { char: '桐', pinyin: 'tóng', radical: '木', strokes: 10, words: ['梧桐', '桐油'], sentence: '梧桐树叶落满地面。', unit: 5 },
    { char: '簇', pinyin: 'cù', radical: '竹', strokes: 17, words: ['簇拥', '花簇'], sentence: '粉丝们簇拥着明星。', unit: 5 },
    { char: '浓', pinyin: 'nóng', radical: '氵', strokes: 9, words: ['浓厚', '浓密'], sentence: '森林里弥漫着花香。', unit: 5 },
    { char: '臀', pinyin: 'tún', radical: '月', strokes: 17, words: ['臀部'], sentence: '他摔伤时伤到了臀部。', unit: 5 },
    { char: '稍', pinyin: 'shāo', radical: '禾', strokes: 11, words: ['稍微', '稍稍'], sentence: '请稍微等一会儿。', unit: 5 },
    { char: '额', pinyin: 'é', radical: '页', strokes: 15, words: ['额头', '额外'], sentence: '他额头上冒着汗珠。', unit: 5 },
    { char: '擦', pinyin: 'cā', radical: '扌', strokes: 17, words: ['擦拭', '擦伤'], sentence: '他用毛巾擦拭汗水。', unit: 5 },
    { char: '蜿', pinyin: 'wān', radical: '虫', strokes: 14, words: ['蜿蜒'], sentence: '山路蜿蜒曲折。', unit: 5 },
    { char: '蜒', pinyin: 'yán', radical: '虫', strokes: 12, words: ['蜿蜒'], sentence: '长城蜿蜒在群山之间。', unit: 5 },
    // 第六单元
    { char: '晋', pinyin: 'jìn', radical: '日', strokes: 10, words: ['晋升', '晋级'], sentence: '他成功晋级到决赛。', unit: 6 },
    { char: '炕', pinyin: 'kàng', radical: '火', strokes: 8, words: ['炕床', '土炕'], sentence: '北方农村有土炕。', unit: 6 },
    { char: '铅', pinyin: 'qiān', radical: '钅', strokes: 10, words: ['铅笔', '铅球'], sentence: '他用铅笔写字。', unit: 6 },
    { char: '迈', pinyin: 'mài', radical: '辶', strokes: 6, words: ['迈步', '迈进'], sentence: '他迈着坚定的步伐。', unit: 6 },
    { char: '栓', pinyin: 'shuān', radical: '木', strokes: 10, words: ['门栓', '栓子'], sentence: '请把门栓好。', unit: 6 },
    { char: '劫', pinyin: 'jié', radical: '力', strokes: 7, words: ['抢劫', '劫持'], sentence: '他遭遇了抢劫。', unit: 6 },
    { char: '绸', pinyin: 'chóu', radical: '纟', strokes: 11, words: ['丝绸', '绸缎'], sentence: '中国丝绸闻名世界。', unit: 6 },
    { char: '扒', pinyin: 'bā', radical: '扌', strokes: 5, words: ['扒开', '扒手'], sentence: '他扒开草丛往里看。', unit: 6 },
    { char: '敌', pinyin: 'dí', radical: '攵', strokes: 10, words: ['敌人', '敌对'], sentence: '战士们勇敢面对敌人。', unit: 6 },
    { char: '尸', pinyin: 'shī', radical: '尸', strokes: 3, words: ['尸体', '尸骨'], sentence: '考古学家发现了尸骨。', unit: 6 },
    { char: '趁', pinyin: 'chèn', radical: '走', strokes: 12, words: ['趁机', '趁早'], sentence: '趁着天气好去郊游。', unit: 6 },
    { char: '慌', pinyin: 'huāng', radical: '忄', strokes: 12, words: ['慌张', '惊慌'], sentence: '他慌张地跑出房间。', unit: 6 },
    // 第七单元
    { char: '伦', pinyin: 'lún', radical: '亻', strokes: 6, words: ['伦理', '天伦'], sentence: '天伦之乐最珍贵。', unit: 7 },
    { char: '腹', pinyin: 'fù', radical: '月', strokes: 13, words: ['腹部', '腹泻'], sentence: '他感到腹部隐隐作痛。', unit: 7 },
    { char: '剖', pinyin: 'pōu', radical: '刂', strokes: 10, words: ['解剖', '剖析'], sentence: '医生正在解剖青蛙。', unit: 7 },
    { char: '窟', pinyin: 'kū', radical: '穴', strokes: 13, words: ['窟窿', '石窟'], sentence: '墙上有一个窟窿。', unit: 7 },
    { char: '窿', pinyin: 'lóng', radical: '穴', strokes: 16, words: ['窟窿'], sentence: '老鼠把墙咬了个窟窿。', unit: 7 },
    { char: '混', pinyin: 'hùn', radical: '氵', strokes: 11, words: ['混乱', '混合'], sentence: '现场一片混乱。', unit: 7 },
    { char: '嘶', pinyin: 'sī', radical: '口', strokes: 15, words: ['嘶哑', '嘶叫'], sentence: '他的声音变得嘶哑。', unit: 7 },
    { char: '维', pinyin: 'wéi', radical: '纟', strokes: 11, words: ['维护', '思维'], sentence: '我们要维护环境卫生。', unit: 7 },
    { char: '秩', pinyin: 'zhì', radical: '禾', strokes: 10, words: ['秩序', '秩次'], sentence: '公共场合要维持秩序。', unit: 7 },
    { char: '卑', pinyin: 'bēi', radical: '十', strokes: 8, words: ['卑微', '卑鄙'], sentence: '他出身卑微但志向远大。', unit: 7 },
    { char: '岗', pinyin: 'gǎng', radical: '山', strokes: 7, words: ['岗位', '站岗'], sentence: '士兵们在边境站岗。', unit: 7 },
    { char: '宰', pinyin: 'zǎi', radical: '宀', strokes: 10, words: ['宰相', '宰杀'], sentence: '古代宰相地位很高。', unit: 7 },
    { char: '遣', pinyin: 'qiǎn', radical: '辶', strokes: 13, words: ['派遣', '消遣'], sentence: '公司派遣他去国外学习。', unit: 7 },
    { char: '梭', pinyin: 'suō', radical: '木', strokes: 11, words: ['梭子', '穿梭'], sentence: '时光如梭，一年过去了。', unit: 7 },
    // 第八单元
    { char: '介', pinyin: 'jiè', radical: '人', strokes: 4, words: ['介绍', '介入'], sentence: '让我介绍一下自己。', unit: 8 },
    { char: '绍', pinyin: 'shào', radical: '纟', strokes: 8, words: ['介绍', '绍兴'], sentence: '老师向我们介绍新同学。', unit: 8 },
    { char: '妖', pinyin: 'yāo', radical: '女', strokes: 7, words: ['妖怪', '妖精'], sentence: '故事里有一个妖怪。', unit: 8 },
    { char: '矩', pinyin: 'jǔ', radical: '矢', strokes: 9, words: ['规矩', '矩形'], sentence: '做人要守规矩。', unit: 8 },
    { char: '乖', pinyin: 'guāi', radical: '丿', strokes: 8, words: ['乖巧', '乖孩子'], sentence: '她是一个乖巧的女孩。', unit: 8 },
    { char: '撵', pinyin: 'niǎn', radical: '扌', strokes: 15, words: ['撵走'], sentence: '他把小狗撵走了。', unit: 8 },
    { char: '烫', pinyin: 'tàng', radical: '火', strokes: 10, words: ['烫伤', '滚烫'], sentence: '小心，水很烫！', unit: 8 },
    { char: '溜', pinyin: 'liū', radical: '氵', strokes: 13, words: ['溜走', '溜冰'], sentence: '小偷想趁机溜走。', unit: 8 },
    { char: '丫', pinyin: 'yā', radical: '丨', strokes: 3, words: ['丫头', '脚丫'], sentence: '她是个可爱的小丫头。', unit: 8 },
    { char: '柴', pinyin: 'chái', radical: '木', strokes: 10, words: ['柴火', '木柴'], sentence: '他背着一捆柴火。', unit: 8 },
    { char: '拒', pinyin: 'jù', radical: '扌', strokes: 7, words: ['拒绝', '抗拒'], sentence: '他拒绝了邀请。', unit: 8 },
    { char: '轿', pinyin: 'jiào', radical: '车', strokes: 10, words: ['轿车', '轿子'], sentence: '他开着一辆轿车。', unit: 8 },
    { char: '惩', pinyin: 'chéng', radical: '心', strokes: 12, words: ['惩罚', '惩处'], sentence: '他受到了惩罚。', unit: 8 },
    { char: '撑', pinyin: 'chēng', radical: '扌', strokes: 15, words: ['支撑', '撑开'], sentence: '他用手撑着墙壁。', unit: 8 },
  ];
}

function importChineseChars(db) {
  const chars = getCharsData();
  const stmt = db.prepare('INSERT INTO chinese_chars (char, pinyin, radical, strokes, words, sentence, unit) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const c of chars) {
    stmt.run(c.char, c.pinyin, c.radical, c.strokes, JSON.stringify(c.words), c.sentence, c.unit);
  }
  console.log(`✅ 已导入 ${chars.length} 个生字`);
}

module.exports = { getDB, initDB, closeDB };
