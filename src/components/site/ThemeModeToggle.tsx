"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "codex-theme-mode";

function detectCurrentTheme(): ThemeMode {
  if (typeof document === "undefined") {
    return "dark";
  }

  const shell = document.querySelector(".page-shell");
  if (shell?.classList.contains("theme-light")) {
    return "light";
  }

  return "dark";
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.querySelectorAll(".page-shell").forEach((node) => {
    node.classList.remove("theme-light", "theme-dark");
    node.classList.add(theme === "light" ? "theme-light" : "theme-dark");
  });

  document.documentElement.dataset.themeMode = theme;
}

type ThemeModeToggleProps = {
  editorMode?: boolean;
};

export function ThemeModeToggle({ editorMode = false }: ThemeModeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedTheme = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const initialTheme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : detectCurrentTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || typeof window === "undefined") {
      return;
    }

    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [ready, theme]);

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  const label = theme === "light" ? "Modo claro" : "Modo oscuro";

  return (
    <button
      aria-label={label}
      className={`theme-toggle theme-toggle-${theme}${editorMode ? " is-editor" : ""}`}
      onClick={toggleTheme}
      type="button"
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {theme === "light" ? (
          <svg viewBox="0 0 24 24" role="presentation">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 1.8v3.1M12 19.1v3.1M4.3 4.3l2.2 2.2M17.5 17.5l2.2 2.2M1.8 12h3.1M19.1 12h3.1M4.3 19.7l2.2-2.2M17.5 6.5l2.2-2.2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" role="presentation">
            <path d="M14.9 2.3a9.7 9.7 0 1 0 6.8 16.5A8.7 8.7 0 0 1 14.9 2.3Z" />
          </svg>
        )}
      </span>
      <span className="theme-toggle-label">{label}</span>
    </button>
  );
}
