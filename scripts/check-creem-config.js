#!/usr/bin/env node

/**
 * Creem 配置验证脚本
 * 用于检查所有必需的环境变量是否正确配置
 */

console.log("🔍 检查 Creem 支付配置...\n");

// 加载环境变量
require("dotenv").config({ path: ".env.local" });

let hasError = false;

// 检查 API Key
console.log("📌 API Key:");
if (process.env.CREEM_API_KEY) {
  console.log(`  ✅ CREEM_API_KEY 已设置`);
  console.log(`     前缀: ${process.env.CREEM_API_KEY.substring(0, 15)}...`);
  console.log(`     长度: ${process.env.CREEM_API_KEY.length} 字符`);

  if (!process.env.CREEM_API_KEY.startsWith("creem_")) {
    console.log(`  ⚠️  警告: API Key 应该以 "creem_" 开头`);
  }
} else {
  console.log("  ❌ CREEM_API_KEY 未设置");
  hasError = true;
}

// 检查 Webhook Secret
console.log("\n📌 Webhook Secret:");
if (process.env.CREEM_WEBHOOK_SECRET) {
  console.log(`  ✅ CREEM_WEBHOOK_SECRET 已设置`);
  console.log(`     前缀: ${process.env.CREEM_WEBHOOK_SECRET.substring(0, 10)}...`);
} else {
  console.log("  ⚠️  CREEM_WEBHOOK_SECRET 未设置 (Webhook 功能将不可用)");
}

// 检查 Base URL
console.log("\n📌 Base URL:");
if (process.env.NEXT_PUBLIC_BASE_URL) {
  console.log(`  ✅ NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL}`);
} else {
  console.log("  ❌ NEXT_PUBLIC_BASE_URL 未设置");
  hasError = true;
}

// 检查所有 Product ID
console.log("\n📌 Product IDs:");

const productConfig = [
  { name: "Basic (月付)", env: "CREEM_PRODUCT_BASIC_MONTHLY" },
  { name: "Basic (年付)", env: "CREEM_PRODUCT_BASIC_YEARLY" },
  { name: "Pro (月付)", env: "CREEM_PRODUCT_PRO_MONTHLY" },
  { name: "Pro (年付)", env: "CREEM_PRODUCT_PRO_YEARLY" },
  { name: "Max (月付)", env: "CREEM_PRODUCT_MAX_MONTHLY" },
  { name: "Max (年付)", env: "CREEM_PRODUCT_MAX_YEARLY" },
];

for (const product of productConfig) {
  const value = process.env[product.env];
  if (value) {
    console.log(`  ✅ ${product.name}: ${value}`);
  } else {
    console.log(`  ❌ ${product.name}: 未设置 (${product.env})`);
    hasError = true;
  }
}

// 总结
console.log("\n" + "=".repeat(60));
if (hasError) {
  console.log("❌ 配置检查失败！请修复上述错误后重试。");
  console.log("\n💡 快速修复步骤:");
  console.log("1. 确保 .env.local 文件存在");
  console.log("2. 访问 https://creem.io/dashboard 获取 API Key");
  console.log("3. 在 Creem Dashboard 创建产品并获取 Product ID");
  console.log("4. 将所有配置添加到 .env.local 文件");
  console.log("5. 重启开发服务器");
  process.exit(1);
} else {
  console.log("✅ 所有配置检查通过！");
  console.log("\n💡 下一步:");
  console.log("1. 访问 http://localhost:3000/pricing 测试支付流程");
  console.log("2. 如果仍然遇到 403 错误，请检查:");
  console.log("   - API Key 是否有效且未过期");
  console.log("   - Product ID 是否正确且属于同一个 Creem 账户");
  console.log("   - API Key 是否有访问这些产品的权限");
}
console.log("=".repeat(60) + "\n");
