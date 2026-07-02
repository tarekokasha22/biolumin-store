"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

type Status = "idle" | "submitting" | "success" | "error" | "invalid";

export function Newsletter() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus("invalid");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source: "footer" }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus(data.error === "invalid" ? "invalid" : "error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="relative mx-4 mb-4.5 overflow-hidden rounded-[20px] border border-champagne/20 bg-linear-to-br from-aqua/8 to-champagne/6 px-[22px] py-[30px] text-center">
      <div
        className="pointer-events-none absolute -top-10 end-[-40px] h-[140px] w-[140px] rounded-full blur-[6px]"
        style={{ background: "radial-gradient(circle, rgba(72,214,194,.18), transparent 70%)" }}
      />
      <div className="relative">
        <p className="font-body mb-2 text-[10px] tracking-[0.28em] text-aqua-light uppercase">{t("kicker")}</p>
        <h3 className="font-display text-[26px] leading-[1.15] text-white">{t("title")}</h3>
        <p className="font-body mx-auto mt-2.5 mb-4.5 max-w-[300px] text-[12.5px] leading-[1.6] text-ivory/66">
          {t("note")}
        </p>

        {status === "success" ? (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-body rounded-(--radius-input) border border-aqua/30 bg-aqua/10 py-4 text-sm text-aqua-light"
          >
            {t("success")}
          </motion.p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "invalid" || status === "error") setStatus("idle");
              }}
              placeholder={t("placeholder")}
              aria-label={t("placeholder")}
              className="font-body w-full rounded-(--radius-input) border border-greige/30 bg-[rgba(10,10,12,.55)] px-4 py-3.5 text-sm text-ivory outline-none placeholder:text-ivory/30"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="font-body w-full rounded-(--radius-input) bg-linear-to-r from-[#d8b87a] to-champagne py-3.5 text-sm font-semibold text-[#1a160d] disabled:opacity-50"
            >
              {status === "submitting" ? t("submitting") : t("cta")}
            </button>
          </form>
        )}

        {(status === "invalid" || status === "error") && (
          <p className="font-body mt-3 text-xs text-ivory/50">
            {status === "invalid" ? t("invalid") : t("error")}
          </p>
        )}
      </div>
    </section>
  );
}
