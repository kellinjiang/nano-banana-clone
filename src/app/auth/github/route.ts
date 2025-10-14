import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const supabase = await createClient();

	// 获取正确的回调 URL (支持 Vercel 部署)
	const origin = request.headers.get("origin");
	const forwardedHost = request.headers.get("x-forwarded-host");
	const forwardedProto = request.headers.get("x-forwarded-proto");
	const host = request.headers.get("host");
	const referer = request.headers.get("referer");

	// 调试日志
	console.log("GitHub Login - Headers:", {
		origin,
		forwardedHost,
		forwardedProto,
		host,
		referer,
		requestUrl: request.url,
	});

	// 优先使用 forwarded headers (Vercel 部署环境)
	let redirectUrl: string;
	if (forwardedHost && forwardedProto) {
		redirectUrl = `${forwardedProto}://${forwardedHost}/auth/callback`;
	} else if (origin) {
		redirectUrl = `${origin}/auth/callback`;
	} else if (host) {
		// 如果有 host header,使用它
		const protocol = host.includes("localhost") ? "http" : "https";
		redirectUrl = `${protocol}://${host}/auth/callback`;
	} else {
		// 后备方案
		redirectUrl = `${new URL(request.url).origin}/auth/callback`;
	}

	console.log("GitHub Login - Redirect URL:", redirectUrl);

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "github",
		options: {
			redirectTo: redirectUrl,
		},
	});

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	return NextResponse.json({ url: data.url });
}
