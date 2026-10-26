"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Block3D, type BlockColor } from "@/components/ui/Block3D";

/**
 * Hero scene: magnetic blocks (3D cubes and prisms) that build a shape, collapse onto the grass, then rebuild the next shape, forever.
 * The board is CELLS × CELLS tile-sized cells; a tile at (x, row) has its left edge at column x and sits
 * `row` tiles above the grass. Every shape places all 10 squares and 4 triangles.
 * Server render = the first shape, assembled (also what reduced-motion visitors keep seeing).
 */

const CELLS = 9;
const GROUND = 7.7; // top of the grass, in cells from the top of the board

type Color = BlockColor;
type Slot = [x: number, row: number];
type Shape = { squares: Slot[]; triangles: Slot[] };

// Fixed tile set: colours alternate so every shape comes out colourful.
const SQUARES: Color[] = ["sky", "sun", "mint", "coral", "sky", "sun", "coral", "mint", "sky", "sun"];
const TRIANGLES: Color[] = ["sun", "sky", "coral", "mint"];

const SHAPES: Shape[] = [
  // Village: tall tower, house, small tower (like the brand banner)
  {
    squares: [[1, 0], [1, 1], [1, 2], [1, 3], [3.5, 0], [4.5, 0], [3.5, 1], [4.5, 1], [6.5, 0], [6.5, 1]],
    triangles: [[1, 4], [3.5, 2], [4.5, 2], [6.5, 2]],
  },
  // Pyramid
  {
    squares: [[2, 0], [3, 0], [4, 0], [5, 0], [2.5, 1], [3.5, 1], [4.5, 1], [3, 2], [4, 2], [3.5, 3]],
    triangles: [[3.5, 4], [0.6, 0], [6.4, 0], [7.4, 0]],
  },
  // Rocket on its launch pad
  {
    squares: [[2.5, 0], [3.5, 0], [4.5, 0], [3.5, 1], [3.5, 2], [3.5, 3], [3.5, 4], [0.3, 0], [6.7, 0], [7.7, 0]],
    triangles: [[3.5, 5], [2.5, 1], [4.5, 1], [1.3, 0]],
  },
  // Castle
  {
    squares: [[1.5, 0], [1.5, 1], [1.5, 2], [5.5, 0], [5.5, 1], [5.5, 2], [2.5, 0], [3.5, 0], [4.5, 0], [3.5, 1]],
    triangles: [[1.5, 3], [5.5, 3], [2.5, 1], [4.5, 1]],
  },
  // Bridge between two pillars
  {
    squares: [[1.5, 0], [1.5, 1], [1.5, 2], [5.5, 0], [5.5, 1], [5.5, 2], [2.5, 2], [3.5, 2], [4.5, 2], [3.5, 3]],
    triangles: [[1.5, 3], [5.5, 3], [3.5, 4], [0.3, 0]],
  },
];

type Pose = { x: number; y: number; z: number; r: number; rx: number; ry: number };

const tf = (p: Pose) =>
  `translate3d(${(p.x * 100).toFixed(2)}%, ${(p.y * 100).toFixed(2)}%, ${p.z.toFixed(1)}px) rotateX(${p.rx.toFixed(1)}deg) rotateY(${p.ry.toFixed(1)}deg) rotateZ(${p.r.toFixed(1)}deg)`;

const slotPose = ([x, row]: Slot): Pose => ({ x, y: GROUND - 1 - row, z: 0, r: 0, rx: 0, ry: 0 });

/** Every tile's target pose for a shape: squares first, then triangles (same order as the rendered tiles). */
const shapePoses = (s: Shape) => [...s.squares, ...s.triangles].map(slotPose);

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Where a falling tile lands: somewhere on the grass, at a random depth, upright again after spinning. */
function groundPose(isTriangle: boolean, index: number, count: number): Pose {
  // Spread landing spots across the board, shuffled a little.
  const x = Math.min(CELLS - 1.05, Math.max(0.05, (index / count) * (CELLS - 1) + rand(-0.6, 0.6)));
  const z = rand(-90, 70); // further back sits a little higher on the grass
  const turns = Math.round(rand(-2, 2)) * 360;
  const quarter = () => Math.round(rand(-2, 2)) * (isTriangle ? 180 : 90);
  return { x, y: GROUND - 1 + 0.15 - z / 260, z, r: turns + (isTriangle ? 0 : Math.round(rand(-1, 1)) * 90), rx: isTriangle ? 0 : quarter(), ry: quarter() };
}

export function TileScene({ label }: { label: string }) {
  const tiles = useRef<(HTMLDivElement | null)[]>([]);
  const board = useRef<HTMLDivElement>(null);

  // Block faces are placed with translateZ, which needs a length: one cell of the board, in px.
  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => el.style.setProperty("--w", `${entry.contentRect.width / CELLS}px`));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const els = tiles.current.filter((e): e is HTMLDivElement => !!e);
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let stopped = false;
    let running: Animation[] = [];
    const poses: Pose[] = shapePoses(SHAPES[0]);

    /** Animates every tile through its keyframes, then pins the final pose. */
    const play = async (frames: Pose[][], timing: (i: number) => KeyframeAnimationOptions & { offsets?: number[] }) => {
      running = els.map((el, i) => {
        const { offsets, ...options } = timing(i);
        const keyframes = frames[i].map((p, k) => ({ transform: tf(p), ...(offsets ? { offset: offsets[k] } : {}) }));
        return el.animate(keyframes, { fill: "forwards", ...options });
      });
      await Promise.all(running.map((a) => a.finished.catch(() => undefined)));
      els.forEach((el, i) => {
        const last = frames[i][frames[i].length - 1];
        poses[i] = last;
        el.style.transform = tf(last);
      });
      running.forEach((a) => a.cancel());
      running = [];
    };

    /** Waits while the hero is hidden (phone layout) or the tab is in the background. */
    const waitUntilVisible = async () => {
      while (!stopped && (!desktop.matches || document.hidden)) await sleep(500);
    };

    const loop = async () => {
      let shape = 0;
      await sleep(1800);
      while (!stopped) {
        await waitUntilVisible();
        if (stopped) return;

        // 1. Collapse: each tile hops, then falls with gravity onto the grass and bounces.
        const count = els.length;
        const order = els.map((_, i) => i).sort(() => Math.random() - 0.5);
        const landing = els.map((_, i) => groundPose(i >= SQUARES.length, order.indexOf(i), count));
        await play(
          els.map((_, i) => {
            const from = poses[i];
            const to = landing[i];
            const hop: Pose = { ...from, y: from.y - rand(0.15, 0.45), r: from.r + rand(-25, 25), rx: from.rx + rand(-40, 40), ry: from.ry + rand(-40, 40) };
            const bounce: Pose = { ...to, y: to.y - rand(0.2, 0.45), r: to.r - rand(-20, 20) };
            return [from, hop, to, bounce, to];
          }),
          () => ({ duration: rand(1100, 1500), delay: rand(0, 450), easing: "linear", offsets: [0, 0.14, 0.72, 0.86, 1] }),
        );
        if (stopped) return;
        await sleep(700);

        // 2. Rebuild the next shape, bottom rows first; each tile arcs up, spins in 3D and snaps into place.
        shape = (shape + 1) % SHAPES.length;
        const targets = shapePoses(SHAPES[shape]);
        const rank = targets.map((t, i) => ({ i, y: -t.y + (i >= SQUARES.length ? 0.5 : 0) })).sort((a, b) => a.y - b.y);
        const delayOf = (i: number) => rank.findIndex((r) => r.i === i) * 120;
        await play(
          els.map((_, i) => {
            const from = poses[i];
            const to = targets[i];
            const peak: Pose = {
              x: (from.x + to.x) / 2 + rand(-0.5, 0.5),
              y: Math.min(from.y, to.y) - rand(1.2, 2.2),
              z: rand(60, 160),
              r: rand(-40, 40),
              rx: from.rx / 2 + rand(-120, 120),
              ry: 180,
            };
            const near: Pose = { ...to, y: to.y - 0.12, ry: 340, z: 10 };
            return [from, peak, near, { ...to, ry: 360 }];
          }),
          (i) => ({ duration: 1050, delay: delayOf(i), easing: "ease-in-out", offsets: [0, 0.5, 0.85, 1] }),
        );
        // Normalise the spin so the next animation starts from a clean rotation.
        els.forEach((el, i) => {
          poses[i] = { ...poses[i], rx: 0, ry: 0, r: 0 };
          el.style.transform = tf(poses[i]);
        });
        if (stopped) return;
        await sleep(2400);
      }
    };

    loop();
    return () => {
      stopped = true;
      running.forEach((a) => a.cancel());
    };
  }, []);

  const initial = shapePoses(SHAPES[0]);
  const size = `${100 / CELLS}%`;

  return (
    <div ref={board} role="img" aria-label={label} className="tile-scene relative aspect-square w-full overflow-hidden [--w:56px]">
      {/* Sky, drifting clouds, grass hill and footprints, like the brand banner. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#d6ecfb] via-[#eef7fd] to-[#fdf6e0]" />
      <Cloud className="tile-scene-cloud start-[6%] top-[8%] w-[22%]" />
      <Cloud className="tile-scene-cloud start-[62%] top-[14%] w-[17%] [animation-delay:-14s]" />
      <div className="absolute inset-x-[-20%] bottom-[-45%] h-[75%] rounded-[50%] bg-[#cfe9bf]" />
      <Image src="/brand/mark.png" alt="" width={56} height={56} className="absolute bottom-[3%] start-[4%] w-[9%]" />
      <Image src="/brand/mark.png" alt="" width={56} height={56} className="absolute bottom-[3%] end-[4%] w-[9%]" />

      {/* The blocks: a 3D stage of their own, seen slightly from above so top faces show. */}
      <div className="absolute inset-0 [perspective:1000px] [perspective-origin:50%_-15%] [transform-style:preserve-3d]">
        {[...SQUARES, ...TRIANGLES].map((color, i) => {
          const isTriangle = i >= SQUARES.length;
          return (
            <div
              key={i}
              ref={(el) => {
                tiles.current[i] = el;
              }}
              className="absolute left-0 top-0 will-change-transform [transform-style:preserve-3d]"
              style={{ width: size, height: size, transform: tf(initial[i]) }}
            >
              <Block3D kind={isTriangle ? "prism" : "cube"} color={color} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Cloud({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 150 70" className={`absolute ${className}`} aria-hidden>
      <g fill="#fff">
        <circle cx="40" cy="40" r="28" />
        <circle cx="78" cy="30" r="30" />
        <circle cx="112" cy="44" r="24" />
        <rect x="20" y="40" width="110" height="28" rx="14" />
      </g>
    </svg>
  );
}
