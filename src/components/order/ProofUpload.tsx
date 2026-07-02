"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

export function ProofUpload({
  orderId,
  initialUrl,
}: {
  orderId: string;
  initialUrl: string | null;
}) {
  const t = useTranslations("order");
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(false);
    try {
      const fd = new FormData();
      fd.append("orderId", orderId);
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUrl(data.url);
    } catch {
      setError(true);
    } finally {
      setUploading(false);
    }
  }

  if (url) {
    return (
      <div className="space-y-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="proof"
          className="max-h-64 rounded-sm border border-ivory/15"
        />
        <p className="font-body text-sm text-champagne">{t("uploaded")}</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="font-body text-[11px] uppercase tracking-[0.2em] text-ivory/50 underline-offset-4 hover:text-ivory hover:underline"
        >
          {t("uploadCta")}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={onPick}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="font-body rounded-full border border-champagne/50 px-8 py-3 text-xs uppercase tracking-[0.25em] text-ivory transition-all hover:bg-champagne hover:text-obsidian disabled:opacity-60"
      >
        {uploading ? t("uploading") : t("uploadCta")}
      </button>
      {error && (
        <p className="font-body mt-3 text-sm text-red-300">
          {t("uploading")}…
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onPick}
      />
    </div>
  );
}
