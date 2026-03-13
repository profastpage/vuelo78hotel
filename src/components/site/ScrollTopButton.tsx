"use client";

import { useEffect, useState } from "react";

type ScrollTopButtonProps = {
  editorMode?: boolean;
};

export function ScrollTopButton({ editorMode = false }: ScrollTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 260);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <button
      aria-label="Subir al inicio"
      className={`scroll-top-button${visible ? " is-visible" : ""}${editorMode ? " is-editor" : ""}`}
      onClick={scrollToTop}
      type="button"
    >
      <svg viewBox="0 0 24 24" role="presentation">
        <path d="M12 6.5 6.5 12M12 6.5 17.5 12M12 6.5V18" />
      </svg>
    </button>
  );
}
