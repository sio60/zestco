import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const NAV = [
  { label: "About us & History", to: "/about" },
  { label: "Brand", to: "/brand" },
  { label: "Products", to: "/products" },
  { label: "Where to Buy", to: "/stores" },
  { label: "SNS", to: "/sns" },
  { label: "Contact", to: "/contact" },
  { label: "Notice", to: "/notice" },
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
        {/* 왼쪽 여백 */}
        <div aria-hidden className="spacer" />

        {/* 중앙 로고 (홈으로 이동) */}
        <Link className="site-logo" to="/" onClick={() => setOpen(false)}>
          <img src="/icons/logo.png" alt="Zestco logo" />
        </Link>

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

      {/* 반투명 오버레이 */}
      <div
        className={`backdrop ${open ? "is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* 오른쪽 슬라이드 메뉴 */}
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

        {/* 메뉴 항목 */}
        <ul className="drawer-list">
          {NAV.map((n) => (
            <li key={n.label}>
              <Link
                to={n.to}
                className="drawer-link"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </header>
  );
}
