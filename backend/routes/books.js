
const express = require('express');
const router = express.Router();
const db = require('../db');
const { getBookInfoByISBN } = require('../isbn');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置图片上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 获取所有图书
router.get('/', (req, res) => {
  const { status, age_range } = req.query;
  let sql = 'SELECT * FROM books';
  const params = [];
  
  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  if (age_range) {
    sql += status ? ' AND age_range = ?' : ' WHERE age_range = ?';
    params.push(age_range);
  }
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ books: rows });
  });
});

// 获取单本图书
router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM books WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '图书不存在' });
      return;
    }
    res.json({ book: row });
  });
});

// 通过 ISBN 查询图书信息（不保存）
router.get('/isbn/:isbn', async (req, res) => {
  try {
    const bookInfo = await getBookInfoByISBN(req.params.isbn);
    if (!bookInfo) {
      res.status(404).json({ error: '未找到该 ISBN 对应的图书' });
      return;
    }
    res.json({ book: bookInfo });
  } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// 添加图书
router.post('/', upload.array('photos', 5), (req, res) => {
  const { isbn, title, author, publisher, price, selling_price, age_range, tags, location, status } = req.body;
  const cover_url = req.body.cover_url || '';
  const photos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

  const sql = `
    INSERT INTO books (isbn, title, author, publisher, price, selling_price, age_range, tags, cover_url, photos, location, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    isbn, title, author, publisher,
    price ? parseFloat(price) : null,
    selling_price ? parseFloat(selling_price) : null,
    age_range, tags, cover_url,
    JSON.stringify(photos), location, status || 'available'
  ];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '图书添加成功', id: this.lastID });
  });
});

// 更新图书
router.put('/:id', upload.array('photos', 5), (req, res) => {
  const { title, author, publisher, price, selling_price, age_range, tags, location, status, cover_url } = req.body;
  
  // 获取现有图书信息
  const getSql = 'SELECT * FROM books WHERE id = ?';
  db.get(getSql, [req.params.id], (err, existingBook) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!existingBook) {
      res.status(404).json({ error: '图书不存在' });
      return;
    }

    let photos = existingBook.photos ? JSON.parse(existingBook.photos) : [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map(f => `/uploads/${f.filename}`);
    }

    const sql = `
      UPDATE books
      SET title = ?, author = ?, publisher = ?, price = ?, selling_price = ?,
          age_range = ?, tags = ?, cover_url = ?, photos = ?, location = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const params = [
      title || existingBook.title,
      author || existingBook.author,
      publisher || existingBook.publisher,
      price !== undefined ? parseFloat(price) : existingBook.price,
      selling_price !== undefined ? parseFloat(selling_price) : existingBook.selling_price,
      age_range || existingBook.age_range,
      tags !== undefined ? tags : existingBook.tags,
      cover_url !== undefined ? cover_url : existingBook.cover_url,
      JSON.stringify(photos),
      location !== undefined ? location : existingBook.location,
      status !== undefined ? status : existingBook.status,
      req.params.id
    ];

    db.run(sql, params, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: '图书更新成功' });
    });
  });
});

// 删除图书
router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM books WHERE id = ?';
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '图书删除成功' });
  });
});

module.exports = router;
