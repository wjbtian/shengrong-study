const { getDB } = require('../db/database');
const path = require('path');
const fs = require('fs');
const db = getDB();

function handleShinesCreate(req, res) {
  try {
    let title, type, icon, description, date, photo;
    
    if (req.file) {
      title = req.body.title;
      type = req.body.type;
      icon = req.body.icon;
      description = req.body.description;
      date = req.body.date;
      photo = req.file.filename;
    } else {
      const body = req.body;
      title = body.title;
      type = body.category || body.type;
      icon = body.category || body.type;
      description = body.desc || body.description;
      date = body.date;
      if (body.photoUrl) {
        photo = body.photoUrl.replace('/uploads/', '');
      } else {
        photo = null;
      }
    }
    
    const result = db.prepare(
      'INSERT INTO shines (title, type, icon, description, date, photo) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, type || '📸 照片', icon || '📸', description || '', date, photo);
    res.json({ id: result.lastInsertRowid, ok: true });
  } catch (e) {
    console.error('shines create error:', e);
    res.status(500).json({ error: e.message });
  }
}

const shinesController = {
  getAll: (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM shines ORDER BY date DESC, id DESC').all();
      rows.forEach(r => {
        if (r.photo && r.photo !== 'pending_migration' && !r.photo.startsWith('http')) {
          r.photoUrl = `/uploads/${r.photo}`;
        }
      });
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  create: (req, res, next) => {
    if (req.is('application/json')) {
      return handleShinesCreate(req, res);
    }
    const upload = require('../utils/upload');
    upload.single('photo')(req, res, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      handleShinesCreate(req, res);
    });
  },

  delete: (req, res) => {
    try {
      const row = db.prepare('SELECT photo FROM shines WHERE id = ?').get(req.params.id);
      if (row && row.photo) {
        const p = path.join(__dirname, '..', 'uploads', row.photo);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
      db.prepare('DELETE FROM shines WHERE id = ?').run(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  like: (req, res) => {
    try {
      const row = db.prepare('SELECT likes FROM shines WHERE id = ?').get(req.params.id);
      if (!row) return res.status(404).json({ ok: false });
      const newLikes = (row.likes || 0) + 1;
      db.prepare('UPDATE shines SET likes = ? WHERE id = ?').run(newLikes, req.params.id);
      res.json({ ok: true, likes: newLikes });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  fav: (req, res) => {
    try {
      const { fav } = req.body;
      const row = db.prepare('SELECT fav FROM shines WHERE id = ?').get(req.params.id);
      if (!row) return res.status(404).json({ ok: false, error: 'Not found' });
      db.prepare('UPDATE shines SET fav = ? WHERE id = ?').run(fav ? 1 : 0, req.params.id);
      res.json({ ok: true, fav: !!fav });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
};

module.exports = shinesController;
