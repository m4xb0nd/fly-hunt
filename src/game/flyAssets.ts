import type { FlyKind } from "../types/fly";

export interface FlyAssetConfig {
  flyingSrc: string;
  flyingFilter?: string;
  deathFrames: string[];
  sparksSrc?: string;
  hitsRequired: number;
}

export const FLY_ASSETS: Record<FlyKind, FlyAssetConfig> = {
  normal: {
    flyingSrc: "/flies/fly.gif",
    deathFrames: [
      "/flies/death/death1.png",
      "/flies/death/death2.png",
      "/flies/death/death3.png",
    ],
    hitsRequired: 1,
  },
  golden: {
    flyingSrc: "/flies/fly.gif",
    flyingFilter: "sepia(1) saturate(4) hue-rotate(-15deg) brightness(1.15)",
    deathFrames: ["/flies/death/death1.png", "/flies/death/death2.png"],
    sparksSrc: "/flies/sparks.gif",
    hitsRequired: 3,
  },
};

export function pickRandomDeathFrame(kind: FlyKind): number {
  const frames = FLY_ASSETS[kind].deathFrames;
  return Math.floor(Math.random() * frames.length);
}
