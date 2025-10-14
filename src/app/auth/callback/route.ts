import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const next = requestUrl.searchParams.get("next") ?? "/";

	// 获取正确的重定向 URL
	const forwardedHost = request.headers.get("x-forwarded-host");
	const forwardedProto = request.headers.get("x-forwarded-proto");
	const host = request.headers.get("host");

	// 调试日志
	console.log("Callback - Headers:", {
		forwardedHost,
		forwardedProto,
		host,
		requestUrl: request.url,
		origin: requestUrl.origin,
	});

	// 构建正确的重定向 URL
	let redirectOrigin: string;
	if (forwardedHost && forwardedProto) {
		// Vercel 生产环境
		redirectOrigin = `${forwardedProto}://${forwardedHost}`;
	} else if (host) {
		// 使用 host header
		const protocol = host.includes("localhost") ? "http" : "https";
		redirectOrigin = `${protocol}://${host}`;
	} else {
		// 后备方案
		redirectOrigin = requestUrl.origin;
	}

	console.log("Callback - Redirect origin:", redirectOrigin);

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			const redirectUrl = `${redirectOrigin}${next}`;
			console.log("Callback - Final redirect URL:", redirectUrl);
			return NextResponse.redirect(redirectUrl);
		}
		console.error("Callback - Exchange code error:", error);
	}

	// return the user to an error page with instructions
	return NextResponse.redirect(`${redirectOrigin}/auth/auth-code-error`);
}
