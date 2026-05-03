const { getDB } = require('../db/database');
const db = getDB();

const commonController = {
  upload: (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: '没有收到文件' });
      const type = req.body.type || 'image';
      const url = '/uploads/' + req.file.filename;
      res.json({ url, photoUrl: url, videoUrl: type === 'video' ? url : '', filename: req.file.filename });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  migrate: (req, res) => {
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
  },

  getPhotoWall: (req, res) => {
    try {
      const row = db.prepare('SELECT config FROM photo_wall WHERE id = 1').get();
      res.json({ config: row ? JSON.parse(row.config) : [] });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  savePhotoWall: (req, res) => {
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
  }
};

module.exports = commonController;
