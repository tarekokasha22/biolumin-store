"use client";

import { useState } from "react";

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
      {/* Page header */}
      <div className="border-b border-ivory/8 bg-obsidian-soft/20 px-6 py-5 shrink-0">
        <p className="font-body text-[10px] uppercase tracking-[0.35em] text-champagne">Business Hub</p>
        <h1 className="font-display mt-1 text-2xl text-ivory">Creative & Content Tools</h1>
        <p className="font-body mt-1 text-xs text-ivory/35">All Biolumin brand intelligence — one place.</p>
      </div>

      {/* Tool switcher tabs */}
      <div className="border-b border-ivory/8 bg-obsidian shrink-0 px-6">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActive(tool.id)}
              className={`font-body flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-[11px] uppercase tracking-[0.15em] transition-colors -mb-px ${
                active === tool.id
                  ? "border-champagne text-champagne"
                  : "border-transparent text-ivory/35 hover:text-ivory"
              }`}
            >
              <span className="text-base leading-none">{tool.emoji}</span>
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active tool info bar */}
      <div className="border-b border-ivory/8 bg-obsidian/80 px-6 py-2 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <p className="font-body text-[11px] text-ivory/35 truncate">{activeTool.description}</p>
          <a
            href={activeTool.src}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body shrink-0 rounded-full border border-ivory/15 px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-ivory/45 hover:border-champagne hover:text-champagne transition-colors"
          >
            ↗ Full
          </a>
        </div>
      </div>

      {/* Iframe container */}
      <div className="relative flex-1 min-h-0">
        {TOOLS.map((tool) => (
          <iframe
            key={tool.id}
            src={tool.src}
            title={tool.label}
            className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${
              active === tool.id ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
