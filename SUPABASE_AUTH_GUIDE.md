# Supabase OAuth 登录集成指南

本项目已集成 Supabase OAuth 登录功能,支持 **GitHub** 和 **Google** 登录,使用服务器端认证方式 (SSR)。

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

## 2. 配置 OAuth 提供商

### 选项 A: 配置 GitHub OAuth

#### 2A.1 获取 Supabase 回调 URL
1. 登录 Supabase Dashboard
2. 点击左侧 Authentication
3. 点击 Providers 标签
4. 点击 GitHub,复制 **Callback URL** (格式: `https://你的项目.supabase.co/auth/v1/callback`)

#### 2A.2 在 GitHub 创建 OAuth App
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写信息:
   - Application name: Nano Banana Clone
   - Homepage URL: http://localhost:3000 (开发环境) 或你的生产域名
   - Authorization callback URL: 粘贴步骤 2.1 的 Callback URL
4. 点击 "Register application"
5. 复制 **Client ID**
6. 点击 "Generate a new client secret",复制 **Client Secret**

#### 2A.3 在 Supabase 配置 GitHub 凭证
1. 回到 Supabase Dashboard -> Authentication -> Providers
2. 找到 GitHub,启用它
3. 填入:
   - GitHub Client ID
   - GitHub Client Secret
4. 点击 Save

### 选项 B: 配置 Google OAuth

#### 2B.1 创建 Google Cloud 项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 前往 [Google Auth Platform Console](https://console.cloud.google.com/auth/overview)

#### 2B.2 配置 OAuth 同意屏幕
1. 在 [Branding](https://console.cloud.google.com/auth/branding) 页面配置应用信息
2. 在 [Data Access (Scopes)](https://console.cloud.google.com/auth/scopes) 添加必需的作用域:
   - `openid` (需手动添加)
   - `.../auth/userinfo.email` (默认添加)
   - `.../auth/userinfo.profile` (默认添加)

#### 2B.3 创建 OAuth 客户端 ID
1. 前往 [Clients](https://console.cloud.google.com/auth/clients)
2. 点击 [Create OAuth client ID](https://console.cloud.google.com/auth/clients/create)
3. 选择 **Web application** 类型
4. 填写配置:
   - **Name**: Nano Banana Clone
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (开发环境)
     - `https://你的域名.com` (生产环境)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/v1/callback` (开发环境)
     - `https://你的项目.supabase.co/auth/v1/callback` (从 Supabase Dashboard 获取)
5. 点击 Create
6. 复制 **Client ID** 和 **Client Secret**

#### 2B.4 在 Supabase 配置 Google 凭证
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Authentication -> Providers
4. 找到 Google,启用它
5. 填入:
   - Google Client ID (Web)
   - Google Client Secret (Web)
6. 点击 Save

#### 2B.5 配置 Google 的额外选项(推荐)
为了获取 Google 的 refresh token,需要在登录时传递特定参数。本项目已在 `/auth/google/route.ts` 中配置:
```typescript
queryParams: {
  access_type: "offline",
  prompt: "consent",
}
```

## 3. 配置重定向 URL 白名单

在 Supabase Dashboard -> Authentication -> URL Configuration 中添加:
- 开发环境:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/**` (允许所有本地路径)
- 生产环境:
  - `https://你的域名.com/auth/callback`
  - `https://你的域名.com/**` (允许所有路径)

**重要提示**: 确保添加通配符 `/**` 以允许应用内的所有重定向路径。

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
│       ├── github/
│       │   └── route.ts       # GitHub 登录 API 路由
│       ├── google/
│       │   └── route.ts       # Google 登录 API 路由
│       ├── logout/
│       │   └── route.ts       # 登出 API 路由
│       └── callback/
│           └── route.ts       # OAuth 回调处理 (统一处理)
├── components/
│   └── auth-button.tsx        # 登录/登出按钮组件
└── middleware.ts              # Next.js Middleware (刷新会话)

```

## 6. API 端点

### POST /auth/github
触发 GitHub OAuth 登录流程

### POST /auth/google
触发 Google OAuth 登录流程

### POST /auth/logout
登出当前用户

### GET /auth/callback
处理 OAuth 回调 (GitHub 和 Google 共用,自动处理,无需手动调用)

## 7. 测试

1. 启动开发服务器:
```bash
npm run dev
```

2. 访问 http://localhost:3000
3. 点击 "GitHub 登录" 或 "Google 登录" 按钮
4. 完成相应的 OAuth 授权
5. 应该会重定向回应用并显示用户信息

## 8. 生产环境部署

在 Vercel 或其他平台部署时:
1. 添加环境变量 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. 在 GitHub OAuth App 和/或 Google OAuth Client 中添加生产域名的回调 URL
3. 在 Supabase URL Configuration 中添加生产域名的回调 URL
4. 如果使用自定义域名,建议配置 `auth.你的域名.com` 或 `api.你的域名.com` 用于 Supabase 自定义域名(可选但推荐)

## 故障排查

### 登录后重定向到错误页面
- 检查 Supabase 中的 URL Configuration 白名单
- 确保 GitHub OAuth App 或 Google OAuth Client 的回调 URL 正确
- 确认回调 URL 使用的是 Supabase 的回调地址 (`https://你的项目.supabase.co/auth/v1/callback`),而不是应用的地址

### Google 登录特定问题
- **未获取到 refresh token**: 确保在 `signInWithOAuth` 中传递了 `access_type: "offline"` 和 `prompt: "consent"`
- **作用域权限不足**: 检查 Google Auth Platform 中配置的 scopes 是否包含 `openid`, `userinfo.email`, `userinfo.profile`
- **品牌验证警告**: 对于生产环境,建议在 Google Auth Platform 的 Branding 页面完成品牌验证

### 会话无法保持
- 检查 `middleware.ts` 是否正确配置
- 确保 cookie 设置正确

### 登录按钮无响应
- 检查浏览器控制台错误
- 确认环境变量已正确设置
