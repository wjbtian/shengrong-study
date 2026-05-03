const { getDB } = require('../db/database');
const db = getDB();

function today() {
  return new Date().toISOString().slice(0, 10);
}

const techController = {
  getAll: (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM tech ORDER BY fav DESC, date DESC, id DESC').all();
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  create: (req, res) => {
    try {
      const { title, summary, source, category, date } = req.body;
      const result = db.prepare(
        'INSERT INTO tech (title, summary, source, category, date) VALUES (?, ?, ?, ?, ?)'
      ).run(title, summary, source || '', category || '🔬 科学', date);
      res.json({ id: result.lastInsertRowid, ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  delete: (req, res) => {
    try {
      db.prepare('DELETE FROM tech WHERE id = ?').run(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  toggleFav: (req, res) => {
    try {
      const row = db.prepare('SELECT fav FROM tech WHERE id = ?').get(req.params.id);
      if (!row) return res.status(404).json({ ok: false });
      const newFav = row.fav ? 0 : 1;
      db.prepare('UPDATE tech SET fav = ? WHERE id = ?').run(newFav, req.params.id);
      res.json({ ok: true, fav: newFav });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  getDaily: (req, res) => {
    try {
      const todayStr = today();
      const count = db.prepare('SELECT COUNT(*) as c FROM tech WHERE date = ?').get(todayStr);
      res.json({ hasDaily: count.c > 0, today: todayStr });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  seed: (req, res) => {
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
  }
};

module.exports = techController;
