export type ProofOption = 'none' | 'cold';
export type StarterBuildBreakdown = {
  desiredStarterG: number;
  totalTargetG: number;
  inactiveStarterG: number;
  flourG: number;
  waterG: number;
};

const HOUR_MS = 60 * 60 * 1000;

export function computeRipeDurationMs(tempC: number): number {
  const durationHours = 6 - ((tempC - 21) * 20) / 60;
  const clampedHours = Math.min(12, Math.max(3.5, durationHours));
  return clampedHours * HOUR_MS;
}

export function computeStarterReady(feedTime: Date, tempC: number): Date {
  return new Date(feedTime.getTime() + computeRipeDurationMs(tempC));
}

export function computeBakeWindow(start: Date, option: ProofOption): {
  start: Date;
  readyStart: Date;
  readyEnd?: Date;
} {
  if (option === 'none') {
    return {
      start,
      readyStart: new Date(start.getTime() + 8 * HOUR_MS)
    };
  }

  return {
    start,
    readyStart: new Date(start.getTime() + 12 * HOUR_MS),
    readyEnd: new Date(start.getTime() + 18 * HOUR_MS)
  };
}

export function computeStarterBuild(desiredStarterG: number): StarterBuildBreakdown {
  const safeDesiredStarter = Math.max(0, desiredStarterG);
  const totalTargetG = safeDesiredStarter + 50;
  const partSize = totalTargetG / 5;

  return {
    desiredStarterG: safeDesiredStarter,
    totalTargetG,
    inactiveStarterG: partSize,
    flourG: partSize * 2,
    waterG: partSize * 2
  };
}
