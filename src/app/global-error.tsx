"use client";

// Last-resort boundary: this replaces the root layout, so there is no intl
// provider, no fonts and no globals guaranteed. Keep it fully self-contained
// with inline brand colors. Bilingual (AR + EN) since we can't read the locale.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          background: "#0e0e10",
          color: "#f4f0e9",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", margin: 0, color: "#c9a66b" }}>
          لحظة عتمة · A moment of darkness
        </h1>
        <p style={{ maxWidth: 420, lineHeight: 1.6, opacity: 0.7, margin: 0 }}>
          حصل خطأ غير متوقع. جرّبي تاني.
          <br />
          Something went wrong. Please try again.
        </p>
        <button
          onClick={() => reset()}
          style={{
            cursor: "pointer",
            background: "transparent",
            border: "1px solid rgba(201,166,107,0.6)",
            color: "#c9a66b",
            borderRadius: 999,
            padding: "0.85rem 2rem",
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          جرّبي تاني · Try again
        </button>
      </body>
    </html>
  );
}
