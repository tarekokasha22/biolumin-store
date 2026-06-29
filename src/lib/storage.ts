import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Persist an uploaded image and return its public URL.
 *
 * Production (Vercel): uploads to Vercel Blob when BLOB_READ_WRITE_TOKEN is set —
 * the local filesystem is read-only/ephemeral on serverless, so disk writes fail.
 * Development: falls back to writing under /public/uploads so the local flow works
 * without any cloud token.
 *
 * @param bytes    file contents
 * @param ext      file extension without the dot (e.g. "jpg")
 * @param prefix   logical folder, e.g. "" for proofs or "products" for product images
 * @param contentType MIME type, used for the Blob upload
 */
export async function saveUpload(
  bytes: Buffer,
  ext: string,
  prefix: string,
  contentType: string,
): Promise<string> {
  const name = `${randomUUID()}.${ext}`;
  const key = prefix ? `${prefix}/${name}` : name;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${key}`, bytes, {
      access: "public",
      contentType,
    });
    return blob.url;
  }

  // Local dev fallback — write to /public/uploads/<prefix>/<name>
  const dir = path.join(process.cwd(), "public", "uploads", prefix);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${key}`;
}
