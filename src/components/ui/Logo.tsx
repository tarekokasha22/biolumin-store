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
      className="absolute top-[-0.34em] left-1/2 h-[0.14em] w-[0.14em] -translate-x-1/2 rounded-full bg-aqua-light [animation:logo-dot-pulse_3.4s_ease-in-out_infinite]"
      style={{
        WebkitTextFillColor: "initial",
        boxShadow: "0 0 5px #48d6c2, 0 0 12px rgba(72,214,194,.85)",
        animationDelay: delay,
      }}
    />
  );
}

type Props = {
  size?: "sm" | "md";
  className?: string;
};

/**
 * Pure-code wordmark — no logo image. The brand name is not a design
 * asset, it's the two "i"s in BIOLUMIN carrying a glowing, pulsing
 * teal dot. Always LTR and always Cormorant Garamond regardless of
 * page locale — the brand name itself never mirrors or re-fonts.
 */
export function Logo({ size = "md", className = "" }: Props) {
  const gap = "0.17em";
  return (
    <span
      dir="ltr"
      className={`inline-flex items-start font-medium ${className}`}
      style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: size === "sm" ? "21px" : "23px",
        lineHeight: 1,
        filter: "drop-shadow(0 1px 9px rgba(201,166,107,.3))",
        ...gradientText,
      }}
    >
      {WORD.map((letter, i) => {
        const spacing = i < WORD.length - 1 ? { marginInlineEnd: gap } : undefined;
        return letter === "I" ? (
          <span
            key={i}
            className="relative inline-block"
            style={{ ...gradientText, ...spacing }}
          >
            <GlowDot delay={i === 1 ? "0s" : "0.7s"} />
            {letter}
          </span>
        ) : (
          <span key={i} style={spacing}>
            {letter}
          </span>
        );
      })}
    </span>
  );
}
