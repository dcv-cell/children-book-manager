
const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// 生成分享链接
router.post('/', (req, res) => {
  const { password, expires_days = 7 } = req.body;
  const code = crypto.randomBytes(4).toString('hex');
  const expiresAt = new Date(Date.now() + expires_days * 24 * 60 * 60 * 1000).toISOString();

  const sql = 'INSERT INTO share_links (code, password, expires_at) VALUES (?, ?, ?)';
  db.run(sql, [code, password || null, expiresAt], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '分享链接创建成功', code, id: this.lastID });
  });
});

// 获取分享链接详情
router.get('/:code', (req, res) => {
  const sql = 'SELECT * FROM share_links WHERE code = ?';
  db.get(sql, [req.params.code], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '分享链接不存在' });
      return;
    }
    if (new Date(row.expires_at) < new Date()) {
      res.status(410).json({ error: '分享链接已过期' });
      return;
    }
    res.json({ share_link: row });
  });
});

module.exports = router;
