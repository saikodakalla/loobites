import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { supabase } from "../lib/supabaseClient";
import { Avatar } from "./Avatar";
import {
  BellIcon,
  LogoMark,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "./icons";
import { useMenus } from "../hooks/useMenus";

export interface NavbarProps {
  dark: boolean;
  onToggleTheme: () => void;
  onNavigate: (route: string, params?: Record<string, unknown>) => void;
  activeRoute: string;
}

export function Navbar({
  dark,
  onToggleTheme,
  onNavigate,
  activeRoute,
}: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [shrink, setShrink] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { data } = useMenus();

  useEffect(() => {
    const onScroll = () => setShrink(window.scrollY > 6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setTimeout(() => setSearchMounted(false), 220);
  };

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") closeSearch();
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !data?.cafeterias) return [] as { name: string; cafeteria: string; station: string }[];
    const out: { name: string; cafeteria: string; station: string }[] = [];
    const cafes: any = data.cafeterias as any;
    for (const [slug, cafe] of Object.entries(cafes)) {
      for (const st of cafe.stations || []) {
        for (const it of st.items || []) {
          const name = String(it.name || "");
          if (name.toLowerCase().includes(q)) {
            out.push({ name, cafeteria: cafe.name || slug, station: st.station || "Menu" });
            if (out.length >= 12) return out;
          }
        }
      }
    }
    return out;
  }, [query, data]);

  return (
    <header className={`home-header${shrink ? " shrink" : ""}`} role="banner">
      <div className="home-container home-topnav">
        <nav className="home-topnav-inner" aria-label="Primary">
          <button
            className="home-brand-btn"
            type="button"
            aria-label="Go to Home"
            onClick={() => onNavigate("home")}
          >
            <span className="home-brand">
              <LogoMark color="#E7B83E" />
              <span className="home-wordmark">LooBites</span>
            </span>
          </button>

          <div className="home-nav-item">
            <a
              href="#"
              className={`home-nav-link${
                activeRoute === "home" ? " is-active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate("home");
              }}
            >
              Menu
            </a>
          </div>

          <div className="home-nav-item">
            <a
              href="#"
              className={`home-nav-link${
                activeRoute === "reviews" ? " is-active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate("reviews");
              }}
            >
              Reviews
            </a>
          </div>

          <div className="home-nav-item">
            <button
              className="home-icon-btn"
              type="button"
              aria-label="Search"
              onClick={() => {
                setSearchMounted(true);
                setSearchOpen(true);
              }}
            >
              <SearchIcon />
            </button>
          </div>

          <div className="home-nav-spacer" />

          <button
            className="home-icon-btn"
            type="button"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={dark ? "true" : "false"}
            onClick={onToggleTheme}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            className="home-icon-btn"
            type="button"
            aria-label="Notifications"
          >
            <BellIcon />
          </button>

          <div className="home-user">
            <button
              className="home-avatar-btn"
              type="button"
              aria-label="User menu"
              onClick={(e) => {
                const root = e.currentTarget.parentElement;
                root?.classList.toggle("open");
              }}
            >
              <Avatar />
            </button>
            <div className="home-user-menu" role="menu" aria-label="User menu">
              <a
                href="#"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("profile", { username: "me" });
                }}
              >
                Profile
              </a>
              <div className="menu-sep" aria-hidden="true" />
              <div className="menu-label" aria-hidden="true">Account</div>
              <a
                href="#"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("profile", { username: "me", manage: "email" });
                }}
              >
                Change email
              </a>
              <a
                href="#"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("profile", { username: "me", manage: "username" });
                }}
              >
                Change username
              </a>
              <a
                href="#"
                role="menuitem"
                className="danger"
                onClick={async (e) => {
                  e.preventDefault();
                  if (confirm("Delete your account? This cannot be undone.")) {
                    // Placeholder: app needs a server-side delete flow; for now, sign out.
                    try { await supabase?.auth?.signOut?.(); } finally { onNavigate("auth"); }
                  }
                }}
              >
                Delete account
              </a>
              <div className="menu-sep" aria-hidden="true" />
              <a
                href="#"
                role="menuitem"
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    await supabase?.auth?.signOut?.();
                  } finally {
                    onNavigate("auth");
                  }
                }}
              >
                Log out
              </a>
            </div>
          </div>
        </nav>
      </div>
      {searchMounted && (
        <div
          className={`cmd-overlay${!searchOpen ? " is-exiting" : ""}`}
          role="dialog"
          aria-modal="true"
          onClick={closeSearch}
        >
          <div
            className={`cmd-dialog${!searchOpen ? " is-exiting" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cmd-input-row">
              <span className="cmd-icon">
                <SearchIcon />
              </span>
              <input
                ref={searchRef}
                type="text"
                className="cmd-input"
                placeholder="Search dishes or cafeterias"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKey}
              />
              <button
                className="cmd-close"
                aria-label="Close"
                type="button"
                onClick={closeSearch}
              >
                Esc
              </button>
            </div>
            <div className="cmd-list" role="listbox" aria-label="Suggestions">
              {query.trim().length === 0 && (
                <div className="cmd-item" role="option" style={{opacity:0.7}}>
                  Start typing to search today’s dishes…
                </div>
              )}
              {query.trim().length > 0 && results.length === 0 && (
                <div className="cmd-item" role="option" style={{opacity:0.7}}>
                  No matches for “{query}”.
                </div>
              )}
              {results.map((r, i) => (
                <div
                  key={`${r.cafeteria}-${r.station}-${r.name}-${i}`}
                  className="cmd-item"
                  role="option"
                  onClick={() => {
                    setSearchOpen(false);
                    setTimeout(() => setSearchMounted(false), 200);
                    onNavigate("dish", { slug: r.name.toLowerCase().replace(/\s+/g, "-") });
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{r.cafeteria} • {r.station}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
