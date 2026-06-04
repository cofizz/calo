"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n-context";

// The dog hangs out next to the calorie ring and reacts to the day — judged by
// the user's PLAN (cut / bulk / maintain). On a cut, eating under goal is great;
// on a bulk, it's bad. Captions are goofy and randomized.
//
// Photos live in /public/dog/ named "<tier>-<anything>.jpg" (5 calorie buckets).
// Add as many as you like — one shows at random. Missing tier -> emoji.

type Tier = "under-goal" | "near-goal" | "hit-goal" | "over-limit" | "way-over";
type Plan = "cut" | "bulk" | "maintain";

export type DogReactionData = {
  tier: Tier;
  plan: Plan;
  emoji: string;
  title: string;
  tone: string; // tailwind text color class
  lines: string[]; // goofy one-liners (one picked at random)
};

// Serbian text (title + goofy lines) per plan/tier — overlays the English data.
const TEXT_SR: Record<Plan, Record<Tier, { title: string; lines: string[] }>> = {
  cut: {
    "under-goal": { title: "Duboki deficit", lines: [
      "Pojeo si jedan list salate i rekao gotovo.",
      "Stomak ti je prijavio nestanak osobe.",
      "Grozd ima više sadržaja od ovoga.",
      "Jedeš li ti uopšte ili samo postojiš?",
      "Pas ti nudi svoju hranu, bre.",
      "Ovo nije dijeta, ovo je čarobni nestanak.",
      "Vazduh i inat — doručak šampiona.",
    ] },
    "near-goal": { title: "Čisto skidanje", lines: [
      "Disciplina na nivou, ko je dobar dečko?",
      "Frižider te se plaši.",
      "Trbušnjaci se učitavaju… 73%.",
      "Pogledao si krofnu i otišao. Heroj.",
      "Deficit osiguran, faca netaknuta.",
      "Lean mašina, bip bup.",
    ] },
    "hit-goal": { title: "Tačno na cilju", lines: [
      "Majstorski. Bogovi deficita su zadovoljni.",
      "Snajperski precizno. Pas ti salutira. 🫡",
      "Tačno koliko treba. Sumnjivo savršeno.",
      "10/10 bez primedbi. Rep maše ludo.",
      "Zlatna sredina. To je to. *pas zuri dramatično*",
    ] },
    "over-limit": { title: "Grickalice su se desile", lines: [
      "Neko je našao frižider. Pas je sve video. 👀",
      "Skidanje je otišlo na pauzu za kafu.",
      "Bili smo tako blizu. Tako tako blizu.",
      "Pojavila se grickalica, bio si nemoćan.",
      "Pas nije ljut, samo razočaran.",
    ] },
    "way-over": { title: "O danas ne pričamo", lines: [
      "To nije bilo skidanje, to je bila gozba. *pojačano osuđivanje*",
      "Deficit je trajno napustio grupu.",
      "Pojeo si i deficit i višak i ceo meni deserta.",
      "Dijeta? Pas nikad čuo za nju danas.",
      "Speedrun kroz celu kuhinju.",
      "Sutra se pravimo da se ovo nije desilo. 🤝",
    ] },
  },
  bulk: {
    "under-goal": { title: "To je mrvica", lines: [
      "Gains plaču. JEDI. 😭",
      "To je bulk? Veverica je pojela više.",
      "Pirinač. Odmah. Idi.",
      "Mišići ne rastu na vazduhu, brate.",
      "Gains su otišli u drugu teretanu danas.",
      "Nahrani zver ili će zver tebe.",
    ] },
    "near-goal": { title: "Treba još goriva", lines: [
      "Na pola puta do zveri. Više hrane, manje priče.",
      "Gains na čekanju… ubaci još ugljenih hidrata.",
      "Skoro si tu, još jedan tanjir.",
      "Višak je stidljiv. Namami ga picom.",
      "Lopataj dalje, gains te gledaju.",
    ] },
    "hit-goal": { title: "Višak osiguran", lines: [
      "GROWTH MINDSET (bukvalno). Gains stižu. 💪",
      "Višak zaključan. Mišići kažu vau, hvala.",
      "Viljuška: legendarna. Gains: neizbežni.",
      "Nahranio si zver i zver je ODUŠEVLJENA.",
      "Bulkuj ko da niko ne gleda. (pas gleda.)",
    ] },
    "over-limit": { title: "Apsolutna zverka", lines: [
      "Ponašanje zverke. Drži (uglavnom) čisto.",
      "Višak naslagan više od tvojih standarda.",
      "Bulk sezona: totalno odlepljeno. Respekt.",
      "Prljavi bulk detektovan. Pas odobrava haos.",
      "Ne jedeš, uznosiš se.",
    ] },
    "way-over": { title: "To je švedski sto", lines: [
      "Nije bulk, ceo švedski sto. Blago zabrinjavajuće.",
      "Čak i za bulk… to je MNOGO hrane, kralju.",
      "Pas nikad nije video toliku posvećenost jelu.",
      "Nisi bulkovao, postao si lanac ishrane.",
      "Polako, švedski sto hoće titulu nazad.",
    ] },
  },
  maintain: {
    "under-goal": { title: "Na rezervi", lines: [
      "Preživljavaš na lepoti i tri badema. Jedi.",
      "To je grickalica, ne dan, druže.",
      "Pas ti donosi sendvič. Čekaj.",
      "Prazan rezervoar, jaka faca. Dopuni.",
      "Opet si zaboravio da jedeš, je l' da. 🙃",
    ] },
    "near-goal": { title: "Krstariš", lines: [
      "Još malo pa savršeno izbalansirano.",
      "Skoro savršeno. Pas strpljivo maše.",
      "Mirna plovidba, blago gladan.",
      "Jedna grickalica do harmonije.",
      "Režim održavanja: 90% učitano…",
    ] },
    "hit-goal": { title: "Savršeno izbalansirano", lines: [
      "Kako i treba da bude. 🐾",
      "Održavanje savladano. Zen pas je ušao u čet.",
      "Tačno na pari. *sporo odobravajuće mahanje*",
      "Nijedna kalorija van mesta. Ikonski.",
      "Izbalansiran ko dobar dečko na ogradi.",
    ] },
    "over-limit": { title: "Mrvicu preko", lines: [
      "Pas je primetio ali neće nikom reći.",
      "Ušunjala se poslastica. Praštamo. Uglavnom.",
      "Malo ljuće na kalorijama danas.",
      "Živimo malo, a? 😏",
      "Održavanje, lagano začinjeno haosom.",
    ] },
    "way-over": { title: "Održavanje? Ne poznajem je", lines: [
      "Održavanje je napustilo zgradu. 🚪",
      "Održao si… celu gozbu.",
      "Eskaliralo je ukusno.",
      "Pas je razrogačen i blago impresioniran.",
      "Ravnoteža? U OVOJ ekonomiji? Ne.",
    ] },
  },
};

const ACCENT = "text-accent";
const DANGER = "text-danger";
const MUTED = "text-muted";

const REACTIONS: Record<Plan, Record<Tier, Omit<DogReactionData, "tier" | "plan">>> = {
  cut: {
    "under-goal": { emoji: "🍃", title: "Deep deficit", tone: MUTED, lines: [
      "Bro ate a single leaf and called it a day.",
      "Your calorie intake is in witness protection.",
      "A grape has more going on than this.",
      "Even the houseplant eats more than you.",
      "The dog sniffed your meals and found nothing. Concerning.",
      "Are you cutting or auditioning to be a ghost?",
      "Stomach.exe has stopped responding.",
      "This is a diet, not a vanishing act, champ.",
    ] },
    "near-goal": { emoji: "🐶", title: "Cutting clean", tone: ACCENT, lines: [
      "Snacc discipline detected. Who's a good boy?",
      "Lean machine, beep boop.",
      "Abs loading… please do not close the app.",
      "The fridge filed a restraining order against you.",
      "You looked at a donut and walked away. Hero.",
      "Calorie ninja. Silent. Lean. Slightly hungry.",
      "Deficit secured, swagger at maximum.",
    ] },
    "hit-goal": { emoji: "🎯", title: "Bang on target", tone: ACCENT, lines: [
      "Chef's kiss. The deficit gods are pleased.",
      "Sniper-accurate. The dog salutes you. 🫡",
      "Goldilocks would be proud. Juuust right.",
      "You ate the exact right amount. Suspiciously perfect.",
      "10/10 no notes. The pup wags violently.",
      "This is the way. *dramatic dog stare*",
    ] },
    "over-limit": { emoji: "🙈", title: "Snacks happened", tone: DANGER, lines: [
      "Someone found the fridge. The dog saw everything. 👀",
      "The cut took a smoke break.",
      "We were SO close. So so close. *sigh in dog*",
      "A snack appeared. You were powerless.",
      "Plot twist: the snacks won today.",
      "The dog isn't mad, just disappointed.",
    ] },
    "way-over": { emoji: "🚨", title: "We don't talk about today", tone: DANGER, lines: [
      "That wasn't a cut, that was a feast. *judging intensifies*",
      "The deficit has left the chat permanently.",
      "You ate the cut, the surplus, AND the dessert menu.",
      "Diet? The dog has never heard of her after today.",
      "Bro speedran the entire kitchen.",
      "Tomorrow we pretend this never happened. 🤝",
    ] },
  },
  bulk: {
    "under-goal": { emoji: "🚨", title: "That's a crumb", tone: DANGER, lines: [
      "The gains are crying. EAT. 😭",
      "You call that a bulk? A squirrel ate more.",
      "Rice. Now. Go. The dog insists.",
      "Muscles don't grow on vibes and air, buddy.",
      "That's a pre-snack to a snack to a thought of food.",
      "The gains went to a different gym today.",
      "Feed the beast or the beast feeds on YOU.",
    ] },
    "near-goal": { emoji: "🍖", title: "Need more fuel", tone: MUTED, lines: [
      "Halfway to beast mode. More food, less talk.",
      "Gains pending… insert more carbs to continue.",
      "Almost there big guy, one more plate.",
      "The surplus is shy. Lure it out with pizza.",
      "Keep shoveling, the gains are watching closely.",
      "You're 60% snack, 40% dream. Eat up.",
    ] },
    "hit-goal": { emoji: "🎉", title: "Surplus acquired", tone: ACCENT, lines: [
      "GROWTH MINDSET (literally). Gains incoming. 💪",
      "Surplus locked. Muscles say woof, thank you.",
      "Fork: legendary. Gains: imminent.",
      "You fed the beast and the beast is THRILLED.",
      "Big eater energy. The pup is in awe.",
      "Bulk like nobody's watching. (the dog is watching.)",
    ] },
    "over-limit": { emoji: "💪", title: "Absolute unit", tone: ACCENT, lines: [
      "Unit behavior. Keep it (mostly) clean.",
      "Surplus stacked higher than your standards.",
      "Bulk season: fully unhinged. Respect.",
      "Big meals, bigger dreams, biggest plate.",
      "Dirty bulk detected. The dog approves of the chaos.",
      "You're not eating, you're ascending.",
    ] },
    "way-over": { emoji: "🚨", title: "That's a buffet", tone: DANGER, lines: [
      "Not a bulk, a full buffet. Slightly concerning.",
      "Even for a bulk… that's a LOT of food, king.",
      "The dog has never witnessed such devotion to eating.",
      "You didn't bulk, you became the food chain.",
      "Surplus of the surplus of the surplus.",
      "Easy there, the buffet wants its title back.",
    ] },
  },
  maintain: {
    "under-goal": { emoji: "🍖", title: "Running on fumes", tone: MUTED, lines: [
      "Surviving on good looks and three almonds. Eat.",
      "That's a snack, not a day, sweet friend.",
      "The dog is fetching you a sandwich. Hold on.",
      "Empty tank, big vibes. Please refuel.",
      "You forgot to eat again, didn't you. 🙃",
      "Maintenance requires… maintenance. Go nibble.",
    ] },
    "near-goal": { emoji: "🐶", title: "Cruising", tone: MUTED, lines: [
      "A little more and we're chef's-kiss balanced.",
      "Almost perfect. The pup is patiently wagging.",
      "Smooth sailing, mildly peckish.",
      "So close to the sweet spot, keep going.",
      "One snack away from harmony.",
      "Maintenance mode: 90% loaded…",
    ] },
    "hit-goal": { emoji: "🎯", title: "Perfectly balanced", tone: ACCENT, lines: [
      "As all things should be. 🐾",
      "Maintenance mastered. Zen dog has entered the chat.",
      "Right on the money. *slow approving wag*",
      "Equilibrium achieved. Inner peace: unlocked.",
      "Not a calorie out of place. Iconic behavior.",
      "Balanced like a good boy on a fence post.",
    ] },
    "over-limit": { emoji: "🙈", title: "A smidge over", tone: DANGER, lines: [
      "The dog noticed but will take it to the grave.",
      "A treat snuck in. We forgive you. Mostly.",
      "Slightly spicy on the calories today.",
      "Living a little, are we? 😏",
      "Over by a smidge. The dog shrugs adorably.",
      "Maintenance, lightly seasoned with chaos.",
    ] },
    "way-over": { emoji: "🚨", title: "Maintenance? Never met her", tone: DANGER, lines: [
      "Maintenance has left the building. 🚪",
      "You maintained… an entire feast.",
      "That escalated deliciously.",
      "The pup is wide-eyed and mildly impressed.",
      "Balance? In THIS economy? Nope.",
      "Today you maintained your right to snack infinitely.",
    ] },
  },
};

function tierFor(ratio: number): Tier {
  if (ratio < 0.65) return "under-goal";
  if (ratio < 0.9) return "near-goal";
  if (ratio <= 1.1) return "hit-goal";
  if (ratio <= 1.5) return "over-limit";
  return "way-over";
}

export function getDogReaction(
  calories: number,
  goal: number,
  goalType: string | null,
): DogReactionData | null {
  if (calories <= 0 || goal <= 0) return null;
  const plan: Plan =
    goalType === "cut" || goalType === "bulk" ? goalType : "maintain";
  const tier = tierFor(calories / goal);
  return { tier, plan, ...REACTIONS[plan][tier] };
}

type Groups = Record<string, string[]>;

export default function DogReaction({ reaction }: { reaction: DogReactionData | null }) {
  const { lang } = useI18n();
  const [groups, setGroups] = useState<Groups>({});
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    fetch("/api/dog")
      .then((r) => (r.ok ? r.json() : {}))
      .then((g) => setGroups(g))
      .catch(() => setGroups({}));
  }, []);

  const tier = reaction?.tier ?? null;

  // Title + lines in the current language (Serbian overlay, else English).
  const text =
    reaction && lang === "sr"
      ? TEXT_SR[reaction.plan][reaction.tier]
      : reaction
        ? { title: reaction.title, lines: reaction.lines }
        : null;

  // Pick a random photo for the current tier (re-picks when the tier changes).
  const src = useMemo(() => {
    if (!tier) return null;
    const list = groups[tier] ?? [];
    if (list.length === 0) return null;
    return `/dog/${list[Math.floor(Math.random() * list.length)]}`;
  }, [tier, groups]);

  // Pick a random goofy line for the current tier + language.
  const line = useMemo(() => {
    if (!text) return "";
    return text.lines[Math.floor(Math.random() * text.lines.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, lang]);

  useEffect(() => setImgFailed(false), [src]);

  if (!reaction || !text) return null;

  return (
    <div className="mt-5 flex flex-col items-center text-center">
      {src && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="dog reaction"
          className="max-h-60 max-w-full rounded-2xl object-contain"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="text-7xl">{reaction.emoji}</span>
      )}
      <p className={`mt-3 text-base font-bold leading-tight ${reaction.tone}`}>{text.title}</p>
      <p className="mt-1 text-sm leading-snug text-muted">{line}</p>
    </div>
  );
}
