const { getDB } = require('../db/database');
const ctrl = {
  getErrors: (req, res) => {
    try {
      const db = getDB();
      let sql = 'SELECT * FROM errors WHERE 1=1';
      const p = [];
      if (req.query.subject) { sql += ' AND subject = ?'; p.push(req.query.subject); }
      sql += ' ORDER BY created_at DESC';
      res.json(db.prepare(sql).all(...p));
    } catch(e) { res.status(500).json({error: e.message}); }
  },
  getErrorStats: (req, res) => {
    try {
      const db = getDB();
      res.json({
        total: db.prepare('SELECT COUNT(*) as total FROM errors').get().total,
        bySubject: db.prepare('SELECT subject,COUNT(*) as count FROM errors GROUP BY subject ORDER BY count DESC').all(),
        byCategory: db.prepare('SELECT category,COUNT(*) as count FROM errors GROUP BY category ORDER BY count DESC').all(),
        byMastery: db.prepare('SELECT mastery,COUNT(*) as count FROM errors GROUP BY mastery').all()
      });
    } catch(e) { res.status(500).json({error: e.message}); }
  },
  addError: (req, res) => {
    try {
      const r = req.body;
      const ret = getDB().prepare('INSERT INTO errors(title,subject,category,error_text,correct_text,analysis,error_reason,practice_type,source) VALUES(?,?,?,?,?,?,?,?,?)').run(r.title||'', r.subject||'语文', r.category||'字词', r.error_text||'', r.correct_text||'', r.analysis||'', r.error_reason||'概念不清', r.practice_type||'通用', r.source||'');
      res.json({id: ret.lastInsertRowid, ok: true});
    } catch(e) { res.status(500).json({error: e.message}); }
  },
  deleteError: (req, res) => {
    try { getDB().prepare('DELETE FROM errors WHERE id=?').run(req.params.id); res.json({ok:true}); }
    catch(e) { res.status(500).json({error: e.message}); }
  },
  getReports: (req, res) => {
    try { res.json(getDB().prepare('SELECT * FROM reports ORDER BY created_at DESC').all()); }
    catch(e) { res.status(500).json({error: e.message}); }
  },
  getErrorsForPrint: (req, res) => {
    try {
      const db = getDB();
      const { phase, subject, date } = req.query;
      let sql = 'SELECT * FROM errors WHERE 1=1';
      const p = [];
      if (phase) { sql += ' AND phase = ?'; p.push(phase); }
      if (subject) { sql += ' AND subject = ?'; p.push(subject); }
      if (date) { sql += ' AND error_date = ?'; p.push(date); }
      sql += ' ORDER BY subject, category, id';
      res.json(db.prepare(sql).all(...p));
    } catch(e) { res.status(500).json({error: e.message}); }
  },
  addReport: (req, res) => {
    try {
      const r = req.body;
      const ret = getDB().prepare('INSERT INTO reports(title,subject,summary,details,suggestions) VALUES(?,?,?,?,?)').run(r.title||'', r.subject||'综合', r.summary||'', JSON.stringify(r.details||[]), JSON.stringify(r.suggestions||[]));
      res.json({id: ret.lastInsertRowid, ok: true});
    } catch(e) { res.status(500).json({error: e.message}); }
  }
};
module.exports = ctrl;
