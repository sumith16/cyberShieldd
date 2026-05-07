import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HUD } from "@/components/game/HUD";
import { store } from "@/lib/game-store";
import { Beep } from "@/components/game/Beep";
import { sounds } from "@/lib/sounds";

export const Route = createFileRoute("/play/hq")({ component: HQ });

type Scenario = {
  id: number;
  text: string;
  danger: boolean;
};

const DANGER_SCENARIOS = [
  "A stranger asks for your photo online.",
  "Your screen freezes with a scary warning.",
  "Someone you don't know asks to meet up.",
  "A game asks for your parents' credit card.",
  "Someone is being mean to you in chat.",
];

const SAFE_SCENARIOS = [
  "You want to change your avatar's color.",
  "You lost a round in your favorite game.",
  "You want to build a new house in Minecraft.",
  "Your friend sent you a funny cat video.",
  "You need to save your game progress.",
];

function makeScenario(id: number): Scenario {
  const danger = Math.random() < 0.5;
  if (danger) {
    return {
      id,
      text: DANGER_SCENARIOS[Math.floor(Math.random() * DANGER_SCENARIOS.length)],
      danger: true,
    };
  }
  return {
    id,
    text: SAFE_SCENARIOS[Math.floor(Math.random() * SAFE_SCENARIOS.length)],
    danger: false,
  };
}

function HQ() {
  const [scenario, setScenario] = useState<Scenario>(() => makeScenario(0));
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  function next(action: "call" | "handle") {
    const correct =
      (action === "call" && scenario.danger) || (action === "handle" && !scenario.danger);
    setFeedback({ ok: correct, text: correct ? "Great choice!" : "Uh oh..." });

    if (correct) {
      sounds.success();
      setScore((s) => s + 20);
    } else {
      sounds.error();
      setScore((s) => Math.max(0, s - 5));
    }

    setTimeout(() => {
      setFeedback(null);
      if (round >= 10) {
        finish();
      } else {
        setRound((r) => r + 1);
        setScenario(makeScenario(round));
      }
    }, 1000);
  }

  function finish() {
    setDone(true);
    const coins = Math.floor(score / 5);
    store.addCoins(coins);
    store.recordScore("hq", score);
    sounds.chime();
  }

  return (
    <div className="min-h-dvh">
      <HUD back title="Hero HQ" />

      <div className="px-4 mt-3 flex items-start gap-3">
        <Beep size={64} mood="wow" />
        <div className="flex-1 rounded-2xl bg-card ink-border pop p-3 text-sm font-semibold">
          Alert! Review the situation. If it's dangerous or scary,{" "}
          <span className="rounded bg-accent px-1 ink-border text-danger">Call Backup</span>.
          Otherwise, <span className="rounded bg-accent px-1 ink-border text-safe">Handle it</span>!
        </div>
      </div>

      <div className="px-4 mt-3 grid grid-cols-2 gap-2 text-center">
        <Stat label="Score" value={score} />
        <Stat label="Round" value={`${round}/10`} />
      </div>

      {/* Stage */}
      <div
        className="relative mx-4 mt-4 h-[350px] rounded-3xl ink-border pop-lg overflow-hidden flex flex-col items-center justify-center p-6"
        style={{ background: "linear-gradient(180deg, oklch(0.85 0.1 80), oklch(0.7 0.1 80))" }}
      >
        <AnimatePresence mode="wait">
          {!feedback && !done ? (
            <motion.div
              key={scenario.id}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              className="w-full rounded-2xl ink-border pop bg-card p-6 text-center"
            >
              <div className="text-4xl mb-4">📡</div>
              <div className="font-display text-2xl leading-snug">{scenario.text}</div>
            </motion.div>
          ) : feedback ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`rounded-2xl ink-border pop p-6 text-center font-display text-2xl text-card ${
                feedback.ok ? "bg-safe" : "bg-danger"
              }`}
            >
              {feedback.text}
              <div className="text-lg mt-2 font-sans opacity-90">
                {feedback.ok
                  ? scenario.danger
                    ? "Always tell an adult!"
                    : "You got this!"
                  : scenario.danger
                    ? "This is dangerous, tell an adult!"
                    : "No need to worry adults for this."}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="px-4 mt-4 flex gap-2 pb-24">
        <button
          onClick={() => next("handle")}
          disabled={!!feedback || done}
          className="flex-1 rounded-full ink-border pop bg-safe text-card font-display py-4 disabled:opacity-50"
        >
          ✅ Handle It
        </button>
        <button
          onClick={() => next("call")}
          disabled={!!feedback || done}
          className="flex-1 rounded-full ink-border pop bg-danger text-card font-display py-4 disabled:opacity-50"
        >
          🚨 Call Backup
        </button>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            className="fixed inset-0 z-30 grid place-items-center bg-foreground/70 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              className="rounded-3xl bg-card ink-border pop-lg p-6 max-w-sm text-center"
            >
              <div className="text-5xl">🦸</div>
              <h3 className="font-display text-2xl mt-2">HQ Commander!</h3>
              <p className="text-sm font-semibold mt-1">
                Score: <b>{score}</b>
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent ink-border px-3 py-1 font-black">
                +{Math.floor(score / 5)} Shield Coins
              </div>
              <p className="text-xs mt-3 text-muted-foreground">
                Whenever you feel unsafe, always call for backup from a trusted adult.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setScore(0);
                    setRound(1);
                    setDone(false);
                  }}
                  className="flex-1 rounded-full ink-border pop bg-secondary font-bold py-2"
                >
                  Play again
                </button>
                <Link
                  to="/"
                  className="flex-1 rounded-full ink-border pop bg-primary text-primary-foreground font-bold py-2 grid place-items-center"
                >
                  Back to City
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={`rounded-2xl ink-border pop py-2 text-center bg-card`}>
      <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-xl">{value}</div>
    </div>
  );
}
