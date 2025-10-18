/**
 * Credits Deduct API
 * POST /api/credits/deduct
 * 扣除用户 Credits
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/credits/manager";
import type { DeductCreditsParams } from "@/types/credits";

export async function POST(request: NextRequest) {
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

    // 2. 解析请求参数
    const body = await request.json();
    const { amount, operation_type, metadata } = body;

    // 3. 参数验证
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "扣除数量必须大于 0" },
        { status: 400 }
      );
    }

    if (
      !operation_type ||
      !["image_generation", "image_upscale", "image_variation"].includes(
        operation_type
      )
    ) {
      return NextResponse.json(
        { error: "无效的操作类型" },
        { status: 400 }
      );
    }

    // 4. 执行扣费
    const params: DeductCreditsParams = {
      userId: user.id,
      amount,
      operationType: operation_type,
      metadata: metadata || {},
    };

    const result = await deductCredits(params);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "扣除 Credits 失败",
          remaining: result.remaining,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        remaining: result.remaining,
        source: result.source,
        free_generation_used: result.free_generation_used || false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("扣除 Credits 失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "扣除 Credits 时发生错误",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
