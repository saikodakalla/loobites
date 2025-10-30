import { Navbar } from "../components/Navbar";
import { MenuCard } from "../components/MenuCard";
import { BellIcon } from "../components/icons";
import { useMenus } from "../hooks/useMenus";

interface CafeteriaPageProps {
  dark: boolean;
  onToggleTheme: () => void;
  onNavigate: (route: string, params?: Record<string, unknown>) => void;
  params?: Record<string, unknown>;
}

export function CafeteriaPage({
  dark,
  onToggleTheme,
  onNavigate,
  params,
}: CafeteriaPageProps) {
  const title = (params?.name as string) || "Cafeteria";
  const slug = (params?.slug as string) || "";
  const { data, loading } = useMenus();
  const cafeterias = (data as any)?.cafeterias ?? {};
  const cafe = slug ? cafeterias[slug] : null;

  return (
    <div className={`home-app ${dark ? "theme-dark" : ""}`}>
      <Navbar
        dark={dark}
        onToggleTheme={onToggleTheme}
        onNavigate={onNavigate}
        activeRoute="cafeteria"
      />
      <main className="home-main" role="main">
        <div className="home-container">
          <div className="cafe-header">
            <h1 className="page-title">{title}</h1>
            <div className="cafe-sub">{data?.date || ""}</div>
            <div className="cafe-tools">
              <button type="button" className="cafe-tool">
                ♥
              </button>
              <button type="button" className="cafe-tool">
                Follow
              </button>
              <button type="button" className="cafe-tool" aria-label="Notify me">
                <BellIcon />
              </button>
              <button type="button" className="cafe-tool">
                Share
              </button>
            </div>
          </div>
          {!loading && !cafe && (
            <div className="cafe-banner">
              <span>Menu not available for this cafeteria today</span>
            </div>
          )}
          <div className="dish-toolbar">
            <div className="toolbar-group">Sort: Trending</div>
            <div className="toolbar-spacer" />
            <div className="toolbar-group">Filters</div>
          </div>
          {loading && (
            <div className="dish-grid">
              <div>Loading menu…</div>
            </div>
          )}
          {!loading && cafe && (
            <div>
              {cafe.stations.map((station, idx) => (
                <div key={idx} style={{ marginBottom: 24 }}>
                  <h2 className="home-section-title">{station.station}</h2>
                  <div className="dish-grid">
                    {station.items.map((item, jdx) => (
                      <MenuCard
                        key={jdx}
                        title={item.name}
                        tags={item.tags}
                        onSelect={() =>
                          onNavigate("dish", {
                            slug: item.name.toLowerCase().replace(/\s+/g, "-"),
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CafeteriaPage;
