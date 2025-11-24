import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";
import { LogoMark, GoogleIcon } from "../components/icons";

interface AuthLandingProps {
  dark?: boolean;
}

export function AuthLanding({ dark = false }: AuthLandingProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const canUseAuth = !!supabase;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setInfo("");
    if (!canUseAuth) {
      setError(
        "Authentication is currently unavailable. Please contact the site administrator."
      );
      return;
    }
    if (mode === "signup") {
      if (!email || !password || !confirmPassword) {
        setError("Please fill all required fields.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setLoading(true);
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || undefined } },
      });
      setLoading(false);
      if (err) setError(err.message);
      else
        setInfo(
          "Sign up successful. Check your email if confirmation is required."
        );
      return;
    }
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) setError(err.message);
  };

  const signInWithGoogle = async () => {
    setError("");
    setInfo("");
    if (!canUseAuth) {
      setError(
        "Authentication is currently unavailable. Please contact the site administrator."
      );
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
  };

  return (
    <div className={`lb-app ${dark ? "theme-dark" : ""}`}>
      <header className="lb-header" role="banner">
        <div className="lb-header-inner">
          <div className="lb-brand" aria-label="LooBites">
            <LogoMark color={dark ? "#E9B949" : "#000"} />
            <span className="lb-wordmark">LooBites</span>
          </div>
        </div>
      </header>

      <main className="lb-main" role="main">
        <section className="lb-auth" aria-label="Authentication">
          <h1 className="lb-hero">Welcome to LooBites</h1>
          <p className="lb-subhead">Your guide to campus dining.</p>

          <div className="lb-card" aria-label="Authentication options">
            <div className="lb-tabs" role="tablist" aria-label="Auth mode">
              <button
                role="tab"
                aria-selected={mode === "login"}
                className={`lb-tab ${mode === "login" ? "is-active" : ""}`}
                onClick={() => setMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                role="tab"
                aria-selected={mode === "signup"}
                className={`lb-tab ${mode === "signup" ? "is-active" : ""}`}
                onClick={() => setMode("signup")}
                type="button"
              >
                Sign Up
              </button>
            </div>

            <form className="lb-form" onSubmit={onSubmit} noValidate>
              {mode === "signup" && (
                <div className="lb-field">
                  <label htmlFor="fullName" className="lb-visually-hidden">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Full Name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
              <div className="lb-field">
                <label htmlFor="identifier" className="lb-visually-hidden">
                  Email
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="lb-field">
                <label htmlFor="password" className="lb-visually-hidden">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                />
              </div>
              {mode === "signup" && (
                <div className="lb-field">
                  <label
                    htmlFor="confirmPassword"
                    className="lb-visually-hidden"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {!!error && (
                <div role="alert" style={{ color: "#E11D48", marginBottom: 8 }}>
                  {error}
                </div>
              )}
              {!!info && (
                <div
                  role="status"
                  style={{ color: "#059669", marginBottom: 8 }}
                >
                  {info}
                </div>
              )}

              <button
                type="submit"
                className="lb-primary-btn"
                disabled={loading}
              >
                {loading
                  ? "Please wait…"
                  : mode === "login"
                  ? "Log In"
                  : "Sign Up"}
              </button>
            </form>

            <div className="lb-divider" aria-hidden="true">
              Or continue with
            </div>

            <div className="lb-sso">
              <button
                type="button"
                className="lb-sso-btn"
                aria-label="Sign in with Google"
                onClick={signInWithGoogle}
                disabled={!canUseAuth || loading}
              >
                <span className="lb-sso-icon">
                  <GoogleIcon />
                </span>
                <span className="lb-sso-label">Sign in with Google</span>
              </button>
            </div>

            {!canUseAuth && (
              <div style={{ paddingTop: 12, fontSize: 12, opacity: 0.85 }}>
                Missing Supabase environment variables. Add either
                <code style={{ marginLeft: 4 }}>VITE_SUPABASE_URL</code> and
                <code style={{ marginLeft: 4 }}>VITE_SUPABASE_ANON_KEY</code> or
                your existing{" "}
                <code style={{ marginLeft: 4 }}>LOOBITES_APP_*</code> keys to{" "}
                <code>.env.local</code>, then restart the dev server.
              </div>
            )}

            <p className="lb-legal">
              By continuing, you agree to our{" "}
              <a href="#" rel="noopener noreferrer">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" rel="noopener noreferrer">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AuthLanding;
