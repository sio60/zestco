import { useEffect, useState } from "react";

const NAV = [
  { label: "About us & History", href: "#about" },
  { label: "Brand", href: "#brand" },
  { label: "Products", href: "#products" },
  { label: "Where to Buy", href: "#stores" },
  { label: "SNS", href: "#sns" },
  { label: "Contact", href: "#contact" },
  { label: "Notice", href: "#notice" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* 그리드 왼쪽 빈 칸 */}
        <div aria-hidden className="spacer" />
        {/* 중앙 로고 */}
        <a className="site-logo" href="/">
          <img src="/icons/logo.png" alt="Zestco logo" />
        </a>
        {/* 오른쪽 MENU + 햄버거 */}
        <button
          className="menu-cta"
          aria-label="Open menu"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span className="menu-label">MENU</span>
          <img className="menu-icon" src="/icons/hamburger.png" alt="" />
        </button>
      </div>

      {/* 오버레이 & 오른쪽 드로어 */}
      <div
        className={`backdrop ${open ? "is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <aside
        className={`drawer ${open ? "is-open" : ""}`}
        role="menu"
        aria-label="Navigation"
      >
        <div className="drawer-header">
          <span>Menu</span>
          <button
            className="btn-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6l-12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <ul className="drawer-list">
          {NAV.map((n) => (
            <li key={n.label}>
              <a
                href={n.href}
                className="drawer-link"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </header>
  );
}
