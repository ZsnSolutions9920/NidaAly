import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN is not configured. Go to Vercel Dashboard → Storage → Create Blob Store." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploaded: { url: string; name: string }[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `products/${uuidv4()}.${ext}`;

      const blob = await put(filename, file, {
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      uploaded.push({
        url: blob.url,
        name: file.name,
      });
    }

    return NextResponse.json({ files: uploaded });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
