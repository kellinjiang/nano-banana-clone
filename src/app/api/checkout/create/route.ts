import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, billingPeriod } = body;

    if (!planId || !billingPeriod) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Mock 模式 - 仅用于开发测试
    const enableMock = process.env.ENABLE_PAYMENT_MOCK === "true";
    if (enableMock) {
      console.log("⚠️  Mock 模式已启用 - 跳过真实的 Creem API 调用");
      console.log(`模拟支付: planId=${planId}, billingPeriod=${billingPeriod}`);

      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 返回模拟的支付 URL
      return NextResponse.json({
        checkoutUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing/success?mock=true&plan=${planId}&period=${billingPeriod}`,
        sessionId: `mock_session_${Date.now()}`,
        isMock: true,
      });
    }

    // 获取 Creem API Key
    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    // 获取产品 ID (在实际应用中,你需要在 pricing-data.ts 中配置每个套餐对应的 Creem Product ID)
    const productId = getProductId(planId, billingPeriod);
    if (!productId) {
      return NextResponse.json(
        { error: "Invalid plan configuration" },
        { status: 400 }
      );
    }

    // 创建 Creem 支付会话
    const checkoutResponse = await fetch("https://api.creem.io/v1/checkouts", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing/success`,
        request_id: `${planId}_${billingPeriod}_${Date.now()}`, // 用于追踪支付
      }),
    });

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json().catch(() => ({}));
      console.error("Creem API error:", {
        status: checkoutResponse.status,
        statusText: checkoutResponse.statusText,
        error: errorData,
        productId,
        planId,
        billingPeriod,
      });

      // 返回更详细的错误信息给前端
      return NextResponse.json(
        {
          error: "Failed to create checkout session",
          details: checkoutResponse.status === 403
            ? "Invalid API key or insufficient permissions. Please check your Creem API configuration."
            : `API returned status ${checkoutResponse.status}`,
          status: checkoutResponse.status,
        },
        { status: checkoutResponse.status }
      );
    }

    const checkoutData = await checkoutResponse.json();

    return NextResponse.json({
      checkoutUrl: checkoutData.checkout_url,
      sessionId: checkoutData.id,
    });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 辅助函数:根据套餐 ID 和计费周期获取 Creem Product ID
// 在实际应用中,你需要在 Creem 后台创建产品并在这里配置对应的 Product ID
function getProductId(planId: string, billingPeriod: string): string | null {
  const productMap: Record<string, { monthly: string; yearly: string }> = {
    basic: {
      monthly: process.env.CREEM_PRODUCT_BASIC_MONTHLY || "",
      yearly: process.env.CREEM_PRODUCT_BASIC_YEARLY || "",
    },
    pro: {
      monthly: process.env.CREEM_PRODUCT_PRO_MONTHLY || "",
      yearly: process.env.CREEM_PRODUCT_PRO_YEARLY || "",
    },
    max: {
      monthly: process.env.CREEM_PRODUCT_MAX_MONTHLY || "",
      yearly: process.env.CREEM_PRODUCT_MAX_YEARLY || "",
    },
  };

  const plan = productMap[planId];
  if (!plan) return null;

  return billingPeriod === "monthly" ? plan.monthly : plan.yearly;
}
