import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const supabase = await createClient();
	await supabase.auth.signOut();

	// 获取正确的重定向 URL (支持 Vercel 部署)
	const forwardedHost = request.headers.get("x-forwarded-host");
	const forwardedProto = request.headers.get("x-forwarded-proto");

	// 优先使用 forwarded headers (Vercel 部署环境)
	let redirectUrl: string;
	if (forwardedHost && forwardedProto) {
		redirectUrl = `${forwardedProto}://${forwardedHost}`;
	} else {
		redirectUrl = new URL(request.url).origin;
	}

	return NextResponse.json({ success: true, redirectUrl });
}
