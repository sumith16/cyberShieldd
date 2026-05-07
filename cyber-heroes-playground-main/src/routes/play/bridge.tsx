import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HUD } from "@/components/game/HUD";
import { store } from "@/lib/game-store";
import { Beep } from "@/components/game/Beep";
import { sounds } from "@/lib/sounds";

export const Route = createFileRoute("/play/bridge")({ component: Bridge });

type Network = {
  id: string;
  name: string;
  secured: boolean; // Needs password / padlock
};

const NETWORKS: Network[] = [
  { id: "1", name: "Home_WiFi", secured: true },
  { id: "2", name: "Free_Public_WiFi", secured: false },
  { id: "3", name: "Airport_Guest_NoPass", secured: false },
  { id: "4", name: "Library_Secure", secured: true },
  { id: "5", name: "Cafe_Free_Web", secured: false },
  { id: "6", name: "Dad_Hotspot", secured: true },
];

function Bridge() {
  const [planks, setPlanks] = useState<Network[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    // Shuffle and pick 4 networks for the bridge
    const shuffled = [...NETWORKS].sort(() => Math.random() - 0.5).slice(0, 4);
    // Ensure at least 1 safe and 1 unsafe
    setPlanks(shuffled);
  }, []);

  function toggle(id: string) {
    if (done || feedback) return;
    sounds.click();
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function checkBridge() {
    let mistakes = 0;
    planks.forEach((p) => {
      if (p.secured && !selected.has(p.id)) mistakes++;
      if (!p.secured && selected.has(p.id)) mistakes++;
    });

    if (mistakes === 0) {
      sounds.success();
      setFeedback({ ok: true, text: "Bridge is secure!" });
      setScore(50);
      setTimeout(finish, 1500);
    } else {
      sounds.error();
      setFeedback({ ok: false, text: "Some planks are unsafe!" });
      setScore(0);
      setTimeout(() => {
        setFeedback(null);
        setSelected(new Set());
        setPlanks([...NETWORKS].sort(() => Math.random() - 0.5).slice(0, 4));
      }, 1500);
    }
  }

  function finish() {
    setDone(true);
    const coins = score > 0 ? 10 : 0;
    store.addCoins(coins);
    store.recordScore("bridge", score);
    sounds.chime();
  }

  return (
    <div className="min-h-dvh">
      <HUD back title="The Bridge" />

      <div className="px-4 mt-3 flex items-start gap-3">
        <Beep size={64} mood="think" />
        <div className="flex-1 rounded-2xl bg-card ink-border pop p-3 text-sm font-semibold">
          Fix the bridge! Select only the{" "}
          <span className="rounded bg-accent px-1 ink-border text-safe">Secured Wi-Fi</span>{" "}
          networks (the ones that need passwords). Leave the open ones behind!
        </div>
      </div>

      {/* Stage */}
      <div
        className="relative mx-4 mt-6 h-[380px] rounded-3xl ink-border pop-lg overflow-hidden flex flex-col items-center justify-center p-4"
        style={{ background: "linear-gradient(180deg, oklch(0.85 0.1 230), oklch(0.6 0.15 250))" }}
      >
        <div className="w-full flex flex-col gap-3 relative z-10">
          {planks.map((p) => {
            const isSelected = selected.has(p.id);
            return (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggle(p.id)}
                className={`w-full p-4 rounded-xl ink-border font-display text-lg flex items-center justify-between transition-colors ${
                  isSelected ? "bg-safe text-card" : "bg-card text-foreground"
                }`}
              >
                <span>{p.name}</span>
                <span className="text-2xl">{p.secured ? "🔒" : "🔓"}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={`absolute z-20 px-6 py-3 rounded-full ink-border pop font-black text-xl text-card ${
                feedback.ok ? "bg-safe" : "bg-danger"
              }`}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 mt-6 pb-24">
        <button
          onClick={checkBridge}
          disabled={!!feedback || done || selected.size === 0}
          className="w-full rounded-full ink-border pop bg-primary text-primary-foreground font-display text-xl py-4 disabled:opacity-50"
        >
          Cross the Bridge!
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
              <div className="text-5xl">🌉</div>
              <h3 className="font-display text-2xl mt-2">Safe Crossing!</h3>
              <p className="text-sm font-semibold mt-1">
                Score: <b>{score}</b>
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent ink-border px-3 py-1 font-black">
                +{score > 0 ? 10 : 0} Shield Coins
              </div>
              <p className="text-xs mt-3 text-muted-foreground">
                Always use secured networks with a padlock symbol to keep your data safe!
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setScore(0);
                    setSelected(new Set());
                    setDone(false);
                    setPlanks([...NETWORKS].sort(() => Math.random() - 0.5).slice(0, 4));
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
