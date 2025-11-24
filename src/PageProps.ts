export interface PageProps {
  dark: boolean;
  onToggleTheme: () => void;
  onNavigate: (route: string, params?: Record<string, unknown>) => void;
  params?: Record<string, unknown>;
  session?: unknown;
}
