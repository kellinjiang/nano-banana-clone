"use client";

import { useState } from "react";
import { PricingCard } from "./PricingCard";
import { pricingPlans, faqs } from "../data/pricing-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handleSubscribe = async (
    planId: string,
    period: "monthly" | "yearly"
  ) => {
    // Free 套餐直接跳转到首页（图片生成界面）
    if (planId === "free") {
      window.location.href = "/";
      return;
    }

    setLoadingPlanId(planId);
    try {
      // 调用支付 API
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          billingPeriod: period,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 处理 API 错误
        console.error("Checkout API error:", data);

        let errorMessage = "创建支付会话失败，请稍后再试。";

        if (data.status === 403) {
          errorMessage = "支付服务配置错误。请联系管理员检查 Creem API 配置。\n\n详情：" + (data.details || "API 认证失败");
        } else if (data.status === 400) {
          errorMessage = "请求参数错误：" + (data.error || "未知错误");
        } else if (data.status === 500) {
          errorMessage = "服务器内部错误：" + (data.error || "请稍后再试");
        } else if (data.details) {
          errorMessage = data.details;
        }

        alert(errorMessage);
        return;
      }

      if (data.checkoutUrl) {
        // 重定向到支付页面
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("响应中缺少支付链接");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("启动支付流程失败，请稍后再试。\n\n" + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-base px-4 py-2">
            🍌 Limited Time: Save 20% with Annual Billing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Unlimited creativity starts here
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span
            className={`text-sm font-medium ${
              billingPeriod === "monthly"
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            Monthly
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")
            }
            className="relative w-14 h-8 p-0"
          >
            <div
              className={`absolute inset-1 w-6 h-6 bg-primary rounded-sm transition-transform ${
                billingPeriod === "yearly" ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </Button>
          <span
            className={`text-sm font-medium ${
              billingPeriod === "yearly"
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            Yearly
          </span>
          {billingPeriod === "yearly" && (
            <Badge variant="destructive" className="ml-2">
              🔥 LIMITED TIME: Save 50%
            </Badge>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingPeriod={billingPeriod}
              onSubscribe={handleSubscribe}
              isLoading={loadingPlanId === plan.id}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-12">
            <p className="text-lg mb-4">Have more questions? We&apos;re here to help</p>
            <Button variant="outline" size="lg">
              Contact Support
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-16 text-sm text-muted-foreground">
          Nanobanana.ai is an independent product and is not affiliate with Google
          or any of its brands
        </div>
      </div>
    </div>
  );
}
