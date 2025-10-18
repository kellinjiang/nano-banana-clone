import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      checkoutId,
      orderId,
      customerId,
      subscriptionId,
      productId,
      requestId,
      signature,
    } = body;

    if (!checkoutId || !signature) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 验证签名
    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    // 构建签名字符串 (按照 Creem 文档的要求)
    const signatureString = [
      checkoutId,
      orderId,
      customerId,
      subscriptionId,
      productId,
      requestId,
    ]
      .filter(Boolean)
      .join("");

    // 使用 API Key 计算 HMAC 签名
    const expectedSignature = crypto
      .createHmac("sha256", apiKey)
      .update(signatureString)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Signature mismatch:", {
        received: signature,
        expected: expectedSignature,
      });
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // 签名验证成功,记录支付信息
    // 在实际应用中,你需要将支付信息保存到数据库
    console.log("Payment verified:", {
      checkoutId,
      orderId,
      customerId,
      subscriptionId,
      productId,
      requestId,
    });

    // TODO: 保存到数据库
    // await savePaymentToDatabase({
    //   checkoutId,
    //   orderId,
    //   customerId,
    //   subscriptionId,
    //   productId,
    //   requestId,
    // });

    return NextResponse.json({
      success: true,
      orderId,
      subscriptionId,
      customerId,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
