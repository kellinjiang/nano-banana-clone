"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PricingPlan } from "../data/pricing-data";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  plan: PricingPlan;
  billingPeriod: "monthly" | "yearly";
  onSubscribe: (planId: string, billingPeriod: "monthly" | "yearly") => void;
  isLoading?: boolean;
}

export function PricingCard({
  plan,
  billingPeriod,
  onSubscribe,
  isLoading,
}: PricingCardProps) {
  const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const originalPrice = billingPeriod === "yearly" ? plan.yearlyOriginalPrice : null;
  const credits =
    billingPeriod === "monthly" ? plan.credits.monthly : plan.credits.yearly;
  const savings =
    originalPrice && billingPeriod === "yearly"
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  return (
    <Card
      className={cn(
        "relative flex flex-col h-full",
        plan.popular && "border-primary border-2 shadow-lg"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="px-4 py-1 text-sm font-semibold">最受欢迎</Badge>
        </div>
      )}

      <CardHeader className="text-center pb-8 pt-8">
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="text-base mt-2">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-2">
            {originalPrice && !plan.isFree && (
              <span className="text-lg text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-4xl font-bold">
              {plan.isFree ? "免费" : `$${price.toFixed(2)}`}
            </span>
            {!plan.isFree && (
              <span className="text-muted-foreground">
                /{billingPeriod === "monthly" ? "月" : "年"}
              </span>
            )}
          </div>

          {billingPeriod === "yearly" && savings > 0 && !plan.isFree && (
            <Badge variant="destructive" className="mt-2">
              ⚡ 节省 {savings}%
            </Badge>
          )}

          {!plan.isFree && (
            <div className="text-sm text-muted-foreground mt-2">
              {credits} credits/{billingPeriod === "monthly" ? "月" : "年"}
            </div>
          )}
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        {plan.isFree ? (
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={() => onSubscribe(plan.id, billingPeriod)}
            disabled={isLoading}
          >
            {isLoading ? "处理中..." : "开始免费使用"}
          </Button>
        ) : (
          <Button
            className="w-full"
            size="lg"
            variant={plan.popular ? "default" : "outline"}
            onClick={() => onSubscribe(plan.id, billingPeriod)}
            disabled={isLoading}
          >
            {isLoading ? "处理中..." : "立即订阅"}
          </Button>
        )}
        <p className="text-xs text-center text-muted-foreground w-full">
          {plan.isFree ? "无需支付，注册即可使用" : "请先登录以订阅套餐"}
        </p>
      </CardFooter>
    </Card>
  );
}
