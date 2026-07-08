"use client";

import { useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

const TOOLS = [
  {
    id: "prompt-library",
    label: "AI Prompt Library",
    emoji: "✦",
    description: "Pre-tuned AI prompts for every Biolumin campaign, video, and shoot.",
    src: "/prompt-library.html",
  },
  {
    id: "content-command-center",
    label: "Content Command Center",
    emoji: "◈",
    description: "Full content calendar, caption templates, and platform playbook.",
    src: "/content-command-center.html",
  },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

export function BusinessClient() {
  const [active, setActive] = useState<ToolId>("prompt-library");

  const activeTool = TOOLS.find((t) => t.id === active)!;

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      <AdminNav active="business" />

      {/* Page header */}
      <div className="border-b border-ivory/10 bg-obsidian-soft/20 px-4 py-4 sm:px-6 sm:py-5 shrink-0">
        <div className="mx-auto max-w-6xl">
          <p className="font-body text-[10px] uppercase tracking-[0.35em] text-champagne">
            Business Hub
          </p>
          <h1 className="font-display mt-1 text-xl text-ivory sm:text-2xl">
            Creative &amp; Content Tools
          </h1>
          <p className="font-body mt-1 text-xs text-ivory/40">
            All Biolumin brand intelligence — one place.
          </p>
        </div>
      </div>

      {/* Tool switcher tabs */}
      <div className="border-b border-ivory/10 bg-obsidian shrink-0 px-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActive(tool.id)}
              className={`font-body flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-[11px] uppercase tracking-[0.15em] transition-colors -mb-px sm:px-4 ${
                active === tool.id
                  ? "border-champagne text-champagne"
                  : "border-transparent text-ivory/40 hover:text-ivory"
              }`}
            >
              <span className="text-base leading-none">{tool.emoji}</span>
              <span className="hidden xs:inline sm:inline">{tool.label}</span>
              <span className="xs:hidden sm:hidden">
                {tool.label.split(" ").slice(0, 2).join(" ")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active tool info bar */}
      <div className="border-b border-ivory/10 bg-obsidian/80 px-4 py-2 sm:px-6 shrink-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="font-body text-[11px] text-ivory/40 truncate">
            {activeTool.description}
          </p>
          <a
            href={activeTool.src}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body shrink-0 rounded-full border border-ivory/20 px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-ivory/50 transition-colors hover:border-champagne hover:text-champagne"
          >
            ↗ Full
          </a>
        </div>
      </div>

      {/* Iframe container — fills remaining space */}
      <div className="relative flex-1 min-h-0">
        {TOOLS.map((tool) => (
          <iframe
            key={tool.id}
            src={tool.src}
            title={tool.label}
            className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${
              active === tool.id
                ? "opacity-100 z-10 pointer-events-auto"
                : "opacity-0 z-0 pointer-events-none"
            }`}
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
