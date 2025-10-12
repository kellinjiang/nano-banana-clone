# Supabase GitHub 登录集成指南

本项目已集成 Supabase GitHub OAuth 登录功能,使用服务器端认证方式 (SSR)。

## 1. 准备工作

### 1.1 安装依赖(已完成)
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 1.2 配置环境变量
复制 `.env.example` 到 `.env.local`:
```bash
cp .env.example .env.local
```

编辑 `.env.local`,填入你的 Supabase 配置:
```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名密钥
```

获取方式:
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Settings -> API
4. 复制 Project URL 和 anon public key

## 2. 在 Supabase 配置 GitHub OAuth

### 2.1 获取 Supabase 回调 URL
1. 登录 Supabase Dashboard
2. 点击左侧 Authentication
3. 点击 Providers 标签
4. 点击 GitHub,复制 **Callback URL** (格式: `https://你的项目.supabase.co/auth/v1/callback`)

### 2.2 在 GitHub 创建 OAuth App
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写信息:
   - Application name: Nano Banana Clone
   - Homepage URL: http://localhost:3000 (开发环境) 或你的生产域名
   - Authorization callback URL: 粘贴步骤 2.1 的 Callback URL
4. 点击 "Register application"
5. 复制 **Client ID**
6. 点击 "Generate a new client secret",复制 **Client Secret**

### 2.3 在 Supabase 配置 GitHub 凭证
1. 回到 Supabase Dashboard -> Authentication -> Providers
2. 找到 GitHub,启用它
3. 填入:
   - GitHub Client ID
   - GitHub Client Secret
4. 点击 Save

## 3. 配置重定向 URL 白名单

在 Supabase Dashboard -> Authentication -> URL Configuration 中添加:
- `http://localhost:3000/auth/callback` (开发环境)
- `https://你的域名.com/auth/callback` (生产环境)

## 4. 使用登录组件

### 在页面中使用 AuthButton 组件
```tsx
import { AuthButton } from "@/components/auth-button";

export default function Page() {
  return (
    <div>
      <AuthButton />
    </div>
  );
}
```

### 获取当前用户(服务器端)
```tsx
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      {user ? `欢迎, ${user.email}` : '请登录'}
    </div>
  );
}
```

### 获取当前用户(客户端)
```tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function Page() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return <div>{user ? `欢迎, ${user.email}` : '请登录'}</div>;
}
```

## 5. 项目结构

```
src/
├── lib/
│   └── supabase/
│       ├── client.ts          # 客户端 Supabase 实例
│       ├── server.ts          # 服务器端 Supabase 实例
│       └── middleware.ts      # Middleware 会话刷新逻辑
├── app/
│   └── auth/
│       ├── login/
│       │   └── route.ts       # 登录 API 路由
│       ├── logout/
│       │   └── route.ts       # 登出 API 路由
│       └── callback/
│           └── route.ts       # OAuth 回调处理
├── components/
│   └── auth-button.tsx        # 登录/登出按钮组件
└── middleware.ts              # Next.js Middleware (刷新会话)

```

## 6. API 端点

### POST /auth/login
触发 GitHub OAuth 登录流程

### POST /auth/logout
登出当前用户

### GET /auth/callback
处理 GitHub OAuth 回调(自动处理,无需手动调用)

## 7. 测试

1. 启动开发服务器:
```bash
npm run dev
```

2. 访问 http://localhost:3000
3. 点击 "使用 GitHub 登录" 按钮
4. 完成 GitHub 授权
5. 应该会重定向回应用并显示用户信息

## 8. 生产环境部署

在 Vercel 或其他平台部署时:
1. 添加环境变量 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. 在 GitHub OAuth App 中添加生产域名的回调 URL
3. 在 Supabase URL Configuration 中添加生产域名的回调 URL

## 故障排查

### 登录后重定向到错误页面
- 检查 Supabase 中的 URL Configuration 白名单
- 确保 GitHub OAuth App 的回调 URL 正确

### 会话无法保持
- 检查 `middleware.ts` 是否正确配置
- 确保 cookie 设置正确

### 登录按钮无响应
- 检查浏览器控制台错误
- 确认环境变量已正确设置
