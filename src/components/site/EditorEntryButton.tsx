"use client";

import Link from "next/link";

export function EditorEntryButton() {
  return (
    <Link className="editor-entry" href="/editor" prefetch>
      Editor local
    </Link>
  );
}
