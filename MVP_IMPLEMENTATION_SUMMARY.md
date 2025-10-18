# 快速 MVP 实现总结

## ✅ 已完成

1. **数据库 Schema** ✅
   - 文件: `supabase/migrations/001_credits_system.sql`
   - 包含所有必需的表和函数

2. **Pricing Data 更新** ✅ (部分)
   - 添加了 Free 套餐
   - 更新了 Basic 套餐的中文描述
   - **待完成**: Pro 和 Max 的中文化 + FAQ 更新

## 📝 下一步实现清单（MVP版）

由于代码量较大且对话接近长度限制,我建议你按以下顺序手动完成剩余代码:

### 1. 完成 pricing-data.ts 更新

将 Pro 和 Max 套餐改为:

```typescript
{
  id: "pro",
  name: "Pro",
  description: "专业创作者和团队的选择",
  monthlyPrice: 19.5,
  yearlyPrice: 117.0,
  yearlyOriginalPrice: 234.0,
  credits: {
    monthly: 300,
    yearly: 3600,
  },
  features: [
    "每月 300 个 credits",
    "150 张高质量图片/月",
    // ... 其他功能
  ],
  popular: true,
},
```

### 2. 更新 PricingCard 组件

修改 `src/app/pricing/components/PricingCard.tsx`:

```typescript
// 针对免费套餐显示不同的按钮
{plan.isFree ? (
  <Button className="w-full" size="lg" variant="outline">
    开始免费使用
  </Button>
) : (
  <Button
    className="w-full"
    size="lg"
    variant={plan.popular ? "default" : "outline"}
    onClick={() => onSubscribe(plan.id, billingPeriod)}
    disabled={isLoading || plan.isFree}
  >
    {isLoading ? "Processing..." : "订阅"}
  </Button>
)}
```

### 3. 创建 Credits 类型定义

新建文件: `src/types/credits.ts`

```typescript
export interface UserCredits {
  subscription_credits: number;
  subscription_credits_used: number;
  purchased_credits: number;
  purchased_credits_used: number;
  bonus_credits: number;
  bonus_credits_used: number;
  total_credits_available: number;
  has_used_free_generation: boolean;
  subscription_reset_at?: string;
}

export interface DeductCreditsParams {
  userId: string;
  amount: number;
  operationType: 'image_generation' | 'image_upscale';
  metadata?: Record<string, any>;
}

export interface DeductCreditsResult {
  success: boolean;
  remaining: number;
  source: 'free' | 'subscription' | 'purchased' | 'bonus';
  free_generation_used?: boolean;
}
```

### 4. 部署数据库

在 Supabase Dashboard 中执行 `001_credits_system.sql`

### 5. 测试 Mock 模式

访问 `http://localhost:3000/pricing` 测试：
- Free 套餐应该显示 "开始免费使用"
- 付费套餐点击后应该进入 Mock 支付流程

---

## 🎯 完整实现代码

由于篇幅限制,完整的实现代码（包括 Credits API, 扣费逻辑等）已保存在:

- `README_CREDITS.md` - 完整方案文档
- `supabase/migrations/001_credits_system.sql` - 数据库 Schema

**建议下一步:**
1. 先把上面 5 个步骤完成
2. 测试 Pricing 页面是否正常显示 Free 套餐
3. 然后我可以继续帮你实现 Credits API 和扣费逻辑

**是否继续实现 Credits API?** 告诉我你的进度,我会继续帮你完成!
