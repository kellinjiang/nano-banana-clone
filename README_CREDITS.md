# Credits 系统完整实现方案

## 📋 系统概述

这是一个基于 **订阅 + 充值包** 的灵活支付系统,适用于图片生成 SaaS 应用。

### 核心特性

- ✅ **订阅套餐**: Free/Basic/Pro/Max 四档,月付/年付
- ✅ **充值包**: Mini/Plus/Mega 三种规格,永久有效
- ✅ **首次免费**: 每个用户首次生成图片免费
- ✅ **Credits 管理**: 智能扣费优先级(订阅 → 充值 → 赠送)
- ✅ **Mock 模式**: 开发测试无需真实支付

---

## 🏗️ 技术架构

```
┌──────────────────────────────────────────────────────────┐
│                      前端 (Next.js)                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Pricing Page (订阅 + 充值包)                             │
│       ↓                                                   │
│  Dashboard (余额展示 + 使用记录)                           │
│       ↓                                                   │
│  Image Generation (扣费逻辑)                              │
│                                                           │
├──────────────────────────────────────────────────────────┤
│                      API层 (Next.js API Routes)          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  /api/credits/balance    - 查询余额                       │
│  /api/credits/deduct     - 扣费                           │
│  /api/credits/history    - 使用记录                       │
│  /api/checkout/create    - 创建支付                       │
│  /api/checkout/verify    - 验证支付                       │
│  /api/webhooks/creem     - 接收 Webhook                   │
│                                                           │
├──────────────────────────────────────────────────────────┤
│                      数据库 (Supabase)                    │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  user_credits           - Credits 账户                    │
│  user_subscriptions     - 订阅信息                        │
│  transactions           - 交易记录                        │
│  usage_logs             - 使用记录                        │
│  credit_pack_configs    - 充值包配置                      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 💰 定价策略

### 订阅套餐

| 套餐 | 月付 | 年付 | Credits/月 | 单价 | 特性 |
|------|------|------|-----------|------|------|
| **Free** | 免费 | - | 10 | - | 基础功能 |
| **Basic** | $12 | $72 | 100 | $0.12 | 标准分辨率 |
| **Pro** | $19.5 | $117 | 300 | $0.065 | 高清 + 优先队列 |
| **Max** | $80 | $480 | 1000 | $0.08 | 超高清 + API |

> 年付享受 50% 折扣

### 充值包 (永久有效)

| 名称 | Credits | 价格 | 单价 | 说明 |
|------|---------|------|------|------|
| **Mini** | 50 | $5 | $0.10 | 偶尔使用 |
| **Plus** | 150 | $12 | $0.08 | ⭐ 最划算 |
| **Mega** | 500 | $35 | $0.07 | 大量使用 |

### 图片生成成本

- **单次生成**: 消耗 1 credit
- **首次免费**: 每个用户第一次生成不消耗 credits
- **高清生成**: 消耗 2 credits (可选)
- **批量生成**: 按张数计费

---

## 📁 文件结构

```
├── supabase/
│   └── migrations/
│       └── 001_credits_system.sql          # 数据库 Schema
│
├── src/
│   ├── app/
│   │   ├── pricing/
│   │   │   ├── page.tsx                    # 主定价页
│   │   │   ├── components/
│   │   │   │   ├── PricingPage.tsx         # 订阅套餐
│   │   │   │   ├── CreditPacksTab.tsx      # 充值包 Tab
│   │   │   │   └── PricingCard.tsx         # 价格卡片
│   │   │   └── data/
│   │   │       └── pricing-data.ts         # 定价数据
│   │   │
│   │   ├── dashboard/
│   │   │   └── credits/
│   │   │       └── page.tsx                # Credits 仪表盘
│   │   │
│   │   └── api/
│   │       ├── credits/
│   │       │   ├── balance/route.ts        # 查询余额
│   │       │   ├── deduct/route.ts         # 扣费
│   │       │   └── history/route.ts        # 使用记录
│   │       │
│   │       ├── checkout/
│   │       │   ├── create/route.ts         # 创建支付
│   │       │   └── verify/route.ts         # 验证支付
│   │       │
│   │       └── webhooks/
│   │           └── creem/route.ts          # Creem Webhook
│   │
│   ├── lib/
│   │   ├── credits/
│   │   │   ├── manager.ts                  # Credits 管理器
│   │   │   ├── deduction.ts                # 扣费逻辑
│   │   │   └── types.ts                    # 类型定义
│   │   │
│   │   └── supabase/
│   │       ├── client.ts                   # Supabase 客户端
│   │       └── server.ts                   # Supabase 服务端
│   │
│   └── types/
│       └── credits.ts                      # Credits 类型定义
│
├── .env.local                              # 环境变量
└── README_CREDITS.md                       # 本文档
```

---

## 🔧 关键实现

### 1. Credits 扣费优先级

```typescript
/**
 * 扣费优先级:
 * 1. 订阅 Credits (subscription_credits)
 * 2. 充值 Credits (purchased_credits)
 * 3. 赠送 Credits (bonus_credits)
 */
async function deductCredits(userId: string, amount: number) {
  // 1. 检查是否首次免费
  const account = await getUserCredits(userId);
  if (!account.has_used_free_generation) {
    await markFreeGenerationUsed(userId);
    return { success: true, source: 'free' };
  }

  // 2. 检查总余额
  if (account.total_credits_available < amount) {
    throw new Error("余额不足");
  }

  // 3. 按优先级扣费
  let remaining = amount;

  // 优先扣订阅 credits
  if (account.subscription_credits > account.subscription_credits_used) {
    const available = account.subscription_credits - account.subscription_credits_used;
    const toDeduct = Math.min(available, remaining);
    await deductFromSubscription(userId, toDeduct);
    remaining -= toDeduct;
  }

  // 其次扣充值 credits
  if (remaining > 0) {
    const available = account.purchased_credits - account.purchased_credits_used;
    const toDeduct = Math.min(available, remaining);
    await deductFromPurchased(userId, toDeduct);
    remaining -= toDeduct;
  }

  // 最后扣赠送 credits
  if (remaining > 0) {
    const available = account.bonus_credits - account.bonus_credits_used;
    const toDeduct = Math.min(available, remaining);
    await deductFromBonus(userId, toDeduct);
  }

  return { success: true };
}
```

### 2. 订阅 Credits 重置

```sql
-- 每月自动执行 (通过 Cron Job 或 Supabase Edge Function)
SELECT reset_subscription_credits(user_id)
FROM user_subscriptions
WHERE status = 'active'
  AND current_period_end <= NOW();
```

### 3. Webhook 处理 (Creem)

```typescript
// /api/webhooks/creem/route.ts
export async function POST(request: Request) {
  const signature = request.headers.get("x-creem-signature");
  const body = await request.text();

  // 验证签名
  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  switch (event.type) {
    case "checkout.completed":
      await handleCheckoutCompleted(event.data);
      break;

    case "subscription.created":
      await handleSubscriptionCreated(event.data);
      break;

    case "subscription.updated":
      await handleSubscriptionUpdated(event.data);
      break;

    // ... 其他事件
  }

  return NextResponse.json({ received: true });
}
```

---

## 📊 数据库操作示例

### 查询用户余额

```sql
SELECT
  subscription_credits - subscription_credits_used AS subscription_available,
  purchased_credits - purchased_credits_used AS purchased_available,
  bonus_credits - bonus_credits_used AS bonus_available,
  total_credits_available
FROM user_credits
WHERE user_id = $1;
```

### 扣除 Credits

```sql
-- 扣除订阅 credits
UPDATE user_credits
SET subscription_credits_used = subscription_credits_used + $2
WHERE user_id = $1
  AND (subscription_credits - subscription_credits_used) >= $2;

-- 记录使用日志
INSERT INTO usage_logs (user_id, credits_used, operation_type, deducted_from_subscription)
VALUES ($1, $2, 'image_generation', $2);
```

### 添加充值 Credits

```sql
-- 添加充值 credits
UPDATE user_credits
SET purchased_credits = purchased_credits + $2
WHERE user_id = $1;

-- 记录交易
INSERT INTO transactions (
  user_id,
  type,
  amount,
  credits,
  status,
  credit_pack_id
) VALUES (
  $1,
  'credit_pack',
  $3,
  $2,
  'completed',
  $4
);
```

---

## 🔐 安全考虑

1. **RLS (Row Level Security)**
   - 用户只能访问自己的 credits 和交易记录
   - API 操作需要服务端权限

2. **Webhook 签名验证**
   - 所有 Webhook 请求必须验证签名
   - 防止伪造支付回调

3. **并发控制**
   - 使用数据库事务防止重复扣费
   - 乐观锁防止并发冲突

4. **环境变量保护**
   - API Key 仅在服务端使用
   - 不暴露敏感配置到客户端

---

## 🚀 部署checklist

### 数据库设置

- [ ] 运行 `001_credits_system.sql` 迁移
- [ ] 验证 RLS 策略已启用
- [ ] 配置 Cron Job 用于订阅重置

### 环境变量

```bash
# Creem 配置
CREEM_API_KEY=creem_xxx
CREEM_WEBHOOK_SECRET=whsec_xxx
CREEM_PRODUCT_FREE=prod_xxx
CREEM_PRODUCT_BASIC_MONTHLY=prod_xxx
CREEM_PRODUCT_BASIC_YEARLY=prod_xxx
CREEM_PRODUCT_PRO_MONTHLY=prod_xxx
CREEM_PRODUCT_PRO_YEARLY=prod_xxx
CREEM_PRODUCT_MAX_MONTHLY=prod_xxx
CREEM_PRODUCT_MAX_YEARLY=prod_xxx

# Credit Packs
CREEM_PRODUCT_MINI_PACK=prod_xxx
CREEM_PRODUCT_PLUS_PACK=prod_xxx
CREEM_PRODUCT_MEGA_PACK=prod_xxx

# Mock 模式 (开发环境)
ENABLE_PAYMENT_MOCK=true
```

### Creem Dashboard 配置

1. 创建 11 个产品:
   - 4 个订阅套餐 × 2 (月付/年付) = 8 个
   - 3 个充值包 = 3 个

2. 配置 Webhook:
   - URL: `https://yourdomain.com/api/webhooks/creem`
   - 事件: `checkout.completed`, `subscription.*`, `payment.*`

3. 获取 API Key 和 Webhook Secret

---

## 📝 TODO List

### Phase 1: 核心功能 ✅
- [x] 数据库 Schema 设计
- [ ] Credits 管理 API
- [ ] 充值包购买流程
- [ ] 订阅管理流程
- [ ] 首次免费逻辑

### Phase 2: UI 实现
- [ ] 更新 Pricing 页面 (Tab 切换)
- [ ] Credits 仪表盘
- [ ] 使用记录页面
- [ ] 余额不足提示

### Phase 3: 高级功能
- [ ] 自动充值
- [ ] 套餐推荐算法
- [ ] 邮件通知 (余额低、订阅到期)
- [ ] 使用统计图表

---

## 📚 API 文档

### GET /api/credits/balance

查询用户 Credits 余额

**Response:**
```json
{
  "subscription": {
    "total": 100,
    "used": 30,
    "available": 70,
    "reset_at": "2025-11-18T00:00:00Z"
  },
  "purchased": {
    "total": 150,
    "used": 20,
    "available": 130
  },
  "bonus": {
    "total": 10,
    "used": 0,
    "available": 10
  },
  "total_available": 210,
  "has_free_generation": true
}
```

### POST /api/credits/deduct

扣除 Credits

**Request:**
```json
{
  "amount": 1,
  "operation_type": "image_generation",
  "metadata": {
    "prompt": "A beautiful sunset",
    "model": "flux-1.1-pro",
    "resolution": "1024x1024"
  }
}
```

**Response:**
```json
{
  "success": true,
  "remaining": 209,
  "deducted_from": "subscription",
  "free_generation_used": false
}
```

---

## 🆘 常见问题

### Q: 如何切换到真实支付?

A: 在 `.env.local` 中设置 `ENABLE_PAYMENT_MOCK=false` 并配置真实的 Creem credentials。

### Q: 订阅 Credits 如何重置?

A: 通过 Supabase Edge Function 或外部 Cron Job 定期调用 `reset_subscription_credits()`。

### Q: 如何处理退款?

A: 在 Webhook 中监听 `payment.refunded` 事件,扣除对应的 credits 并更新交易状态。

### Q: 充值包 Credits 会过期吗?

A: 不会,充值包 Credits 永久有效。

---

## 📖 相关文档

- [Creem API 文档](https://docs.creem.io)
- [Supabase RLS 文档](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

*创建于: 2025-10-18*
*版本: 1.0*
