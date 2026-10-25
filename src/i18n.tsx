import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'es' | 'en';

const STORAGE_KEY = 'lang';
const TITLES: Record<Lang, string> = {
  es: 'Nico Coudouy · Desarrollo web y automatización',
  en: 'Nico Coudouy · Web development and automation',
};

type LangContext = { lang: Lang; setLang: (lang: Lang) => void };
const Ctx = createContext<LangContext>({ lang: 'es', setLang: () => {} });

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch {
    // Storage can be blocked (private mode); fall back to Spanish.
  }
  return 'es';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = TITLES[lang];
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore: the choice just won't persist.
    }
  };

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

/** Picks the copy block for the current language. */
export function useCopy<T>(copy: Record<Lang, T>): T {
  return copy[useLang().lang];
}
