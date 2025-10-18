import { NextResponse } from "next/server";

export async function GET() {
  // 仅在开发环境中允许访问此端点
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "此端点仅在开发环境中可用" },
      { status: 403 }
    );
  }

  const config = {
    apiKey: {
      exists: !!process.env.CREEM_API_KEY,
      prefix: process.env.CREEM_API_KEY?.substring(0, 10) || "未设置",
      length: process.env.CREEM_API_KEY?.length || 0,
    },
    webhookSecret: {
      exists: !!process.env.CREEM_WEBHOOK_SECRET,
      prefix: process.env.CREEM_WEBHOOK_SECRET?.substring(0, 10) || "未设置",
    },
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "未设置",
    products: {
      basic: {
        monthly: process.env.CREEM_PRODUCT_BASIC_MONTHLY || "未设置",
        yearly: process.env.CREEM_PRODUCT_BASIC_YEARLY || "未设置",
      },
      pro: {
        monthly: process.env.CREEM_PRODUCT_PRO_MONTHLY || "未设置",
        yearly: process.env.CREEM_PRODUCT_PRO_YEARLY || "未设置",
      },
      max: {
        monthly: process.env.CREEM_PRODUCT_MAX_MONTHLY || "未设置",
        yearly: process.env.CREEM_PRODUCT_MAX_YEARLY || "未设置",
      },
    },
  };

  return NextResponse.json(config);
}
