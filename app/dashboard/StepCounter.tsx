"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n-context";

const STEP_GOAL = 10000;

// Card showing today's steps + a live "walk mode" that counts steps from the
// phone's motion sensor while the app is open.
export default function StepCounter({ day }: { day: string }) {
  const { t } = useI18n();
  const [steps, setSteps] = useState(0);
  const [walking, setWalking] = useState(false);
  const [session, setSession] = useState(0);
  const [editing, setEditing] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  // Refs for the step-detection algorithm + saving.
  const stepsRef = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMag = useRef(0);
  const goingUp = useRef(false);
  const lastStepAt = useRef(0);
  const gotEvent = useRef(false);

  stepsRef.current = steps;

  // Load today's steps when the day changes.
  useEffect(() => {
    let active = true;
    fetch(`/api/steps?day=${day}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { steps: 0 }))
      .then((d) => active && setSteps(d.steps))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [day]);

  const saveSteps = useCallback(
    (value: number) => {
      fetch("/api/steps", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, steps: value }),
      }).catch(() => {});
    },
    [day],
  );

  // Debounced save while walking.
  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveSteps(stepsRef.current), 1500);
  }, [saveSteps]);

  // Motion handler: peak-detect steps from total acceleration magnitude.
  const onMotion = useCallback(
    (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      gotEvent.current = true;
      const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
      const now = Date.now();

      if (mag > lastMag.current) {
        goingUp.current = true;
      } else if (goingUp.current) {
        // We just passed a peak.
        if (lastMag.current > 11.5 && now - lastStepAt.current > 300) {
          lastStepAt.current = now;
          setSteps((s) => s + 1);
          setSession((s) => s + 1);
          scheduleSave();
        }
        goingUp.current = false;
      }
      lastMag.current = mag;
    },
    [scheduleSave],
  );

  const startWalking = useCallback(async () => {
    setHint(null);
    type MotionCtor = typeof DeviceMotionEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    const Ctor = DeviceMotionEvent as MotionCtor;
    try {
      if (typeof Ctor.requestPermission === "function") {
        const res = await Ctor.requestPermission();
        if (res !== "granted") {
          setHint(t("Motion permission denied. Allow it to count steps.", "Dozvola za kretanje odbijena. Dozvoli da bismo brojali korake."));
          return;
        }
      }
    } catch {
      setHint(t("Couldn't request motion access on this device.", "Nije moguće tražiti pristup senzoru kretanja."));
      return;
    }
    if (typeof DeviceMotionEvent === "undefined") {
      setHint(t("This device/browser has no motion sensor.", "Ovaj uređaj/pregledač nema senzor kretanja."));
      return;
    }
    gotEvent.current = false;
    setSession(0);
    window.addEventListener("devicemotion", onMotion);
    setWalking(true);
    // If no sensor events arrive shortly, the context probably isn't secure.
    setTimeout(() => {
      if (!gotEvent.current)
        setHint(t("No motion data — open it on your phone (needs HTTPS).", "Nema podataka o kretanju — otvori na telefonu (potreban HTTPS)."));
    }, 2500);
  }, [onMotion]);

  const stopWalking = useCallback(() => {
    window.removeEventListener("devicemotion", onMotion);
    setWalking(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveSteps(stepsRef.current);
  }, [onMotion, saveSteps]);

  // Clean up the listener on unmount.
  useEffect(() => {
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [onMotion]);

  const pct = Math.min((steps / STEP_GOAL) * 100, 100);

  return (
    <section className="mb-5 rounded-3xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">👟 {t("Steps today", "Koraci danas")}</span>
        {!editing && !walking && (
          <button onClick={() => setEditing(true)} className="text-xs text-muted hover:text-foreground">
            {t("edit", "izmeni")}
          </button>
        )}
      </div>

      {editing ? (
        <StepEditor
          current={steps}
          onSave={(n) => {
            setSteps(n);
            saveSteps(n);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums">{steps.toLocaleString()}</span>
            <span className="text-sm text-muted">/ {STEP_GOAL.toLocaleString()}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>

          <div className="mt-4">
            {walking ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-accent">
                  🚶 {t("Walking…", "Hodam…")} <span className="font-semibold">+{session}</span> {t("this session", "ova sesija")}
                </span>
                <button
                  onClick={stopWalking}
                  className="rounded-xl bg-danger/15 px-4 py-2 text-sm font-semibold text-danger"
                >
                  {t("Stop", "Stop")}
                </button>
              </div>
            ) : (
              <button
                onClick={startWalking}
                className="w-full rounded-xl border border-accent/40 bg-accent/10 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
              >
                🚶 {t("Start walk mode", "Pokreni brojač koraka")}
              </button>
            )}
            {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
          </div>
        </>
      )}
    </section>
  );
}

function StepEditor({
  current,
  onSave,
  onCancel,
}: {
  current: number;
  onSave: (n: number) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [val, setVal] = useState(String(current));
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        autoFocus
        className="w-32 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        onClick={() => {
          const n = Math.max(0, Math.round(Number(val) || 0));
          onSave(n);
        }}
        className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-black"
      >
        {t("Save", "Sačuvaj")}
      </button>
      <button onClick={onCancel} className="px-2 text-sm text-muted">
        {t("Cancel", "Otkaži")}
      </button>
    </div>
  );
}
