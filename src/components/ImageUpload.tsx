"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
	onImageSelect: (base64Image: string) => void;
	selectedImage: string | null;
}

export default function ImageUpload({
	onImageSelect,
	selectedImage,
}: ImageUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileSelect = (file: File) => {
		if (!file.type.startsWith("image/")) {
			alert("请选择图片文件");
			return;
		}

		if (file.size > 50 * 1024 * 1024) {
			alert("文件大小不能超过 50MB");
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const base64 = e.target?.result as string;
			onImageSelect(base64);
		};
		reader.readAsDataURL(file);
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const file = e.dataTransfer.files[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		onImageSelect("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleChange}
				className="hidden"
			/>

			{selectedImage ? (
				<div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
					<img
						src={selectedImage}
						alt="Selected"
						className="w-full h-48 object-cover"
					/>
					<Button
						size="sm"
						variant="destructive"
						className="absolute top-2 right-2"
						onClick={handleRemove}
					>
						<X className="w-4 h-4" />
					</Button>
				</div>
			) : (
				<div
					onClick={handleClick}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
						isDragging
							? "border-orange-500 bg-orange-50"
							: "border-gray-300 hover:border-orange-400"
					}`}
				>
					<div className="text-4xl mb-2">+</div>
					<p className="text-sm text-gray-600">添加图片</p>
					<p className="text-xs text-gray-500">最大 50MB</p>
					<p className="text-xs text-gray-400 mt-2">或拖放文件到此处</p>
				</div>
			)}
		</div>
	);
}
