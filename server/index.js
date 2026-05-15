const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { initDB, getDB } = require('./db/database');

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
  // 返回北京时间 (UTC+8) 的日期
  const now = new Date();
  const beijing = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return beijing.toISOString().slice(0, 10);
}

// 初始化示例数据
function seedData(db) {
  const sampleDiary = [
    { mood: '😄', title: '今天很开心', content: '学会了新的吉他曲子！', date: today() },
    { mood: '🤔', title: '数学思考题', content: '今天遇到了一道有趣的数学题...', date: today() },
  ];
  const stmt = db.prepare('INSERT INTO diary (mood, title, content, date) VALUES (?, ?, ?, ?)');
  for (const d of sampleDiary) {
    stmt.run(d.mood, d.title, d.content, d.date);
  }
  console.log('✅ 示例数据已初始化');
}

function startServer() {
  // 初始化数据库
  initDB();
  const db = getDB();

  // 如果是新数据库，初始化示例数据
  const diaryCount = db.prepare('SELECT COUNT(*) as c FROM diary').get();
  if (!diaryCount || diaryCount.c === 0) {
    console.log('新数据库，初始化示例数据...');
    seedData(db);
  }

  // 中间件
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

  // ===== 通用上传 API =====
  app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: '没有收到文件' });
      const type = req.body.type || 'image';
      const subDir = type === 'video' ? 'videos' : 'images';
      // multer 已经把文件存到 uploads/ 目录了
      const url = `/uploads/${req.file.filename}`;
      res.json({ url, photoUrl: url, videoUrl: type === 'video' ? url : '', filename: req.file.filename });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ===== 日记 API =====
  app.get('/api/diary', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM diary ORDER BY date DESC, id DESC').all();
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/diary', (req, res) => {
    try {
      const { mood, title, content, date } = req.body;
      const result = db.prepare('INSERT INTO diary (mood, title, content, date) VALUES (?, ?, ?, ?)')
        .run(mood, title, content, date);
      res.json({ id: result.lastInsertRowid, ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/diary/:id', (req, res) => {
    try {
      const { mood, title, content, date } = req.body;
      db.prepare('UPDATE diary SET mood = ?, title = ?, content = ?, date = ? WHERE id = ?')
        .run(mood, title, content, date, req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/diary/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM diary WHERE id = ?').run(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ===== 闪光时刻 API =====
  app.get('/api/shines', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM shines ORDER BY date DESC, id DESC').all();
      rows.forEach(r => {
        // 统一返回 photos 数组
        let photos = [];
        if (r.photos) {
          try {
            const raw = typeof r.photos === 'string' ? JSON.parse(r.photos) : r.photos;
            photos = raw.map(p => {
              if (!p) return null;
              // 已经是完整路径
              if (p.startsWith('http') || p.startsWith('/')) return p;
              // 旧数据：photo 字段存文件名
              return `/uploads/${p}`;
            }).filter(Boolean);
          } catch (e) {
            photos = [];
          }
        } else if (r.photo && r.photo !== 'pending_migration') {
          // 旧数据兼容：单 photo 字段
          const p = r.photo.startsWith('/') ? r.photo : `/uploads/${r.photo}`;
          photos = [p];
        }
        r.photos = photos;
        // 兼容前端旧字段
        r.photoUrl = photos[0] || '';
        delete r.photo;
      });
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/shines', (req, res, next) => {
    // 如果是 JSON 请求，跳过 multer，直接处理
    if (req.is('application/json')) {
      return handleShinesCreate(req, res);
    }
    // multipart 表单，用 multer 处理
    upload.single('photo')(req, res, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      handleShinesCreate(req, res);
    });
  });

  function handleShinesCreate(req, res) {
    try {
      const body = req.body;
      const title = body.title;
      const type = body.category || body.type;
      const icon = body.category || body.type;
      const description = body.desc || body.description;
      const date = body.date;
      
      // 支持单个 photoUrl 或 photos 数组
      let photos = [];
      if (body.photos && Array.isArray(body.photos)) {
        photos = body.photos;
      } else if (body.photoUrl) {
        photos = [body.photoUrl];
      }
      
      const result = db.prepare(
        'INSERT INTO shines (title, type, icon, description, date, photos) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(title, type || '📸 照片', icon || '📸', description || '', date, JSON.stringify(photos));
      
      res.json({ id: result.lastInsertRowid, ok: true });
    } catch (e) {
      console.error('shines create error:', e);
      res.status(500).json({ error: e.message });
    }
  }

  app.delete('/api/shines/:id', (req, res) => {
    try {
      const row = db.prepare('SELECT photo, photos FROM shines WHERE id = ?').get(req.params.id);
      if (row) {
        // 删除单张旧图片
        if (row.photo) {
          const p = path.join(__dirname, 'uploads', row.photo);
          if (fs.existsSync(p)) fs.unlinkSync(p);
        }
        // 删除多张图片
        if (row.photos) {
          try {
            const photos = JSON.parse(row.photos);
            photos.forEach(photo => {
              const filename = photo.replace('/uploads/', '');
              const p = path.join(__dirname, 'uploads', filename);
              if (fs.existsSync(p)) fs.unlinkSync(p);
            });
          } catch (e) {}
        }
      }
      db.prepare('DELETE FROM shines WHERE id = ?').run(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/shines/:id/like', (req, res) => {
    try {
      const row = db.prepare('SELECT likes FROM shines WHERE id = ?').get(req.params.id);
      if (!row) return res.status(404).json({ ok: false });
      const newLikes = (row.likes || 0) + 1;
      db.prepare('UPDATE shines SET likes = ? WHERE id = ?').run(newLikes, req.params.id);
      res.json({ ok: true, likes: newLikes });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  
  // 更新闪光时刻
  app.post('/api/shines/:id', (req, res) => {
    try {
      const { title, category, desc, photos, fav } = req.body;
      
      // 更新收藏单独处理
      if (fav !== undefined) {
        db.prepare('UPDATE shines SET fav = ? WHERE id = ?').run(fav ? 1 : 0, req.params.id);
        return res.json({ ok: true });
      }
      
      // 更新其他字段
      const photosJson = JSON.stringify(photos || []);
      db.prepare(
        'UPDATE shines SET title = ?, type = ?, icon = ?, description = ?, photos = ? WHERE id = ?'
      ).run(title, category, category, desc || '', photosJson, req.params.id);
      
      res.json({ ok: true });
    } catch (e) {
      console.error('shines update error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/shines/:id/fav', (req, res) => {
    try {
      const { fav } = req.body;
      const row = db.prepare('SELECT fav FROM shines WHERE id = ?').get(req.params.id);
      if (!row) return res.status(404).json({ ok: false, error: 'Not found' });
      db.prepare('UPDATE shines SET fav = ? WHERE id = ?').run(fav ? 1 : 0, req.params.id);
      res.json({ ok: true, fav: !!fav });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ===== 学习进度 API =====
  app.get('/api/progress', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM progress').all();
      const result = { doneUnits: [], doneOM: [] };
      rows.forEach(r => {
        if (r.completed) {
          const fullId = `${r.subject}_${r.unit}`;
          if (r.subject === 'olympiad') result.doneOM.push(fullId);
          else result.doneUnits.push(fullId);
        }
      });
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/progress/:subject/:unit', (req, res) => {
    try {
      const { subject, unit } = req.params;
      db.prepare(
        "INSERT OR REPLACE INTO progress (subject, unit, completed, completed_at) VALUES (?, ?, 1, datetime('now','localtime'))"
      ).run(subject, unit);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/progress/:subject/:unit', (req, res) => {
    try {
      const { subject, unit } = req.params;
      db.prepare('DELETE FROM progress WHERE subject = ? AND unit = ?').run(subject, unit);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ===== 吉他视频 API =====
  app.get('/api/guitar', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM guitar_videos ORDER BY date DESC, id DESC').all();
      rows.forEach(r => { if (r.video_path) r.videoUrl = `/uploads/${r.video_path}`; });
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/guitar', (req, res, next) => {
    if (req.is('application/json')) {
      return handleGuitarCreate(req, res);
    }
    upload.single('video')(req, res, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      handleGuitarCreate(req, res);
    });
  });

  function handleGuitarCreate(req, res) {
    try {
      let title, notes, date, duration, bpm, key_sig, videoPath;
      
      if (req.file) {
        // multipart 方式
        title = req.body.title;
        notes = req.body.notes;
        date = req.body.date;
        duration = req.body.duration;
        bpm = req.body.bpm;
        key_sig = req.body.key_sig;
        videoPath = req.file.filename;
      } else {
        // JSON 方式
        const body = req.body;
        title = body.title;
        notes = body.notes || '';
        date = body.date;
        duration = body.duration;
        bpm = body.bpm;
        key_sig = body.key_sig;
        if (body.videoUrl) {
          videoPath = body.videoUrl.replace('/uploads/', '');
        } else {
          videoPath = null;
        }
      }
      
      const result = db.prepare(
        'INSERT INTO guitar_videos (title, video_path, duration, bpm, key_sig, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(title, videoPath, duration || null, bpm || null, key_sig || null, notes || '', date);
      res.json({ id: result.lastInsertRowid, ok: true });
    } catch (e) {
      console.error('guitar create error:', e);
      res.status(500).json({ error: e.message });
    }
  }

  app.delete('/api/guitar/:id', (req, res) => {
    try {
      const row = db.prepare('SELECT video_path FROM guitar_videos WHERE id = ?').get(req.params.id);
      if (row && row.video_path) {
        const p = path.join(__dirname, 'uploads', row.video_path);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
      db.prepare('DELETE FROM guitar_videos WHERE id = ?').run(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ===== 科技新闻 API =====
  app.get('/api/tech', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM tech ORDER BY fav DESC, date DESC, id DESC').all();
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/tech', (req, res) => {
    try {
      const { title, summary, source, category, date } = req.body;
      const result = db.prepare(
        'INSERT INTO tech (title, summary, source, category, date) VALUES (?, ?, ?, ?, ?)'
      ).run(title, summary, source || '', category || '🔬 科学', date);
      res.json({ id: result.lastInsertRowid, ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/tech/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM tech WHERE id = ?').run(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/tech/:id/fav', (req, res) => {
    try {
      const row = db.prepare('SELECT fav FROM tech WHERE id = ?').get(req.params.id);
      if (!row) return res.status(404).json({ ok: false });
      const newFav = row.fav ? 0 : 1;
      db.prepare('UPDATE tech SET fav = ? WHERE id = ?').run(newFav, req.params.id);
      res.json({ ok: true, fav: newFav });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/tech/daily', (req, res) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const count = db.prepare('SELECT COUNT(*) as c FROM tech WHERE date = ?').get(today);
      res.json({ hasDaily: count.c > 0, today });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/tech/seed', (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) return res.status(400).json({ ok: false });
      const checkStmt = db.prepare('SELECT id FROM tech WHERE title = ?');
      const insertStmt = db.prepare('INSERT INTO tech (title, summary, source, category, date) VALUES (?, ?, ?, ?, ?)');
      for (const item of items) {
        const exists = checkStmt.get(item.title);
        if (!exists) {
          insertStmt.run(item.title, item.summary || '', item.source || '', item.category || '🔬 科学', item.date || today());
        }
      }
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ===== 数据迁移 API =====
  app.post('/api/migrate', (req, res) => {
    try {
      const data = req.body;
      if (data.diary) {
        const checkStmt = db.prepare('SELECT id FROM diary WHERE id = ?');
        const insertStmt = db.prepare('INSERT INTO diary (id, mood, title, content, date) VALUES (?, ?, ?, ?, ?)');
        for (const d of data.diary) {
          if (!checkStmt.get(d.id)) {
            insertStmt.run(d.id, d.mood, d.title, d.content, d.date);
          }
        }
      }
      if (data.shines) {
        const checkStmt = db.prepare('SELECT id FROM shines WHERE id = ?');
        const insertStmt = db.prepare('INSERT INTO shines (id, title, type, icon, description, date, photo) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for (const s of data.shines) {
          if (!checkStmt.get(s.id)) {
            insertStmt.run(s.id, s.title, s.type, s.icon, s.desc || s.description || '', s.date, s.photo || null);
          }
        }
      }
      res.json({ ok: true, msg: '数据迁移成功' });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // ===== 照片墙配置 API =====
  app.get('/api/photo-wall', (req, res) => {
    try {
      const row = db.prepare('SELECT config FROM photo_wall WHERE id = 1').get();
      res.json({ config: row ? JSON.parse(row.config) : [] });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/photo-wall', (req, res) => {
    try {
      const { config } = req.body;
      const exists = db.prepare('SELECT id FROM photo_wall WHERE id = 1').get();
      if (exists) {
        db.prepare('UPDATE photo_wall SET config = ? WHERE id = 1').run(JSON.stringify(config));
      } else {
        db.prepare('INSERT INTO photo_wall (id, config) VALUES (1, ?)').run(JSON.stringify(config));
      }
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ===== 每日五字 API =====
  app.get('/api/chinese/daily', (req, res) => {
    try {
      const dateStr = today(); // 2026-05-12
      const total = db.prepare('SELECT COUNT(*) as c FROM chinese_chars').get().c;
      
      // 使用日期散列生成起始索引，避免相邻日期重复
      let hash = 0;
      for (let i = 0; i < dateStr.length; i++) {
        hash = (hash * 31 + dateStr.charCodeAt(i)) & 0x7fffffff;
      }
      const baseIdx = hash % total;
      const step = Math.floor(total / 5) || 44;
      const dailyChars = [];
      for (let i = 0; i < 5 && i < total; i++) {
        const idx = (baseIdx + i * step) % total;
        const c = db.prepare('SELECT * FROM chinese_chars LIMIT 1 OFFSET ?').get(idx);
        if (c) {
          // 解析 words JSON
          try { c.words = JSON.parse(c.words); } catch (e) { c.words = []; }
          dailyChars.push(c);
        }
      }
      
      // 获取今天已打卡的
      const checkins = db.prepare('SELECT char_id FROM char_checkins WHERE date = ? AND practiced = 1').all(dateStr);
      const practicedIds = new Set(checkins.map(c => c.char_id));
      dailyChars.forEach(c => { c.practiced = practicedIds.has(c.id); });
      
      res.json({ chars: dailyChars, date: dateStr });
    } catch (e) {
      console.error('/api/chinese/daily error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/chinese/checkin', (req, res) => {
    try {
      const { char_id, practiced } = req.body;
      const dateStr = today();
      const exists = db.prepare('SELECT id FROM char_checkins WHERE char_id = ? AND date = ?').get(char_id, dateStr);
      if (exists) {
        db.prepare('UPDATE char_checkins SET practiced = ? WHERE char_id = ? AND date = ?').run(practiced ? 1 : 0, char_id, dateStr);
      } else {
        db.prepare('INSERT INTO char_checkins (char_id, date, practiced) VALUES (?, ?, ?)').run(char_id, dateStr, practiced ? 1 : 0);
      }
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/chinese/progress', (req, res) => {
    try {
      const total = db.prepare('SELECT COUNT(*) as c FROM chinese_chars').get().c;
      const practiced = db.prepare('SELECT COUNT(DISTINCT char_id) as c FROM char_checkins WHERE practiced = 1').get().c;
      res.json({ total, practiced, percent: total > 0 ? Math.round(practiced / total * 100) : 0 });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // 获取错字难字
  app.get('/api/chinese/difficult', (req, res) => {
    try {
      const chars = db.prepare('SELECT * FROM chinese_chars WHERE is_difficult = 1').all();
      chars.forEach(c => {
        try { c.words = JSON.parse(c.words); } catch (e) { c.words = []; }
      });
      res.json({ chars });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // 标记/取消标记错字难字
  app.post('/api/chinese/char/:id/difficult', (req, res) => {
    try {
      const { id } = req.params;
      const { is_difficult } = req.body;
      db.prepare('UPDATE chinese_chars SET is_difficult = ? WHERE id = ?').run(is_difficult ? 1 : 0, id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // 获取练字历史（最近N天）
  app.get('/api/chinese/history', (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const history = [];
      const todayStr = today();
      const total = db.prepare('SELECT COUNT(*) as c FROM chinese_chars').get().c;
      const step = Math.floor(total / 5) || 44;
      
      for (let d = 0; d < days; d++) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        // 使用北京时间计算
        const beijing = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        const dateStr = beijing.toISOString().slice(0, 10);
        
        // 使用日期散列（与 /api/chinese/daily 相同）
        let hash = 0;
        for (let i = 0; i < dateStr.length; i++) {
          hash = (hash * 31 + dateStr.charCodeAt(i)) & 0x7fffffff;
        }
        const baseIdx = hash % total;
        const dailyChars = [];
        
        for (let i = 0; i < 5 && i < total; i++) {
          const idx = (baseIdx + i * step) % total;
          const c = db.prepare('SELECT * FROM chinese_chars LIMIT 1 OFFSET ?').get(idx);
          if (c) {
            try { c.words = JSON.parse(c.words); } catch (e) { c.words = []; }
            dailyChars.push(c);
          }
        }
        
        // 获取该天打卡状态
        const checkins = db.prepare('SELECT char_id FROM char_checkins WHERE date = ? AND practiced = 1').all(dateStr);
        const practicedIds = new Set(checkins.map(c => c.char_id));
        dailyChars.forEach(c => { c.practiced = practicedIds.has(c.id); });
        
        if (dailyChars.length > 0) {
          history.push({ date: dateStr, chars: dailyChars });
        }
      }
      
      res.json({ history });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // SPA fallback
  app.get('*', (req, res) => {
    const distIndex = path.join(__dirname, '..', 'client', 'dist', 'index.html');
    if (fs.existsSync(distIndex)) {
      res.sendFile(distIndex);
    } else {
      res.status(404).send('构建产物不存在，请先运行 npm run build');
    }
  });

  // 启动
  const server = app.listen(PORT, () => {
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
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`端口 ${PORT} 已被占用，跳过启动`);
    } else {
      console.error('服务器错误:', err);
    }
  });
}

startServer();
