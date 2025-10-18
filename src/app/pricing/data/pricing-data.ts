export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyOriginalPrice?: number;
  credits: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  popular?: boolean;
  isFree?: boolean;
  productId?: string; // Creem product ID
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "体验我们的服务",
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      "首次图片生成免费",
      "体验完整功能",
      "基础图片生成",
      "标准生成速度",
      "社区支持",
      "JPG/PNG 格式下载",
      "无需信用卡",
    ],
    isFree: true,
  },
  {
    id: "basic",
    name: "Basic",
    description: "适合个人和轻度用户",
    monthlyPrice: 12.0,
    yearlyPrice: 72.0,
    yearlyOriginalPrice: 144.0,
    credits: {
      monthly: 100,
      yearly: 1200,
    },
    features: [
      "每月 100 个 credits",
      "50 张高质量图片/月",
      "所有风格模板",
      "标准生成速度",
      "基础客服支持",
      "JPG/PNG 格式下载",
      "商业使用许可",
    ],
  },
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
      "所有风格模板",
      "优先生成队列",
      "优先客服支持",
      "JPG/PNG/WebP 格式下载",
      "批量生成功能",
      "图片编辑工具（10月上线）",
      "商业使用许可",
    ],
    popular: true,
  },
  {
    id: "max",
    name: "Max",
    description: "为大型企业和专业工作室设计",
    monthlyPrice: 80.0,
    yearlyPrice: 480.0,
    yearlyOriginalPrice: 960.0,
    credits: {
      monthly: 1000,
      yearly: 12000,
    },
    features: [
      "每月 1000 个 credits",
      "500 张高质量图片/月",
      "所有风格模板",
      "最快生成速度",
      "专属客户经理",
      "所有格式下载",
      "批量生成功能",
      "专业编辑套件（10月上线）",
      "API 访问权限",
      "商业使用许可",
    ],
  },
];

export const faqs = [
  {
    question: "什么是 Credits？如何使用？",
    answer:
      "Credits 是我们的虚拟货币单位。每次生成图片消耗 1 credit。订阅用户每月自动获得 credits 配额，且首次生成永久免费。",
  },
  {
    question: "我可以随时更改套餐吗？",
    answer:
      "可以！您可以随时升级或降级套餐。升级立即生效，降级将在下个计费周期生效。未使用的 credits 会根据套餐政策处理。",
  },
  {
    question: "未使用的 Credits 会累积吗？",
    answer:
      "订阅套餐的 credits 最多可累积 3 个月。超过 3 个月未使用的 credits 将过期。建议根据实际使用量选择合适的套餐。",
  },
  {
    question: "首次免费生成是什么？",
    answer:
      "每个新注册用户的第一次图片生成完全免费，不消耗任何 credits。这让您可以先体验我们的服务质量再决定是否订阅。",
  },
  {
    question: "支持哪些支付方式？",
    answer:
      "我们支持信用卡、借记卡、支付宝、微信支付等多种支付方式。所有支付均通过安全的第三方支付平台处理。",
  },
  {
    question: "免费套餐有什么限制？",
    answer:
      "免费套餐每月提供 10 个 credits（约 10 张图片），适合偶尔使用。功能上与付费套餐相同，但生成速度为标准队列，且无法使用高级编辑功能。",
  },
];
