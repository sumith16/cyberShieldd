import { Link } from "@tanstack/react-router";
import { useGameStore } from "@/lib/game-store";
import { motion } from "framer-motion";

export function HUD({ back = false, title }: { back?: boolean; title?: string }) {
  const coins = useGameStore((s) => s.coins);
  return (
    <header className="sticky top-0 z-20 px-3 pt-3">
      <div className="flex items-center justify-between gap-2 rounded-full bg-card/90 ink-border pop px-3 py-2 backdrop-blur">
        {back ? (
          <Link
            to="/"
            className="rounded-full bg-secondary ink-border px-3 py-1 text-sm font-bold pop"
          >
            ← City
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <a
              href={typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3000/' : '/'}
              className="flex items-center justify-center h-9 px-4 rounded-full bg-primary ink-border text-primary-foreground font-black text-sm pop hover:scale-105 transition-transform"
            >
              ← Back to Hub
            </a>
            <span className="font-display font-bold text-base hidden sm:inline">Cyber Heroes</span>
          </div>
        )}
        {title && <span className="font-display font-bold truncate">{title}</span>}
        <motion.div
          key={coins}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 rounded-full bg-accent ink-border px-3 py-1"
        >
          <span
            aria-hidden
            className="inline-block h-5 w-5 rounded-full ink-border"
            style={{ background: "var(--coin)" }}
          />
          <span className="font-black tabular-nums">{coins}</span>
        </motion.div>
      </div>
    </header>
  );
}
