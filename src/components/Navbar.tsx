import { useEffect, useRef, useState } from "react";
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
  const [cafesOpen, setCafesOpen] = useState(false);
  const [shrink, setShrink] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const cafItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const cafRef = useRef<HTMLDivElement | null>(null);

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

  const onCafKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!cafesOpen) return;
    const items = cafItemsRef.current.filter((el): el is HTMLAnchorElement =>
      Boolean(el),
    );
    const idx = items.findIndex((el) => el === document.activeElement);
    if (e.key === "Escape") setCafesOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      (items[idx + 1] || items[0])?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      (items[idx - 1] || items[items.length - 1])?.focus();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!cafesOpen) return;
      if (cafRef.current && !cafRef.current.contains(event.target as Node)) {
        setCafesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cafesOpen]);

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

          <div
            ref={cafRef}
            className={`home-nav-item has-dropdown${
              cafesOpen ? " is-open" : ""
            }`}
            onKeyDown={onCafKey}
          >
            <a
              href="#"
              className={`home-nav-link${
                activeRoute === "cafeteria" ? " is-active" : ""
              }`}
              aria-haspopup="true"
              aria-expanded={cafesOpen ? "true" : "false"}
              onClick={(e) => {
                e.preventDefault();
                setCafesOpen((open) => !open);
              }}
            >
              Cafeterias
            </a>
            <div className="home-dropdown" role="menu" aria-label="Cafeterias">
              <a
                ref={(el) => (cafItemsRef.current[0] = el)}
                href="#"
                role="menuitem"
                className="home-dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  setCafesOpen(false);
                  onNavigate("cafeteria", {
                    slug: "cmh",
                    name: "The Market (CMH)",
                  });
                }}
              >
                The Market (CMH)
              </a>
              <a
                ref={(el) => (cafItemsRef.current[1] = el)}
                href="#"
                role="menuitem"
                className="home-dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  setCafesOpen(false);
                  onNavigate("cafeteria", {
                    slug: "v1",
                    name: "Mudie's (Village 1)",
                  });
                }}
              >
                Mudie's (Village 1)
              </a>
              <a
                ref={(el) => (cafItemsRef.current[2] = el)}
                href="#"
                role="menuitem"
                className="home-dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  setCafesOpen(false);
                  onNavigate("cafeteria", {
                    slug: "rev",
                    name: "REVelation (Ron Eydt Village)",
                  });
                }}
              >
                REVelation (Ron Eydt Village)
              </a>
            </div>
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
              <a href="#" role="menuitem" onClick={(e) => e.preventDefault()}>
                My posts
              </a>
              <a href="#" role="menuitem" onClick={(e) => e.preventDefault()}>
                Settings
              </a>
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
              <div className="cmd-item" role="option">
                Try “Butter Chicken”
              </div>
              <div className="cmd-item" role="option">
                Open “REVelation”
              </div>
              <div className="cmd-item" role="option">
                See “Past Meals”
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
