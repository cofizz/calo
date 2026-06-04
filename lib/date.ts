// Local-date helpers. We store each entry's day as a YYYY-MM-DD string based on
// the user's own timezone, so "today" matches what they see on their phone.

export function toDayString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayString(): string {
  return toDayString(new Date());
}

export function addDays(day: string, delta: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toDayString(date);
}

// "Today", "Yesterday", or a friendly date like "Mon, Jun 3".
// Pass lang to localise the relative words + date.
export function friendlyDay(day: string, lang: "en" | "sr" = "en"): string {
  const today = todayString();
  const rel = {
    en: { today: "Today", yest: "Yesterday", tom: "Tomorrow" },
    sr: { today: "Danas", yest: "Juče", tom: "Sutra" },
  }[lang];
  if (day === today) return rel.today;
  if (day === addDays(today, -1)) return rel.yest;
  if (day === addDays(today, 1)) return rel.tom;
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(lang === "sr" ? "sr-RS" : undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
