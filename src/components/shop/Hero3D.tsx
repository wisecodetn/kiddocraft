"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

/**
 * 3D stage for the home hero picture: an idle sway, plus a tilt toward the pointer with a moving glare.
 * Children are layers placed at different depths with translateZ (see .hero-3d-* in globals.css).
 * Respects prefers-reduced-motion (no sway, no tilt).
 */
export function Hero3D({ children, className = "" }: { children: ReactNode; className?: string }) {
  const tilt = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width - 0.5;
    const y = (e.clientY - box.top) / box.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = tilt.current;
      if (!el) return;
      el.classList.add("is-tilting");
      el.style.setProperty("--ry", `${(x * 22).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * 18).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
    });
  };

  const onLeave = () => {
    cancelAnimationFrame(frame.current);
    const el = tilt.current;
    if (!el) return;
    el.classList.remove("is-tilting");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  return (
    <div className={`hero-3d-stage ${className}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="hero-3d-sway">
        <div ref={tilt} className="hero-3d-tilt">
          {children}
        </div>
      </div>
    </div>
  );
}
