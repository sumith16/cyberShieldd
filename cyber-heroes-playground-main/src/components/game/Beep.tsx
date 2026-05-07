import { motion } from "framer-motion";

export function Beep({
  size = 96,
  mood = "happy",
}: {
  size?: number;
  mood?: "happy" | "wow" | "think";
}) {
  const eye = mood === "wow" ? "scaleY(1.4)" : mood === "think" ? "scaleY(0.4)" : "none";
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
      style={{ width: size, height: size }}
      className="relative"
      aria-label="Beep the robot"
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* antenna */}
        <line x1="50" y1="6" x2="50" y2="20" stroke="var(--border)" strokeWidth="3" />
        <circle cx="50" cy="6" r="4" fill="var(--accent)" stroke="var(--border)" strokeWidth="2" />
        {/* head */}
        <rect
          x="14"
          y="20"
          width="72"
          height="60"
          rx="18"
          fill="var(--secondary)"
          stroke="var(--border)"
          strokeWidth="3"
        />
        {/* visor */}
        <rect
          x="22"
          y="34"
          width="56"
          height="26"
          rx="10"
          fill="oklch(0.22 0.06 260)"
          stroke="var(--border)"
          strokeWidth="3"
        />
        {/* eyes */}
        <g style={{ transform: eye, transformOrigin: "center" }}>
          <circle cx="38" cy="47" r="5" fill="var(--accent)" />
          <circle cx="62" cy="47" r="5" fill="var(--accent)" />
        </g>
        {/* cheeks */}
        <circle cx="24" cy="66" r="3" fill="var(--primary)" opacity="0.7" />
        <circle cx="76" cy="66" r="3" fill="var(--primary)" opacity="0.7" />
        {/* mouth */}
        <rect
          x="40"
          y="68"
          width="20"
          height="4"
          rx="2"
          fill="var(--accent)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        {/* base */}
        <rect
          x="30"
          y="80"
          width="40"
          height="10"
          rx="4"
          fill="var(--primary)"
          stroke="var(--border)"
          strokeWidth="3"
        />
      </svg>
    </motion.div>
  );
}
