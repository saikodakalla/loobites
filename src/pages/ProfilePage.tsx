import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { ProfileCard } from "../components/ProfileCard";
import { StatsGrid } from "../components/StatsGrid";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { supabase } from "../lib/supabaseClient";

interface ProfilePageProps {
  dark: boolean;
  onToggleTheme: () => void;
  onNavigate: (route: string, params?: Record<string, unknown>) => void;
  params?: Record<string, unknown>;
}

export function ProfilePage({
  dark,
  onToggleTheme,
  onNavigate,
  params,
}: ProfilePageProps) {
  const username = (params?.username as string) || "me";
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        if (!supabase) {
          throw new Error("Supabase is not configured");
        }
        const { data, error: err } = await supabase.auth.getUser();
        if (err) throw err;
        const user = data?.user;
        if (!user) throw new Error("Not authenticated");
        const meta: Record<string, unknown> = (user.user_metadata || {}) as any;
        const possible = [
          meta.full_name,
          meta.name,
          meta.given_name,
          meta.first_name,
          (meta as any).firstName,
          (meta as any).display_name,
        ].filter((v): v is string => typeof v === "string" && !!v.trim());
        let name = possible[0] || user.email || "You";
        // Prefer first name if multiple words
        name = name.trim();
        const first = name.split(/\s+/)[0];
        if (first) name = first;
        if (mounted) setDisplayName(name);
      } catch (e) {
        if (mounted)
          setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div className={`home-app ${dark ? "theme-dark" : ""}`}>
      <Navbar
        dark={dark}
        onToggleTheme={onToggleTheme}
        onNavigate={onNavigate}
        activeRoute="profile"
      />
      <main className="home-main" role="main">
        <div className="home-container">
          {loading && <LoadingSpinner label="Loading profile…" />}
          {!!error && (
            <div className="reviews-error" role="alert">
              {error}
            </div>
          )}
          {!loading && (
            <ProfileCard name={displayName || "You"} handle={username} />
          )}
          <StatsGrid
            stats={[
              { label: "Reviews", value: 12 },
              { label: "Photos", value: 8 },
              { label: "Helpful", value: 34 },
            ]}
          />
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
