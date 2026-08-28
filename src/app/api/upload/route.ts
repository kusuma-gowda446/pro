import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a safe filename
    const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filename = `${Date.now()}-${originalName}`;
    
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filepath = path.join(uploadDir, filename);
    
    await writeFile(filepath, buffer);
    
    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
    
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
