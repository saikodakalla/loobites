import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

interface HomePageProps {
  dark: boolean;
  onToggleTheme: () => void;
  onNavigate: (route: string, params?: Record<string, unknown>) => void;
}

export function HomePage({ dark, onToggleTheme, onNavigate }: HomePageProps) {
  // Local image file paths expected under public/images/cafes/
  // Upload files with these names: cmh.jpg, v1.jpg, rev.jpg
  const CMH_IMG = "/images/cafes/cmh.jpg";
  const V1_IMG = "/images/cafes/v1.jpg";
  const REV_IMG = "/images/cafes/rev.jpg";
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
                <div className="venue-media wide">
                  <img src={CMH_IMG} alt="The Market (CMH)" loading="lazy" />
                </div>
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
                <div className="venue-media wide">
                  <img src={V1_IMG} alt="Mudie’s (Village 1)" loading="lazy" />
                </div>
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
                <div className="venue-media wide">
                  <img src={REV_IMG} alt="REVelation (Ron Eydt Village)" loading="lazy" />
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
