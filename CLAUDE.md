# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 Next.js 15 项目,使用 TypeScript、Tailwind CSS 和 shadcn/ui 组件库构建。该项目是一个名为 "Nano Banana" 的 AI 图像编辑工具的营销落地页克隆版本。

## 核心技术栈

- **框架**: Next.js 15.3.2 (使用 App Router)
- **语言**: TypeScript 5.8.3
- **样式**: Tailwind CSS 3.4.17
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **图标**: lucide-react
- **代码质量**: Biome (格式化和 linting)
- **特殊依赖**: same-runtime (通过 CDN 加载)

## 常用命令

### 开发
```bash
npm run dev
# 或
bun run dev
```
在本地开发服务器上运行应用,使用 Turbopack,监听所有网络接口 (0.0.0.0)

### 构建
```bash
npm run build
# 或
bun run build
```
创建生产环境构建

### 启动生产服务器
```bash
npm start
# 或
bun start
```

### 代码检查
```bash
npm run lint
# 或
bun run lint
```
运行 TypeScript 类型检查 (`tsc --noEmit`) 和 Next.js ESLint 检查

### 代码格式化
```bash
npm run format
# 或
bun run format
```
使用 Biome 格式化代码

## 项目架构

### 目录结构
- `src/app/` - Next.js App Router 页面和布局
  - `layout.tsx` - 根布局,加载 Geist 字体,集成 same-runtime
  - `page.tsx` - 主页面,包含完整的营销落地页内容
  - `ClientBody.tsx` - 客户端组件,用于处理 hydration 问题
  - `globals.css` - 全局样式
- `src/components/ui/` - shadcn/ui 可复用组件 (Button, Card, Badge, Accordion, DropdownMenu 等)
- `src/lib/` - 工具函数 (如 `utils.ts` 中的 `cn` 辅助函数)

### 关键特性

1. **SSR/CSR 混合架构**:
   - 使用 Server Components 作为默认
   - `ClientBody.tsx` 是客户端组件,用于在 hydration 后清理扩展添加的类名

2. **same-runtime 集成**:
   - 在 `layout.tsx` 中通过 `<Script>` 标签从 CDN 加载
   - `jsxImportSource` 配置为 `same-runtime/dist` (在 tsconfig.json 中)

3. **图像配置**:
   - `next.config.js` 配置了图像优化为 unoptimized
   - 允许来自 Unsplash 和 same-assets.com 域的远程图像

4. **shadcn/ui 配置**:
   - 使用 "new-york" 风格
   - 启用 CSS 变量
   - 路径别名: `@/` 指向 `src/`

### 代码质量工具

- **Biome**: 替代 Prettier 和部分 ESLint 规则
  - 配置文件: `biome.json`
  - 使用空格缩进和双引号
  - 禁用大部分 a11y 规则和未使用变量警告
  - 仅检查 `src/**/*.{ts,tsx}` 文件

### 样式系统

- Tailwind CSS 与 CSS 变量结合使用
- 使用 `tailwind-merge` 和 `clsx` 进行条件类名处理 (通过 `cn()` 工具函数)
- `tailwindcss-animate` 用于动画效果

## 开发注意事项

1. **添加新的 UI 组件**: 使用 shadcn/ui CLI 添加新组件,它们会被安装到 `src/components/ui/`

2. **样式约定**:
   - 使用 Tailwind 实用类
   - 对于复杂的动态样式,使用 `cn()` 函数合并类名

3. **TypeScript 严格模式**: 项目启用了严格的 TypeScript 检查

4. **图像处理**:
   - 使用 Next.js `<Image>` 组件优化图像
   - 外部图像需要在 `next.config.js` 中配置

5. **Hydration 问题**:
   - 如果遇到 hydration 不匹配,使用 `suppressHydrationWarning` 属性
   - `ClientBody.tsx` 组件处理浏览器扩展引起的类名冲突
