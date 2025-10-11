import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// 配置 Next.js API 路由的最大执行时间
export const maxDuration = 120; // 120 秒
export const dynamic = "force-dynamic";

const openai = new OpenAI({
	baseURL: "https://openrouter.ai/api/v1",
	apiKey: process.env.OPENROUTER_API_KEY,
	timeout: 120000, // 120 秒超时
	maxRetries: 0, // 不自动重试
	defaultHeaders: {
		"HTTP-Referer": "https://nanobanana.ai",
		"X-Title": "Nano Banana Clone",
	},
});

export async function POST(req: NextRequest) {
	try {
		const { image, prompt } = await req.json();

		if (!image || !prompt) {
			return NextResponse.json(
				{ error: "图片和提示词都是必需的" },
				{ status: 400 },
			);
		}

		console.log("开始调用 API...");
		console.log("Prompt:", prompt);

		// 调用 Gemini 2.5 Flash Image API
		const completion = await openai.chat.completions.create({
			model: "google/gemini-2.5-flash-image-preview",
			messages: [
				{
					role: "user",
					content: [
						{
							type: "image_url",
							image_url: {
								url: image, // base64 格式的图片
							},
						},
						{
							type: "text",
							text: prompt,
						},
					],
				},
			],
			// 关键参数:指定需要生成图片
			modalities: ["image", "text"] as any,
		});

		console.log("API 完整响应:", JSON.stringify(completion, null, 2));

		// 检查响应的不同可能结构
		const choice = completion.choices[0];
		const message = choice?.message;

		console.log("Choice 内容:", JSON.stringify(choice, null, 2));
		console.log("Message:", JSON.stringify(message, null, 2));

		// 检查是否有图片数据
		let generatedImage = null;

		// 1. 优先检查 message.images 字段(图片生成的标准位置)
		if ((message as any)?.images && Array.isArray((message as any).images)) {
			const images = (message as any).images;
			console.log("找到 images 数组:", images.length, "张图片");

			if (images[0]) {
				// 图片可能在 image_url.url 或直接是字符串
				if (images[0].image_url?.url) {
					generatedImage = images[0].image_url.url;
					console.log("从 images[0].image_url.url 获取图片");
				} else if (typeof images[0] === "string") {
					generatedImage = images[0];
					console.log("从 images[0] 获取图片");
				} else if (images[0].url) {
					generatedImage = images[0].url;
					console.log("从 images[0].url 获取图片");
				}
			}
		}

		// 2. 检查 content 字段
		const messageContent = message?.content;
		if (!generatedImage && messageContent) {
			console.log("Message content:", messageContent);
			console.log("Message content type:", typeof messageContent);

			if (typeof messageContent === "string") {
				// 检查是否是 markdown 格式的图片
				const imageUrlMatch = messageContent.match(
					/!\[.*?\]\((https?:\/\/[^\)]+)\)/,
				);
				if (imageUrlMatch) {
					generatedImage = imageUrlMatch[1];
					console.log("从 markdown 提取图片 URL:", generatedImage);
				}
				// 检查是否是直接的 URL
				else if (messageContent.startsWith("http")) {
					generatedImage = messageContent;
					console.log("找到直接 URL:", generatedImage);
				}
				// 检查是否是 data URL (base64)
				else if (messageContent.startsWith("data:image/")) {
					generatedImage = messageContent;
					console.log("找到 base64 图片");
				}
			}
			// 检查 content 是否是数组
			else if (Array.isArray(messageContent)) {
				console.log("Content 是数组:", messageContent);
				for (const item of messageContent) {
					if (item.type === "image_url" && item.image_url?.url) {
						generatedImage = item.image_url.url;
						console.log("从 content 数组中提取图片 URL:", generatedImage);
						break;
					}
				}
			}
		}

		if (!generatedImage) {
			console.error("无法从响应中提取图片");
			console.error("完整响应结构:", JSON.stringify(completion, null, 2));
			return NextResponse.json(
				{
					error: "生成图片失败: API 没有返回图片内容",
					debug: {
						hasChoice: !!choice,
						hasMessage: !!message,
						hasImages: !!(message as any)?.images,
						hasContent: !!messageContent,
						contentType: typeof messageContent,
						messageContent: messageContent,
						fullResponse: completion,
					},
				},
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			image: generatedImage,
			rawContent: messageContent,
		});
	} catch (error) {
		console.error("API 错误详情:", error);
		const errorMessage = error instanceof Error ? error.message : "未知错误";
		const errorStack = error instanceof Error ? error.stack : "";

		return NextResponse.json(
			{
				error: "生成图片时出错",
				details: errorMessage,
				stack: errorStack,
			},
			{ status: 500 },
		);
	}
}
