export class MusicGridClock {
  private readonly bpm: number;
  private readonly subdivisionsPerBeat: number;

  private startedAtMs: number | null = null;

  constructor(
    bpm: number,
    subdivisionsPerBeat: number
  ) {
    if (bpm <= 0) {
      throw new Error(
        "MusicGridClock BPM must be greater than zero."
      );
    }

    if (subdivisionsPerBeat <= 0) {
      throw new Error(
        "MusicGridClock subdivisionsPerBeat must be greater than zero."
      );
    }

    this.bpm = bpm;
    this.subdivisionsPerBeat = subdivisionsPerBeat;
  }

  public start(
    startedAtMs: number = performance.now()
  ): void {
    this.startedAtMs = startedAtMs;
  }

  public stop(): void {
    this.startedAtMs = null;
  }

  public isRunning(): boolean {
    return this.startedAtMs !== null;
  }

  public snapToNearestSubdivision(
    targetMs: number
  ): number {
    if (this.startedAtMs === null) {
      return targetMs;
    }

    const subdivisionDurationMs =
      this.getSubdivisionDurationMs();

    const elapsedSinceStartMs =
      targetMs - this.startedAtMs;

    const nearestSubdivisionIndex =
      Math.round(
        elapsedSinceStartMs /
        subdivisionDurationMs
      );

    return (
      this.startedAtMs +
      nearestSubdivisionIndex *
      subdivisionDurationMs
    );
  }

  private getSubdivisionDurationMs(): number {
    const beatDurationMs = 60000 / this.bpm;

    return (
      beatDurationMs /
      this.subdivisionsPerBeat
    );
  }
}