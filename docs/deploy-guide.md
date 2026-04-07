# Render 部署指南

本指南将帮助你将儿童绘本二手书管理系统部署到 Render 平台。

## 前置条件

1. GitHub 账号
2. Render 账号（免费注册：https://render.com）
3. 项目代码已推送到 GitHub

## 部署步骤

### 方法一：使用 render.yaml 自动部署（推荐）

1. **确保 render.yaml 在项目根目录**

2. **登录 Render 控制台**
   - 访问 https://dashboard.render.com
   - 使用 GitHub 账号登录

3. **创建新的 Blueprint**
   - 点击 "New +" → "Blueprint"
   - 连接你的 GitHub 账号
   - 选择项目仓库
   - 点击 "Apply"

4. **配置环境变量**
   - 在 Render 控制台中，找到 `children-book-backend` 服务
   - 进入 "Environment" 标签
   - 添加环境变量：
     ```
     VOLCENGINE_API_KEY=你的火山引擎API密钥
     ```

5. **等待部署完成**
   - Render 会自动构建和部署两个服务
   - 部署完成后，你会获得两个访问地址：
     - 前端：https://children-book-frontend.onrender.com
     - 后端：https://children-book-backend.onrender.com

### 方法二：手动部署

#### 部署后端

1. **创建新的 Web Service**
   - 点击 "New +" → "Web Service"
   - 连接 GitHub 仓库
   - 配置：
     - Name: `children-book-backend`
     - Environment: `Node`
     - Region: 选择离你近的区域
     - Branch: `main`
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Plan: `Free`

2. **添加环境变量**
   - 在 "Environment" 标签中添加：
     ```
     VOLCENGINE_API_KEY=你的火山引擎API密钥
     NODE_VERSION=18
     ```

3. **点击 "Create Web Service"**

#### 部署前端

1. **创建新的 Static Site**
   - 点击 "New +" → "Static Site"
   - 连接 GitHub 仓库
   - 配置：
     - Name: `children-book-frontend`
     - Region: 选择离你近的区域
     - Branch: `main`
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`

2. **添加环境变量**
   - 在 "Environment" 标签中添加：
     ```
     VITE_API_URL=https://children-book-backend.onrender.com/api
     ```
   （注意：将 URL 替换为你的后端实际地址）

3. **点击 "Create Static Site"**

## 重要注意事项

### SQLite 数据持久化

⚠️ **重要提示**：Render 的免费实例在每次部署或重启时，文件系统会重置。这意味着：
- SQLite 数据库文件会丢失
- 上传的图片文件会丢失

**解决方案**：
1. **短期方案**：接受数据重置，适合测试
2. **长期方案**：升级到 Render 付费计划，使用 PostgreSQL 数据库

### 冷启动问题

Render 的免费实例在闲置 15 分钟后会进入休眠状态，下次访问时需要约 30 秒启动时间。

**解决方法**：
- 使用 Uptime Robot 等服务定期 ping 你的服务
- 或升级到付费计划

### 火山引擎 API Key

确保在 Render 环境变量中正确配置了 `VOLCENGINE_API_KEY`，否则：
- 图书封面分析功能无法使用
- 豆包大模型增强的 ISBN 查询功能无法使用

## 自定义域名

Render 提供免费的 `.onrender.com` 域名，你也可以使用自定义域名：

1. 在 Render 服务设置中找到 "Custom Domains"
2. 添加你的域名
3. 按照提示配置 DNS 解析
4. 等待 SSL 证书颁发（通常几分钟）

## 监控和日志

- 在 Render 控制台可以查看实时日志
- 可以查看服务的响应时间、错误率等指标
- 可以设置邮件告警

## 成本估算

### 免费套餐
- ✅ 2 个 Web 服务
- ✅ 每月 750 小时运行时间
- ✅ 100GB 带宽/月
- ✅ 免费 SSL 证书

### 付费套餐（如果需要）
- Starter: $7/月/服务
- Pro: $20/月/服务
- PostgreSQL: $7/月起

## 故障排除

### 部署失败
1. 检查 Build Logs 中的错误信息
2. 确保 package.json 中的脚本正确
3. 检查依赖是否完整

### 前端无法连接后端
1. 确认 `VITE_API_URL` 环境变量正确
2. 检查后端服务是否正常运行
3. 查看浏览器控制台的网络请求

### 图书识别不工作
1. 确认 `VOLCENGINE_API_KEY` 已配置
2. 检查 API Key 是否有效
3. 查看后端日志中的错误信息

## 备份和恢复

### 数据库备份
由于 SQLite 在 Render 上不持久化，建议：
1. 定期通过 API 导出数据
2. 本地保存备份
3. 需要时通过 API 重新导入

### 图片备份
1. 定期下载 `backend/uploads` 目录
2. 使用云存储（如 AWS S3、阿里云 OSS）替代本地存储

## 下一步

部署完成后，你可以：
1. 访问前端地址测试功能
2. 使用 ISBN 扫码添加图书
3. 测试分享选书功能
4. 根据需要调整代码和配置

---

**需要帮助？**
- Render 文档：https://render.com/docs
- 项目 Issues：在 GitHub 提交问题
