# Creem 支付集成快速入门

## 🚀 5分钟快速开始

### 1. 安装依赖

项目已包含所有必要的依赖,无需额外安装。

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件
# 添加你的 Creem API Key 和产品 ID
```

### 3. 获取 Creem 凭据

#### 步骤 1: 注册 Creem 账号
访问 https://creem.io 注册账号

#### 步骤 2: 获取 API Key
1. 登录 Creem Dashboard
2. 进入 Settings -> API Keys
3. 创建新的 API Key
4. 复制密钥到 `.env.local`:
   ```
   CREEM_API_KEY=creem_xxxxxxxxxxxxx
   ```

#### 步骤 3: 创建产品
1. 进入 Products 页面
2. 为每个套餐创建产品(参考下表)
3. 复制 Product ID 到 `.env.local`

**需要创建的产品:**

| 套餐 | 计费周期 | 价格 | 环境变量 |
|------|---------|------|----------|
| Basic | 月付 | $12.00 | `CREEM_PRODUCT_BASIC_MONTHLY` |
| Basic | 年付 | $144.00 | `CREEM_PRODUCT_BASIC_YEARLY` |
| Pro | 月付 | $19.50 | `CREEM_PRODUCT_PRO_MONTHLY` |
| Pro | 年付 | $234.00 | `CREEM_PRODUCT_PRO_YEARLY` |
| Max | 月付 | $80.00 | `CREEM_PRODUCT_MAX_MONTHLY` |
| Max | 年付 | $960.00 | `CREEM_PRODUCT_MAX_YEARLY` |

#### 步骤 4: 配置 Webhook (重要!)
1. 进入 Creem Dashboard -> Webhooks 页面
2. 点击 "Create Webhook"
3. 填写 Webhook URL:
   - 本地测试: 使用 ngrok (见下方说明)
   - 生产环境: `https://yourdomain.com/api/webhooks/creem`
4. 选择要接收的事件类型:
   - ✅ checkout.completed
   - ✅ subscription.created
   - ✅ subscription.updated
   - ✅ subscription.cancelled
   - ✅ payment.succeeded
   - ✅ payment.failed
5. 保存后,复制 **Webhook Secret** 到 `.env.local`:
   ```
   CREEM_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

**本地开发 Webhook 测试:**
```bash
# 安装 ngrok
npm install -g ngrok

# 启动 ngrok (在另一个终端)
ngrok http 3000

# 使用生成的 URL 配置 Webhook
# 例如: https://abc123.ngrok.io/api/webhooks/creem
```

### 4. 启动开发服务器

```bash
npm run dev
# 或
bun run dev
```

访问 http://localhost:3000/pricing

### 5. 测试支付流程

1. 访问 Pricing 页面
2. 选择任意套餐
3. 点击订阅按钮
4. 会跳转到 Creem 支付页面
5. 使用测试卡号完成支付(测试模式)
6. 支付成功后会跳转回成功页面

## 📝 完整的 .env.local 配置示例

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-xxx...

# Creem 支付配置
CREEM_API_KEY=creem_xxxxxxxxxxxxx
CREEM_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Basic 套餐
CREEM_PRODUCT_BASIC_MONTHLY=prod_xxxxxxxxxxxxx
CREEM_PRODUCT_BASIC_YEARLY=prod_xxxxxxxxxxxxx

# Pro 套餐
CREEM_PRODUCT_PRO_MONTHLY=prod_xxxxxxxxxxxxx
CREEM_PRODUCT_PRO_YEARLY=prod_xxxxxxxxxxxxx

# Max 套餐
CREEM_PRODUCT_MAX_MONTHLY=prod_xxxxxxxxxxxxx
CREEM_PRODUCT_MAX_YEARLY=prod_xxxxxxxxxxxxx

# 应用 URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🔍 验证配置

运行以下命令验证环境变量是否正确配置:

```bash
# 检查环境变量
node -e "console.log('Creem API Key:', process.env.CREEM_API_KEY ? '✅ 已配置' : '❌ 未配置')"
```

## 🐛 常见问题

### Q: 支付按钮点击后没有反应?
**A:** 检查浏览器控制台错误,确认:
- API Key 已正确配置
- Product ID 已正确配置
- 开发服务器正在运行

### Q: 支付页面显示 "Payment service not configured"?
**A:** 检查 `.env.local` 文件中的 `CREEM_API_KEY` 是否已设置

### Q: 如何测试而不产生实际费用?
**A:** 在 Creem Dashboard 切换到测试模式,使用测试 API Key

### Q: Webhook 显示 "Webhook service not configured"?
**A:** 检查 `.env.local` 文件中的 `CREEM_WEBHOOK_SECRET` 是否已设置

### Q: Webhook 签名验证失败?
**A:** 确保:
- Webhook Secret 复制正确
- 使用的是 Webhook Secret 而不是 API Key
- Webhook URL 配置正确

## 📚 下一步

- 阅读完整文档: [PRICING_README.md](./PRICING_README.md)
- 配置 Webhook: [Creem Webhooks](https://creem.io/dashboard/webhooks)
- 集成数据库存储订单信息
- 实现用户认证和权限管理

## 🆘 需要帮助?

- 查看 [Creem 官方文档](https://docs.creem.io)
- 查看项目完整文档 [PRICING_README.md](./PRICING_README.md)
- 在 GitHub 创建 Issue
