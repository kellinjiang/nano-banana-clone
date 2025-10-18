"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Sparkles } from "lucide-react";
import type { CreditsBalanceResponse } from "@/types/credits";

export function CreditsBalance() {
  const [balance, setBalance] = useState<CreditsBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/credits/balance");

      if (!response.ok) {
        if (response.status === 401) {
          setError("请先登录");
          return;
        }
        throw new Error("获取余额失败");
      }

      const data = await response.json();
      setBalance(data);
    } catch (err) {
      console.error("获取 Credits 余额失败:", err);
      setError(err instanceof Error ? err.message : "获取余额失败");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Coins className="h-5 w-5 animate-pulse" />
            <span>加载中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md border-destructive">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* 总余额 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-semibold">总余额</span>
            </div>
            <div className="text-2xl font-bold">{balance.total_available}</div>
          </div>

          {/* 首次免费提示 */}
          {balance.has_free_generation && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                您还有一次免费生成机会！
              </span>
            </div>
          )}

          {/* 详细余额 */}
          <div className="space-y-2 text-sm">
            {/* 订阅 Credits */}
            {balance.subscription.total > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">订阅 Credits</span>
                <div className="flex items-center gap-2">
                  <span>
                    {balance.subscription.available} / {balance.subscription.total}
                  </span>
                  {balance.subscription.reset_at && (
                    <Badge variant="outline" className="text-xs">
                      {new Date(balance.subscription.reset_at).toLocaleDateString()}重置
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* 充值 Credits */}
            {balance.purchased.total > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">充值 Credits</span>
                <span>
                  {balance.purchased.available} / {balance.purchased.total}
                </span>
              </div>
            )}

            {/* 赠送 Credits */}
            {balance.bonus.total > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">赠送 Credits</span>
                <span>
                  {balance.bonus.available} / {balance.bonus.total}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
