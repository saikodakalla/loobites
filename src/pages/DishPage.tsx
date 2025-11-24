import { useMemo } from "react";
import { Navbar } from "../components/Navbar";
import { formatMenuId } from "../lib/format";

interface DishPageProps {
  dark: boolean;
  onToggleTheme: () => void;
  onNavigate: (route: string, params?: Record<string, unknown>) => void;
  params?: Record<string, unknown>;
  session: unknown;
}

export function DishPage({
  dark,
  onToggleTheme,
  onNavigate,
  params,
}: DishPageProps) {
  const menuId = (params?.slug as string) || "";
  const dishName = formatMenuId(menuId) || "Dish";

  const renderedReviews = useMemo(() => {
    return <div className="reviews-empty">Reviews are currently disabled.</div>;
  }, []);

  return (
    <div className={`home-app ${dark ? "theme-dark" : ""}`}>
      <Navbar
        dark={dark}
        onToggleTheme={onToggleTheme}
        onNavigate={onNavigate}
        activeRoute="dish"
      />
      <main className="home-main" role="main">
        <div className="home-container">
          <h1 className="page-title">{dishName}</h1>

          <div className="dish-meta-block">
            Served at{" "}
            <button
              className="pill-link"
              onClick={() =>
                onNavigate("cafeteria", { slug: "rev", name: "REVelation" })
              }
            >
              REV
            </button>
          </div>

          <section aria-label="Reviews" className="reviews-section">
            <div className="reviews">{renderedReviews}</div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default DishPage;
