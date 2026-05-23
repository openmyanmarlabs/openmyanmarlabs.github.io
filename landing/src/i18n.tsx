/**
 * i18n — Myanmar-first language context.
 *
 * `my` is the default on first load; `en` is the toggle. The provider keeps
 * the active lang, syncs <html lang>, and exposes the active content object so
 * components render copy without knowing about the other language.
 *
 * API (via `useI18n()`):
 *   lang        — "my" | "en"  (default "my")
 *   setLang     — (lang) => void
 *   toggleLang  — () => void   (my <-> en)
 *   isMyanmar   — boolean
 *   t           — active content object (content[lang])
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { content } from "./content";
import type { Content, Lang } from "./content";

const DEFAULT_LANG: Lang = "my";

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  isMyanmar: boolean;
  t: Content;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  const setLang = useCallback((next: Lang) => {
    if (next !== "my" && next !== "en") return;
    setLangState(next);
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "my" ? "en" : "my");
  }, [lang, setLang]);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang,
      isMyanmar: lang === "my",
      t: content[lang],
    }),
    [lang, setLang, toggleLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (ctx === null) {
    throw new Error("useI18n must be used within an <I18nProvider>");
  }
  return ctx;
}
