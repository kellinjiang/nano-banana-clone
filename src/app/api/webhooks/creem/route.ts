import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

/**
 * Creem Webhook 处理器
 * 接收来自 Creem 的支付事件通知
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-creem-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    // 验证 webhook 签名
    // Creem 使用专门的 Webhook Secret,而不是 API Key
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CREEM_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook service not configured" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Webhook signature mismatch");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // 解析 webhook 数据
    const event = JSON.parse(body);

    // 处理不同类型的事件
    switch (event.type) {
      case "checkout.completed":
        await handleCheckoutCompleted(event.data);
        break;
      case "subscription.created":
        await handleSubscriptionCreated(event.data);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(event.data);
        break;
      case "subscription.cancelled":
        await handleSubscriptionCancelled(event.data);
        break;
      case "payment.succeeded":
        await handlePaymentSucceeded(event.data);
        break;
      case "payment.failed":
        await handlePaymentFailed(event.data);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// 处理支付完成事件
async function handleCheckoutCompleted(data: any) {
  console.log("Checkout completed:", data);
  // TODO: 更新数据库中的订单状态
  // await updateOrderStatus(data.checkout_id, 'completed');
}

// 处理订阅创建事件
async function handleSubscriptionCreated(data: any) {
  console.log("Subscription created:", data);
  // TODO: 在数据库中创建订阅记录
  // await createSubscription({
  //   subscriptionId: data.subscription_id,
  //   customerId: data.customer_id,
  //   productId: data.product_id,
  //   status: 'active',
  // });
}

// 处理订阅更新事件
async function handleSubscriptionUpdated(data: any) {
  console.log("Subscription updated:", data);
  // TODO: 更新数据库中的订阅信息
  // await updateSubscription(data.subscription_id, data);
}

// 处理订阅取消事件
async function handleSubscriptionCancelled(data: any) {
  console.log("Subscription cancelled:", data);
  // TODO: 更新数据库中的订阅状态
  // await updateSubscriptionStatus(data.subscription_id, 'cancelled');
}

// 处理支付成功事件
async function handlePaymentSucceeded(data: any) {
  console.log("Payment succeeded:", data);
  // TODO: 记录支付成功,更新用户积分
  // await addCreditsToUser(data.customer_id, data.credits);
}

// 处理支付失败事件
async function handlePaymentFailed(data: any) {
  console.log("Payment failed:", data);
  // TODO: 记录支付失败,通知用户
  // await notifyPaymentFailure(data.customer_id, data.reason);
}
