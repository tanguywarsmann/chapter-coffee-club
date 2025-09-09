export function uiCanSurfaceJoker(expectedSegments?: number): boolean {
  const seg = Number(expectedSegments ?? 0);
  return Number.isFinite(seg) && seg >= 3;
}

export function uiJokersAllowed(expectedSegments?: number): number {
  const seg = Number(expectedSegments ?? 0);
  if (!Number.isFinite(seg) || seg < 3) return 0;
  return Math.floor(seg / 10) + 1;
}

export function getUiJokerHint(expectedSegments?: number): string {
  const seg = Number(expectedSegments ?? 0);
  if (!Number.isFinite(seg) || seg < 3) {
    return "Joker disponible à partir de 3 segments.";
  }
  return "";
}