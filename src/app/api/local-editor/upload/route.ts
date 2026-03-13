import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";
import { getBaseSiteContent, mergeSiteContent } from "@/lib/site-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const execFileAsync = promisify(execFile);

const imageTargetSchema = z
  .string()
  .trim()
  .regex(/^(brand\.heroImageSrc|galleryItems\.\d+\.imageSrc|services\.\d+\.imageSrc|products\.\d+\.imageSrc|testimonials\.\d+\.avatarSrc)$/);
const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".jfif", ".png", ".webp", ".gif", ".bmp", ".svg", ".avif"]);
const PASSTHROUGH_IMAGE_EXTENSIONS = new Set([".svg", ".gif"]);
const MAX_RAW_UPLOAD_BYTES = 28 * 1024 * 1024;
const MAX_SAVED_UPLOAD_BYTES = 8 * 1024 * 1024;
const PRIMARY_MAX_DIMENSION = 2800;
const FALLBACK_MAX_DIMENSION = 2200;

function editorEnabled() {
  return process.env.NODE_ENV === "development" || process.env.ALLOW_LOCAL_EDITOR === "true";
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "-").replace(/-+/g, "-").toLowerCase();
}

function isSupportedImageUpload(file: File) {
  const safeName = sanitizeFileName(file.name || "");
  const extension = path.extname(safeName).toLowerCase();
  const mimeType = String(file.type || "").trim().toLowerCase();

  if (mimeType.startsWith("image/")) {
    return true;
  }

  if ((mimeType === "" || mimeType === "application/octet-stream") && ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return true;
  }

  return false;
}

async function prepareImageAsset(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = sanitizeFileName(file.name || "asset");
  const originalExtension = path.extname(safeName).toLowerCase() || ".png";

  if (bytes.length > MAX_RAW_UPLOAD_BYTES) {
    throw new Error("La imagen original supera el limite de 28 MB.");
  }

  if (PASSTHROUGH_IMAGE_EXTENSIONS.has(originalExtension)) {
    if (bytes.length > MAX_SAVED_UPLOAD_BYTES) {
      throw new Error("Ese formato no puede optimizarse automaticamente por debajo de 8 MB. Usa JPG, PNG, WEBP o AVIF.");
    }

    return {
      buffer: bytes,
      extension: originalExtension,
      optimized: false,
      originalBytes: bytes.length,
      finalBytes: bytes.length,
    };
  }

  const buildWebp = async (maxDimension: number, quality: number, alphaQuality: number) => {
    const image = sharp(bytes, { failOn: "none", animated: false });
    const metadata = await image.metadata();
    let pipeline = image.rotate();

    if ((metadata.width ?? 0) > maxDimension || (metadata.height ?? 0) > maxDimension) {
      pipeline = pipeline.resize({
        width: maxDimension,
        height: maxDimension,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const optimizedBuffer = await pipeline.webp({
      quality,
      alphaQuality,
      effort: 6,
    }).toBuffer();

    return {
      buffer: optimizedBuffer,
    };
  };

  const firstPass = await buildWebp(PRIMARY_MAX_DIMENSION, 86, 92);
  let finalBuffer = firstPass.buffer;

  if (finalBuffer.length > MAX_SAVED_UPLOAD_BYTES) {
    const fallbackPass = await buildWebp(FALLBACK_MAX_DIMENSION, 80, 86);
    finalBuffer = fallbackPass.buffer;
  }

  if (bytes.length <= MAX_SAVED_UPLOAD_BYTES && finalBuffer.length >= bytes.length) {
    return {
      buffer: bytes,
      extension: originalExtension,
      optimized: false,
      originalBytes: bytes.length,
      finalBytes: bytes.length,
    };
  }

  if (finalBuffer.length > MAX_SAVED_UPLOAD_BYTES) {
    throw new Error("No pudimos optimizar la imagen por debajo de 8 MB. Reduce dimensiones o exportala como WEBP/JPG.");
  }

  return {
    buffer: finalBuffer,
    extension: ".webp",
    optimized: true,
    originalBytes: bytes.length,
    finalBytes: finalBuffer.length,
  };
}

function setNestedValue(target: Record<string, unknown>, fieldPath: string, value: string) {
  const segments = fieldPath.split(".");
  let current: Record<string, unknown> | unknown[] = target;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const isLast = index === segments.length - 1;
    const nextSegment = segments[index + 1];
    const nextIsIndex = typeof nextSegment === "string" && /^\d+$/.test(nextSegment);

    if (/^\d+$/.test(segment)) {
      if (!Array.isArray(current)) {
        throw new Error(`Ruta invalida para array: ${fieldPath}`);
      }

      const numericIndex = Number(segment);
      if (isLast) {
        current[numericIndex] = value;
        return;
      }

      const existing = current[numericIndex];
      if (existing === undefined || existing === null || typeof existing !== "object") {
        current[numericIndex] = nextIsIndex ? [] : {};
      }
      current = current[numericIndex] as Record<string, unknown> | unknown[];
      continue;
    }

    if (Array.isArray(current)) {
      throw new Error(`Ruta invalida para objeto: ${fieldPath}`);
    }

    if (isLast) {
      current[segment] = value;
      return;
    }

    const existing = current[segment];
    if (existing === undefined || existing === null || typeof existing !== "object") {
      current[segment] = nextIsIndex ? [] : {};
    }
    current = current[segment] as Record<string, unknown> | unknown[];
  }
}

async function syncClientContentFiles() {
  const syncScriptPath = path.join(process.cwd(), "scripts", "sync-content-from-config.mjs");

  try {
    await fs.access(syncScriptPath);
  } catch {
    return;
  }

  await execFileAsync(process.execPath, [syncScriptPath], {
    cwd: process.cwd(),
  });
}

async function persistImageReference(fieldPath: string, src: string) {
  const configDir = path.join(process.cwd(), "config");
  const siteContentPath = path.join(configDir, "site-content.json");
  const localEditorPath = path.join(configDir, "local-editor-content.json");
  await fs.mkdir(configDir, { recursive: true });

  const baseContent = getBaseSiteContent();
  const nextContent = mergeSiteContent(baseContent, {}) as Record<string, unknown>;
  setNestedValue(nextContent, fieldPath, src);
  await fs.writeFile(siteContentPath, `${JSON.stringify(nextContent, null, 2)}\n`, "utf8");
  await fs.writeFile(localEditorPath, "{}\n", "utf8");
  await syncClientContentFiles();
}

export async function POST(request: Request) {
  try {
    if (!editorEnabled()) {
      return NextResponse.json({ ok: false, message: "Editor local deshabilitado." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const target = formData.get("target");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "No se envio ningun archivo." }, { status: 400 });
    }

    if (!isSupportedImageUpload(file)) {
      return NextResponse.json({ ok: false, message: "Formato no permitido. Usa JPG, JPEG, JFIF, PNG, WEBP, GIF, BMP, SVG o AVIF." }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "assets", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const preparedAsset = await prepareImageAsset(file);
    const safeName = sanitizeFileName(file.name);
    const sourceExtension = path.extname(safeName) || ".png";
    const outputExtension = preparedAsset.extension || sourceExtension;
    const baseName = path.basename(safeName, sourceExtension) || "asset";
    const fileName = `${baseName}-${randomUUID()}${outputExtension}`;
    const targetPath = path.join(uploadsDir, fileName);
    const src = `/assets/uploads/${fileName}`;

    await fs.writeFile(targetPath, preparedAsset.buffer);

    if (typeof target === "string" && target.trim() !== "") {
      const parsedTarget = imageTargetSchema.safeParse(target);
      if (!parsedTarget.success) {
        await fs.unlink(targetPath).catch(() => undefined);
        return NextResponse.json({ ok: false, message: "Destino de imagen invalido." }, { status: 400 });
      }

      try {
        await persistImageReference(parsedTarget.data, src);
      } catch (error) {
        await fs.unlink(targetPath).catch(() => undefined);
        throw error;
      }
    }

    return NextResponse.json({
      ok: true,
      src,
      optimized: preparedAsset.optimized,
      originalBytes: preparedAsset.originalBytes,
      finalBytes: preparedAsset.finalBytes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "No se pudo guardar la imagen en local.",
      },
      { status: 500 },
    );
  }
}
