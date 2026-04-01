
# 儿童绘本二手书管理系统（H5 版）

一个个人使用的儿童绘本二手书管理工具，支持图书录入、管理、分享选书和闲鱼半自动对接。

## 项目结构
```
children-book-manager/
├── backend/      # 后端代码（Node.js）
├── frontend/     # 前端 H5 代码（Vue.js 3）
├── docs/         # 项目文档
├── start.bat     # Windows 一键启动脚本
└── README.md
```

## 需求文档
详见 [docs/requirements.md](./docs/requirements.md)

## 技术栈
- 前端：HTML + CSS + JavaScript + Vue.js 3 + QuaggaJS（扫码）
- 后端：Node.js + Express
- 数据库：SQLite
- ISBN 查询：Open Library API / 豆瓣图书 API
- 图片存储：本地存储

## 快速启动
### Windows 用户
1. 双击运行 `start.bat`
2. 等待后端和前端启动
3. 访问前端地址（默认 http://localhost:5173）

### 手动启动
#### 后端
```bash
cd backend
npm install
npm start
```
后端地址：http://localhost:3001

#### 前端
```bash
cd frontend
npm install
npm run dev
```
前端地址：http://localhost:5173

## 功能说明
- **图书管理**：查看、筛选、删除图书
- **图书录入**：输入或扫描 ISBN 自动获取图书信息，上传实物照片
- **分享选书**：生成分享链接，他人可挑选图书并加入购物车

## 开发进度
- ✅ 需求分析 + 项目初始化
- ✅ 后端基础框架 + 数据库设计
- ✅ ISBN 图书识别功能
- ✅ 图书 CRUD 接口
- ✅ 前端 H5 基础页面
- ✅ 图书录入页面
- ✅ 图书管理页面
- ✅ 分享选书功能
- ⏳ 闲鱼半自动对接
- ⏳ 测试 + 优化
