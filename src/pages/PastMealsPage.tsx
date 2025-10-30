import { Navbar } from "../components/Navbar";
import { MealList } from "../components/MealList";

interface PastMealsPageProps {
  dark: boolean;
  onToggleTheme: () => void;
  onNavigate: (route: string, params?: Record<string, unknown>) => void;
}

export function PastMealsPage({
  dark,
  onToggleTheme,
  onNavigate,
}: PastMealsPageProps) {
  return (
    <div className={`home-app ${dark ? "theme-dark" : ""}`}>
      <Navbar
        dark={dark}
        onToggleTheme={onToggleTheme}
        onNavigate={onNavigate}
        activeRoute="history"
      />
      <main className="home-main" role="main">
        <div className="home-container">
          <h1 className="page-title">Past Meals</h1>

          <section className="history-group">
            <h2 className="history-date">Monday, October 21</h2>
            <MealList
              items={[
                {
                  id: "chicken-stir-fry",
                  primary: "Dinner",
                  secondary: "Chicken Stir-Fry",
                  onSelect: () =>
                    onNavigate("dish", { slug: "chicken-stir-fry" }),
                },
                {
                  id: "rev-lunch",
                  primary: "Lunch",
                  secondary: "REVelation (period menu)",
                  onSelect: () =>
                    onNavigate("cafeteria", {
                      slug: "rev",
                      name: "REVelation",
                    }),
                  thumbnailClassName: "alt",
                },
              ]}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default PastMealsPage;
