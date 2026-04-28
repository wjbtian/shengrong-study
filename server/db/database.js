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

  console.log('✅ 数据库初始化完成');
  return database;
}

function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDB, initDB, closeDB };
