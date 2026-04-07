# 儿童绘本二手书管理系统（纯前端版）

一个纯前端的儿童绘本二手书管理工具，支持图书录入、管理和分享功能。

## ✨ 特性

- 📚 **图书管理**：添加、查看、编辑、删除图书
- 🤖 **智能识别**：直接调用豆包大模型识别图书信息
- 💾 **本地存储**：使用 IndexedDB 本地存储数据
- 📋 **一键分享**：生成图书信息文本，可复制到任意平台
- 📱 **响应式设计**：完美支持移动端

## 🛠️ 技术栈

- **前端框架**：Vue.js 3 + Vite
- **数据存储**：localForage (IndexedDB)
- **AI 模型**：豆包大模型（火山引擎）
- **样式**：原生 CSS

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 环境配置

在项目根目录创建 `.env` 文件：

```env
VITE_VOLCENGINE_API_KEY=你的火山引擎API密钥
VITE_VOLCENGINE_MODEL_ID=doubao-seed-2-0-code-250615
```

## 📖 使用说明

### 添加图书

1. 点击"添加图书"按钮
2. 输入图书描述或上传封面图片
3. 点击"智能识别"获取图书信息
4. 补充或修改图书信息
5. 保存图书

### 分享图书

1. 在图书列表中找到要分享的图书
2. 点击"分享"按钮
3. 复制生成的图书信息文本
4. 粘贴到闲鱼、微信等平台发送

## 📁 项目结构

```
children-book-manager/
├── src/
│   ├── components/     # 组件
│   ├── views/          # 页面
│   ├── utils/          # 工具函数
│   ├── store/          # 数据存储
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── public/             # 静态资源
├── index.html          # HTML 模板
├── package.json        # 依赖配置
└── vite.config.js      # Vite 配置
```

## 🌐 GitHub Pages 部署

### 方法一：自动部署（推荐）

1. Fork 此仓库
2. 在仓库设置中启用 GitHub Pages
3. 设置 Source 为 `gh-pages` 分支
4. 推送代码后自动部署

### 方法二：手动部署

```bash
# 构建项目
npm run build

# 安装 gh-pages
npm install -D gh-pages

# 部署
npx gh-pages -d dist
```

访问地址：`https://你的用户名.github.io/children-book-manager/`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
