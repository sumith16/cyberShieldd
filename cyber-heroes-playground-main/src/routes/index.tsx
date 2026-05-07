import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Beep } from "@/components/game/Beep";
import { HUD } from "@/components/game/HUD";
import { useGameStore, type GameId } from "@/lib/game-store";

export const Route = createFileRoute("/")({ component: Hub });

type Building = {
  id: GameId;
  name: string;
  emoji: string;
  lesson: string;
  to: string;
  ready: boolean;
  bg: string;
  preview: React.ReactNode;
};

const BUILDINGS: Building[] = [
  {
    id: "fort",
    name: "The Fort",
    emoji: "🏰",
    lesson: "Strong Passwords",
    to: "/play/fort",
    ready: true,
    bg: "oklch(0.85 0.14 30)",
    preview: (
      <div className="absolute inset-0 flex items-end justify-center pb-2 gap-1 opacity-40">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0 }} className="w-4 h-4 bg-accent rounded-sm" />
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.2 }} className="w-4 h-4 bg-primary rounded-sm" />
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.4 }} className="w-4 h-4 bg-secondary rounded-sm" />
      </div>
    )
  },
  {
    id: "post",
    name: "Post Office",
    emoji: "📬",
    lesson: "Spot the Trick",
    to: "/play/post",
    ready: true,
    bg: "oklch(0.82 0.15 200)",
    preview: (
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <motion.div animate={{ x: [-15, 15, -15], rotate: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="w-8 h-6 bg-card rounded-md shadow-sm border border-foreground/20" />
      </div>
    )
  },
  {
    id: "arcade",
    name: "The Arcade",
    emoji: "🎯",
    lesson: "Safe Clicking",
    to: "/play/arcade",
    ready: true,
    bg: "oklch(0.82 0.16 320)",
    preview: (
      <div className="absolute inset-0 flex items-end justify-around pb-1 opacity-40 overflow-hidden">
        <motion.div animate={{ y: [20, -60] }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }} className="w-4 h-5 rounded-full bg-danger" />
        <motion.div animate={{ y: [20, -60] }} transition={{ repeat: Infinity, duration: 3.2, delay: 1, ease: "linear" }} className="w-4 h-5 rounded-full bg-safe" />
        <motion.div animate={{ y: [20, -60] }} transition={{ repeat: Infinity, duration: 2.8, delay: 0.5, ease: "linear" }} className="w-4 h-5 rounded-full bg-accent" />
      </div>
    )
  },
  {
    id: "park",
    name: "The Park",
    emoji: "🌳",
    lesson: "Personal Privacy",
    to: "/play/park",
    ready: true,
    bg: "oklch(0.82 0.18 145)",
    preview: (
      <div className="absolute inset-0 flex items-center justify-center opacity-40 gap-4">
        <div className="text-xl">🎒</div>
        <motion.div animate={{ x: [-10, 10, -10], scale: [0.8, 1.1, 0.8] }} transition={{ repeat: Infinity, duration: 2 }} className="w-5 h-4 bg-card rounded shadow-sm border border-foreground/20" />
      </div>
    )
  },
  {
    id: "hq",
    name: "Hero HQ",
    emoji: "🦸",
    lesson: "Call for Backup",
    to: "/play/hq",
    ready: true,
    bg: "oklch(0.82 0.18 80)",
    preview: (
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-8 h-8 rounded-full bg-danger flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-card" />
        </motion.div>
      </div>
    )
  },
  {
    id: "bridge",
    name: "The Bridge",
    emoji: "🌉",
    lesson: "Wi-Fi Safety",
    to: "/play/bridge",
    ready: true,
    bg: "oklch(0.78 0.14 230)",
    preview: (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-40">
        <motion.div animate={{ backgroundColor: ["var(--card)", "var(--safe)", "var(--card)"] }} transition={{ repeat: Infinity, duration: 3 }} className="w-12 h-2 rounded-full border border-foreground/20" />
        <motion.div animate={{ backgroundColor: ["var(--card)", "var(--danger)", "var(--card)"] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} className="w-12 h-2 rounded-full border border-foreground/20" />
      </div>
    )
  },
  {
    id: "bank",
    name: "The Bank",
    emoji: "🏦",
    lesson: "Spot Phishing",
    to: "/play/bank",
    ready: true,
    bg: "oklch(0.80 0.15 110)",
    preview: (
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 gap-1">
        <motion.div animate={{ y: [10, -5, 10], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2.5 }} className="w-8 h-4 rounded-md bg-card shadow-sm border border-foreground/20 flex items-center justify-center text-[8px]">💬</motion.div>
        <motion.div animate={{ y: [10, -5, 10], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2.5, delay: 1.25 }} className="w-8 h-4 rounded-md bg-danger/50 shadow-sm border border-danger/20 flex items-center justify-center text-[8px]">⚠</motion.div>
      </div>
    )
  },
  {
    id: "library",
    name: "The Library",
    emoji: "📚",
    lesson: "Fact Checking",
    to: "/play/library",
    ready: true,
    bg: "oklch(0.85 0.12 60)",
    preview: (
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <motion.div animate={{ rotateY: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="w-8 h-10 bg-card rounded-r-md border-l-4 border-l-amber-700 shadow-sm flex items-center justify-center text-[10px]">📰</motion.div>
      </div>
    )
  },
];

function Hub() {
  const completed = useGameStore((s) => s.completed);

  return (
    <div className="min-h-dvh">
      <HUD />

      {/* Sky banner with Beep */}
      <section className="relative px-4 pt-4">
        <div className="cloud-bg h-16 -mx-4" />
        <div className="relative -mt-10 mx-auto max-w-md rounded-3xl bg-card ink-border pop-lg p-4">
          <div className="flex items-center gap-3">
            <Beep size={84} />
            <div className="flex-1">
              <h1 className="font-display text-2xl leading-tight">
                Welcome to <span className="text-primary text-stroke">Safety City!</span>
              </h1>
              <p className="text-sm text-muted-foreground font-bold">
                I'm Beep. Tap a building to play. Earn Shield Coins!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* News board */}
      <section className="px-4 mt-4">
        <div className="rounded-2xl ink-border pop bg-accent text-accent-foreground p-3 flex items-start gap-3">
          <span className="text-2xl">📰</span>
          <div>
            <div className="font-display font-bold">Hero News Board</div>
            <p className="text-sm font-semibold">
              Tip of the day: a strong password is long, mixes <em>numbers</em> and <em>symbols</em>
              , and is your secret!
            </p>
          </div>
        </div>
      </section>

      {/* Building grid */}
      <h2 className="font-display text-xl px-4 mt-6 mb-2">Pick a building</h2>
      <div className="grid grid-cols-2 gap-3 px-4 pb-24">
        {BUILDINGS.map((b, i) => {
          const best = completed[b.id];
          const inner = (
            <motion.div
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative aspect-[4/5] rounded-3xl ink-border pop p-4 flex flex-col justify-between overflow-hidden group"
              style={{ background: b.bg }}
            >
              {/* Live Preview Background */}
              {b.preview}
              
              <div className="flex items-center justify-between relative z-10">
                <span className="text-4xl drop-shadow-md group-hover:scale-110 transition-transform">{b.emoji}</span>
                {best > 0 && (
                  <span className="rounded-full bg-card ink-border px-2 py-0.5 text-xs font-black shadow-sm">
                    ★ {best}
                  </span>
                )}
              </div>
              <div className="relative z-10 bg-card/80 backdrop-blur-sm p-2 rounded-xl border border-border/50">
                <div className="font-display font-bold text-lg leading-tight text-foreground">
                  {b.name}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">
                  {b.lesson}
                </div>
              </div>
              {!b.ready && (
                <div className="absolute inset-0 z-20 grid place-items-center bg-foreground/55 backdrop-blur-[1px]">
                  <span className="rounded-full bg-card ink-border px-3 py-1 font-bold text-sm shadow-md">
                    🔒 Soon
                  </span>
                </div>
              )}
            </motion.div>
          );
          return b.ready ? (
            <Link key={b.id} to={b.to} className="block">
              {inner}
            </Link>
          ) : (
            <div key={b.id}>{inner}</div>
          );
        })}
      </div>

      <footer className="fixed bottom-0 inset-x-0 px-3 pb-3 pointer-events-none z-50">
        <div className="mx-auto max-w-md rounded-full bg-card/90 ink-border pop px-4 py-2 text-center text-xs font-bold backdrop-blur">
          Made for HACKHIVE-2k26 · Play, don't quiz.
        </div>
      </footer>
    </div>
  );
}
