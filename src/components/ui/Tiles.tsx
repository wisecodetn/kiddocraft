// Floating magnetic tiles, the brand's decorative motif.

type TileSpec = { className: string; color: "sun" | "sky" | "coral" | "mint"; shape?: "square" | "triangle"; rotate?: number; delay?: number };

const triColors = {
  sun: ["var(--color-sun-500)", "var(--color-sun-200)"],
  sky: ["var(--color-sky-400)", "var(--color-sky-100)"],
  coral: ["var(--color-coral-500)", "var(--color-coral-100)"],
  mint: ["var(--color-mint-500)", "var(--color-mint-100)"],
};

export function FloatingTiles({ tiles }: { tiles: TileSpec[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block" aria-hidden>
      {tiles.map((t, i) =>
        t.shape === "triangle" ? (
          <svg
            key={i}
            viewBox="0 0 100 88"
            className={`absolute animate-float ${t.className}`}
            style={{ ["--r" as string]: `${t.rotate ?? 0}deg`, animationDelay: `${t.delay ?? 0}s` }}
          >
            <path d="M50 6 L94 82 L6 82 Z" fill={triColors[t.color][1]} stroke={triColors[t.color][0]} strokeWidth="9" strokeLinejoin="round" />
            <path d="M50 36 L68 68 L32 68 Z" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" opacity=".85" />
          </svg>
        ) : (
          <div
            key={i}
            className={`tile tile-${t.color === "sky" ? "" : t.color} absolute animate-float ${t.className}`}
            style={{ ["--r" as string]: `${t.rotate ?? 0}deg`, animationDelay: `${t.delay ?? 0}s` }}
          />
        ),
      )}
    </div>
  );
}

export function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-2 text-lg text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
