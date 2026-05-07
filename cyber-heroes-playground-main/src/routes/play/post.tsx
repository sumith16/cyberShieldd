import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { HUD } from "@/components/game/HUD";
import { store } from "@/lib/game-store";
import { sounds } from "@/lib/sounds";

export const Route = createFileRoute("/play/post")({ component: Post });

type Letter = {
  id: number;
  text: string;
  scam: boolean;
  villain?: string;
  shape: "smooth" | "spiky"; // colorblind cue
};

const SAFE = [
  "Game update is ready!",
  "Mom: dinner at 7 ❤",
  "Library books due Friday",
  "Your art club meets today",
];
const SCAM: { text: string; villain: string }[] = [
  { text: "U WON A FREE iPhone! Click NOW", villain: "Prize Pig" },
  { text: "Your account is LOCKED. Send password.", villain: "Lock Lurker" },
  { text: "Hi grandma here, send code 1234", villain: "Faker Phantom" },
  { text: "Click to get 9999 ROBUX free!", villain: "Loot Goblin" },
];

function makeLetter(id: number): Letter {
  const scam = Math.random() < 0.5;
  if (scam) {
    const s = SCAM[Math.floor(Math.random() * SCAM.length)];
    return { id, text: s.text, scam: true, villain: s.villain, shape: "spiky" };
  }
  return { id, text: SAFE[Math.floor(Math.random() * SAFE.length)], scam: false, shape: "smooth" };
}

function Post() {
  const [letter, setLetter] = useState<Letter>(() => makeLetter(0));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [time, setTime] = useState(45);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const idRef = useRef(1);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);
  const trashOpacity = useTransform(x, [-150, -40, 0], [1, 0.3, 0]);
  const inboxOpacity = useTransform(x, [0, 40, 150], [0, 0.3, 1]);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  useEffect(() => {
    if (time <= 0 && !done) finish();
  }, [time]); // eslint-disable-line

  function next(correct: boolean, action: "trash" | "inbox") {
    setFeedback({
      ok: correct,
      text: correct ? (action === "trash" ? "Trashed!" : "Inboxed!") : "Oops!",
    });
    if (correct) {
      sounds.success();
      setScore((s) => s + 10 + combo * 2);
      setCombo((c) => c + 1);
      if (action === "trash" && letter.villain) store.unlockSticker(letter.villain);
    } else {
      sounds.error();
      setCombo(0);
    }
    setTimeout(() => setFeedback(null), 600);
    animate(x, 0, { duration: 0 });
    setLetter(makeLetter(idRef.current++));
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    const dx = info.offset.x;
    sounds.swipe();
    if (dx < -120) next(letter.scam, "trash");
    else if (dx > 120) next(!letter.scam, "inbox");
    else animate(x, 0, { type: "spring", stiffness: 400 });
  }

  function finish() {
    setDone(true);
    const coins = Math.floor(score / 5);
    store.addCoins(coins);
    store.recordScore("post", score);
    sounds.chime();
  }

  return (
    <div className="min-h-dvh">
      <HUD back title="Post Office" />

      <div className="px-4 mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="Score" value={score} />
        <Stat label="Combo" value={`x${combo}`} highlight={combo >= 3} />
        <Stat label="Time" value={`${Math.max(0, time)}s`} highlight={time <= 10} />
      </div>

      <div className="px-4 mt-3 text-center text-sm font-bold text-muted-foreground">
        Swipe ← to <span className="text-danger">trash scams</span> · Swipe → to{" "}
        <span className="text-safe">inbox real mail</span>
      </div>

      {/* Stage */}
      <div
        className="relative mx-4 mt-4 h-[420px] rounded-3xl ink-border pop-lg overflow-hidden"
        style={{ background: "linear-gradient(180deg, var(--sky), oklch(0.92 0.06 230))" }}
      >
        {/* Trash zone */}
        <motion.div
          style={{ opacity: trashOpacity }}
          className="absolute left-0 top-0 bottom-0 w-1/3 bg-danger/30 grid place-items-center"
        >
          <div className="text-5xl">🗑️</div>
        </motion.div>
        <motion.div
          style={{ opacity: inboxOpacity }}
          className="absolute right-0 top-0 bottom-0 w-1/3 bg-safe/30 grid place-items-center"
        >
          <div className="text-5xl">📥</div>
        </motion.div>

        {/* Edge labels (always visible) */}
        <div className="absolute left-2 top-2 rounded-full bg-card ink-border px-2 py-0.5 text-xs font-black">
          🗑️ Trash
        </div>
        <div className="absolute right-2 top-2 rounded-full bg-card ink-border px-2 py-0.5 text-xs font-black">
          📥 Inbox
        </div>

        <AnimatePresence mode="wait">
          {!done && (
            <motion.div
              key={letter.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              style={{ x, rotate }}
              initial={{ y: -300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 cursor-grab active:cursor-grabbing"
            >
              <div
                className={`relative rounded-2xl ink-border pop-lg p-4 bg-card ${letter.shape === "spiky" ? "" : ""}`}
              >
                {letter.shape === "spiky" && (
                  <div
                    className="absolute -top-3 -right-3 grid place-items-center h-9 w-9 rounded-full bg-danger ink-border text-card font-black"
                    aria-label="warning"
                  >
                    ⚠
                  </div>
                )}
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Letter
                </div>
                <div className="font-display text-lg leading-snug mt-1">{letter.text}</div>
                <div className="mt-3 text-xs font-bold text-muted-foreground">Drag me!</div>
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
              className={`absolute left-1/2 top-4 -translate-x-1/2 rounded-full ink-border pop px-4 py-1 font-black ${
                feedback.ok ? "bg-safe text-card" : "bg-danger text-card"
              }`}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 mt-4 flex gap-2 pb-24">
        <button
          onClick={() => next(letter.scam, "trash")}
          className="flex-1 rounded-full ink-border pop bg-danger text-card font-display py-3"
        >
          🗑️ Trash
        </button>
        <button
          onClick={() => next(!letter.scam, "inbox")}
          className="flex-1 rounded-full ink-border pop bg-safe text-card font-display py-3"
        >
          📥 Inbox
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
              <h3 className="font-display text-2xl mt-2">Mail sorted!</h3>
              <p className="text-sm font-semibold mt-1">
                Score: <b>{score}</b>
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent ink-border px-3 py-1 font-black">
                +{Math.floor(score / 5)} Shield Coins
              </div>
              <p className="text-xs mt-3 text-muted-foreground">
                Real mail looks normal. Tricks shout, beg, or rush you.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setScore(0);
                    setCombo(0);
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
    <div className={`rounded-2xl ink-border pop py-2 ${highlight ? "bg-accent" : "bg-card"}`}>
      <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-xl">{value}</div>
    </div>
  );
}
