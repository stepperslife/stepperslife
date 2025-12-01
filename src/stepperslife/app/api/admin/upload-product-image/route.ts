import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Calculate file hash for duplicate detection
async function calculateFileHash(buffer: Buffer): Promise<string> {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Calculate file hash for unique naming
    const fileHash = await calculateFileHash(buffer);

    // Optimize image with sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, null, {
        // Resize width to 1200px, maintain aspect ratio
        withoutEnlargement: true,
        fit: "inside",
      })
      .jpeg({
        quality: 85, // Good quality while reducing file size
        progressive: true,
      })
      .toBuffer();

    // Get upload URL from Convex
    const uploadUrl = await convex.mutation(api.upload.generateUploadUrl);

    // Upload to Convex storage
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: optimizedBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Convex upload failed: ${uploadResponse.statusText}`);
    }

    const { storageId } = await uploadResponse.json();

    // Get the public URL for the uploaded file
    const imageUrl = await convex.mutation(api.upload.getImageUrl, { storageId });

    // Calculate sizes for reporting
    const originalSize = buffer.length;
    const optimizedSize = optimizedBuffer.length;
    const savedBytes = originalSize - optimizedSize;
    const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

    return NextResponse.json({
      success: true,
      storageId,
      hash: fileHash,
      url: imageUrl,
      originalSize,
      optimizedSize,
      savedBytes,
      savedPercent: `${savedPercent}%`,
    });
  } catch (error) {
    console.error("Product image upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload product image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
