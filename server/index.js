const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { initDB, all, run, get, migrateFromJSON } = require('./db/init');

const app = express();
const PORT = 3200;

// 图片上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

async function startServer() {
  // 初始化数据库
  await initDB();

  // 中间件
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'client')));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // ===== 日记 API =====
  app.get('/api/diary', (req, res) => {
    const rows = all('SELECT * FROM diary ORDER BY date DESC, id DESC');
    res.json(rows);
  });

  app.post('/api/diary', (req, res) => {
    const { mood, title, content, date } = req.body;
    const result = run('INSERT INTO diary (mood, title, content, date) VALUES (?, ?, ?, ?)', [mood, title, content, date]);
    res.json({ id: result.lastInsertRowid, ok: true });
  });

  app.delete('/api/diary/:id', (req, res) => {
    run('DELETE FROM diary WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  });

  // ===== 闪光时刻 API =====
  app.get('/api/shines', (req, res) => {
    const rows = all('SELECT * FROM shines ORDER BY date DESC, id DESC');
    rows.forEach(r => { if (r.photo && r.photo !== 'pending_migration' && !r.photo.startsWith('http')) r.photoUrl = `/uploads/${r.photo}`; });
    res.json(rows);
  });

  app.post('/api/shines', upload.single('photo'), (req, res) => {
    const { title, type, icon, description, date } = req.body;
    const photo = req.file ? req.file.filename : null;
    const result = run('INSERT INTO shines (title, type, icon, description, date, photo) VALUES (?, ?, ?, ?, ?, ?)',
      [title, type, icon || type.split(' ')[0], description, date, photo]);
    res.json({ id: result.lastInsertRowid, ok: true });
  });

  app.delete('/api/shines/:id', (req, res) => {
    const row = get('SELECT photo FROM shines WHERE id = ?', [req.params.id]);
    if (row && row.photo) {
      const p = path.join(__dirname, 'uploads', row.photo);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    run('DELETE FROM shines WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  });

  // ===== 学习进度 API =====
  app.get('/api/progress', (req, res) => {
    const rows = all('SELECT * FROM progress');
    const result = { doneUnits: [], doneOM: [] };
    rows.forEach(r => {
      if (r.completed) {
        if (r.subject === 'olympiad') result.doneOM.push(r.unit);
        else result.doneUnits.push(r.unit);
      }
    });
    res.json(result);
  });

  app.post('/api/progress/:subject/:unit', (req, res) => {
    const { subject, unit } = req.params;
    run('INSERT OR REPLACE INTO progress (subject, unit, completed, completed_at) VALUES (?, ?, 1, datetime("now","localtime"))', [subject, unit]);
    res.json({ ok: true });
  });

  app.delete('/api/progress/:subject/:unit', (req, res) => {
    const { subject, unit } = req.params;
    run('DELETE FROM progress WHERE subject = ? AND unit = ?', [subject, unit]);
    res.json({ ok: true });
  });

  // ===== 科技新闻 API =====
  app.get('/api/tech', (req, res) => {
    const rows = all('SELECT * FROM tech ORDER BY fav DESC, date DESC, id DESC');
    res.json(rows);
  });

  app.post('/api/tech', (req, res) => {
    const { title, summary, source, category, date } = req.body;
    const result = run('INSERT INTO tech (title, summary, source, category, date) VALUES (?, ?, ?, ?, ?)', [title, summary, source || '', category || '🔬 科学', date]);
    res.json({ id: result.lastInsertRowid, ok: true });
  });

  app.delete('/api/tech/:id', (req, res) => {
    run('DELETE FROM tech WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  });

  // 收藏/取消收藏
  app.put('/api/tech/:id/fav', (req, res) => {
    const row = get('SELECT fav FROM tech WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ ok: false });
    const newFav = row.fav ? 0 : 1;
    run('UPDATE tech SET fav = ? WHERE id = ?', [newFav, req.params.id]);
    res.json({ ok: true, fav: newFav });
  });

  // 每日推荐
  app.get('/api/tech/daily', (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const count = get('SELECT COUNT(*) as c FROM tech WHERE date = ?', [today]);
    res.json({ hasDaily: count.c > 0, today });
  });

  // 批量添加种子数据
  app.post('/api/tech/seed', (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ ok: false });
    for (const item of items) {
      const exists = get('SELECT id FROM tech WHERE title = ?', [item.title]);
      if (!exists) {
        run('INSERT INTO tech (title, summary, source, category, date) VALUES (?, ?, ?, ?, ?)',
          [item.title, item.summary || '', item.source || '', item.category || '🔬 科学', item.date || today()]);
      }
    }
    res.json({ ok: true });
  });

  // ===== 数据迁移 API =====
  app.post('/api/migrate', (req, res) => {
    try {
      migrateFromJSON(req.body);
      res.json({ ok: true, msg: '数据迁移成功' });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
  });

  // 启动
  app.listen(PORT, () => {
    const os = require('os');
    const nets = os.networkInterfaces();
    let localIP = 'localhost';
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          localIP = net.address;
        }
      }
    }
    console.log(`🚀 尚融成长网站已启动！`);
    console.log(`   本机访问: http://localhost:${PORT}`);
    console.log(`   局域网访问: http://${localIP}:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});
