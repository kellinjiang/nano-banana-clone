/**
 * Credits 管理器 - 核心业务逻辑
 */

import { createClient } from "@/lib/supabase/server";
import type {
  UserCredits,
  DeductCreditsParams,
  DeductCreditsResult,
  CreditsBalanceResponse,
  UsageLog,
} from "@/types/credits";

/**
 * 获取用户 Credits 余额
 */
export async function getUserCreditsBalance(
  userId: string
): Promise<CreditsBalanceResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_credits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("获取用户 Credits 失败:", error);
    throw new Error("无法获取 Credits 余额");
  }

  if (!data) {
    throw new Error("用户 Credits 账户不存在");
  }

  return {
    subscription: {
      total: data.subscription_credits,
      used: data.subscription_credits_used,
      available: data.subscription_credits - data.subscription_credits_used,
      reset_at: data.subscription_reset_at,
    },
    purchased: {
      total: data.purchased_credits,
      used: data.purchased_credits_used,
      available: data.purchased_credits - data.purchased_credits_used,
    },
    bonus: {
      total: data.bonus_credits,
      used: data.bonus_credits_used,
      available: data.bonus_credits - data.bonus_credits_used,
    },
    total_available: data.total_credits_available,
    has_free_generation: !data.has_used_free_generation,
  };
}

/**
 * 扣除 Credits
 * 优先级: 首次免费 > 订阅 Credits > 充值 Credits > 赠送 Credits
 */
export async function deductCredits(
  params: DeductCreditsParams
): Promise<DeductCreditsResult> {
  const { userId, amount, operationType, metadata } = params;
  const supabase = await createClient();

  // 1. 获取用户 Credits 账户
  const { data: credits, error: fetchError } = await supabase
    .from("user_credits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (fetchError || !credits) {
    return {
      success: false,
      remaining: 0,
      source: "subscription",
      error: "无法获取用户 Credits 账户",
    };
  }

  // 2. 检查是否首次免费
  if (!credits.has_used_free_generation) {
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({ has_used_free_generation: true })
      .eq("user_id", userId);

    if (updateError) {
      console.error("标记首次免费失败:", updateError);
    }

    // 记录使用日志
    await supabase.from("usage_logs").insert({
      user_id: userId,
      credits_used: amount,
      operation_type: operationType,
      deducted_from_subscription: 0,
      deducted_from_purchased: 0,
      deducted_from_bonus: 0,
      metadata: metadata || {},
    });

    return {
      success: true,
      remaining: credits.total_credits_available,
      source: "free",
      free_generation_used: true,
    };
  }

  // 3. 检查总余额是否足够
  if (credits.total_credits_available < amount) {
    return {
      success: false,
      remaining: credits.total_credits_available,
      source: "subscription",
      error: "Credits 余额不足",
    };
  }

  // 4. 按优先级扣费
  let remaining = amount;
  let deductedFromSubscription = 0;
  let deductedFromPurchased = 0;
  let deductedFromBonus = 0;
  let primarySource: "subscription" | "purchased" | "bonus" = "subscription";

  // 优先扣订阅 credits
  const subscriptionAvailable =
    credits.subscription_credits - credits.subscription_credits_used;
  if (subscriptionAvailable > 0 && remaining > 0) {
    const toDeduct = Math.min(subscriptionAvailable, remaining);
    deductedFromSubscription = toDeduct;
    remaining -= toDeduct;
  }

  // 其次扣充值 credits
  if (remaining > 0) {
    const purchasedAvailable =
      credits.purchased_credits - credits.purchased_credits_used;
    if (purchasedAvailable > 0) {
      const toDeduct = Math.min(purchasedAvailable, remaining);
      deductedFromPurchased = toDeduct;
      remaining -= toDeduct;
      if (deductedFromSubscription === 0) primarySource = "purchased";
    }
  }

  // 最后扣赠送 credits
  if (remaining > 0) {
    const bonusAvailable = credits.bonus_credits - credits.bonus_credits_used;
    if (bonusAvailable > 0) {
      const toDeduct = Math.min(bonusAvailable, remaining);
      deductedFromBonus = toDeduct;
      remaining -= toDeduct;
      if (deductedFromSubscription === 0 && deductedFromPurchased === 0)
        primarySource = "bonus";
    }
  }

  // 5. 更新数据库
  const { error: updateError } = await supabase
    .from("user_credits")
    .update({
      subscription_credits_used:
        credits.subscription_credits_used + deductedFromSubscription,
      purchased_credits_used:
        credits.purchased_credits_used + deductedFromPurchased,
      bonus_credits_used: credits.bonus_credits_used + deductedFromBonus,
    })
    .eq("user_id", userId);

  if (updateError) {
    console.error("扣除 Credits 失败:", updateError);
    return {
      success: false,
      remaining: credits.total_credits_available,
      source: primarySource,
      error: "扣除 Credits 时发生错误",
    };
  }

  // 6. 记录使用日志
  await supabase.from("usage_logs").insert({
    user_id: userId,
    credits_used: amount,
    operation_type: operationType,
    deducted_from_subscription: deductedFromSubscription,
    deducted_from_purchased: deductedFromPurchased,
    deducted_from_bonus: deductedFromBonus,
    metadata: metadata || {},
  });

  return {
    success: true,
    remaining: credits.total_credits_available - amount,
    source: primarySource,
    free_generation_used: false,
  };
}

/**
 * 获取用户使用记录
 */
export async function getUserUsageHistory(
  userId: string,
  limit = 50
): Promise<UsageLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("usage_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("获取使用记录失败:", error);
    throw new Error("无法获取使用记录");
  }

  return data || [];
}

/**
 * 添加 Credits (充值、订阅、赠送等)
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: "subscription" | "purchased" | "bonus"
): Promise<boolean> {
  const supabase = await createClient();

  const updateField =
    type === "subscription"
      ? "subscription_credits"
      : type === "purchased"
        ? "purchased_credits"
        : "bonus_credits";

  const { error } = await supabase.rpc("increment_credits", {
    p_user_id: userId,
    p_field: updateField,
    p_amount: amount,
  });

  if (error) {
    console.error(`添加 ${type} Credits 失败:`, error);
    return false;
  }

  return true;
}
