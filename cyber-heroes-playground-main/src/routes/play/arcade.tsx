import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HUD } from "@/components/game/HUD";
import { store } from "@/lib/game-store";
import { sounds } from "@/lib/sounds";

export const Route = createFileRoute("/play/arcade")({ component: Arcade });

type Balloon = {
  id: number;
  x: number; // percent
  y: number; // percent (animates upward via duration)
  bad: boolean;
  label: string;
  duration: number; // seconds to cross
  hue: number;
};

const BAD = ["DOWNLOAD NOW!!", "FREE V-BUCKS", "CLICK 2 WIN", "SCAN ME", "100% PRIZE"];
const GOOD = ["Game update", "Cloud save", "New skin", "Map patch", "Bug fix"];

function makeBalloon(id: number): Balloon {
  const bad = Math.random() < 0.55;
  return {
    id,
    x: 10 + Math.random() * 80,
    y: 110,
    bad,
    label: bad
      ? BAD[Math.floor(Math.random() * BAD.length)]
      : GOOD[Math.floor(Math.random() * GOOD.length)],
    duration: 4 + Math.random() * 3,
    hue: bad ? 15 : 150,
  };
}

function Arcade() {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(40);
  const [done, setDone] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    if (done) return;
    const spawn = setInterval(() => {
      setBalloons((b) => [...b.slice(-7), makeBalloon(idRef.current++)]);
    }, 900);
    const tick = setInterval(() => setTime((s) => s - 1), 1000);
    return () => {
      clearInterval(spawn);
      clearInterval(tick);
    };
  }, [done]);

  useEffect(() => {
    if ((time <= 0 || lives <= 0) && !done) {
      sounds.chime();
      setDone(true);
      const coins = Math.floor(score / 5);
      store.addCoins(coins);
      store.recordScore("arcade", score);
    }
  }, [time, lives]); // eslint-disable-line

  function pop(b: Balloon) {
    sounds.pop();
    setBalloons((arr) => arr.filter((x) => x.id !== b.id));
    if (b.bad) {
      setScore((s) => s + 15);
    } else {
      sounds.error();
      setLives((l) => l - 1);
      setScore((s) => Math.max(0, s - 5));
    }
  }

  function escaped(b: Balloon) {
    setBalloons((arr) => arr.filter((x) => x.id !== b.id));
    if (b.bad) setLives((l) => l - 1); // a bad pop-up got through
  }

  return (
    <div className="min-h-dvh">
      <HUD back title="The Arcade" />

      <div className="px-4 mt-3 grid grid-cols-3 gap-2">
        <Stat label="Score" value={score} />
        <Stat label="Lives" value={"❤".repeat(Math.max(0, lives)) || "—"} />
        <Stat label="Time" value={`${Math.max(0, time)}s`} highlight={time <= 10} />
      </div>

      <p className="px-4 mt-2 text-center text-sm font-bold text-muted-foreground">
        Pop the <span className="text-danger">spiky scams</span>. Let the{" "}
        <span className="text-safe">round updates</span> float by.
      </p>

      <div
        className="relative mx-4 mt-3 h-[480px] rounded-3xl ink-border pop-lg overflow-hidden"
        style={{ background: "linear-gradient(180deg, oklch(0.88 0.1 280), oklch(0.78 0.14 320))" }}
      >
        {/* ground */}
        <div
          className="absolute bottom-0 inset-x-0 h-6 ink-border"
          style={{ background: "var(--grass)" }}
        />
        <AnimatePresence>
          {balloons.map((b) => (
            <motion.button
              key={b.id}
              onClick={() => pop(b)}
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "-20%", opacity: 1 }}
              exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.18 } }}
              transition={{ duration: b.duration, ease: "linear", opacity: { duration: 0.3 } }}
              onAnimationComplete={() => escaped(b)}
              style={{ left: `${b.x}%` }}
              className="absolute"
              aria-label={b.bad ? "scam pop-up" : "safe update"}
            >
              <BalloonShape bad={b.bad} label={b.label} hue={b.hue} />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="px-4 mt-3 pb-24 text-center text-xs text-muted-foreground font-bold">
        Tip: real updates have rounded edges and short, calm names.
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
              <div className="text-5xl">🎯</div>
              <h3 className="font-display text-2xl mt-2">Nice aim!</h3>
              <p className="text-sm font-semibold mt-1">
                Score: <b>{score}</b>
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent ink-border px-3 py-1 font-black">
                +{Math.floor(score / 5)} Shield Coins
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setScore(0);
                    setLives(3);
                    setTime(40);
                    setBalloons([]);
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

function BalloonShape({ bad, label, hue }: { bad: boolean; label: string; hue: number }) {
  const fill = `oklch(0.78 0.18 ${hue})`;
  return (
    <div className="relative grid place-items-center" style={{ width: 110, height: 130 }}>
      {bad ? (
        <svg viewBox="0 0 100 100" width="100" height="100">
          <polygon
            points="50,4 60,30 88,30 66,48 76,76 50,60 24,76 34,48 12,30 40,30"
            fill={fill}
            stroke="var(--border)"
            strokeWidth="3"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 100 100" width="100" height="100">
          <circle cx="50" cy="48" r="38" fill={fill} stroke="var(--border)" strokeWidth="3" />
        </svg>
      )}
      <div className="absolute inset-0 grid place-items-center px-2 pointer-events-none">
        <span className="text-[10px] leading-tight text-center font-black text-stroke text-card">
          {label}
        </span>
      </div>
      <div className="w-px h-5 bg-foreground/60 -mt-1" />
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
