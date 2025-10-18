# Pricing 页面和 Creem 支付集成文档

## 概述

本项目实现了完整的 Pricing 页面和 Creem 支付集成,参考了 nanobanana.ai 的设计。

## 文件结构

```
src/
├── app/
│   ├── pricing/
│   │   ├── page.tsx                          # Pricing 页面路由
│   │   ├── success/
│   │   │   └── page.tsx                      # 支付成功页面
│   │   ├── components/
│   │   │   ├── PricingPage.tsx              # 主要定价页面组件
│   │   │   └── PricingCard.tsx              # 价格卡片组件
│   │   └── data/
│   │       └── pricing-data.ts               # 定价数据配置
│   └── api/
│       ├── checkout/
│       │   ├── create/
│       │   │   └── route.ts                  # 创建支付会话 API
│       │   └── verify/
│       │       └── route.ts                  # 验证支付结果 API
│       └── webhooks/
│           └── creem/
│               └── route.ts                  # Creem Webhook 处理器
```

## 功能特性

### 1. 定价页面
- ✅ 三种套餐:Basic、Pro、Max
- ✅ 月付/年付切换
- ✅ 年付显示折扣(50% 优惠)
- ✅ 响应式设计
- ✅ FAQ 手风琴组件

### 2. Creem 支付集成
- ✅ 创建支付会话
- ✅ 支付成功回调处理
- ✅ 支付签名验证
- ✅ Webhook 事件处理

### 3. 支持的 Webhook 事件
- `checkout.completed` - 支付完成
- `subscription.created` - 订阅创建
- `subscription.updated` - 订阅更新
- `subscription.cancelled` - 订阅取消
- `payment.succeeded` - 支付成功
- `payment.failed` - 支付失败

## 配置步骤

### 1. 获取 Creem API Key

1. 访问 [Creem Dashboard](https://creem.io/dashboard)
2. 创建账号或登录
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 API Key 到 `.env.local` 文件

### 2. 在 Creem 创建产品

你需要为每个套餐和计费周期创建对应的产品:

1. 访问 [Products 页面](https://creem.io/dashboard/products)
2. 创建以下产品:
   - **Basic Monthly**: $12.00/月
   - **Basic Yearly**: $144.00/年
   - **Pro Monthly**: $19.50/月
   - **Pro Yearly**: $234.00/年
   - **Max Monthly**: $80.00/月
   - **Max Yearly**: $960.00/年

3. 复制每个产品的 Product ID
4. 将 Product ID 添加到 `.env.local` 文件

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写:

```bash
# Creem 配置
CREEM_API_KEY=creem_xxxxxxxxxxxx

# Basic 套餐产品 ID
CREEM_PRODUCT_BASIC_MONTHLY=prod_xxxxxxxxxxxx
CREEM_PRODUCT_BASIC_YEARLY=prod_xxxxxxxxxxxx

# Pro 套餐产品 ID
CREEM_PRODUCT_PRO_MONTHLY=prod_xxxxxxxxxxxx
CREEM_PRODUCT_PRO_YEARLY=prod_xxxxxxxxxxxx

# Max 套餐产品 ID
CREEM_PRODUCT_MAX_MONTHLY=prod_xxxxxxxxxxxx
CREEM_PRODUCT_MAX_YEARLY=prod_xxxxxxxxxxxx

# 应用 URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. 配置 Webhook

1. 访问 [Creem Webhooks 页面](https://creem.io/dashboard/webhooks)
2. 创建新的 Webhook
3. Webhook URL: `https://yourdomain.com/api/webhooks/creem`
4. 选择需要接收的事件类型
5. 保存配置

**本地开发测试 Webhook:**
可以使用 [ngrok](https://ngrok.com/) 或 [localtunnel](https://localtunnel.github.io/www/) 暴露本地服务器:

```bash
# 使用 ngrok
ngrok http 3000

# 使用生成的 URL 配置 Webhook
# 例如: https://abc123.ngrok.io/api/webhooks/creem
```

## 使用说明

### 访问 Pricing 页面

```
http://localhost:3000/pricing
```

### 支付流程

1. 用户选择套餐和计费周期
2. 点击 "Sign In to Get Started" 按钮
3. 调用 `/api/checkout/create` API 创建支付会话
4. 重定向到 Creem 支付页面
5. 用户完成支付
6. Creem 重定向到 `/pricing/success?checkout_id=xxx&...`
7. 前端调用 `/api/checkout/verify` 验证支付
8. 显示支付成功信息

### API 端点

#### POST /api/checkout/create
创建 Creem 支付会话

**请求体:**
```json
{
  "planId": "pro",
  "billingPeriod": "yearly"
}
```

**响应:**
```json
{
  "checkoutUrl": "https://checkout.creem.io/...",
  "sessionId": "ch_xxxxxxxxxxxx"
}
```

#### POST /api/checkout/verify
验证支付结果

**请求体:**
```json
{
  "checkoutId": "ch_xxxxxxxxxxxx",
  "orderId": "ord_xxxxxxxxxxxx",
  "customerId": "cust_xxxxxxxxxxxx",
  "subscriptionId": "sub_xxxxxxxxxxxx",
  "productId": "prod_xxxxxxxxxxxx",
  "signature": "..."
}
```

#### POST /api/webhooks/creem
接收 Creem Webhook 事件

**请求头:**
```
x-creem-signature: <签名>
```

**请求体:**
```json
{
  "type": "payment.succeeded",
  "data": { ... }
}
```

## 安全性

### 签名验证

所有从 Creem 返回的数据都经过 HMAC-SHA256 签名验证:

```typescript
const expectedSignature = crypto
  .createHmac("sha256", apiKey)
  .update(signatureString)
  .digest("hex");
```

### 环境变量安全

- ✅ 所有敏感密钥都存储在服务器端环境变量中
- ✅ 不在客户端暴露 API Key
- ✅ 使用 `NEXT_PUBLIC_` 前缀仅暴露必要的公开变量

## 下一步开发

目前实现了基本的支付流程,以下功能需要进一步开发:

### 必须实现
- [ ] 集成数据库存储订单和订阅信息
- [ ] 实现用户认证系统
- [ ] 添加用户积分/额度管理
- [ ] 实现订阅管理功能(升级/降级/取消)

### 建议实现
- [ ] 添加支付失败页面
- [ ] 实现发票生成
- [ ] 添加订阅到期提醒
- [ ] 实现退款流程
- [ ] 添加使用量统计

## 测试

### 本地测试

```bash
# 启动开发服务器
npm run dev

# 访问 Pricing 页面
open http://localhost:3000/pricing
```

### 测试模式

Creem 支持测试模式,可以使用测试 API Key 进行测试而不产生实际费用:

1. 在 Creem Dashboard 切换到测试模式
2. 使用测试模式的 API Key
3. 使用测试模式的 Product ID
4. 测试支付不会产生实际扣费

## 故障排除

### 常见问题

**Q: 支付会话创建失败?**
A: 检查 CREEM_API_KEY 和 Product ID 是否正确配置

**Q: 签名验证失败?**
A: 确保使用正确的 API Key,检查签名计算逻辑

**Q: Webhook 未收到事件?**
A: 检查 Webhook URL 是否可访问,确认已在 Creem Dashboard 配置

**Q: 本地开发如何测试 Webhook?**
A: 使用 ngrok 暴露本地服务器

## 参考资源

- [Creem 官方文档](https://docs.creem.io/introduction)
- [Creem API 参考](https://docs.creem.io/api-reference/introduction)
- [Creem 快速开始](https://docs.creem.io/quickstart)
- [Creem 标准集成](https://docs.creem.io/checkout-flow)

## 技术支持

如有问题,可以:
- 查看 Creem 官方文档
- 联系 Creem 支持团队
- 在项目 Issue 中提问
