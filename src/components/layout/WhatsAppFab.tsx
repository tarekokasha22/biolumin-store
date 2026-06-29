"use client";

import { useTranslations } from "next-intl";

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "201131701911";

export default function WhatsAppFab() {
  const t = useTranslations("fab");
  const th = useTranslations("hero");
  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(th("waMessage"))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={t("label")}
      className="bl-fab"
      style={{
        position: "fixed",
        insetInlineEnd: "22px",
        bottom: "22px",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "54px",
        width: "54px",
        borderRadius: "99px",
        background: "#1f8a5b",
        boxShadow: "0 10px 30px -8px rgba(31,138,91,.7)",
        textDecoration: "none",
      }}
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff">
        <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.8.7.7-2.8-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7.2 7.2 0 01-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 00-.7.3 2.8 2.8 0 00-.9 2.1 4.9 4.9 0 001 2.6 11.2 11.2 0 004.3 3.8c.6.3 1.1.4 1.5.5a3.6 3.6 0 001.6.1c.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.1z"/>
      </svg>
    </a>
  );
}
