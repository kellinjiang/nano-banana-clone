-- =====================================================
-- Credits 系统数据库 Schema
-- =====================================================

-- 1. 用户 Credits 账户表
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 订阅 credits (每月重置)
  subscription_credits INTEGER DEFAULT 0 CHECK (subscription_credits >= 0),
  subscription_credits_used INTEGER DEFAULT 0 CHECK (subscription_credits_used >= 0),
  subscription_reset_at TIMESTAMPTZ,

  -- 充值 credits (永久有效)
  purchased_credits INTEGER DEFAULT 0 CHECK (purchased_credits >= 0),
  purchased_credits_used INTEGER DEFAULT 0 CHECK (purchased_credits_used >= 0),

  -- 赠送 credits (活动赠送、首次注册等)
  bonus_credits INTEGER DEFAULT 0 CHECK (bonus_credits >= 0),
  bonus_credits_used INTEGER DEFAULT 0 CHECK (bonus_credits_used >= 0),

  -- 总余额 (计算字段)
  total_credits_available INTEGER GENERATED ALWAYS AS (
    (subscription_credits - subscription_credits_used) +
    (purchased_credits - purchased_credits_used) +
    (bonus_credits - bonus_credits_used)
  ) STORED,

  -- 是否使用过首次免费生成
  has_used_free_generation BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- 2. 用户订阅表
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 订阅信息
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'basic', 'pro', 'max')),
  billing_period VARCHAR(10) CHECK (billing_period IN ('monthly', 'yearly')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'past_due')),

  -- 时间信息
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- 支付信息
  provider VARCHAR(20) CHECK (provider IN ('creem', 'stripe', 'manual')),
  provider_subscription_id VARCHAR(255),

  -- 自动续费
  auto_renew BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- 3. 交易记录表
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 交易类型
  type VARCHAR(30) NOT NULL CHECK (type IN (
    'subscription_monthly',
    'subscription_yearly',
    'credit_pack',
    'pay_as_you_go',
    'refund',
    'bonus'
  )),

  -- 金额信息
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  credits INTEGER NOT NULL DEFAULT 0,

  -- 状态
  status VARCHAR(20) NOT NULL CHECK (status IN (
    'pending',
    'completed',
    'failed',
    'refunded',
    'canceled'
  )),

  -- 支付提供商信息
  provider VARCHAR(20) CHECK (provider IN ('creem', 'stripe', 'paypal', 'manual')),
  provider_transaction_id VARCHAR(255),
  provider_customer_id VARCHAR(255),

  -- 关联信息
  subscription_id UUID REFERENCES user_subscriptions(id),
  credit_pack_id VARCHAR(50),  -- mini, plus, mega

  -- 元数据
  metadata JSONB DEFAULT '{}'::jsonb,

  -- 时间戳
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Credits 使用记录表
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 使用信息
  credits_used INTEGER NOT NULL CHECK (credits_used > 0),
  operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN (
    'image_generation',
    'image_upscale',
    'image_variation',
    'free_generation'
  )),

  -- 扣费来源 (按优先级)
  deducted_from_subscription INTEGER DEFAULT 0,
  deducted_from_purchased INTEGER DEFAULT 0,
  deducted_from_bonus INTEGER DEFAULT 0,

  -- 操作详情
  metadata JSONB DEFAULT '{}'::jsonb,  -- prompt, model, resolution, etc.

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Credit Packs 配置表 (可选，也可以硬编码在代码中)
CREATE TABLE IF NOT EXISTS credit_pack_configs (
  id VARCHAR(50) PRIMARY KEY,  -- mini, plus, mega
  name VARCHAR(100) NOT NULL,
  credits INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  popular BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 索引优化
-- =====================================================

-- user_credits 索引
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_user_credits_total_available ON user_credits(total_credits_available);

-- user_subscriptions 索引
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

-- transactions 索引
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_provider_id ON transactions(provider_transaction_id);

-- usage_logs 索引
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at DESC);
CREATE INDEX idx_usage_logs_operation_type ON usage_logs(operation_type);

-- =====================================================
-- 触发器 - 自动更新 updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (Row Level Security) 策略
-- =====================================================

-- 启用 RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- user_credits 策略
CREATE POLICY "用户只能查看自己的 credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "系统可以插入 credits 记录"
  ON user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的 credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- user_subscriptions 策略
CREATE POLICY "用户只能查看自己的订阅"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "系统可以插入订阅记录"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的订阅"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- transactions 策略
CREATE POLICY "用户只能查看自己的交易"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "系统可以插入交易记录"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- usage_logs 策略
CREATE POLICY "用户只能查看自己的使用记录"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "系统可以插入使用记录"
  ON usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 初始化 Credit Packs 配置
-- =====================================================

INSERT INTO credit_pack_configs (id, name, credits, price, popular, display_order) VALUES
  ('mini', 'Mini Pack', 50, 5.00, false, 1),
  ('plus', 'Plus Pack', 150, 12.00, true, 2),
  ('mega', 'Mega Pack', 500, 35.00, false, 3)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 辅助函数
-- =====================================================

-- 函数: 初始化新用户的 credits 账户
CREATE OR REPLACE FUNCTION initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, bonus_credits)
  VALUES (NEW.id, 0)  -- 新用户获得 0 bonus credits,首次生成免费
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO user_subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器: 用户注册时自动初始化 credits
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_credits();

-- 函数: 重置订阅 credits (每月执行)
CREATE OR REPLACE FUNCTION reset_subscription_credits(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_subscription RECORD;
  v_credits INTEGER;
BEGIN
  -- 获取用户订阅信息
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id AND status = 'active';

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- 根据套餐tier 确定 credits
  v_credits := CASE v_subscription.tier
    WHEN 'free' THEN 10
    WHEN 'basic' THEN 100
    WHEN 'pro' THEN 300
    WHEN 'max' THEN 1000
    ELSE 0
  END;

  -- 重置 credits
  UPDATE user_credits
  SET
    subscription_credits = v_credits,
    subscription_credits_used = 0,
    subscription_reset_at = NOW() + INTERVAL '1 month'
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
