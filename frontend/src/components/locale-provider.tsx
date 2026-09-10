"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
});

const STORAGE_KEY = "wb-locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Restore a previously chosen locale on mount (client-only — avoids SSR/CSR hydration
  // mismatches from reading localStorage during render).
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "lg") {
      // One-time hydration of a client-only preference (localStorage), not state derived from
      // props/other state; must run after mount, which is exactly why this isn't a lazy
      // useState initializer instead (that would cause an SSR/CSR hydration mismatch).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
    }
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
