"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PaymentDetails {
  isMock?: boolean;
  plan?: string;
  period?: string;
  message?: string;
  orderId?: string;
  subscriptionId?: string;
  customerId?: string;
  productId?: string;
}

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // 检查是否是 Mock 模式
        const isMock = searchParams.get("mock") === "true";

        if (isMock) {
          // Mock 模式 - 直接显示成功页面
          const plan = searchParams.get("plan");
          const period = searchParams.get("period");

          setPaymentDetails({
            isMock: true,
            plan: plan ?? undefined,
            period: period ?? undefined,
            message: "这是 Mock 支付模式 - 仅用于测试",
          });
          setIsVerifying(false);
          return;
        }

        // 真实支付模式 - 从 URL 获取支付信息
        const checkoutId = searchParams.get("checkout_id");
        const orderId = searchParams.get("order_id");
        const customerId = searchParams.get("customer_id");
        const subscriptionId = searchParams.get("subscription_id");
        const productId = searchParams.get("product_id");
        const requestId = searchParams.get("request_id");
        const signature = searchParams.get("signature");

        if (!checkoutId) {
          setError("Invalid payment information");
          setIsVerifying(false);
          return;
        }

        // 验证支付签名
        const response = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkoutId,
            orderId,
            customerId,
            subscriptionId,
            productId,
            requestId,
            signature,
          }),
        });

        if (!response.ok) {
          throw new Error("Payment verification failed");
        }

        const data = await response.json();
        setPaymentDetails(data);
      } catch (err) {
        console.error("Payment verification error:", err);
        setError("Failed to verify payment. Please contact support.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-semibold mb-2">Verifying Payment...</h2>
          <p className="text-muted-foreground">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Payment Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/pricing">Try Again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">
          {paymentDetails?.isMock ? "测试支付成功！" : "Payment Successful!"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {paymentDetails?.isMock
            ? "这是 Mock 支付测试模式。在生产环境中，此处将显示真实的支付确认信息。"
            : "Thank you for your subscription. Your account has been upgraded."}
        </p>

        {paymentDetails && (
          <div className="bg-muted rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2">
              {paymentDetails.isMock ? "测试订单详情" : "Order Details"}
            </h3>
            <div className="space-y-1 text-sm">
              {paymentDetails.isMock ? (
                <>
                  <p>
                    <span className="text-muted-foreground">套餐:</span>{" "}
                    {paymentDetails.plan?.toUpperCase() || "未知"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">计费周期:</span>{" "}
                    {paymentDetails.period === "monthly" ? "月付" : "年付"}
                  </p>
                  <p className="text-amber-600 mt-2 text-xs">
                    ⚠️ {paymentDetails.message}
                  </p>
                </>
              ) : (
                <>
                  {paymentDetails.orderId && (
                    <p>
                      <span className="text-muted-foreground">Order ID:</span>{" "}
                      {paymentDetails.orderId}
                    </p>
                  )}
                  {paymentDetails.subscriptionId && (
                    <p>
                      <span className="text-muted-foreground">Subscription ID:</span>{" "}
                      {paymentDetails.subscriptionId}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              {paymentDetails?.isMock ? "返回首页" : "Start Creating"}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pricing">
              {paymentDetails?.isMock ? "查看套餐" : "View Plans"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
