"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function AuthButton() {
	const [user, setUser] = useState<{ email?: string } | null>(null);
	const [loading, setLoading] = useState(false);
	const [isInitializing, setIsInitializing] = useState(true);
	const supabase = createClient();

	// 获取当前用户
	useEffect(() => {
		// 初始加载用户状态
		supabase.auth.getUser().then(({ data: { user } }) => {
			setUser(user);
			setIsInitializing(false);
		});

		// 监听认证状态变化
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			setIsInitializing(false);
		});

		return () => subscription.unsubscribe();
	}, [supabase]);

	const handleLogin = async (provider: "github" | "google") => {
		setLoading(true);
		try {
			const response = await fetch(`/auth/${provider}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`登录失败: ${response.statusText}`);
			}

			const data = await response.json();

			if (data.error) {
				console.error(`${provider} 登录错误:`, data.error);
				alert(`登录失败: ${data.error}`);
				setLoading(false);
				return;
			}

			if (data.url) {
				// 跳转到 OAuth 提供商页面
				window.location.href = data.url;
			}
		} catch (error) {
			console.error(`${provider} 登录错误:`, error);
			alert("登录失败,请稍后重试");
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		setLoading(true);
		try {
			const response = await fetch("/auth/logout", {
				method: "POST",
			});

			const data = await response.json();

			if (data.success) {
				// 使用服务器返回的正确 URL 进行重定向
				const redirectUrl = data.redirectUrl || window.location.origin;
				window.location.href = redirectUrl;
			} else {
				throw new Error("登出失败");
			}
		} catch (error) {
			console.error("登出错误:", error);
			alert("登出失败,请稍后重试");
			setLoading(false);
		}
	};

	// 初始化时显示加载状态
	if (isInitializing) {
		return (
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">加载中...</span>
			</div>
		);
	}

	if (user) {
		return (
			<div className="flex items-center gap-4">
				<span className="text-sm text-muted-foreground">{user.email}</span>
				<Button
					onClick={handleLogout}
					disabled={loading}
					variant="outline"
					size="sm"
				>
					{loading ? "退出中..." : "退出"}
				</Button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Button
				onClick={() => handleLogin("github")}
				disabled={loading}
				size="sm"
				variant="outline"
			>
				{loading ? "登录中..." : "GitHub 登录"}
			</Button>
			<Button onClick={() => handleLogin("google")} disabled={loading} size="sm">
				{loading ? "登录中..." : "Google 登录"}
			</Button>
		</div>
	);
}
