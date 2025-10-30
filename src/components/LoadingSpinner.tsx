export interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = "Loading…" }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <div className="loading-spinner-dot" />
      <div className="loading-spinner-dot" />
      <div className="loading-spinner-dot" />
      <span className="loading-spinner-label">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
