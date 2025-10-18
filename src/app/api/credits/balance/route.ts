/**
 * Credits Balance API
 * GET /api/credits/balance
 * 查询用户 Credits 余额
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserCreditsBalance } from "@/lib/credits/manager";

export async function GET() {
  try {
    // 1. 验证用户身份
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "未授权访问，请先登录" },
        { status: 401 }
      );
    }

    // 2. 获取用户 Credits 余额
    const balance = await getUserCreditsBalance(user.id);

    return NextResponse.json(balance, { status: 200 });
  } catch (error) {
    console.error("查询 Credits 余额失败:", error);
    return NextResponse.json(
      {
        error: "查询 Credits 余额失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
