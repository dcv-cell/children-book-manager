# 闲鱼对接功能使用指南

## 概述

儿童绘本二手书管理系统提供闲鱼半自动对接功能，帮助你快速发布图书到闲鱼平台。

## 功能特性

### 1. 一键生成闲鱼发布文案

自动生成包含完整信息的闲鱼发布文案，包括：
- 图书标题
- 作者信息
- 出版社
- 定价和售价
- 适合年龄
- 存放位置
- 品相说明

### 2. 图片拼图提示

自动整理图书封面和实物照片，提供拼图建议：
- 收集所有相关图片
- 建议闲鱼长图尺寸（750xN）
- 提供图片编辑工具建议

### 3. 闲鱼链接记录

- 记录闲鱼商品链接
- 同步库存状态
- 跟踪发布时间

### 4. 订单管理

- 手动录入订单信息
- 自动更新图书状态为"已售"
- 记录买家信息和订单金额

## API 接口

### 生成发布文案

```
POST /api/xianyu/generate-copy/:bookId
```

**响应示例：**
```json
{
  "success": true,
  "bookId": 1,
  "copy": "【出闲置】好饿的毛毛虫\n\n✍️ 作者：艾瑞·卡尔\n🏢 出版社：明天出版社\n💰 定价：39.8元\n🎯 售价：20元\n👶 适合年龄：3-6岁\n📍 存放位置：书架A-1\n\n📖 绘本状态：全新/品相好\n\n💡 说明：二手绘本，一经售出不退不换，介意慎拍。",
  "title": "好饿的毛毛虫",
  "price": 20
}
```

### 生成图片拼图信息

```
POST /api/xianyu/generate-collage/:bookId
```

**响应示例：**
```json
{
  "success": true,
  "bookId": 1,
  "images": [
    "https://covers.openlibrary.org/b/isbn/9787533258121-L.jpg",
    "/uploads/photo1.jpg",
    "/uploads/photo2.jpg"
  ],
  "message": "图片列表已生成，请使用图片编辑工具将图片拼成闲鱼长图（建议尺寸：750xN）",
  "suggestedSize": "750x任意高度"
}
```

### 保存闲鱼链接

```
POST /api/xianyu/save-link
Content-Type: application/json

{
  "bookId": 1,
  "xianyuUrl": "https://2.taobao.com/item.htm?id=123456789"
}
```

### 获取图书的闲鱼信息

```
GET /api/xianyu/book/:bookId
```

### 创建订单

```
POST /api/xianyu/orders
Content-Type: application/json

{
  "bookId": 1,
  "xianyuOrderId": "闲鱼订单号",
  "buyerName": "买家昵称",
  "totalAmount": 20,
  "notes": "备注信息"
}
```

### 获取订单列表

```
GET /api/xianyu/orders
```

## 使用流程

### 发布图书到闲鱼

1. **在系统中录入图书**
   - 扫描或输入ISBN
   - 补充图书信息和实物照片
   - 设置售价和存放位置

2. **生成发布文案**
   - 调用 `/api/xianyu/generate-copy/:bookId`
   - 复制生成的文案

3. **准备图片**
   - 调用 `/api/xianyu/generate-collage/:bookId`
   - 使用图片编辑工具（如PPT、Canva、Photoshop）拼成长图
   - 建议尺寸：宽度750px，高度根据图片数量调整

4. **在闲鱼发布**
   - 打开闲鱼APP或网页版
   - 粘贴文案，上传拼好的图片
   - 设置价格和运费
   - 发布商品

5. **记录闲鱼链接**
   - 复制闲鱼商品链接
   - 调用 `/api/xianyu/save-link` 保存链接

### 处理订单

1. **闲鱼卖出后**
   - 在系统中创建订单记录
   - 调用 `/api/xianyu/orders` 录入订单信息

2. **系统自动处理**
   - 图书状态自动更新为"已售"
   - 订单信息保存到数据库

## 图片拼图建议

### 推荐工具

- **PPT/Keynote**：简单易用，适合快速拼图
- **Canva**：在线设计工具，有很多模板
- **Photoshop**：专业修图，功能强大
- **手机APP**：美图秀秀、醒图等

### 拼图顺序建议

1. 图书封面
2. 图书正面（实物）
3. 图书封底（实物）
4. 内页展示（1-3张）
5. 版权页/ISBN页

### 图片要求

- 格式：JPG、PNG
- 大小：单张不超过5MB
- 总图片数：建议3-9张
- 清晰度：图片清晰，文字可辨认

## 注意事项

1. **文案优化**
   - 生成的文案可以根据实际情况修改
   - 可以添加更多图书细节或个人说明
   - 注意遵守闲鱼平台规则

2. **价格设置**
   - 建议参考市场价格
   - 可以设置合理的议价空间
   - 注意运费设置

3. **库存管理**
   - 发布后及时在系统中记录链接
   - 卖出后及时录入订单
   - 避免超卖

4. **图片版权**
   - 实物照片自己拍摄
   - 封面图使用官方图片或自己拍摄
   - 注意不要使用他人的图片

## 数据库表结构

### xianyu_items（闲鱼商品表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| book_id | INTEGER | 关联图书ID |
| xianyu_url | TEXT | 闲鱼商品链接 |
| xianyu_status | TEXT | 状态（draft/posted/sold） |
| posted_at | TEXT | 发布时间 |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

### orders（订单表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| book_id | INTEGER | 关联图书ID |
| xianyu_order_id | TEXT | 闲鱼订单号 |
| buyer_name | TEXT | 买家昵称 |
| total_amount | REAL | 订单金额 |
| status | TEXT | 订单状态 |
| notes | TEXT | 备注 |
| created_at | TEXT | 创建时间 |

## 后续优化方向

- [ ] 图片自动拼图功能
- [ ] 闲鱼API对接（需要官方接口权限）
- [ ] 订单自动同步
- [ ] 销量统计和分析
- [ ] 更多平台对接（转转、孔夫子等）
