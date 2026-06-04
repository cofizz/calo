"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Lang = "en" | "sr";

type I18n = {
  lang: Lang;
  setLang: (l: Lang) => void;
  // Translate inline: t("English", "Srpski") -> picks by current language.
  t: (en: string, sr: string) => string;
};

const I18nContext = createContext<I18n>({
  lang: "en",
  setLang: () => {},
  t: (en) => en,
});

export function I18nProvider({
  initialLang,
  loggedIn,
  children,
}: {
  initialLang: Lang;
  loggedIn: boolean;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  // On mount, prefer a locally-saved choice (snappy + works before login).
  useEffect(() => {
    const stored = localStorage.getItem("lang");
    if (stored === "en" || stored === "sr") setLangState(stored);
  }, []);

  // Reflect language on <html lang> for accessibility.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      localStorage.setItem("lang", l);
      if (loggedIn) {
        fetch("/api/language", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: l }),
        }).catch(() => {});
      }
    },
    [loggedIn],
  );

  const t = useCallback((en: string, sr: string) => (lang === "sr" ? sr : en), [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
