import type { CSSProperties } from "react";

export type DecoPhase = "idle" | "expand" | "collapse";

// Смещения карточек [x%, y%] для широкого экрана
const OFFSETS_WIDE = [
  [-52, -42],
  [48, 40],
  [50, -48],
  [-50, 45],
  [-6, -58],
  [9, 55],
  [-62, 3],
  [58, -6],
];

// Смещения для узкого экрана (<=1280px) — вылет дальше, чтобы выйти из-за формы
const OFFSETS_NARROW = [
  [-75, -55],
  [70, 50],
  [72, -60],
  [-70, 55],
  [-5, -80],
  [8, 75],
  [-85, 3],
  [80, -5],
];

const FLOAT_ANIMS = [
  "float-a",
  "float-b",
  "float-a",
  "float-c",
  "float-b",
  "float-a",
  "float-c",
  "float-b",
];
const FLOAT_DURS = [5.0, 6.2, 7.0, 5.5, 6.5, 4.8, 7.5, 5.2];
const FLOAT_DELS = [0, 0, 0.5, 1.0, 0.3, 0.8, 0.2, 1.2];

export interface DecoStyleState {
  isNarrow: boolean;
  size: { w: number; h: number };
  phase: DecoPhase;
  expanded: boolean;
}

export const getCardStyle = (
  idx: number,
  { isNarrow, size, phase, expanded }: DecoStyleState,
): CSSProperties => {
  const offsets = isNarrow ? OFFSETS_NARROW : OFFSETS_WIDE;
  const [px, py] = offsets[idx];
  const tx = (size.w * px) / 100;
  const ty = (size.h * py) / 100;
  const base = {
    "--tx": `${tx}px`,
    "--ty": `${ty}px`,
  } as CSSProperties;

  if (phase === "expand") {
    return {
      ...base,
      animation: `exp-card 1.1s cubic-bezier(0.16,1,0.3,1) ${idx * 0.09}s forwards`,
    };
  }
  if (phase === "collapse" && expanded) {
    return {
      ...base,
      animation: `col-card 0.9s cubic-bezier(0.16,1,0.3,1) ${idx * 0.07}s forwards`,
    };
  }
  if (expanded) {
    // Карточка на месте — добавляем float
    return {
      ...base,
      opacity: 1,
      transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1)`,
      animation: `${FLOAT_ANIMS[idx]} ${FLOAT_DURS[idx]}s ease-in-out ${FLOAT_DELS[idx]}s infinite`,
    };
  }
  return base;
};
