// A magnetic block as a real 3D solid: a cube (6 faces) or a triangular prism (2 triangles + 3 sides).
// The parent sets its size with the CSS variable --w (a length); faces are placed by .block3d rules in globals.css.

export type BlockColor = "sky" | "sun" | "coral" | "mint";
export type BlockKind = "cube" | "prism";

const tileClass = (color: BlockColor) => `tile ${color === "sky" ? "" : `tile-${color}`}`;

const TRI: Record<BlockColor, [string, string]> = {
  sky: ["var(--color-sky-400)", "var(--color-sky-100)"],
  sun: ["var(--color-sun-500)", "var(--color-sun-200)"],
  coral: ["var(--color-coral-500)", "var(--color-coral-100)"],
  mint: ["var(--color-mint-500)", "var(--color-mint-100)"],
};

export function Block3D({ kind, color }: { kind: BlockKind; color: BlockColor }) {
  if (kind === "cube") {
    return (
      <span className="block3d cube" aria-hidden>
        {["front", "back", "right", "left", "top", "bottom"].map((f) => (
          <span key={f} className={`face f-${f} ${tileClass(color)}`} />
        ))}
      </span>
    );
  }
  const [stroke, fill] = TRI[color];
  const triangle = (
    <svg viewBox="0 0 100 100" className="size-full overflow-visible">
      <path d="M50 13.4 L100 100 L0 100 Z" fill={fill} stroke={stroke} strokeWidth="7" strokeLinejoin="round" />
      <path d="M50 50 L70 86 L30 86 Z" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" opacity=".85" />
    </svg>
  );
  return (
    <span className="block3d prism" aria-hidden>
      <span className="face f-front">{triangle}</span>
      <span className="face f-back">{triangle}</span>
      {["base", "left", "right"].map((f) => (
        <span key={f} className={`face f-${f} ${tileClass(color)}`} />
      ))}
    </span>
  );
}
