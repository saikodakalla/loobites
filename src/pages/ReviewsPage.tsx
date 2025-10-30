import { useEffect, useMemo, useState } from "react";
import { Navbar } from "../components/Navbar";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { fetchApi } from "../lib/api";
import { formatMenuId, starsFor } from "../lib/format";

interface ReviewsPageProps {
  dark: boolean;
  onToggleTheme: () => void;
  onNavigate: (route: string, params?: Record<string, unknown>) => void;
}

interface Review {
  id?: string;
  menuId?: string;
  author?: string;
  rating?: number;
  title?: string;
  body?: string;
  createdAt?: string;
  imageUrl?: string | null;
  mlLabel?: string | null;
}

export function ReviewsPage({
  dark,
  onToggleTheme,
  onNavigate,
}: ReviewsPageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("all");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchApi("/api/reviews");
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(payload?.error || "Failed to load reviews");
        }
        if (mounted) setReviews(Array.isArray(payload) ? payload : []);
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Failed to load reviews");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const menuOptions = useMemo(() => {
    const ids = new Set<string>();
    reviews.forEach((r) => {
      if (r.menuId) ids.add(r.menuId);
    });
    return Array.from(ids.values()).sort();
  }, [reviews]);

  const filtered = useMemo(() => {
    if (selectedMenu === "all") return reviews;
    return reviews.filter((r) => r.menuId === selectedMenu);
  }, [reviews, selectedMenu]);

  return (
    <div className={`home-app ${dark ? "theme-dark" : ""}`}>
      <Navbar
        dark={dark}
        onToggleTheme={onToggleTheme}
        onNavigate={onNavigate}
        activeRoute="reviews"
      />

      <main className="home-main" role="main">
        <div className="home-container">
          <h1 className="page-title">Community Reviews</h1>
          <p className="page-subtitle">
            See what diners are saying across menus.
          </p>

          <div className="reviews-controls">
            <label className="reviews-filter">
              <span>Filter by menu</span>
              <select
                value={selectedMenu}
                onChange={(event) => setSelectedMenu(event.target.value)}
              >
                <option value="all">All menus</option>
                {menuOptions.map((id) => (
                  <option key={id} value={id}>
                    {formatMenuId(id)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading && <LoadingSpinner label="Loading reviews…" />}
          {!!error && (
            <div className="reviews-error" role="alert">
              {error}
            </div>
          )}
          {!loading && !error && (
            <div className="reviews-grid">
              {filtered.map((review, idx) => {
                const img = review.imageUrl;
                return (
                  <div className="review-card" key={review.id || idx}>
                    <div className="review-head">
                      <div className="review-meta">
                        <div className="review-title">
                          {review.title || "Untitled review"}
                        </div>
                        <div className="review-sub">
                          {review.author || "Anonymous"} &middot;{" "}
                          {review.menuId ? formatMenuId(review.menuId) : "Menu"}
                        </div>
                      </div>
                      <div className="review-rating">
                        {starsFor(review.rating)}
                      </div>
                    </div>
                    {!!img && (
                      <div className="review-photo">
                        <img src={img} alt={review.title || "Review photo"} />
                      </div>
                    )}
                    <div className="review-body">{review.body}</div>
                    {!!review.mlLabel && (
                      <div className="review-footnote">
                        ML label: {review.mlLabel}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ReviewsPage;
