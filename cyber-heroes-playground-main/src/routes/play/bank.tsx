import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HUD } from "@/components/game/HUD";
import { store } from "@/lib/game-store";
import { Beep } from "@/components/game/Beep";
import { sounds } from "@/lib/sounds";

export const Route = createFileRoute("/play/bank")({ component: Bank });

type Message = {
  id: number;
  text: string;
  sender: string;
  phishing: boolean;
};

const MESSAGES = [
  { sender: "Bank-Alert", text: "Your account is locked. Click here to verify: http://bink-login.com", phishing: true },
  { sender: "Mom", text: "Can you pick up milk on your way home?", phishing: false },
  { sender: "PrizeCenter", text: "You won $1000! Reply with your PIN to claim.", phishing: true },
  { sender: "GameSupport", text: "We need your password to fix your account. Send it here.", phishing: true },
  { sender: "School", text: "Reminder: No classes this Friday.", phishing: false },
  { sender: "Delivery", text: "Package missing. Pay $2 fee at http://fakepost.com/pay", phishing: true },
];

function makeMessage(id: number): Message {
  const m = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  return { id, ...m };
}

function Bank() {
  const [msg, setMsg] = useState<Message>(() => makeMessage(0));
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

  function next(action: "block" | "safe") {
    sounds.click();
    const correct = (action === "block" && msg.phishing) || (action === "safe" && !msg.phishing);
    setFeedback({ ok: correct, text: correct ? "Good catch!" : "Tricked!" });
    
    if (correct) {
      sounds.success();
      setScore((s) => s + 20);
    } else {
      sounds.error();
      setScore((s) => Math.max(0, s - 10));
    }

    setTimeout(() => {
      setFeedback(null);
      setMsg(makeMessage(Date.now()));
    }, 800);
  }

  function finish() {
    sounds.chime();
    setDone(true);
    const coins = Math.floor(score / 5);
    store.addCoins(coins);
    store.recordScore("bank", score);
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <HUD back title="The Bank" />

      <div className="px-4 mt-3 flex items-start gap-3 flex-shrink-0">
        <Beep size={64} mood="think" />
        <div className="flex-1 rounded-2xl bg-card ink-border pop p-3 text-sm font-semibold">
          Don't get scammed! If a text asks for passwords, money, or has a weird link, <span className="text-danger">Block it!</span>
        </div>
      </div>

      <div className="px-4 mt-3 grid grid-cols-2 gap-2 text-center flex-shrink-0">
        <Stat label="Score" value={score} />
        <Stat label="Time" value={`${Math.max(0, time)}s`} highlight={time <= 10} />
      </div>

      {/* Phone Screen Stage */}
      <div className="flex-1 relative mx-4 mt-4 mb-24 rounded-[2rem] ink-border pop-lg overflow-hidden flex flex-col bg-black border-[6px] border-zinc-800">
        {/* Dynamic notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20 flex items-center justify-center gap-2">
          <div className="w-12 h-1.5 bg-black rounded-full opacity-50" />
          <div className="w-2 h-2 rounded-full bg-blue-900/50 shadow-[0_0_4px_blue]" />
        </div>

        <div className="flex-1 bg-zinc-900 p-4 pt-8 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!feedback && !done ? (
              <motion.div
                key={msg.id}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                className="w-full rounded-2xl bg-zinc-800 p-4 relative"
              >
                <div className="text-xs font-bold text-zinc-400 mb-2">From: {msg.sender}</div>
                <div className="font-sans text-lg text-white leading-snug">{msg.text}</div>
                <div className="absolute -bottom-2 -left-2 text-3xl">💬</div>
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
        <div className="bg-zinc-800 p-4 flex gap-3 border-t border-zinc-700">
          <button 
            onClick={() => next("block")} 
            disabled={!!feedback || done}
            className="flex-1 rounded-full bg-danger text-white font-display text-lg py-3 active:scale-95 transition-transform disabled:opacity-50">
            🚫 Block
          </button>
          <button 
            onClick={() => next("safe")} 
            disabled={!!feedback || done}
            className="flex-1 rounded-full bg-blue-500 text-white font-display text-lg py-3 active:scale-95 transition-transform disabled:opacity-50">
            ✅ Safe
          </button>
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-foreground/80 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }}
              className="rounded-3xl bg-card ink-border pop-lg p-6 max-w-sm text-center w-full">
              <div className="text-5xl">🏦</div>
              <h3 className="font-display text-2xl mt-2">Bank Secured!</h3>
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
