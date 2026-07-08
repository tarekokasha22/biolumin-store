const GRADIENT = "linear-gradient(180deg, #f9f0d8, #dcbd80 46%, #a9854a)";
const WORD = ["B", "I", "O", "L", "U", "M", "I", "N"];

const gradientText = {
  background: GRADIENT,
  WebkitBackgroundClip: "text" as const,
  backgroundClip: "text" as const,
  WebkitTextFillColor: "transparent" as const,
};

function GlowDot({ delay }: { delay: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute" as const,
        left: "50%",
        // paddingTop on the parent span is 8px. The dot is 4px tall.
        // top: 2px → dot occupies 2px–6px, letter cap starts at ~8px.
        // That gives exactly 2px of breathing room between dot and letter.
        top: "2px",
        width: "4px",
        height: "4px",
        transform: "translateX(-50%)",
        borderRadius: "50%",
        background: "#48d6c2",
        boxShadow: "0 0 3px #48d6c2, 0 0 7px rgba(72,214,194,.85)",
        WebkitTextFillColor: "initial" as const,
        willChange: "opacity" as const,
        animationName: "logo-dot-pulse",
        animationDuration: "3.4s",
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite" as const,
        animationDelay: delay,
        display: "block",
      }}
    />
  );
}

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Pure-code wordmark — no image asset required.
 * The two "I"s in BIOLUMIN each carry a glowing teal dot centred
 * perfectly above the letter. Always LTR, always Cormorant Garamond,
 * regardless of page locale.
 */
export function Logo({ size = "md", className = "" }: Props) {
  const fontSize = size === "sm" ? "20px" : size === "lg" ? "32px" : "24px";
  const gap = "0.15em";

  return (
    <span
      dir="ltr"
      className={`inline-flex items-end font-medium ${className}`}
      style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize,
        // Use a fixed lineHeight so every letter sits on the same baseline
        lineHeight: 1,
        filter: "drop-shadow(0 1px 9px rgba(201,166,107,.28))",
        ...gradientText,
      }}
    >
      {WORD.map((letter, i) => {
        const spacing = i < WORD.length - 1 ? { marginInlineEnd: gap } : undefined;
        return letter === "I" ? (
          <span
            key={i}
            // paddingTop creates space so the dot doesn't get clipped
            style={{ position: "relative", display: "inline-block", paddingTop: "8px", ...gradientText, ...spacing }}
          >
            <GlowDot delay={i === 1 ? "0s" : "0.7s"} />
            {letter}
          </span>
        ) : (
          <span key={i} style={{ display: "inline-block", paddingTop: "8px", ...spacing }}>
            {letter}
          </span>
        );
      })}
    </span>
  );
}
