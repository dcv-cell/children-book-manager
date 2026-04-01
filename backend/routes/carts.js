
const express = require('express');
const router = express.Router();
const db = require('../db');

// 添加图书到购物车
router.post('/', (req, res) => {
  const { share_link_id, book_id } = req.body;

  const sql = 'INSERT INTO carts (share_link_id, book_id) VALUES (?, ?)';
  db.run(sql, [share_link_id, book_id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '已添加到购物车', id: this.lastID });
  });
});

// 获取购物车内容（含图书详情）
router.get('/:share_link_id', (req, res) => {
  const sql = `
    SELECT carts.*, books.title, books.selling_price, books.cover_url
    FROM carts
    JOIN books ON carts.book_id = books.id
    WHERE carts.share_link_id = ?
  `;
  db.all(sql, [req.params.share_link_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const total = rows.reduce((sum, item) => sum + (item.selling_price || 0), 0);
    res.json({ cart_items: rows, total });
  });
});

// 从购物车移除图书
router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM carts WHERE id = ?';
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '已从购物车移除' });
  });
});

module.exports = router;
