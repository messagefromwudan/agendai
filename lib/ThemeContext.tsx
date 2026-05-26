import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start with 'light' — the blocking script in _document.tsx has already
  // applied the correct class to <html> before React hydrates, so there is
  // no visible flash. We sync state from localStorage in the effect below.
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = localStorage.getItem('tuto-theme') as Theme | null;
    const preferred =
      saved ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    setTheme(preferred);
    // The blocking script may have already set the class, but we ensure it
    // matches in case the script was skipped (e.g., SSR-only rendering).
    document.documentElement.classList.toggle('dark', preferred === 'dark');
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('tuto-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
