"use client";

import { useState } from "react";
import { getPageHref } from "./rendering";

type MobileNavProps = {
  brandName: string;
  pages: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export function MobileNav({
  brandName,
  pages,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <div className="mobile-nav-bar">
        <strong>{brandName}</strong>
        <button
          aria-controls="mobile-nav-drawer"
          aria-expanded={open}
          aria-label={open ? "Cerrar menu" : "Abrir menu"}
          className={`mobile-nav-toggle${open ? " open" : ""}`}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`mobile-nav-backdrop${open ? " open" : ""}`} onClick={closeMenu} />

      <aside className={`mobile-nav-drawer${open ? " open" : ""}`} id="mobile-nav-drawer">
        <div className="mobile-nav-header">
          <span className="eyebrow">Menu</span>
          <strong>{brandName}</strong>
        </div>

        <nav className="mobile-nav-links">
          {pages.slice(0, 6).map((page) => (
            <a href={getPageHref(page)} key={page} onClick={closeMenu}>
              {page}
            </a>
          ))}
        </nav>

        <div className="mobile-nav-actions">
          <a className="primary-button" href={primaryCtaHref} onClick={closeMenu}>
            {primaryCtaLabel}
          </a>
          <a className="secondary-button" href={secondaryCtaHref} onClick={closeMenu}>
            {secondaryCtaLabel}
          </a>
        </div>
      </aside>
    </>
  );
}
