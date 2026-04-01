
# 儿童绘本二手书管理系统（H5 版）

一个个人使用的儿童绘本二手书管理工具，支持图书录入、管理、分享选书和闲鱼半自动对接。

## 项目结构
```
children-book-manager/
├── backend/      # 后端代码（Node.js）
├── frontend/     # 前端 H5 代码（Vue.js 3）
└── docs/         # 项目文档
```

## 需求文档
详见 [docs/requirements.md](./docs/requirements.md)

## 技术栈
- 前端：HTML + CSS + JavaScript + Vue.js 3 + QuaggaJS（扫码）
- 后端：Node.js + Express
- 数据库：SQLite
- ISBN 查询：Open Library API / 豆瓣图书 API
- 图片存储：本地存储

## 开发计划
1. Day 1：需求分析 + 项目初始化 ✅
2. Day 2：后端基础框架 + 数据库设计
3. Day 3：ISBN 图书识别功能（Open Library API + QuaggaJS）
4. Day 4：图书 CRUD 接口
5. Day 5：前端 H5 基础页面（Vue.js 3）
6. Day 6：图书录入页面
7. Day 7：图书管理页面
8. Day 8：分享选书功能
9. Day 9：闲鱼半自动对接
10. Day 10：测试 + 优化
