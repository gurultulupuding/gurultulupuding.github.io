import type { StructureFamily } from "../../game/packs/StructureFamily";
import { MusicGridClock } from "./MusicGridClock";

export type BuildingSoundFamily =
  Exclude<StructureFamily, "infrastructure">;

type ScheduledBuildingSound = {
  placedBuildingId: string;
  family: BuildingSoundFamily;
  timeoutId: number | null;
};

export class PlacedBuildingSoundScheduler {
  private readonly musicGridClock: MusicGridClock;
  private readonly repeatIntervalMs: number;

  private readonly playSound: (
    family: BuildingSoundFamily,
    placedBuildingId: string
  ) => void;

  private readonly scheduledSoundsByBuildingId =
    new Map<string, ScheduledBuildingSound>();

  private paused = true;

  constructor(
    musicGridClock: MusicGridClock,
    repeatIntervalMs: number,
    playSound: (
      family: BuildingSoundFamily,
      placedBuildingId: string
    ) => void
  ) {
    if (repeatIntervalMs <= 0) {
      throw new Error(
        "PlacedBuildingSoundScheduler repeatIntervalMs must be greater than zero."
      );
    }

    this.musicGridClock = musicGridClock;
    this.repeatIntervalMs = repeatIntervalMs;
    this.playSound = playSound;
  }

  public start(): void {
    if (!this.paused) {
      return;
    }

    this.paused = false;

    for (
      const scheduledSound
      of this.scheduledSoundsByBuildingId.values()
    ) {
      if (scheduledSound.timeoutId !== null) {
        continue;
      }

      this.scheduleNextSound(
        scheduledSound,
        performance.now()
      );
    }
  }

  public pause(): void {
    this.paused = true;

    for (
      const scheduledSound
      of this.scheduledSoundsByBuildingId.values()
    ) {
      if (scheduledSound.timeoutId === null) {
        continue;
      }

      window.clearTimeout(
        scheduledSound.timeoutId
      );

      scheduledSound.timeoutId = null;
    }
  }

  public clear(): void {
    this.pause();

    this.scheduledSoundsByBuildingId.clear();
  }

  public registerBuilding(
    family: StructureFamily,
    placedBuildingId: string
  ): void {
    if (family === "infrastructure") {
      return;
    }

    if (
      this.scheduledSoundsByBuildingId.has(
        placedBuildingId
      )
    ) {
      return;
    }

    const scheduledSound: ScheduledBuildingSound = {
      placedBuildingId,
      family,
      timeoutId: null,
    };

    this.scheduledSoundsByBuildingId.set(
      placedBuildingId,
      scheduledSound
    );

    if (this.paused) {
      return;
    }
    this.playSound(
      scheduledSound.family,
      scheduledSound.placedBuildingId
    );

    this.scheduleNextSound(
      scheduledSound,
      performance.now()
    );
  }

  private scheduleNextSound(
    scheduledSound: ScheduledBuildingSound,
    previousSoundTimeMs: number
  ): void {
    if (this.paused) {
      scheduledSound.timeoutId = null;
      return;
    }

    const nowMs = performance.now();

    const unsnappedTargetMs =
      previousSoundTimeMs +
      this.repeatIntervalMs;

    let snappedTargetMs =
      this.musicGridClock
        .snapToNearestSubdivision(
          unsnappedTargetMs
        );
    if (snappedTargetMs <= nowMs + 5) {
      snappedTargetMs =
        this.musicGridClock
          .snapToNearestSubdivision(
            nowMs +
            this.repeatIntervalMs
          );
    }

    const delayMs = Math.max(
      0,
      snappedTargetMs - nowMs
    );

    scheduledSound.timeoutId =
      window.setTimeout(() => {
        const currentScheduledSound =
          this.scheduledSoundsByBuildingId.get(
            scheduledSound.placedBuildingId
          );

        if (
          this.paused ||
          currentScheduledSound !== scheduledSound
        ) {
          return;
        }

        scheduledSound.timeoutId = null;

        this.playSound(
          scheduledSound.family,
          scheduledSound.placedBuildingId
        );
        this.scheduleNextSound(
          scheduledSound,
          snappedTargetMs
        );
      }, delayMs);
  }
}