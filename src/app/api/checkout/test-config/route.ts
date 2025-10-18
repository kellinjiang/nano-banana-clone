import { NextResponse } from "next/server";

export async function GET() {
  // 仅在开发环境中允许访问此端点
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "此端点仅在开发环境中可用" },
      { status: 403 }
    );
  }

  const apiKey = process.env.CREEM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      error: "CREEM_API_KEY 未配置",
      suggestion: "请在 .env.local 中设置 CREEM_API_KEY",
    });
  }

  try {
    // 测试 API Key 是否有效 - 获取产品列表
    const response = await fetch("https://api.creem.io/v1/products", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        status: "error",
        apiKeyValid: false,
        httpStatus: response.status,
        error: errorData,
        suggestion:
          response.status === 403
            ? "API Key 无效或已过期。请在 Creem Dashboard 重新生成 API Key。"
            : `API 返回状态码 ${response.status}`,
      });
    }

    const products = await response.json();

    // 检查配置的 Product ID 是否存在
    const configuredProducts = {
      basic_monthly: process.env.CREEM_PRODUCT_BASIC_MONTHLY,
      basic_yearly: process.env.CREEM_PRODUCT_BASIC_YEARLY,
      pro_monthly: process.env.CREEM_PRODUCT_PRO_MONTHLY,
      pro_yearly: process.env.CREEM_PRODUCT_PRO_YEARLY,
      max_monthly: process.env.CREEM_PRODUCT_MAX_MONTHLY,
      max_yearly: process.env.CREEM_PRODUCT_MAX_YEARLY,
    };

    const productIds = Array.isArray(products.data)
      ? products.data.map((p: { id: string }) => p.id)
      : [];

    const validation: Record<string, {
      configured: boolean;
      exists: boolean;
      productId?: string;
      message: string;
    }> = {};
    for (const [key, productId] of Object.entries(configuredProducts)) {
      if (!productId) {
        validation[key] = {
          configured: false,
          exists: false,
          message: "未配置",
        };
      } else {
        const exists = productIds.includes(productId);
        validation[key] = {
          configured: true,
          exists,
          productId,
          message: exists
            ? "✅ 有效"
            : "❌ Product ID 不存在于你的 Creem 账户中",
        };
      }
    }

    return NextResponse.json({
      status: "success",
      apiKeyValid: true,
      apiKeyPrefix: apiKey.substring(0, 15) + "...",
      totalProductsInAccount: productIds.length,
      availableProductIds: productIds,
      configuredProducts: validation,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "测试 API Key 时发生错误",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
}
