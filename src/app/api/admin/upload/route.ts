import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const uploaded: { url: string; name: string }[] = [];

    for (const file of files) {
      const ext = path.extname(file.name) || ".jpg";
      const filename = `${uuidv4()}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filepath = path.join(UPLOAD_DIR, filename);

      await writeFile(filepath, buffer);
      uploaded.push({
        url: `/uploads/${filename}`,
        name: file.name,
      });
    }

    return NextResponse.json({ files: uploaded });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
