const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'shengrong.db');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// 确保上传目录存在
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let db = null;

// 初始化数据库
async function initDB() {
  const SQL = await initSqlJs();

  // 如果已有数据库文件，加载它
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  // 创建表
  db.run(`
    CREATE TABLE IF NOT EXISTS diary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mood TEXT NOT NULL DEFAULT '😄',
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS shines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT '📸 照片',
      icon TEXT NOT NULL DEFAULT '📸',
      description TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      photo TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      unit TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      UNIQUE(subject, unit)
    );

    CREATE TABLE IF NOT EXISTS tech (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      source TEXT,
      category TEXT DEFAULT '🔬 科学',
      fav INTEGER DEFAULT 0,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

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
    );
  `);

  saveDB();
  return db;
}

// 保存数据库到文件
function saveDB() {
  if (!db) return;
  const data = db.export();
  const buf = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buf);
}

// 查询辅助函数
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
  return { lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] };
}

function get(sql, params = []) {
  const rows = all(sql, params);
  return rows.length ? rows[0] : null;
}

// 迁移旧数据
function migrateFromJSON(oldData) {
  if (!oldData) return;

  if (oldData.diary) {
    for (const d of oldData.diary) {
      const exists = get('SELECT id FROM diary WHERE id = ?', [d.id]);
      if (!exists) {
        run('INSERT INTO diary (id, mood, title, content, date) VALUES (?, ?, ?, ?, ?)',
          [d.id, d.mood, d.title, d.content, d.date]);
      }
    }
  }
  if (oldData.shines) {
    for (const s of oldData.shines) {
      const exists = get('SELECT id FROM shines WHERE id = ?', [s.id]);
      if (!exists) {
        const hasPhoto = !!(s.photo || s.img);
        run('INSERT INTO shines (id, title, type, icon, description, date, photo) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [s.id, s.title, s.type, s.icon, s.desc || s.description || '', s.date, hasPhoto ? 'pending_migration' : null]);
      }
    }
  }
  if (oldData.doneUnits) {
    for (const unit of oldData.doneUnits) {
      const [subject] = unit.split('_');
      const subjectMap = { chinese: 'chinese', math: 'math', english: 'english' };
      run('INSERT OR REPLACE INTO progress (subject, unit, completed, completed_at) VALUES (?, ?, 1, datetime("now","localtime"))',
        [subjectMap[subject] || subject, unit]);
    }
  }
  if (oldData.doneOM) {
    for (const unit of oldData.doneOM) {
      run('INSERT OR REPLACE INTO progress (subject, unit, completed, completed_at) VALUES (?, ?, 1, datetime("now","localtime"))',
        ['olympiad', unit]);
    }
  }
  if (oldData.tech) {
    for (const t of oldData.tech) {
      const exists = get('SELECT id FROM tech WHERE id = ?', [t.id]);
      if (!exists) {
        run('INSERT INTO tech (id, title, summary, source, date) VALUES (?, ?, ?, ?, ?)',
          [t.id, t.title, t.summary || '', t.source || '', t.date]);
      }
    }
  }
}

module.exports = { initDB, all, run, get, saveDB, migrateFromJSON };
