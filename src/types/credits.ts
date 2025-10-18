/**
 * Credits 系统类型定义
 */

/**
 * 用户 Credits 账户信息
 */
export interface UserCredits {
  /** 订阅 credits 总额 */
  subscription_credits: number;
  /** 订阅 credits 已使用 */
  subscription_credits_used: number;
  /** 充值 credits 总额 */
  purchased_credits: number;
  /** 充值 credits 已使用 */
  purchased_credits_used: number;
  /** 赠送 credits 总额 */
  bonus_credits: number;
  /** 赠送 credits 已使用 */
  bonus_credits_used: number;
  /** 总可用 credits */
  total_credits_available: number;
  /** 是否使用过首次免费生成 */
  has_used_free_generation: boolean;
  /** 订阅 credits 重置时间 */
  subscription_reset_at?: string;
}

/**
 * 扣除 Credits 参数
 */
export interface DeductCreditsParams {
  /** 用户 ID */
  userId: string;
  /** 扣除数量 */
  amount: number;
  /** 操作类型 */
  operationType: "image_generation" | "image_upscale" | "image_variation";
  /** 元数据（如 prompt、model、resolution 等） */
  metadata?: Record<string, unknown>;
}

/**
 * 扣除 Credits 结果
 */
export interface DeductCreditsResult {
  /** 是否成功 */
  success: boolean;
  /** 剩余 credits */
  remaining: number;
  /** 扣费来源 */
  source: "free" | "subscription" | "purchased" | "bonus";
  /** 是否使用了首次免费 */
  free_generation_used?: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * Credits 余额响应
 */
export interface CreditsBalanceResponse {
  /** 订阅 credits 信息 */
  subscription: {
    total: number;
    used: number;
    available: number;
    reset_at?: string;
  };
  /** 充值 credits 信息 */
  purchased: {
    total: number;
    used: number;
    available: number;
  };
  /** 赠送 credits 信息 */
  bonus: {
    total: number;
    used: number;
    available: number;
  };
  /** 总可用 credits */
  total_available: number;
  /** 是否还有首次免费机会 */
  has_free_generation: boolean;
}

/**
 * Credits 使用记录
 */
export interface UsageLog {
  id: string;
  user_id: string;
  credits_used: number;
  operation_type: "image_generation" | "image_upscale" | "image_variation";
  deducted_from_subscription: number;
  deducted_from_purchased: number;
  deducted_from_bonus: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

/**
 * 用户订阅信息
 */
export interface UserSubscription {
  id: string;
  user_id: string;
  tier: "free" | "basic" | "pro" | "max";
  billing_period?: "monthly" | "yearly";
  status: "active" | "canceled" | "expired" | "past_due";
  started_at: string;
  current_period_start?: string;
  current_period_end?: string;
  canceled_at?: string;
  provider?: "creem" | "stripe" | "manual";
  provider_subscription_id?: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 交易记录
 */
export interface Transaction {
  id: string;
  user_id: string;
  type:
    | "subscription_monthly"
    | "subscription_yearly"
    | "credit_pack"
    | "pay_as_you_go"
    | "refund"
    | "bonus";
  amount: number;
  currency: string;
  credits: number;
  status: "pending" | "completed" | "failed" | "refunded" | "canceled";
  provider?: "creem" | "stripe" | "paypal" | "manual";
  provider_transaction_id?: string;
  provider_customer_id?: string;
  subscription_id?: string;
  credit_pack_id?: string;
  metadata?: Record<string, unknown>;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Credit Pack 配置
 */
export interface CreditPackConfig {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  popular: boolean;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
