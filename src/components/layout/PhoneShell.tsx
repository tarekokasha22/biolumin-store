import { Spores } from "@/components/motion/Spores";
import { LightField } from "@/components/motion/LightField";

/**
 * The whole app renders inside a centered, phone-width column — a
 * deliberate choice (not a responsive fallback): the brand is built as
 * a native-feeling mobile experience at every viewport, letterboxed on
 * wide screens with the ambient glow/spore field showing around it.
 */
export function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-svh bg-page">
      <Spores />
      <LightField />
      <div className="relative z-10 mx-auto min-h-svh w-full max-w-(--shell-width) overflow-x-hidden bg-obsidian shadow-[0_0_80px_rgba(0,0,0,0.6)]">
        {children}
      </div>
    </div>
  );
}
