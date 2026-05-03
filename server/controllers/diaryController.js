const { getDB } = require("../db/database");
const db = getDB();

const diaryController = {
  getAll: function(req, res) {
    try {
      const rows = db.prepare("SELECT * FROM diary ORDER BY date DESC, id DESC").all();
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  create: function(req, res) {
    try {
      const mood = req.body.mood;
      const title = req.body.title;
      const content = req.body.content;
      const date = req.body.date;
      const result = db.prepare("INSERT INTO diary (mood, title, content, date) VALUES (?, ?, ?, ?)")
        .run(mood, title, content, date);
      res.json({ id: result.lastInsertRowid, ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  update: function(req, res) {
    try {
      const mood = req.body.mood;
      const title = req.body.title;
      const content = req.body.content;
      const date = req.body.date;
      db.prepare("UPDATE diary SET mood = ?, title = ?, content = ?, date = ? WHERE id = ?")
        .run(mood, title, content, date, req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  delete: function(req, res) {
    try {
      db.prepare("DELETE FROM diary WHERE id = ?").run(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
};

module.exports = diaryController;
