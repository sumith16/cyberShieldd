import { useEffect, useSyncExternalStore } from "react";

export type GameId = "fort" | "post" | "arcade" | "park" | "hq" | "bridge" | "bank" | "library";

interface State {
  coins: number;
  completed: Record<GameId, number>; // best score
  stickers: string[]; // villain sticker book
}

const KEY = "cyber-heroes-v1";
const initial: State = {
  coins: 0,
  completed: { fort: 0, post: 0, arcade: 0, park: 0, hq: 0, bridge: 0, bank: 0, library: 0 },
  stickers: [],
};

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}
function save() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const store = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  addCoins: (n: number) => {
    state = { ...state, coins: state.coins + n };
    save();
  },
  recordScore: (id: GameId, score: number) => {
    state = {
      ...state,
      completed: { ...state.completed, [id]: Math.max(state.completed[id], score) },
    };
    save();
  },
  unlockSticker: (id: string) => {
    if (state.stickers.includes(id)) return;
    state = { ...state, stickers: [...state.stickers, id] };
    save();
  },
  reset: () => {
    state = initial;
    save();
  },
};

export function useGameStore<T>(selector: (s: State) => T): T {
  // Hydrate after mount to avoid SSR mismatch
  const value = useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(initial),
  );
  useEffect(() => {
    // Force a re-read once on client mount in case localStorage had data
    state = load();
    listeners.forEach((l) => l());
  }, []);
  return value;
}
