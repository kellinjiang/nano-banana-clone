"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	ChevronDown,
	Sparkles,
	Zap,
	MessageSquare,
	Image,
	Target,
	Layers,
	Edit3,
	Star,
	Menu,
	Loader2,
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export default function EditorSection() {
	const [selectedImage, setSelectedImage] = useState<string>("");
	const [prompt, setPrompt] = useState<string>("");
	const [generatedImage, setGeneratedImage] = useState<string>("");
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const handleGenerate = async () => {
		if (!selectedImage) {
			setError("请先上传图片");
			return;
		}

		if (!prompt.trim()) {
			setError("请输入提示词");
			return;
		}

		setIsGenerating(true);
		setError("");
		setGeneratedImage("");

		try {
			console.log("发送请求到 /api/generate");

			const response = await fetch("/api/generate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					image: selectedImage,
					prompt: prompt,
				}),
			});

			const data = await response.json();
			console.log("API 响应数据:", data);
			console.log("API 响应完整内容:", JSON.stringify(data, null, 2));

			if (!response.ok) {
				// 如果有 debug 信息,打印出来
				if (data.debug) {
					console.error("Debug 信息:", data.debug);
					console.error("Full Response:", data.debug.fullResponse);
				}
				throw new Error(
					data.details || data.error || `HTTP ${response.status}`,
				);
			}

			if (data.image) {
				setGeneratedImage(data.image);
				console.log("生成成功，图片:", data.image.substring(0, 100));
			} else {
				throw new Error("API 返回的数据中没有图片");
			}
		} catch (err) {
			console.error("生成错误:", err);
			const errorMsg = err instanceof Error ? err.message : "生成图片时出错";
			setError(`错误: ${errorMsg}`);

			// 如果有 debug 信息,也显示在控制台
			if (err instanceof Error) {
				console.error("错误详情:", err);
			}
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<section className="py-16 px-4 bg-white/50">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-12">
					<Badge className="bg-orange-100 text-orange-800 mb-4">
						Get Started
					</Badge>
					<h2 className="text-4xl font-bold text-gray-900 mb-4">
						Try The AI Editor
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Experience the power of nano-banana's natural language image editing.
						Transform any photo with simple text commands
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					{/* Prompt Engine */}
					<Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200">
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
								<Sparkles className="w-5 h-5 text-white" />
							</div>
							<div>
								<h3 className="text-xl font-bold text-gray-900">Prompt Engine</h3>
								<p className="text-gray-600">
									Transform your image with AI-powered editing
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Button
									size="sm"
									className="bg-orange-500 hover:bg-orange-600 text-white"
								>
									<Image className="w-4 h-4 mr-2" />
									Image to Image
								</Button>
								<Button size="sm" variant="outline">
									Text to Image
								</Button>
							</div>

							<ImageUpload
								selectedImage={selectedImage}
								onImageSelect={setSelectedImage}
							/>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									<MessageSquare className="w-4 h-4 inline mr-1" />
									Main Prompt
								</label>
								<textarea
									className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
									rows={3}
									placeholder="A futuristic city powered by nano technology, golden hour lighting, ultra detailed..."
									value={prompt}
									onChange={(e) => setPrompt(e.target.value)}
								/>
							</div>

							{error && (
								<div className="bg-red-100 border border-red-200 rounded-lg p-3">
									<p className="text-sm text-red-800">{error}</p>
								</div>
							)}

							<Button
								onClick={handleGenerate}
								disabled={isGenerating}
								className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-3"
							>
								{isGenerating ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Generating...
									</>
								) : (
									<>
										<Zap className="w-4 h-4 mr-2" />
										Generate Now
									</>
								)}
							</Button>
						</div>
					</Card>

					{/* Output Gallery */}
					<Card className="p-6 bg-white border-gray-200">
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
								<Image className="w-5 h-5 text-white" />
							</div>
							<div>
								<h3 className="text-xl font-bold text-gray-900">
									Output Gallery
								</h3>
								<p className="text-gray-600">
									Your ultra-fast AI creations appear here instantly
								</p>
							</div>
						</div>

						<div className="bg-gray-50 rounded-lg overflow-hidden">
							{isGenerating ? (
								<div className="p-12 text-center">
									<Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
									<h4 className="text-lg font-semibold text-gray-900 mb-2">
										Generating your image...
									</h4>
									<p className="text-gray-600 mb-2">
										Nano Banana AI is working its magic
									</p>
									<p className="text-xs text-gray-500">
										This may take up to 2 minutes, please wait...
									</p>
								</div>
							) : generatedImage ? (
								<div className="relative">
									<img
										src={generatedImage}
										alt="Generated"
										className="w-full h-auto"
									/>
									<div className="absolute bottom-3 right-3 flex space-x-2">
										<Button
											size="sm"
											className="bg-white/90 hover:bg-white text-gray-900"
											onClick={() => {
												const link = document.createElement("a");
												link.href = generatedImage;
												link.download = "nano-banana-generated.png";
												link.click();
											}}
										>
											Download
										</Button>
									</div>
								</div>
							) : (
								<div className="p-12 text-center">
									<div className="w-20 h-20 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
										<Image className="w-8 h-8 text-gray-400" />
									</div>
									<h4 className="text-lg font-semibold text-gray-900 mb-2">
										Ready for instant generation
									</h4>
									<p className="text-gray-600">Enter your prompt and unleash the power</p>
								</div>
							)}
						</div>
					</Card>
				</div>
			</div>
		</section>
	);
}
