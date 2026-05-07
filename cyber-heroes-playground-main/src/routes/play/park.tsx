import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { HUD } from "@/components/game/HUD";
import { store } from "@/lib/game-store";
import { Beep } from "@/components/game/Beep";
import { sounds } from "@/lib/sounds";

export const Route = createFileRoute("/play/park")({ component: Park });

type Item = {
  id: number;
  text: string;
  private: boolean;
  villain?: string;
};

const PRIVATE_ITEMS = ["Home address", "Real name", "School name", "Phone number", "Passwords"];
const PUBLIC_ITEMS = ["Favorite color", "Favorite food", "Pet's name", "Favorite movie", "Hobbies"];

function makeItem(id: number): Item {
  const isPrivate = Math.random() < 0.5;
  if (isPrivate) {
    const text = PRIVATE_ITEMS[Math.floor(Math.random() * PRIVATE_ITEMS.length)];
    return { id, text, private: true, villain: "Snoop Shadow" };
  }
  return {
    id,
    text: PUBLIC_ITEMS[Math.floor(Math.random() * PUBLIC_ITEMS.length)],
    private: false,
  };
}

function Park() {
  const [item, setItem] = useState<Item>(() => makeItem(0));
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(45);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const idRef = useRef(1);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);
  const privateOpacity = useTransform(x, [-150, -40, 0], [1, 0.3, 0]);
  const publicOpacity = useTransform(x, [0, 40, 150], [0, 0.3, 1]);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  useEffect(() => {
    if (time <= 0 && !done) finish();
  }, [time]); // eslint-disable-line

  function next(correct: boolean, action: "private" | "public") {
    setFeedback({ ok: correct, text: correct ? "Good choice!" : "Think again!" });
    if (correct) {
      sounds.success();
      setScore((s) => s + 15);
      if (action === "private" && item.villain) store.unlockSticker(item.villain);
    } else {
      sounds.error();
      setScore((s) => Math.max(0, s - 5));
    }
    setTimeout(() => setFeedback(null), 600);
    animate(x, 0, { duration: 0 });
    setItem(makeItem(idRef.current++));
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    const dx = info.offset.x;
    sounds.swipe();
    if (dx < -120) next(item.private, "private");
    else if (dx > 120) next(!item.private, "public");
    else animate(x, 0, { type: "spring", stiffness: 400 });
  }

  function finish() {
    setDone(true);
    const coins = Math.floor(score / 5);
    store.addCoins(coins);
    store.recordScore("park", score);
    sounds.chime();
  }

  return (
    <div className="min-h-dvh">
      <HUD back title="The Park" />

      <div className="px-4 mt-3 flex items-start gap-3">
        <Beep size={64} mood="think" />
        <div className="flex-1 rounded-2xl bg-card ink-border pop p-3 text-sm font-semibold">
          Keep your secrets safe! Swipe ← to{" "}
          <span className="rounded bg-accent px-1 ink-border">hide</span> private info, and swipe →
          to <span className="rounded bg-accent px-1 ink-border">share</span> fun stuff.
        </div>
      </div>

      <div className="px-4 mt-3 grid grid-cols-2 gap-2 text-center">
        <Stat label="Score" value={score} />
        <Stat label="Time" value={`${Math.max(0, time)}s`} highlight={time <= 10} />
      </div>

      {/* Stage */}
      <div
        className="relative mx-4 mt-4 h-[380px] rounded-3xl ink-border pop-lg overflow-hidden"
        style={{ background: "linear-gradient(180deg, oklch(0.9 0.1 145), oklch(0.7 0.14 145))" }}
      >
        {/* Zones */}
        <motion.div
          style={{ opacity: privateOpacity }}
          className="absolute left-0 top-0 bottom-0 w-1/3 bg-blue-500/30 grid place-items-center"
        >
          <div className="text-5xl">🎒</div>
        </motion.div>
        <motion.div
          style={{ opacity: publicOpacity }}
          className="absolute right-0 top-0 bottom-0 w-1/3 bg-yellow-500/30 grid place-items-center"
        >
          <div className="text-5xl">📢</div>
        </motion.div>

        {/* Edge labels */}
        <div className="absolute left-2 top-2 rounded-full bg-card ink-border px-2 py-0.5 text-xs font-black">
          🎒 Keep Private
        </div>
        <div className="absolute right-2 top-2 rounded-full bg-card ink-border px-2 py-0.5 text-xs font-black">
          📢 Share!
        </div>

        <AnimatePresence mode="wait">
          {!done && (
            <motion.div
              key={item.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              style={{ x, rotate }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 cursor-grab active:cursor-grabbing"
            >
              <div className="relative rounded-2xl ink-border pop-lg p-5 bg-card text-center">
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                  Info Card
                </div>
                <div className="font-display text-2xl leading-snug">{item.text}</div>
                <div className="mt-4 text-xs font-bold text-muted-foreground">Drag me!</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`absolute left-1/2 top-10 -translate-x-1/2 rounded-full ink-border pop px-4 py-1 font-black ${feedback.ok ? "bg-safe text-card" : "bg-danger text-card"
                }`}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 mt-4 flex gap-2 pb-24">
        <button
          onClick={() => next(item.private, "private")}
          className="flex-1 rounded-full ink-border pop bg-blue-500 text-card font-display py-3"
        >
          🎒 Keep Private
        </button>
        <button
          onClick={() => next(!item.private, "public")}
          className="flex-1 rounded-full ink-border pop bg-yellow-500 text-card font-display py-3"
        >
          📢 Share
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
              <div className="text-5xl">🌳</div>
              <h3 className="font-display text-2xl mt-2">Privacy Master!</h3>
              <p className="text-sm font-semibold mt-1">
                Score: <b>{score}</b>
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent ink-border px-3 py-1 font-black">
                +{Math.floor(score / 5)} Shield Coins
              </div>
              <p className="text-xs mt-3 text-muted-foreground">
                Always keep your personal info hidden from strangers.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setScore(0);
                    setTime(45);
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

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl ink-border pop py-2 text-center ${highlight ? "bg-accent" : "bg-card"}`}
    >
      <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-xl">{value}</div>
    </div>
  );
}
