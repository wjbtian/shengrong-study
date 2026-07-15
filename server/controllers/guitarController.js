const { getDB } = require('../db/database');
const path = require('path');
const fs = require('fs');
const db = getDB();

function handleGuitarCreate(req, res) {
  try {
    let title, notes, date, duration, bpm, key_sig, videoPath;
    
    if (req.file) {
      title = req.body.title;
      notes = req.body.notes;
      date = req.body.date;
      duration = req.body.duration;
      bpm = req.body.bpm;
      key_sig = req.body.key_sig;
      videoPath = req.file.filename;
    } else {
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

const guitarController = {
  getAll: (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM guitar_videos ORDER BY date DESC, id DESC').all();
      rows.forEach(r => { if (r.video_path) r.videoUrl = '/uploads/' + r.video_path; });
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  create: (req, res, next) => {
    if (req.is('application/json')) {
      return handleGuitarCreate(req, res);
    }
    const upload = require('../utils/upload');
    upload.single('video')(req, res, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      handleGuitarCreate(req, res);
    });
  },

  delete: (req, res) => {
    try {
      const row = db.prepare('SELECT video_path FROM guitar_videos WHERE id = ?').get(req.params.id);
      if (row && row.video_path) {
        const p = path.join(__dirname, '..', 'uploads', row.video_path);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
      db.prepare('DELETE FROM guitar_videos WHERE id = ?').run(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
};

module.exports = guitarController;
