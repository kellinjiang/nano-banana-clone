/**
 * Credits History API
 * GET /api/credits/history
 * 查询用户 Credits 使用记录
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserUsageHistory } from "@/lib/credits/manager";

export async function GET(request: NextRequest) {
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

    // 2. 获取查询参数
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);

    // 3. 查询使用记录
    const history = await getUserUsageHistory(user.id, limit);

    return NextResponse.json(
      {
        history,
        total: history.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("查询使用记录失败:", error);
    return NextResponse.json(
      {
        error: "查询使用记录失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
