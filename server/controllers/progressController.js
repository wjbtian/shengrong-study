const { getDB } = require('../db/database');
const db = getDB();

const progressController = {
  getAll: (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM progress').all();
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
  },

  markDone: (req, res) => {
    try {
      const { subject, unit } = req.params;
      db.prepare(
        'INSERT OR REPLACE INTO progress (subject, unit, completed, completed_at) VALUES (?, ?, 1, datetime("now","localtime"))'
      ).run(subject, unit);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  markUndo: (req, res) => {
    try {
      const { subject, unit } = req.params;
      db.prepare('DELETE FROM progress WHERE subject = ? AND unit = ?').run(subject, unit);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
};

module.exports = progressController;
