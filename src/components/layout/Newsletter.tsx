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
    <section className="border-t border-greige/15 bg-obsidian px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-body text-[11px] uppercase tracking-[0.35em] text-champagne">
          {t("kicker")}
        </p>
        <h2 className="font-display mt-4 text-3xl text-ivory sm:text-4xl">
          {t("title")}
        </h2>
        <p className="font-body mx-auto mt-5 max-w-md text-sm leading-relaxed text-ivory/55">
          {t("note")}
        </p>

        {status === "success" ? (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-body mt-10 text-sm text-aqua"
          >
            {t("success")}
          </motion.p>
        ) : (
          <form
            onSubmit={submit}
            className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "invalid" || status === "error") setStatus("idle");
              }}
              placeholder={t("placeholder")}
              aria-label={t("placeholder")}
              className="font-body w-full flex-1 border-b border-ivory/20 bg-transparent px-1 py-2 text-center text-base text-ivory placeholder:text-ivory/30 focus:border-champagne focus:outline-none sm:text-start"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="font-body whitespace-nowrap border border-champagne/50 px-7 py-2.5 text-xs uppercase tracking-[0.2em] text-champagne transition-colors duration-500 hover:bg-champagne hover:text-obsidian disabled:opacity-50"
            >
              {status === "submitting" ? t("submitting") : t("cta")}
            </button>
          </form>
        )}

        {(status === "invalid" || status === "error") && (
          <p className="font-body mt-4 text-xs text-ivory/50">
            {status === "invalid" ? t("invalid") : t("error")}
          </p>
        )}
      </div>
    </section>
  );
}
