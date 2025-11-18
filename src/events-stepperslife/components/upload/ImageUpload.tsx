"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import imageCompression from "browser-image-compression";

interface ImageUploadProps {
  onImageUploaded: (storageId: Id<"_storage">) => void;
  onImageRemoved?: () => void;
  currentImageId?: Id<"_storage">;
  currentImageUrl?: string;
  required?: boolean;
}

export function ImageUpload({
  onImageUploaded,
  onImageRemoved,
  currentImageId,
  currentImageUrl,
  required = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.files.mutations.generateUploadUrl);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate original file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setCompressionProgress(0);

    try {
      console.log(`Original image size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

      // Compress image
      const compressionOptions = {
        maxSizeMB: 2, // Target max size of 2MB
        maxWidthOrHeight: 1920, // Max dimension
        useWebWorker: true,
        fileType: file.type,
        initialQuality: 0.85, // 85% quality
        onProgress: (progress: number) => {
          setCompressionProgress(progress);
        },
      };

      const compressedFile = await imageCompression(file, compressionOptions);
      console.log(`Compressed image size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload the compressed file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": compressedFile.type },
        body: compressedFile,
      });

      const { storageId } = await result.json();

      // Create preview from compressed file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

      // Notify parent
      onImageUploaded(storageId);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      setCompressionProgress(0);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageRemoved?.();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload"
      />

      {previewUrl ? (
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
          <Image src={previewUrl} alt="Event preview" fill className="object-cover" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg hover:border-primary transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 ${
            required ? "border-red-300" : "border-gray-300"
          }`}
        >
          <div className="flex flex-col items-center justify-center py-8">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                {compressionProgress > 0 && compressionProgress < 100 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">Optimizing image...</p>
                    <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${compressionProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{compressionProgress}%</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">Uploading...</p>
                )}
              </>
            ) : (
              <>
                <ImageIcon className={`w-12 h-12 mb-4 ${required ? "text-red-400" : "text-gray-400"}`} />
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload event image{required && " *"}
                  </p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (auto-optimized)</p>
                {required && (
                  <p className="text-xs text-red-600 mt-2 font-medium">Required</p>
                )}
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}
