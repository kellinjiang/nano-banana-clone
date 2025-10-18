# Credits 系统快速开始指南

## 🚀 立即开始测试

### 1. 启动开发服务器

```bash
npm run dev
# 或
bun run dev
```

访问 http://localhost:3000

---

## 🧪 测试流程

### 步骤 1: 注册/登录账户

1. 访问 http://localhost:3000
2. 点击登录按钮
3. 使用 GitHub 或 Google 登录

**重要**: 新注册的用户会自动：
- 创建 `user_credits` 记录（Free 套餐，10 credits）
- 创建 `user_subscriptions` 记录（status: active, tier: free）
- 获得首次免费生成机会

---

### 步骤 2: 查看定价页面

访问 http://localhost:3000/pricing

**应该看到 4 个套餐卡片：**
1. **Free** - 免费（显示"开始免费使用"按钮）
2. **Basic** - $12/月（显示"立即订阅"按钮）
3. **Pro** - $19.5/月（显示"最受欢迎"徽章）
4. **Max** - $80/月

**验证点：**
- ✅ 所有文案都是中文
- ✅ 月付/年付切换正常
- ✅ 年付显示"节省 50%"徽章
- ✅ Free 套餐按钮文案不同

---

### 步骤 3: 测试 Credits 余额查询

打开浏览器开发者工具 Console，输入：

```javascript
fetch('/api/credits/balance', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
```

**预期输出：**
```json
{
  "subscription": {
    "total": 10,
    "used": 0,
    "available": 10,
    "reset_at": "2025-11-18T00:00:00Z"
  },
  "purchased": {
    "total": 0,
    "used": 0,
    "available": 0
  },
  "bonus": {
    "total": 0,
    "used": 0,
    "available": 0
  },
  "total_available": 10,
  "has_free_generation": true
}
```

---

### 步骤 4: 测试首次免费生成

**前提**: 确保你有图片生成页面（通常在首页）

1. 上传一张图片
2. 输入 prompt（例如："Make it look like a cartoon"）
3. 点击生成

**预期结果（第一次）：**
- ✅ 图片生成成功
- ✅ 响应包含 `credits.was_free: true`
- ✅ 余额仍然是 10 credits（未扣费）

**验证 Console 输出：**
```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "credits": {
    "used": 1,
    "remaining": 10,
    "source": "free",
    "was_free": true
  }
}
```

---

### 步骤 5: 测试正常扣费

再次点击生成（第二次）

**预期结果：**
- ✅ 图片生成成功
- ✅ 扣除 1 credit
- ✅ 余额变为 9 credits

**验证 Console 输出：**
```json
{
  "success": true,
  "image": "...",
  "credits": {
    "used": 1,
    "remaining": 9,
    "source": "subscription",
    "was_free": false
  }
}
```

---

### 步骤 6: 查看使用记录

在浏览器 Console 输入：

```javascript
fetch('/api/credits/history?limit=10', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
```

**预期输出：**
```json
{
  "history": [
    {
      "id": "...",
      "user_id": "...",
      "credits_used": 1,
      "operation_type": "image_generation",
      "deducted_from_subscription": 1,
      "deducted_from_purchased": 0,
      "deducted_from_bonus": 0,
      "metadata": {
        "prompt": "Make it look like a cartoon",
        "model": "google/gemini-2.5-flash-image-preview"
      },
      "created_at": "2025-10-18T10:30:00Z"
    },
    {
      "id": "...",
      "credits_used": 1,
      "operation_type": "image_generation",
      "deducted_from_subscription": 0,
      "deducted_from_purchased": 0,
      "deducted_from_bonus": 0,
      "metadata": {...},
      "created_at": "2025-10-18T10:25:00Z"
    }
  ],
  "total": 2
}
```

注意第一条记录（首次免费）的扣费来源都是 0。

---

### 步骤 7: 测试余额不足

连续生成图片 11 次（1次免费 + 10次订阅），第 12 次应该失败。

**预期错误响应：**
```json
{
  "error": "Credits 余额不足",
  "remaining": 0,
  "needsTopUp": true
}
```
HTTP 状态码: 402

---

### 步骤 8: 使用 CreditsBalance 组件

创建测试页面 `src/app/test/page.tsx`:

```tsx
import { CreditsBalance } from "@/components/credits/CreditsBalance";

export default function TestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Credits 余额测试</h1>
      <CreditsBalance />
    </div>
  );
}
```

访问 http://localhost:3000/test

**应该看到：**
- ✅ 总余额显示
- ✅ "您还有一次免费生成机会！" 徽章（如果未使用）
- ✅ 订阅 Credits 详情（9 / 10，重置时间）
- ✅ 实时加载状态

---

## 📊 数据库验证

### 查看用户 Credits

在 Supabase SQL Editor 中执行：

```sql
SELECT * FROM user_credits WHERE user_id = 'YOUR_USER_ID';
```

**预期结果：**
```
subscription_credits: 10
subscription_credits_used: 2
purchased_credits: 0
purchased_credits_used: 0
bonus_credits: 0
bonus_credits_used: 0
total_credits_available: 8
has_used_free_generation: true
```

### 查看使用记录

```sql
SELECT
  id,
  credits_used,
  operation_type,
  deducted_from_subscription,
  deducted_from_purchased,
  deducted_from_bonus,
  created_at
FROM usage_logs
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

---

## 🔧 手动操作测试

### 手动添加 Credits

在 Supabase SQL Editor 执行：

```sql
-- 添加充值 Credits
UPDATE user_credits
SET purchased_credits = purchased_credits + 100
WHERE user_id = 'YOUR_USER_ID';
```

再次查询余额，应该看到 `purchased.total` 增加了 100。

### 手动重置订阅 Credits

```sql
SELECT reset_subscription_credits('YOUR_USER_ID');
```

验证：
- `subscription_credits_used` 应该重置为 0
- `subscription_reset_at` 应该更新为下个月

---

## ⚠️ 常见问题排查

### 问题 1: 401 Unauthorized

**原因**: 用户未登录

**解决**:
1. 确保已登录
2. 检查 Supabase Auth 配置
3. 确认 Cookie 正常传递

### 问题 2: 用户 Credits 账户不存在

**原因**: 触发器未生效或数据库未正确部署

**解决**:
```sql
-- 手动创建 Credits 账户
INSERT INTO user_credits (user_id, bonus_credits)
VALUES ('YOUR_USER_ID', 0)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_subscriptions (user_id, tier, status)
VALUES ('YOUR_USER_ID', 'free', 'active')
ON CONFLICT (user_id) DO NOTHING;
```

### 问题 3: 扣费优先级错误

**验证**: 检查 `deductCredits` 函数逻辑

**调试**:
```javascript
// 在 Console 中手动调用 deduct API
fetch('/api/credits/deduct', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    amount: 1,
    operation_type: 'image_generation',
    metadata: { test: true }
  })
})
  .then(r => r.json())
  .then(console.log)
```

### 问题 4: TypeScript 类型错误

**解决**:
```bash
npm run lint
```

检查是否有类型定义缺失。

---

## 🎯 下一步操作

### 选项 A: 测试 Mock 支付流程

1. 访问 http://localhost:3000/pricing
2. 点击任意付费套餐的"立即订阅"按钮
3. 应该跳转到 Success 页面（Mock 模式）
4. 但 **Credits 不会实际添加**（因为 Webhook 未实现）

### 选项 B: 实现 Webhook 处理

参考 `README_CREDITS.md` 中的 Webhook 示例代码，实现：
- `checkout.completed` - 充值完成
- `subscription.created` - 订阅创建
- `subscription.updated` - 订阅更新

### 选项 C: 部署订阅重置定时任务

使用 Supabase Edge Function 或外部 Cron Job：

```typescript
// 伪代码
cron.schedule('0 0 * * *', async () => {
  const { data: activeSubscriptions } = await supabase
    .from('user_subscriptions')
    .select('user_id, current_period_end')
    .eq('status', 'active')
    .lte('current_period_end', new Date().toISOString());

  for (const sub of activeSubscriptions) {
    await supabase.rpc('reset_subscription_credits', {
      p_user_id: sub.user_id
    });
  }
});
```

---

## 📝 测试检查清单

使用以下清单验证系统是否正常工作：

- [ ] 新用户注册后自动创建 Free 套餐（10 credits）
- [ ] 首次生成图片免费（不扣费）
- [ ] 第二次生成扣除 1 credit
- [ ] `/api/credits/balance` 返回正确余额
- [ ] `/api/credits/history` 显示使用记录
- [ ] 余额不足时返回 402 错误
- [ ] CreditsBalance 组件正确显示余额
- [ ] Pricing 页面显示 4 个套餐（含 Free）
- [ ] Free 套餐按钮显示"开始免费使用"
- [ ] 年付显示"节省 50%"徽章

---

**祝测试顺利！** 🎉

如有任何问题，请查看 `CREDITS_IMPLEMENTATION_COMPLETE.md` 获取完整文档。
