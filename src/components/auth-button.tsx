"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function AuthButton() {
	const [user, setUser] = useState<{ email?: string } | null>(null);
	const [loading, setLoading] = useState(false);
	const supabase = createClient();

	// 获取当前用户
	useEffect(() => {
		supabase.auth.getUser().then(({ data: { user } }) => {
			setUser(user);
		});

		// 监听认证状态变化
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, [supabase]);

	const handleLogin = async (provider: "github" | "google") => {
		setLoading(true);
		try {
			const response = await fetch(`/auth/${provider}`, {
				method: "POST",
			});
			const { url } = await response.json();
			if (url) {
				window.location.href = url;
			}
		} catch (error) {
			console.error("Login error:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		setLoading(true);
		try {
			await fetch("/auth/logout", {
				method: "POST",
			});
			window.location.reload();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setLoading(false);
		}
	};

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
