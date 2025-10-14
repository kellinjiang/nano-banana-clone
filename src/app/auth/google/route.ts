import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const supabase = await createClient();

	// 获取正确的回调 URL (支持 Vercel 部署)
	const origin = request.headers.get("origin");
	const forwardedHost = request.headers.get("x-forwarded-host");
	const forwardedProto = request.headers.get("x-forwarded-proto");

	// 优先使用 forwarded headers (Vercel 部署环境)
	let redirectUrl: string;
	if (forwardedHost && forwardedProto) {
		redirectUrl = `${forwardedProto}://${forwardedHost}/auth/callback`;
	} else if (origin) {
		redirectUrl = `${origin}/auth/callback`;
	} else {
		// 后备方案
		redirectUrl = `${new URL(request.url).origin}/auth/callback`;
	}

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: redirectUrl,
			queryParams: {
				access_type: "offline",
				prompt: "consent",
			},
		},
	});

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	return NextResponse.json({ url: data.url });
}
