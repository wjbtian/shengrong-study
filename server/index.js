const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { initDB, getDB } = require('./db/python_db');

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

function today() {
  return new Date().toISOString().slice(0, 10);
}

// 初始化示例数据
async function seedData(db) {
  const sampleDiary = [
    { mood: '😄', title: '今天很开心', content: '学会了新的吉他曲子！', date: today() },
    { mood: '🤔', title: '数学思考题', content: '今天遇到了一道有趣的数学题...', date: today() },
  ];
  for (const d of sampleDiary) {
    await db.run('INSERT INTO diary (mood, title, content, date) VALUES (?, ?, ?, ?)',
      [d.mood, d.title, d.content, d.date]);
  }
  console.log('✅ 示例数据已初始化');
}

async function startServer() {
  // 初始化 Python 数据库
  const db = await initDB();

  // 如果是新数据库，初始化示例数据
  const diaryCount = await db.get('SELECT COUNT(*) as c FROM diary');
  if (!diaryCount || diaryCount.c === 0) {
    console.log('新数据库，初始化示例数据...');
    await seedData(db);
  }

  // 中间件
  app.use(cors());
  app.use(express.json());

  // 静态文件
  const distPath = path.join(__dirname, '..', 'client', 'dist');
  const clientPath = path.join(__dirname, '..', 'client');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log('✅ 使用 Vue 构建版本:', distPath);
  } else {
    app.use(express.static(clientPath));
    console.log('⚠️ 使用旧版客户端:', clientPath);
  }
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // ===== 日记 API =====
  app.get('/api/diary', async (req, res) => {
    try {
      const rows = await db.all('SELECT * FROM diary ORDER BY date DESC, id DESC');
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/diary', async (req, res) => {
    try {
      const { mood, title, content, date } = req.body;
      const result = await db.run('INSERT INTO diary (mood, title, content, date) VALUES (?, ?, ?, ?)',
        [mood, title, content, date]);
      res.json({ id: result.lastInsertRowid, ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/diary/:id', async (req, res) => {
    try {
      await db.run('DELETE FROM diary WHERE id = ?', [req.params.id]);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ===== 闪光时刻 API =====
  app.get('/api/shines', async (req, res) => {
    try {
      const rows = await db.all('SELECT * FROM shines ORDER BY date DESC, id DESC');
      rows.forEach(r => {
        if (r.photo && r.photo !== 'pending_migration' && !r.photo.startsWith('http')) {
          r.photoUrl = `/uploads/${r.photo}`;
        }
      });
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/shines', upload.single('photo'), async (req, res) => {
    try {
      const { title, type, icon, description, date } = req.body;
      const photo = req.file ? req.file.filename : null;
      const result = await db.run(
        'INSERT INTO shines (title, type, icon, description, date, photo) VALUES (?, ?, ?, ?, ?, ?)',
        [title, type, icon || type.split(' ')[0], description, date, photo]
      );
      res.json({ id: result.lastInsertRowid, ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/shines/:id', async (req, res) => {
    try {
      const row = await db.get('SELECT photo FROM shines WHERE id = ?', [req.params.id]);
      if (row && row.photo) {
        const p = path.join(__dirname, 'uploads', row.photo);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
      await db.run('DELETE FROM shines WHERE id = ?', [req.params.id]);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/shines/:id/like', async (req, res) => {
    try {
      const row = await db.get('SELECT likes FROM shines WHERE id = ?', [req.params.id]);
      if (!row) return res.status(404).json({ ok: false });
      const newLikes = (row.likes || 0) + 1;
      await db.run('UPDATE shines SET likes = ? WHERE id = ?', [newLikes, req.params.id]);
      res.json({ ok: true, likes: newLikes });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/shines/:id/fav', async (req, res) => {
    try {
      const { fav } = req.body;
      const row = await db.get('SELECT fav FROM shines WHERE id = ?', [req.params.id]);
      if (!row) return res.status(404).json({ ok: false, error: 'Not found' });
      await db.run('UPDATE shines SET fav = ? WHERE id = ?', [fav ? 1 : 0, req.params.id]);
      res.json({ ok: true, fav: !!fav });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ===== 学习进度 API =====
  app.get('/api/progress', async (req, res) => {
    try {
      const rows = await db.all('SELECT * FROM progress');
      const result = { doneUnits: [], doneOM: [] };
      rows.forEach(r => {
        if (r.completed) {
          if (r.subject === 'olympiad') result.doneOM.push(r.unit);
          else result.doneUnits.push(r.unit);
        }
      });
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/progress/:subject/:unit', async (req, res) => {
    try {
      const { subject, unit } = req.params;
      await db.run(
        'INSERT OR REPLACE INTO progress (subject, unit, completed, completed_at) VALUES (?, ?, 1, datetime("now","localtime"))',
        [subject, unit]
      );
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/progress/:subject/:unit', async (req, res) => {
    try {
      const { subject, unit } = req.params;
      await db.run('DELETE FROM progress WHERE subject = ? AND unit = ?', [subject, unit]);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ===== 吉他视频 API =====
  app.get('/api/guitar', async (req, res) => {
    try {
      const rows = await db.all('SELECT * FROM guitar_videos ORDER BY date DESC, id DESC');
      rows.forEach(r => { if (r.video_path) r.videoUrl = `/uploads/${r.video_path}`; });
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/guitar', upload.single('video'), async (req, res) => {
    try {
      const { title, notes, date, duration, bpm, key_sig } = req.body;
      const videoPath = req.file ? req.file.filename : null;
      const result = await db.run(
        'INSERT INTO guitar_videos (title, video_path, duration, bpm, key_sig, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, videoPath, duration || null, bpm || null, key_sig || null, notes || '', date]
      );
      res.json({ id: result.lastInsertRowid, ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/guitar/:id', async (req, res) => {
    try {
      const row = await db.get('SELECT video_path FROM guitar_videos WHERE id = ?', [req.params.id]);
      if (row && row.video_path) {
        const p = path.join(__dirname, 'uploads', row.video_path);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
      await db.run('DELETE FROM guitar_videos WHERE id = ?', [req.params.id]);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ===== 科技新闻 API =====
  app.get('/api/tech', async (req, res) => {
    try {
      const rows = await db.all('SELECT * FROM tech ORDER BY fav DESC, date DESC, id DESC');
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/tech', async (req, res) => {
    try {
      const { title, summary, source, category, date } = req.body;
      const result = await db.run(
        'INSERT INTO tech (title, summary, source, category, date) VALUES (?, ?, ?, ?, ?)',
        [title, summary, source || '', category || '🔬 科学', date]
      );
      res.json({ id: result.lastInsertRowid, ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/tech/:id', async (req, res) => {
    try {
      await db.run('DELETE FROM tech WHERE id = ?', [req.params.id]);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/tech/:id/fav', async (req, res) => {
    try {
      const row = await db.get('SELECT fav FROM tech WHERE id = ?', [req.params.id]);
      if (!row) return res.status(404).json({ ok: false });
      const newFav = row.fav ? 0 : 1;
      await db.run('UPDATE tech SET fav = ? WHERE id = ?', [newFav, req.params.id]);
      res.json({ ok: true, fav: newFav });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/tech/daily', async (req, res) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const count = await db.get('SELECT COUNT(*) as c FROM tech WHERE date = ?', [today]);
      res.json({ hasDaily: count.c > 0, today });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/tech/seed', async (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) return res.status(400).json({ ok: false });
      for (const item of items) {
        const exists = await db.get('SELECT id FROM tech WHERE title = ?', [item.title]);
        if (!exists) {
          await db.run(
            'INSERT INTO tech (title, summary, source, category, date) VALUES (?, ?, ?, ?, ?)',
            [item.title, item.summary || '', item.source || '', item.category || '🔬 科学', item.date || today()]
          );
        }
      }
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ===== 数据迁移 API =====
  app.post('/api/migrate', async (req, res) => {
    try {
      // 简化版迁移
      const data = req.body;
      if (data.diary) {
        for (const d of data.diary) {
          const exists = await db.get('SELECT id FROM diary WHERE id = ?', [d.id]);
          if (!exists) {
            await db.run('INSERT INTO diary (id, mood, title, content, date) VALUES (?, ?, ?, ?, ?)',
              [d.id, d.mood, d.title, d.content, d.date]);
          }
        }
      }
      if (data.shines) {
        for (const s of data.shines) {
          const exists = await db.get('SELECT id FROM shines WHERE id = ?', [s.id]);
          if (!exists) {
            await db.run('INSERT INTO shines (id, title, type, icon, description, date, photo) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [s.id, s.title, s.type, s.icon, s.desc || s.description || '', s.date, s.photo || null]);
          }
        }
      }
      res.json({ ok: true, msg: '数据迁移成功' });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // SPA fallback
  app.get('*', (req, res) => {
    const distIndex = path.join(__dirname, '..', 'client', 'dist', 'index.html');
    const clientIndex = path.join(__dirname, '..', 'client', 'index.html');
    if (fs.existsSync(distIndex)) {
      res.sendFile(distIndex);
    } else {
      res.sendFile(clientIndex);
    }
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
