# 🚀 快速启用 Mock 支付模式

如果你遇到 Creem API 403 错误，可以使用 Mock 模式来测试支付流程的界面和逻辑。

## 步骤 1：编辑 .env.local 文件

打开或创建 `.env.local` 文件，添加以下内容：

```bash
# ==========================================
# Mock 支付模式配置（快速测试用）
# ==========================================

# 启用 Mock 模式（跳过真实的 Creem API 调用）
ENABLE_PAYMENT_MOCK=true

# 应用基础 URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ==========================================
# 以下是 Creem 真实配置（Mock 模式下不需要）
# 当你准备好使用真实支付时，请填写这些值并关闭 Mock 模式
# ==========================================

# Creem API Key（从 https://creem.io/dashboard/api-keys 获取）
# CREEM_API_KEY=creem_test_your_actual_key_here

# Creem Product IDs（从 Creem Dashboard -> Products 获取）
# CREEM_PRODUCT_BASIC_MONTHLY=prod_xxx
# CREEM_PRODUCT_BASIC_YEARLY=prod_xxx
# CREEM_PRODUCT_PRO_MONTHLY=prod_xxx
# CREEM_PRODUCT_PRO_YEARLY=prod_xxx
# CREEM_PRODUCT_MAX_MONTHLY=prod_xxx
# CREEM_PRODUCT_MAX_YEARLY=prod_xxx
```

## 步骤 2：重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
# 或
bun run dev
```

## 步骤 3：测试

1. 访问 http://localhost:3000/pricing
2. 点击任意套餐的 "Sign In to Get Started" 按钮
3. 应该会直接跳转到成功页面（不会调用 Creem API）

## 🔍 验证 Mock 模式是否启用

查看服务器控制台，应该看到：
```
⚠️  Mock 模式已启用 - 跳过真实的 Creem API 调用
模拟支付: planId=xxx, billingPeriod=xxx
```

---

## 📌 切换到真实支付模式

当你准备好使用真实的 Creem 支付时：

### 1. 在 Creem Dashboard 创建产品

访问 https://creem.io/dashboard/products

创建以下 6 个产品：

| 产品名称 | 价格 | 类型 |
|---------|------|------|
| Basic Monthly | $12.00 | 订阅/月付 |
| Basic Yearly | $144.00 | 订阅/年付 |
| Pro Monthly | $19.50 | 订阅/月付 |
| Pro Yearly | $234.00 | 订阅/年付 |
| Max Monthly | $80.00 | 订阅/月付 |
| Max Yearly | $960.00 | 订阅/年付 |

### 2. 更新 .env.local

```bash
# 关闭 Mock 模式
ENABLE_PAYMENT_MOCK=false

# 填写真实的 API Key
CREEM_API_KEY=creem_test_your_actual_key_here

# 填写真实的 Product IDs
CREEM_PRODUCT_BASIC_MONTHLY=prod_actual_id_1
CREEM_PRODUCT_BASIC_YEARLY=prod_actual_id_2
CREEM_PRODUCT_PRO_MONTHLY=prod_actual_id_3
CREEM_PRODUCT_PRO_YEARLY=prod_actual_id_4
CREEM_PRODUCT_MAX_MONTHLY=prod_actual_id_5
CREEM_PRODUCT_MAX_YEARLY=prod_actual_id_6
```

### 3. 重启服务器

```bash
npm run dev
```

---

## 🆘 常见问题

### Q: Mock 模式下支付会真的扣费吗？
**A:** 不会！Mock 模式完全跳过 Creem API，只是模拟支付流程。

### Q: 如何确认 Mock 模式已启用？
**A:** 查看服务器控制台日志，应该看到 "⚠️ Mock 模式已启用" 的消息。

### Q: Mock 模式和真实模式有什么区别？
**A:**
- **Mock 模式**：不调用 Creem API，直接跳转到成功页面
- **真实模式**：调用 Creem API，创建真实的支付会话

### Q: 为什么我还是看到 403 错误？
**A:** 请确保：
1. `.env.local` 文件中 `ENABLE_PAYMENT_MOCK=true` 已设置
2. 已重启开发服务器
3. 清除浏览器缓存

---

## ✅ 验证配置

运行以下命令验证配置：

```bash
# 方法 1：访问配置检查端点
curl http://localhost:3000/api/checkout/test-config

# 方法 2：在浏览器中访问
# http://localhost:3000/api/checkout/test-config
```

如果返回 `"apiKeyValid": true`，说明 API Key 配置正确。
