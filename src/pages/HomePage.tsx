import { Navbar } from "../components/Navbar";
import { ClockIcon } from "../components/icons";
import { Footer } from "../components/Footer";

interface HomePageProps {
  dark: boolean;
  onToggleTheme: () => void;
  onNavigate: (route: string, params?: Record<string, unknown>) => void;
}

export function HomePage({ dark, onToggleTheme, onNavigate }: HomePageProps) {
  return (
    <div className={`home-app ${dark ? "theme-dark" : ""}`}>
      <Navbar
        dark={dark}
        onToggleTheme={onToggleTheme}
        onNavigate={onNavigate}
        activeRoute="home"
      />

      <main className="home-main" role="main">
        <div className="home-container">
          <section className="home-hero-grid" aria-label="Featured">
            <a
              href="#"
              role="link"
              aria-label="Open Photo of the Day: Butter Chicken at REV, by Sai"
              className="hero-card hero-featured"
              onClick={(event) => {
                event.preventDefault();
                onNavigate("dish", { slug: "butter-chicken-rev" });
              }}
            >
              <div
                className="hero-image hero-image-featured"
                aria-hidden="true"
              />
              <div className="hero-overlay" aria-hidden="true" />
              <div className="hero-content">
                <span className="hero-badge">PHOTO OF THE DAY</span>
                <h3 className="hero-title">Butter Chicken at REV</h3>
                <div className="hero-byline">by Sai</div>
              </div>
            </a>

            <a
              href="#"
              role="link"
              aria-label="Open Archive: See what you’ve missed"
              className="hero-card hero-secondary"
              onClick={(event) => {
                event.preventDefault();
                onNavigate("history");
              }}
            >
              <div
                className="hero-image hero-image-secondary"
                aria-hidden="true"
              />
              <div className="hero-overlay light" aria-hidden="true" />
              <div className="hero-content dark">
                <span className="hero-badge">ARCHIVE</span>
                <h3 className="hero-title dark">See what you’ve missed</h3>
                <div className="hero-subtitle">
                  Browse highlights and popular dishes
                </div>
              </div>
              <div className="hero-glyph" aria-hidden="true">
                <ClockIcon />
              </div>
            </a>
          </section>

          <section className="home-section">
            <h2 className="home-section-title">What’s on the menu today?</h2>

            <div className="home-venues-grid" aria-label="Venues">
              <a
                href="#"
                role="link"
                aria-label="Open The Market (CMH)."
                className="venue-card"
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate("cafeteria", {
                    slug: "cmh",
                    name: "The Market (CMH)",
                  });
                }}
              >
                <div className="venue-media img-sub" />
                <div className="venue-text">
                  <div className="venue-title">The Market (CMH)</div>
                  <div className="venue-stat">
                    <span className="num"> </span>
                  </div>
                </div>
              </a>
              <a
                href="#"
                role="link"
                aria-label="Open Mudie’s (Village 1)."
                className="venue-card"
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate("cafeteria", {
                    slug: "v1",
                    name: "Mudie's (Village 1)",
                  });
                }}
              >
                <div className="venue-media img-mudies" />
                <div className="venue-text">
                  <div className="venue-title">Mudie’s (Village 1)</div>
                  <div className="venue-stat">
                    <span className="num"> </span>
                  </div>
                </div>
              </a>
              <a
                href="#"
                role="link"
                aria-label="Open REVelation (Ron Eydt Village)."
                className="venue-card"
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate("cafeteria", {
                    slug: "rev",
                    name: "REVelation (Ron Eydt Village)",
                  });
                }}
              >
                <div className="venue-media tile-rev">
                  <span className="rev-tag">safe for work</span>
                </div>
                <div className="venue-text">
                  <div className="venue-title">REVelation</div>
                  <div className="venue-stat">
                    <span className="num"> </span>
                  </div>
                </div>
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
