
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务（图片存储）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 确保 uploads 目录存在
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 路由
app.use('/api/books', require('./routes/books'));
app.use('/api/share-links', require('./routes/shareLinks'));
app.use('/api/carts', require('./routes/carts'));

// 测试接口
app.get('/', (req, res) => {
  res.json({ message: '儿童绘本二手书管理系统后端已启动' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`后端服务器运行在 http://localhost:${PORT}`);
});
