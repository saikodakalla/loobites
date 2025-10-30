import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ChangeEvent,
  DragEvent,
  FormEvent,
  KeyboardEvent,
} from "react";
import { Navbar } from "../components/Navbar";
import { Avatar } from "../components/Avatar";
import { fetchApi } from "../lib/api";
import { formatMenuId, starsFor } from "../lib/format";

interface DishPageProps {
  dark: boolean;
  onToggleTheme: () => void;
  onNavigate: (route: string, params?: Record<string, unknown>) => void;
  params?: Record<string, unknown>;
  session: unknown;
}

interface ReviewImage {
  mime: string;
  base64: string;
}

interface DishReview {
  id?: string;
  author?: string;
  rating: number;
  body: string;
  createdAt: string;
  image?: ReviewImage | null;
  mlLabel?: string | null;
}

export function DishPage({
  dark,
  onToggleTheme,
  onNavigate,
  params,
  session,
}: DishPageProps) {
  const menuId = (params?.slug as string) || "";
  const dishName = formatMenuId(menuId) || "Dish";
  const [reviews, setReviews] = useState<DishReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingReviews(true);
      setReviewsError("");
      try {
        const res = await fetchApi(
          `/api/reviews?menuId=${encodeURIComponent(menuId)}`,
        );
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(payload?.error || "Failed to load reviews");
        }
        if (mounted) setReviews(Array.isArray(payload) ? payload : []);
      } catch (e) {
        if (mounted) {
          setReviewsError(
            e instanceof Error ? e.message : "Failed to load reviews",
          );
        }
      } finally {
        if (mounted) setLoadingReviews(false);
      }
    };
    if (menuId) load();
    return () => {
      mounted = false;
    };
  }, [menuId]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleFileSelect = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSubmitError("Only image files are supported.");
      return;
    }
    setSubmitError("");
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0]);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    handleFileSelect(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const refreshReviews = async () => {
    setLoadingReviews(true);
    setReviewsError("");
    try {
      const res = await fetchApi(
        `/api/reviews?menuId=${encodeURIComponent(menuId)}`,
      );
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to load reviews");
      }
      setReviews(Array.isArray(payload) ? payload : []);
    } catch (e) {
      setReviewsError(
        e instanceof Error ? e.message : "Failed to load reviews",
      );
    } finally {
      setLoadingReviews(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) {
      setSubmitError("You must be logged in to submit a review.");
      return;
    }
    if (!menuId) {
      setSubmitError("Unknown dish.");
      return;
    }
    if (!body.trim()) {
      setSubmitError("Please share a few words about the dish.");
      return;
    }
    setSubmitError("");
    setSubmitMessage("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("menuId", menuId);
      formData.append("rating", String(rating));
      formData.append("body", body.trim());
      if (imageFile) formData.append("image", imageFile);

      const res = await fetchApi("/api/reviews", {
        method: "POST",
        body: formData,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to submit review");
      }
      setSubmitMessage("Thanks for sharing your feedback!");
      setBody("");
      setRating(5);
      clearImage();
      await refreshReviews();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit review",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderedReviews = useMemo(() => {
    if (reviews.length === 0) {
      return (
        <div className="reviews-empty">No reviews yet. Be the first!</div>
      );
    }
    return reviews.map((review, idx) => {
      const img = review.image
        ? `data:${review.image.mime};base64,${review.image.base64}`
        : null;
      return (
        <div key={review.id || idx} className="review-item">
          <div className="review-head">
            <Avatar size={24} />
            <div>
              <strong>{review.author || "Guest"}</strong>
              <div className="review-meta">
                {starsFor(review.rating)} ·{" "}
                {new Date(review.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="review-body">{review.body}</div>
          {img && (
            <div className="review-image">
              <img src={img} alt={`${dishName} review`} />
              {review.mlLabel && (
                <span className="review-badge">ML: {review.mlLabel}</span>
              )}
            </div>
          )}
          {!img && review.mlLabel && (
            <div className="review-footnote">
              ML label: {review.mlLabel}
            </div>
          )}
        </div>
      );
    });
  }, [dishName, reviews]);

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
            {loadingReviews && (
              <div className="reviews-loading">Loading reviews…</div>
            )}
            {!!reviewsError && (
              <div className="reviews-error" role="alert">
                {reviewsError}
              </div>
            )}

            {!loadingReviews && !reviewsError && (
              <div className="reviews">{renderedReviews}</div>
            )}
          </section>

          <form className="review-composer" onSubmit={onSubmit}>
            <h2>Leave a review</h2>
            <div className="review-rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`star-btn${rating >= value ? " is-active" : ""}`}
                  onClick={() => setRating(value)}
                  aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder="How was portion, taste, freshness?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            <div
              className={`review-dropzone${isDragging ? " is-dragging" : ""}${
                imageFile ? " has-image" : ""
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {!imagePreview && (
                <span>Drag & drop a food photo or click to upload</span>
              )}
              {imagePreview && (
                <div className="dropzone-preview">
                  <img src={imagePreview} alt="Selected preview" />
                  <button
                    type="button"
                    className="pill-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImage();
                    }}
                  >
                    Remove photo
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileInputChange}
                hidden
              />
            </div>

            {!!submitError && (
              <div className="reviews-error" role="alert">
                {submitError}
              </div>
            )}
            {!!submitMessage && (
              <div className="reviews-success" role="status">
                {submitMessage}
              </div>
            )}

            <div className="review-actions">
              <button
                className="lb-primary-btn"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit review"}
              </button>
              <button
                className="pill-link"
                type="button"
                onClick={refreshReviews}
                disabled={loadingReviews}
              >
                Refresh
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default DishPage;
