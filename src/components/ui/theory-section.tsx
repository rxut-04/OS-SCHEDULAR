"use client";

import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";

interface TheorySectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function TheorySection({ title, children, defaultOpen = false }: TheorySectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-secondary)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <span className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[var(--accent-tertiary)]" />
          {title}
        </span>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-[var(--text-secondary)] text-sm leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:my-2 [&_li]:mb-1">
          {children}
        </div>
      )}
    </div>
  );
}
