import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import AuthLanding from "./pages/AuthLanding";
import HomePage from "./pages/HomePage";
import PastMealsPage from "./pages/PastMealsPage";
import ReviewsPage from "./pages/ReviewsPage";
import CafeteriaPage from "./pages/CafeteriaPage";
import DishPage from "./pages/DishPage";
import ProfilePage from "./pages/ProfilePage";

type RouteName =
  | "auth"
  | "home"
  | "history"
  | "reviews"
  | "cafeteria"
  | "dish"
  | "profile";

type RouteParams = Record<string, unknown>;

export default function App() {
  const LAST_ROUTE_KEY = "loobites:lastRoute";
  const [route, setRoute] = useState<RouteName>("auth");
  const [params, setParams] = useState<RouteParams>({});
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem("loobites:theme") === "dark";
    } catch {
      return false;
    }
  });
  const [session, setSession] = useState<any>(null);
  const sessionRef = useRef<any>(null);
  const restoredRef = useRef<boolean>(false);

  const persistRoute = (name: RouteName, p: RouteParams = {}) => {
    // Don't persist auth route
    if (name === "auth") return;
    try {
      localStorage.setItem(
        LAST_ROUTE_KEY,
        JSON.stringify({ name, params: p, at: Date.now() })
      );
    } catch {
      // localStorage may be unavailable; ignore
    }
  };

  const readPersistedRoute = (): { name: RouteName; params: RouteParams } | null => {
    try {
      const raw = localStorage.getItem(LAST_ROUTE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { name?: RouteName; params?: RouteParams } | null;
      if (!parsed || !parsed.name || parsed.name === "auth") return null;
      return { name: parsed.name, params: parsed.params || {} };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!window.history.state || !window.history.state.route) {
      window.history.replaceState({ route: "auth", params: {} }, "");
    } else {
      setRoute(window.history.state.route);
      setParams(window.history.state.params || {});
    }
    const onPop = (e: PopStateEvent) => {
      const nextRoute = (e.state?.route || "auth") as RouteName;
      const nextParams = (e.state?.params || {}) as RouteParams;
      if (!sessionRef.current && nextRoute !== "auth") {
        window.history.pushState({ route: "auth", params: {} }, "");
        setRoute("auth");
        setParams({});
        return;
      }
      setRoute(nextRoute);
      setParams(nextParams);
      // Persist route on back/forward navigation
      persistRoute(nextRoute, nextParams);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setSession(data.session);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (!session && route !== "auth") {
      window.history.replaceState({ route: "auth", params: {} }, "");
      setRoute("auth");
      setParams({});
    } else if (session && route === "auth") {
      // On first authenticated mount, try restoring last route once
      if (!restoredRef.current) {
        const saved = readPersistedRoute();
        restoredRef.current = true;
        if (saved && saved.name) {
          window.history.replaceState(
            { route: saved.name, params: saved.params || {} },
            ""
          );
          setRoute(saved.name);
          setParams(saved.params || {});
          return;
        }
      }
      window.history.replaceState({ route: "home", params: {} }, "");
      setRoute("home");
      setParams({});
    }
  }, [session, route]);

  const navigate = (name: RouteName, p: RouteParams = {}) => {
    if (!sessionRef.current && name !== "auth") {
      window.history.pushState({ route: "auth", params: {} }, "");
      setRoute("auth");
      setParams({});
      return;
    }
    window.history.pushState({ route: name, params: p }, "");
    setRoute(name);
    setParams(p);
    persistRoute(name, p);
  };

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("loobites:theme", next ? "dark" : "light");
      } catch {
        /* localStorage unavailable */
      }
      return next;
    });
  };

  if (route === "auth") {
    return <AuthLanding dark={dark} />;
  }
  if (route === "home") {
    return (
      <HomePage dark={dark} onToggleTheme={toggleTheme} onNavigate={navigate} />
    );
  }
  if (route === "history") {
    return (
      <PastMealsPage
        dark={dark}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
      />
    );
  }
  if (route === "reviews") {
    return (
      <ReviewsPage
        dark={dark}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
      />
    );
  }
  if (route === "cafeteria") {
    return (
      <CafeteriaPage
        dark={dark}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
        params={params}
      />
    );
  }
  if (route === "dish") {
    return (
      <DishPage
        dark={dark}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
        params={params}
        session={session}
      />
    );
  }
  if (route === "profile") {
    return (
      <ProfilePage
        dark={dark}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
        params={params}
      />
    );
  }
  return null;
}
