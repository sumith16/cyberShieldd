import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HUD } from "@/components/game/HUD";
import { store } from "@/lib/game-store";
import { Beep } from "@/components/game/Beep";
import { sounds } from "@/lib/sounds";

export const Route = createFileRoute("/play/library")({ component: Library });

type Headline = {
  id: number;
  text: string;
  source: string;
  fake: boolean;
};

const HEADLINES = [
  { source: "Real News Times", text: "Scientists discover a new species of frog in the Amazon.", fake: false },
  { source: "ALIEN_TRUTH_99", text: "UFOs stealing all the world's ice cream! Panic!", fake: true },
  { source: "Local Weather", text: "Heavy rain expected this weekend, bring umbrellas.", fake: false },
  { source: "FREE_GEMS_HACK", text: "Click here to get 1,000,000 free Robux right now!", fake: true },
  { source: "Science Weekly", text: "Eating vegetables helps your brain grow stronger.", fake: false },
  { source: "Secret_Rumors", text: "The moon is actually made of cheese! NASA lied!", fake: true },
];

function makeHeadline(id: number): Headline {
  const m = HEADLINES[Math.floor(Math.random() * HEADLINES.length)];
  return { id, ...m };
}

function Library() {
  const [headline, setHeadline] = useState<Headline>(() => makeHeadline(0));
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  useEffect(() => {
    if (time <= 0 && !done) finish();
  }, [time]); // eslint-disable-line

  function next(action: "fake" | "real") {
    sounds.click();
    const correct = (action === "fake" && headline.fake) || (action === "real" && !headline.fake);
    setFeedback({ ok: correct, text: correct ? "Fact Checked!" : "Oops!" });
    
    if (correct) {
      sounds.success();
      setScore((s) => s + 20);
    } else {
      sounds.error();
      setScore((s) => Math.max(0, s - 10));
    }

    setTimeout(() => {
      setFeedback(null);
      setHeadline(makeHeadline(Date.now()));
    }, 800);
  }

  function finish() {
    sounds.chime();
    setDone(true);
    const coins = Math.floor(score / 5);
    store.addCoins(coins);
    store.recordScore("library", score);
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <HUD back title="The Library" />

      <div className="px-4 mt-3 flex items-start gap-3 flex-shrink-0">
        <Beep size={64} mood="think" />
        <div className="flex-1 rounded-2xl bg-card ink-border pop p-3 text-sm font-semibold">
          Don't believe everything you read! If it sounds too crazy or the source looks weird, mark it <span className="text-danger">Fake</span>!
        </div>
      </div>

      <div className="px-4 mt-3 grid grid-cols-2 gap-2 text-center flex-shrink-0">
        <Stat label="Score" value={score} />
        <Stat label="Time" value={`${Math.max(0, time)}s`} highlight={time <= 10} />
      </div>

      {/* Book Stage */}
      <div className="flex-1 relative mx-4 mt-4 mb-24 rounded-3xl ink-border pop-lg overflow-hidden flex flex-col"
           style={{ background: "linear-gradient(135deg, oklch(0.85 0.1 50), oklch(0.7 0.15 60))" }}>
        
        <div className="flex-1 p-6 flex flex-col justify-center items-center">
          <AnimatePresence mode="wait">
            {!feedback && !done ? (
              <motion.div
                key={headline.id}
                initial={{ scale: 0.9, opacity: 0, rotateY: 90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.9, opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[280px] aspect-[3/4] bg-[#fdfaf6] rounded-r-3xl rounded-l-md border-l-8 border-l-[#8b5a2b] shadow-xl p-5 flex flex-col relative"
              >
                {/* Book styling lines */}
                <div className="absolute top-2 right-2 bottom-2 w-px bg-black/10" />
                <div className="absolute top-2 right-3 bottom-2 w-px bg-black/5" />
                
                <div className="text-[10px] font-black uppercase tracking-wider text-[#8b5a2b]/70 mb-4 border-b border-[#8b5a2b]/20 pb-2">
                  Source: {headline.source}
                </div>
                
                <h2 className="font-display text-xl text-black leading-snug">
                  "{headline.text}"
                </h2>
                
                <div className="mt-auto text-4xl self-end opacity-20">📰</div>
              </motion.div>
            ) : feedback ? (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className={`rounded-2xl pop p-6 text-center font-display text-2xl text-white ${
                  feedback.ok ? "bg-safe" : "bg-danger"
                }`}
              >
                {feedback.text}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="p-4 flex gap-3 bg-black/10 backdrop-blur-sm">
          <button 
            onClick={() => next("fake")} 
            disabled={!!feedback || done}
            className="flex-1 rounded-full bg-danger text-white font-display text-lg py-3 shadow-[0_4px_0_oklch(0.4_0.15_25)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50">
            ❌ Fake
          </button>
          <button 
            onClick={() => next("real")} 
            disabled={!!feedback || done}
            className="flex-1 rounded-full bg-safe text-white font-display text-lg py-3 shadow-[0_4px_0_oklch(0.5_0.15_140)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50">
            ✅ Real
          </button>
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-foreground/80 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }}
              className="rounded-3xl bg-card ink-border pop-lg p-6 max-w-sm text-center w-full">
              <div className="text-5xl">📚</div>
              <h3 className="font-display text-2xl mt-2">Fact Checker!</h3>
              <p className="text-sm font-semibold mt-1">Score: <b>{score}</b></p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent ink-border px-3 py-1 font-black">
                +{Math.floor(score / 5)} Shield Coins
              </div>
              <div className="mt-6 flex gap-2">
                <button onClick={() => { setScore(0); setTime(30); setDone(false); }}
                  className="flex-1 rounded-full ink-border pop bg-secondary font-bold py-3">Play again</button>
                <Link to="/" className="flex-1 rounded-full ink-border pop bg-primary text-primary-foreground font-bold py-3 grid place-items-center">
                  City
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl ink-border pop py-2 text-center ${highlight ? "bg-accent" : "bg-card"}`}>
      <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-xl">{value}</div>
    </div>
  );
}
