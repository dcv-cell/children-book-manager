const express = require('express');
const router = express.Router();
const db = require('../db');

// 生成闲鱼发布文案
router.post('/generate-copy/:bookId', (req, res) => {
  const bookId = req.params.bookId;

  db.get('SELECT * FROM books WHERE id = ?', [bookId], (err, book) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!book) {
      return res.status(404).json({ error: '图书不存在' });
    }

    // 生成文案
    let copy = `【出闲置】${book.title || '儿童绘本'}\n\n`;
    
    if (book.author) {
      copy += `✍️ 作者：${book.author}\n`;
    }
    if (book.publisher) {
      copy += `🏢 出版社：${book.publisher}\n`;
    }
    if (book.price) {
      copy += `💰 定价：${book.price}元\n`;
    }
    if (book.selling_price) {
      copy += `🎯 售价：${book.selling_price}元\n`;
    }
    if (book.age_range) {
      copy += `👶 适合年龄：${book.age_range}\n`;
    }
    if (book.location) {
      copy += `📍 存放位置：${book.location}\n`;
    }
    
    copy += `\n📖 绘本状态：`;
    switch (book.status) {
      case 'available':
        copy += '全新/品相好';
        break;
      case 'sold':
        copy += '已售出';
        break;
      case 'kept':
        copy += '自留';
        break;
      default:
        copy += '待售';
    }
    
    copy += `\n\n💡 说明：二手绘本，一经售出不退不换，介意慎拍。`;

    res.json({
      success: true,
      bookId: bookId,
      copy: copy,
      title: book.title || '儿童绘本',
      price: book.selling_price || book.price
    });
  });
});

// 生成图片拼图（纯文本提示，实际拼图需要前端或图片处理库）
router.post('/generate-collage/:bookId', (req, res) => {
  const bookId = req.params.bookId;

  db.get('SELECT * FROM books WHERE id = ?', [bookId], (err, book) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!book) {
      return res.status(404).json({ error: '图书不存在' });
    }

    let photos = [];
    if (book.photos) {
      try {
        photos = JSON.parse(book.photos);
      } catch (e) {
        photos = [];
      }
    }

    const allImages = [];
    if (book.cover_url) {
      allImages.push(book.cover_url);
    }
    allImages.push(...photos);

    res.json({
      success: true,
      bookId: bookId,
      images: allImages,
      message: '图片列表已生成，请使用图片编辑工具将图片拼成闲鱼长图（建议尺寸：750xN）',
      suggestedSize: '750x任意高度'
    });
  });
});

// 保存闲鱼链接
router.post('/save-link', (req, res) => {
  const { bookId, xianyuUrl } = req.body;

  if (!bookId || !xianyuUrl) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  const now = new Date().toISOString();

  db.get('SELECT * FROM xianyu_items WHERE book_id = ?', [bookId], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (existing) {
      // 更新现有记录
      db.run(
        'UPDATE xianyu_items SET xianyu_url = ?, xianyu_status = ?, updated_at = ? WHERE id = ?',
        [xianyuUrl, 'posted', now, existing.id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ success: true, id: existing.id });
        }
      );
    } else {
      // 创建新记录
      db.run(
        'INSERT INTO xianyu_items (book_id, xianyu_url, xianyu_status, posted_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [bookId, xianyuUrl, 'posted', now, now, now],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ success: true, id: this.lastID });
        }
      );
    }
  });
});

// 获取图书的闲鱼信息
router.get('/book/:bookId', (req, res) => {
  const bookId = req.params.bookId;

  db.get('SELECT * FROM xianyu_items WHERE book_id = ?', [bookId], (err, item) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, item: item || null });
  });
});

// 创建订单
router.post('/orders', (req, res) => {
  const { bookId, xianyuOrderId, buyerName, totalAmount, notes } = req.body;

  if (!bookId) {
    return res.status(400).json({ error: '缺少图书ID' });
  }

  const now = new Date().toISOString();

  db.run(
    'INSERT INTO orders (book_id, xianyu_order_id, buyer_name, total_amount, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [bookId, xianyuOrderId || null, buyerName || null, totalAmount || null, notes || null, now],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // 更新图书状态为已售
      db.run(
        'UPDATE books SET status = ?, updated_at = ? WHERE id = ?',
        ['sold', now, bookId],
        (updateErr) => {
          if (updateErr) {
            console.error('更新图书状态失败:', updateErr);
          }
          res.json({ success: true, id: this.lastID });
        }
      );
    }
  );
});

// 获取订单列表
router.get('/orders', (req, res) => {
  db.all('SELECT o.*, b.title, b.isbn FROM orders o LEFT JOIN books b ON o.book_id = b.id ORDER BY o.created_at DESC', [], (err, orders) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, orders });
  });
});

module.exports = router;
