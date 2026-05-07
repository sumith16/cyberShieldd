import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HUD } from "@/components/game/HUD";
import { Beep } from "@/components/game/Beep";
import { store } from "@/lib/game-store";
import { sounds } from "@/lib/sounds";

export const Route = createFileRoute("/play/fort")({ component: Fort });

type Block = { id: string; label: string; type: "word" | "num" | "sym" };

const POOL: Block[] = [
  { id: "w1", label: "puppy", type: "word" },
  { id: "w2", label: "summer", type: "word" },
  { id: "w3", label: "pizza", type: "word" },
  { id: "w4", label: "hello", type: "word" },
  { id: "n1", label: "47", type: "num" },
  { id: "n2", label: "92", type: "num" },
  { id: "n3", label: "13", type: "num" },
  { id: "s1", label: "#", type: "sym" },
  { id: "s2", label: "!", type: "sym" },
  { id: "s3", label: "@", type: "sym" },
];

function score(slots: Block[]): { strength: number; tier: "wood" | "stone" | "diamond" } {
  if (slots.length < 4) return { strength: 0, tier: "wood" };
  const hasNum = slots.some((b) => b.type === "num");
  const hasSym = slots.some((b) => b.type === "sym");
  const wordCount = slots.filter((b) => b.type === "word").length;
  let s = slots.length * 12;
  if (hasNum) s += 20;
  if (hasSym) s += 25;
  if (wordCount > 2) s -= 10;
  s = Math.max(0, Math.min(100, s));
  const tier = s >= 80 ? "diamond" : s >= 50 ? "stone" : "wood";
  return { strength: s, tier };
}

function Fort() {
  const [slots, setSlots] = useState<Block[]>([]);
  const [done, setDone] = useState(false);
  const result = useMemo(() => score(slots), [slots]);

  const available = POOL.filter((b) => !slots.find((s) => s.id === b.id));

  const add = (b: Block) => {
    if (slots.length < 6) {
      sounds.click();
      setSlots([...slots, b]);
    }
  };
  const remove = (id: string) => {
    sounds.pop();
    setSlots(slots.filter((b) => b.id !== id));
  };

  const finish = () => {
    if (done) return;
    const coins = result.tier === "diamond" ? 30 : result.tier === "stone" ? 15 : 5;
    store.addCoins(coins);
    store.recordScore("fort", result.strength);
    sounds.chime();
    setDone(true);
  };

  const door =
    result.tier === "diamond"
      ? { fill: "oklch(0.85 0.15 200)", label: "DIAMOND" }
      : result.tier === "stone"
        ? { fill: "oklch(0.7 0.02 260)", label: "STONE" }
        : { fill: "oklch(0.55 0.1 50)", label: "WOOD" };

  return (
    <div className="min-h-dvh">
      <HUD back title="The Fort" />

      <div className="px-4 mt-3 flex items-start gap-3">
        <Beep size={64} mood="think" />
        <div className="flex-1 rounded-2xl bg-card ink-border pop p-3 text-sm font-semibold">
          Build a wall! Stack <span className="rounded bg-accent px-1 ink-border">numbers</span> and{" "}
          <span className="rounded bg-accent px-1 ink-border">symbols</span> to forge a diamond
          door.
        </div>
      </div>

      {/* Door visualization */}
      <div
        className="mx-4 mt-4 rounded-3xl ink-border pop-lg overflow-hidden"
        style={{ background: "oklch(0.85 0.06 230)" }}
      >
        <div className="relative h-44 grid place-items-center">
          <motion.svg
            viewBox="0 0 200 160"
            width="180"
            height="144"
            animate={result.tier === "wood" && slots.length >= 4 ? { x: [-2, 2, -2, 2, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.4 }}
          >
            <rect
              x="20"
              y="20"
              width="160"
              height="130"
              rx="14"
              fill={door.fill}
              stroke="var(--border)"
              strokeWidth="4"
            />
            <circle
              cx="150"
              cy="85"
              r="6"
              fill="var(--accent)"
              stroke="var(--border)"
              strokeWidth="2"
            />
            <text
              x="100"
              y="92"
              textAnchor="middle"
              fontFamily="Fredoka"
              fontWeight="700"
              fontSize="22"
              fill="var(--border)"
            >
              {door.label}
            </text>
          </motion.svg>
          <div className="absolute top-2 right-3 rounded-full bg-card ink-border px-2 py-0.5 text-xs font-black">
            Strength {result.strength}
          </div>
        </div>
        <div className="h-2 bg-card">
          <motion.div
            className="h-full"
            style={{ background: "var(--primary)" }}
            animate={{ width: `${result.strength}%` }}
          />
        </div>
      </div>

      {/* Slots */}
      <div className="px-4 mt-4">
        <div className="text-xs font-bold uppercase tracking-wide mb-1">Your password wall</div>
        <div className="rounded-2xl ink-border bg-card p-2 min-h-16 flex flex-wrap gap-2">
          {slots.length === 0 && (
            <span className="text-muted-foreground text-sm m-2">Tap blocks below…</span>
          )}
          <AnimatePresence>
            {slots.map((b) => (
              <motion.button
                key={b.id}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => remove(b.id)}
                className={`px-3 py-2 rounded-xl ink-border font-black ${
                  b.type === "word" ? "bg-muted" : b.type === "num" ? "bg-accent" : "bg-secondary"
                }`}
              >
                {b.label}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Pool */}
      <div className="px-4 mt-4">
        <div className="text-xs font-bold uppercase tracking-wide mb-1">Block bin</div>
        <div className="flex flex-wrap gap-2">
          {available.map((b) => (
            <motion.button
              key={b.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => add(b)}
              className={`px-3 py-2 rounded-xl ink-border pop font-black ${
                b.type === "word" ? "bg-muted" : b.type === "num" ? "bg-accent" : "bg-secondary"
              }`}
            >
              {b.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-6 pb-24">
        <button
          onClick={finish}
          disabled={slots.length < 4}
          className="w-full rounded-full ink-border pop bg-primary text-primary-foreground font-display text-lg py-3 disabled:opacity-50"
        >
          {slots.length < 4 ? "Add at least 4 blocks" : "Lock the door!"}
        </button>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            className="fixed inset-0 z-30 grid place-items-center bg-foreground/70 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.6, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="rounded-3xl bg-card ink-border pop-lg p-6 max-w-sm text-center"
            >
              <div className="text-5xl">
                {result.tier === "diamond" ? "💎" : result.tier === "stone" ? "🪨" : "🪵"}
              </div>
              <h3 className="font-display text-2xl mt-2">
                {result.tier === "diamond"
                  ? "Unbreakable!"
                  : result.tier === "stone"
                    ? "Pretty tough!"
                    : "The monsters got in…"}
              </h3>
              <p className="text-sm font-semibold mt-1">
                Real passwords are like this wall — long, with numbers <em>and</em> symbols.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent ink-border px-3 py-1 font-black">
                +{result.tier === "diamond" ? 30 : result.tier === "stone" ? 15 : 5} Shield Coins
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setSlots([]);
                    setDone(false);
                  }}
                  className="flex-1 rounded-full ink-border pop bg-secondary font-bold py-2"
                >
                  Try again
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
