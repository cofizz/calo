"use client";

import { useI18n, type Lang } from "./i18n-context";

// Small EN / SR language switch for page headers.
export default function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-surface-2 p-0.5 text-[10px] font-bold">
      {(["en", "sr"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-full px-2 py-0.5 uppercase transition-colors ${
            lang === l ? "bg-accent text-black" : "text-muted"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
