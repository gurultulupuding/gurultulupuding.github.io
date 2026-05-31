import type { StructureFamily } from "../../game/packs/StructureFamily";
import { SoundSettings } from "../menu/SoundSettings";
import { MusicGridClock } from "./MusicGridClock";
import {
  PlacedBuildingSoundScheduler,
  type BuildingSoundFamily,
} from "./PlacedBuildingSoundScheduler";

export type UIButtonSound =
  | "play"
  | "settings"
  | "rules"
  | "credits"
  | "close"
  | "choice"
  | "returnToMainMenu"
  | "cardSelect"
  | "cardDeselect"
  | "replaceHand"
  | "turnAction"
  | "victory"
  | "defeat";

export class UISoundController {
  private readonly menuSoundPaths = [
    "/assets/audio/ui/menu1.m4a",
    "/assets/audio/ui/menu2.m4a",
    "/assets/audio/ui/menu3.m4a",
    "/assets/audio/ui/menu4.m4a",
    "/assets/audio/ui/menu5.m4a",
    "/assets/audio/ui/menu6.m4a",
    "/assets/audio/ui/menu7.m4a",
    "/assets/audio/ui/menu8.m4a",
  ];

  private readonly menuBackgroundLoopPath =
    "/assets/audio/ui/menu-background.m4a";

  private readonly introBackgroundLoopPath =
    "/assets/audio/ui/intro-background.m4a";

  private readonly gameBackgroundLoopPath =
    "/assets/audio/ui/game-background.m4a";

  private readonly buildingFamilySoundPaths: Record<
    BuildingSoundFamily,
    string[]
  > = {
    residential: [
      "/assets/audio/buildings/residential/residential1.m4a",
      "/assets/audio/buildings/residential/residential2.m4a",
      "/assets/audio/buildings/residential/residential3.m4a",
      "/assets/audio/buildings/residential/residential4.m4a",
      "/assets/audio/buildings/residential/residential5.m4a",
      "/assets/audio/buildings/residential/residential6.m4a",
      "/assets/audio/buildings/residential/residential7.m4a",
      "/assets/audio/buildings/residential/residential8.m4a",
    ],

    industry: [
      "/assets/audio/buildings/industry/industry1.m4a",
      "/assets/audio/buildings/industry/industry2.m4a",
      "/assets/audio/buildings/industry/industry3.m4a",
      "/assets/audio/buildings/industry/industry4.m4a",
      "/assets/audio/buildings/industry/industry5.m4a",
      "/assets/audio/buildings/industry/industry6.m4a",
      "/assets/audio/buildings/industry/industry7.m4a",
      "/assets/audio/buildings/industry/industry8.m4a",
    ],

    civic: [
      "/assets/audio/buildings/civic/civic1.m4a",
      "/assets/audio/buildings/civic/civic2.m4a",
      "/assets/audio/buildings/civic/civic3.m4a",
      "/assets/audio/buildings/civic/civic4.m4a",
      "/assets/audio/buildings/civic/civic5.m4a",
      "/assets/audio/buildings/civic/civic6.m4a",
      "/assets/audio/buildings/civic/civic7.m4a",
      "/assets/audio/buildings/civic/civic8.m4a",
    ],

    culture: [
      "/assets/audio/buildings/culture/culture1.m4a",
      "/assets/audio/buildings/culture/culture2.m4a",
      "/assets/audio/buildings/culture/culture3.m4a",
      "/assets/audio/buildings/culture/culture4.m4a",
      "/assets/audio/buildings/culture/culture5.m4a",
      "/assets/audio/buildings/culture/culture6.m4a",
      "/assets/audio/buildings/culture/culture7.m4a",
      "/assets/audio/buildings/culture/culture8.m4a",
    ],
  };

  private readonly buttonSoundPaths: Record<
    UIButtonSound,
    string
  > = {
    play: "/assets/audio/ui/play.m4a",
    settings: "/assets/audio/ui/settings.m4a",
    rules: "/assets/audio/ui/rules.m4a",
    credits: "/assets/audio/ui/credits.m4a",
    close: "/assets/audio/ui/close.m4a",
    choice: "/assets/audio/ui/choice.m4a",
    returnToMainMenu:
      "/assets/audio/ui/return-to-main-menu.m4a",

    cardSelect:
      "/assets/audio/ui/card-select.m4a",

    cardDeselect:
      "/assets/audio/ui/card-deselect.m4a",

    replaceHand:
      "/assets/audio/ui/replace-hand.m4a",

    turnAction:
      "/assets/audio/ui/turn-action.m4a",

    victory:
      "/assets/audio/ui/victory.m4a",

    defeat:
      "/assets/audio/ui/defeat.m4a",
  };

  private readonly musicGridBpm = 50;
  private readonly musicGridSubdivisionsPerBeat = 4;
  private readonly buildingSoundRepeatIntervalMs = 36000;

  private readonly menuIntervalMs = 1200;

  private readonly menuVolume = 0.2;
  private readonly menuBackgroundVolume = 0.2;
  private readonly introBackgroundVolume = 0.2;
  private readonly gameBackgroundVolume = 0.2;
  private readonly buttonVolume = 0.2;
  private readonly buildingSoundVolume = 0.068;

  private readonly activeOneShots =
    new Map<HTMLAudioElement, () => void>();

  private readonly recentMenuSoundIndexes: number[] = [];

  private readonly lastBuildingSoundIndexByBuildingId =
    new Map<string, number>();

  private readonly musicGridClock =
    new MusicGridClock(
      this.musicGridBpm,
      this.musicGridSubdivisionsPerBeat
    );

  private readonly placedBuildingSoundScheduler =
    new PlacedBuildingSoundScheduler(
      this.musicGridClock,
      this.buildingSoundRepeatIntervalMs,
      (
        family,
        placedBuildingId
      ) => {
        this.playRandomBuildingFamilySound(
          family,
          placedBuildingId
        );
      }
    );

  private menuBackgroundAudio:
    HTMLAudioElement | null = null;

  private introBackgroundAudio:
    HTMLAudioElement | null = null;

  private gameBackgroundAudio:
    HTMLAudioElement | null = null;

  private introFadeIntervalId:
    number | null = null;

  private menuIntervalId:
    number | null = null;

  private menuSoundPlayCount = 0;

  private menuLoopRequested = false;
  private gameBackgroundLoopRequested = false;

  private audioUnlocked = false;

  private soundEnabled =
    SoundSettings.getSoundEnabled();

  constructor() {
    this.installAudioUnlockListeners();
    this.preloadSounds();
  }

  public startMainMenuRandomLoop(): void {
    this.menuLoopRequested = true;

    if (!this.soundEnabled) {
      return;
    }

    if (!this.audioUnlocked) {
      return;
    }

    if (this.menuIntervalId !== null) {
      return;
    }

    this.startMenuBackgroundLoop();

    this.playRandomMenuSound();

    this.menuIntervalId =
      window.setInterval(() => {
        this.playRandomMenuSound();
      }, this.menuIntervalMs);
  }

  public stopMainMenuRandomLoop(): void {
    this.menuLoopRequested = false;

    this.clearMainMenuRandomState();
    this.stopMenuBackgroundLoop();

    if (this.menuIntervalId === null) {
      return;
    }

    window.clearInterval(
      this.menuIntervalId
    );

    this.menuIntervalId = null;
  }

  public startGameBackgroundLoop(): void {
    this.gameBackgroundLoopRequested = true;

    if (!this.soundEnabled) {
      return;
    }

    if (!this.audioUnlocked) {
      return;
    }

    if (this.gameBackgroundAudio !== null) {
      return;
    }

    const audio =
      new Audio(
        this.gameBackgroundLoopPath
      );

    audio.loop = true;
    audio.volume =
      this.gameBackgroundVolume;

    audio.preload = "auto";
    
    audio.addEventListener(
      "playing",
      () => {
        this.musicGridClock.start(
          performance.now()
        );

        this.placedBuildingSoundScheduler
          .start();
      },
      {
        once: true,
      }
    );

    this.gameBackgroundAudio = audio;

    void audio.play().catch(() => {
      this.musicGridClock.stop();

      this.placedBuildingSoundScheduler
        .pause();

      if (
        this.gameBackgroundAudio === audio
      ) {
        this.gameBackgroundAudio = null;
      }
    });
  }

  public stopGameBackgroundLoop(): void {
    this.gameBackgroundLoopRequested = false;

    this.pauseGameBackgroundLoop();
  }

  public startIntroBackgroundLoop(): void {
    if (!this.soundEnabled) {
      return;
    }

    if (!this.audioUnlocked) {
      return;
    }

    if (
      this.introBackgroundAudio !== null
    ) {
      return;
    }

    this.clearIntroFadeInterval();

    const audio =
      new Audio(
        this.introBackgroundLoopPath
      );

    audio.loop = true;
    audio.volume =
      this.introBackgroundVolume;

    audio.preload = "auto";

    this.introBackgroundAudio = audio;

    void audio.play().catch(() => {
      if (
        this.introBackgroundAudio ===
        audio
      ) {
        this.introBackgroundAudio = null;
      }
    });
  }

  public fadeOutIntroBackgroundLoop(
    durationMs: number = 900
  ): Promise<void> {
    const audio =
      this.introBackgroundAudio;

    if (audio === null) {
      return Promise.resolve();
    }

    this.clearIntroFadeInterval();

    return new Promise((resolve) => {
      const startVolume = audio.volume;
      const startedAt =
        performance.now();

      this.introFadeIntervalId =
        window.setInterval(() => {
          const elapsed =
            performance.now() -
            startedAt;

          const progress = Math.min(
            elapsed / durationMs,
            1
          );

          audio.volume =
            startVolume *
            (1 - progress);

          if (progress < 1) {
            return;
          }

          this.clearIntroFadeInterval();

          audio.pause();
          audio.currentTime = 0;

          audio.volume =
            this.introBackgroundVolume;

          if (
            this.introBackgroundAudio ===
            audio
          ) {
            this.introBackgroundAudio =
              null;
          }

          resolve();
        }, 32);
    });
  }

  public stopIntroBackgroundLoop(): void {
    this.clearIntroFadeInterval();

    if (
      this.introBackgroundAudio === null
    ) {
      return;
    }

    this.introBackgroundAudio.pause();

    this.introBackgroundAudio.currentTime =
      0;

    this.introBackgroundAudio.volume =
      this.introBackgroundVolume;

    this.introBackgroundAudio = null;
  }

  public startBuildingSoundLoopForPlacedBuilding(
    family: StructureFamily,
    placedBuildingId: string
  ): void {
    this.placedBuildingSoundScheduler
      .registerBuilding(
        family,
        placedBuildingId
      );
  }

  public stopAllBuildingSoundLoops(): void {
    this.placedBuildingSoundScheduler
      .clear();

    this.lastBuildingSoundIndexByBuildingId
      .clear();
  }

  public playButtonSound(
    sound: UIButtonSound
  ): void {
    if (!this.soundEnabled) {
      return;
    }

    const path =
      this.buttonSoundPaths[sound];

    this.playOneShot(
      path,
      this.buttonVolume
    );
  }

  public playButtonSoundAndWait(
    sound: UIButtonSound
  ): Promise<void> {
    if (!this.soundEnabled) {
      return Promise.resolve();
    }

    const path =
      this.buttonSoundPaths[sound];

    return this.playOneShotAndWait(
      path,
      this.buttonVolume
    );
  }

  public setSoundEnabled(
    enabled: boolean
  ): void {
    this.soundEnabled = enabled;

    SoundSettings.setSoundEnabled(
      enabled
    );

    if (!enabled) {
      this.pauseMainMenuRandomLoopBecauseSoundDisabled();

      this.stopMenuBackgroundLoop();
      this.stopIntroBackgroundLoop();

      this.pauseGameBackgroundLoop();

      this.stopAllActiveSounds();

      return;
    }

    if (this.menuLoopRequested) {
      this.startMainMenuRandomLoop();
    }

    if (
      this.gameBackgroundLoopRequested
    ) {
      this.startGameBackgroundLoop();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  private playRandomMenuSound(): void {
    if (!this.soundEnabled) {
      return;
    }

    if (
      this.menuSoundPaths.length === 0
    ) {
      return;
    }

    this.menuSoundPlayCount++;

    const forcedIndex =
      this.getForcedMenuSoundIndex();

    const selectedIndex =
      forcedIndex !== null
        ? forcedIndex
        : this.getRandomMenuSoundIndexExcludingRecent();

    this.rememberMenuSoundIndex(
      selectedIndex
    );

    this.playOneShot(
      this.menuSoundPaths[selectedIndex],
      this.menuVolume
    );
  }

  private getForcedMenuSoundIndex():
    number | null {
    const positionInCycle =
      (
        (
          this.menuSoundPlayCount -
          1
        ) %
        10
      ) +
      1;

    if (
      positionInCycle === 1 ||
      positionInCycle === 10
    ) {
      return 0;
    }

    if (positionInCycle === 6) {
      return 7;
    }

    return null;
  }

  private getRandomMenuSoundIndexExcludingRecent():
    number {
    const forcedIndexes =
      new Set([0, 7]);

    const availableIndexes =
      this.menuSoundPaths
        .map((_path, index) => index)
        .filter((index) => {
          if (
            forcedIndexes.has(index)
          ) {
            return false;
          }

          return (
            !this.recentMenuSoundIndexes
              .includes(index)
          );
        });

    const fallbackIndexes =
      this.menuSoundPaths
        .map((_path, index) => index)
        .filter(
          (index) =>
            !forcedIndexes.has(index)
        );

    const selectedPool =
      availableIndexes.length > 0
        ? availableIndexes
        : fallbackIndexes;

    return selectedPool[
      Math.floor(
        Math.random() *
        selectedPool.length
      )
    ];
  }

  private rememberMenuSoundIndex(
    index: number
  ): void {
    this.recentMenuSoundIndexes.push(
      index
    );

    while (
      this.recentMenuSoundIndexes
        .length > 2
    ) {
      this.recentMenuSoundIndexes
        .shift();
    }
  }

  private playRandomBuildingFamilySound(
    family: BuildingSoundFamily,
    placedBuildingId: string
  ): void {
    if (!this.soundEnabled) {
      return;
    }

    const paths =
      this.buildingFamilySoundPaths[
        family
      ];

    if (paths.length === 0) {
      return;
    }

    const previousIndex =
      this.lastBuildingSoundIndexByBuildingId
        .get(placedBuildingId);

    const availableIndexes =
      paths
        .map((_path, index) => index)
        .filter(
          (index) =>
            index !== previousIndex
        );

    const selectedIndexes =
      availableIndexes.length > 0
        ? availableIndexes
        : paths.map(
            (_path, index) => index
          );

    const selectedIndex =
      selectedIndexes[
        Math.floor(
          Math.random() *
          selectedIndexes.length
        )
      ];

    this.lastBuildingSoundIndexByBuildingId
      .set(
        placedBuildingId,
        selectedIndex
      );

    this.playOneShot(
      paths[selectedIndex],
      this.buildingSoundVolume
    );
  }

  private playOneShot(
    path: string,
    volume: number
  ): void {
    if (!this.soundEnabled) {
      return;
    }

    const audio = new Audio(path);

    audio.volume = volume;
    audio.preload = "auto";

    let cleanedUp = false;

    const cleanup = (): void => {
      if (cleanedUp) {
        return;
      }

      cleanedUp = true;

      this.activeOneShots.delete(
        audio
      );

      audio.removeEventListener(
        "ended",
        cleanup
      );

      audio.removeEventListener(
        "error",
        cleanup
      );
    };

    this.activeOneShots.set(
      audio,
      cleanup
    );

    audio.addEventListener(
      "ended",
      cleanup
    );

    audio.addEventListener(
      "error",
      cleanup
    );

    void audio.play().catch(() => {
      cleanup();
    });
  }

  private playOneShotAndWait(
    path: string,
    volume: number
  ): Promise<void> {
    if (!this.soundEnabled) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const audio =
        new Audio(path);

      audio.volume = volume;
      audio.preload = "auto";

      let cleanedUp = false;

      const cleanup = (): void => {
        if (cleanedUp) {
          return;
        }

        cleanedUp = true;

        this.activeOneShots.delete(
          audio
        );

        audio.removeEventListener(
          "ended",
          cleanup
        );

        audio.removeEventListener(
          "error",
          cleanup
        );

        resolve();
      };

      this.activeOneShots.set(
        audio,
        cleanup
      );

      audio.addEventListener(
        "ended",
        cleanup
      );

      audio.addEventListener(
        "error",
        cleanup
      );

      void audio.play().catch(() => {
        cleanup();
      });
    });
  }

  private preloadSounds(): void {
    const buildingSoundPaths =
      Object.values(
        this.buildingFamilySoundPaths
      ).flat();

    const paths = [
      this.menuBackgroundLoopPath,
      this.introBackgroundLoopPath,
      this.gameBackgroundLoopPath,
      ...this.menuSoundPaths,
      ...Object.values(
        this.buttonSoundPaths
      ),
      ...buildingSoundPaths,
    ];

    for (const path of paths) {
      const audio = new Audio(path);

      audio.preload = "auto";
      audio.load();
    }
  }

  private installAudioUnlockListeners():
    void {
    const unlock = (): void => {
      this.audioUnlocked = true;

      window.removeEventListener(
        "pointerdown",
        unlock
      );

      window.removeEventListener(
        "keydown",
        unlock
      );

      if (
        this.menuLoopRequested
      ) {
        this.startMainMenuRandomLoop();
      }

      if (
        this.gameBackgroundLoopRequested
      ) {
        this.startGameBackgroundLoop();
      }
    };

    window.addEventListener(
      "pointerdown",
      unlock
    );

    window.addEventListener(
      "keydown",
      unlock
    );
  }

  private startMenuBackgroundLoop(): void {
    if (!this.soundEnabled) {
      return;
    }

    if (
      this.menuBackgroundAudio !== null
    ) {
      return;
    }

    const audio =
      new Audio(
        this.menuBackgroundLoopPath
      );

    audio.loop = true;

    audio.volume =
      this.menuBackgroundVolume;

    audio.preload = "auto";

    this.menuBackgroundAudio = audio;

    void audio.play().catch(() => {
      if (
        this.menuBackgroundAudio ===
        audio
      ) {
        this.menuBackgroundAudio = null;
      }
    });
  }

  private stopMenuBackgroundLoop(): void {
    if (
      this.menuBackgroundAudio === null
    ) {
      return;
    }

    this.menuBackgroundAudio.pause();

    this.menuBackgroundAudio.currentTime =
      0;

    this.menuBackgroundAudio = null;
  }

  private pauseGameBackgroundLoop(): void {
    this.musicGridClock.stop();

    this.placedBuildingSoundScheduler
      .pause();

    if (
      this.gameBackgroundAudio === null
    ) {
      return;
    }

    this.gameBackgroundAudio.pause();

    this.gameBackgroundAudio.currentTime =
      0;

    this.gameBackgroundAudio = null;
  }

  private pauseMainMenuRandomLoopBecauseSoundDisabled():
    void {
    this.clearMainMenuRandomState();

    this.stopMenuBackgroundLoop();

    if (
      this.menuIntervalId === null
    ) {
      return;
    }

    window.clearInterval(
      this.menuIntervalId
    );

    this.menuIntervalId = null;
  }

  private clearMainMenuRandomState(): void {
    this.recentMenuSoundIndexes.length =
      0;

    this.menuSoundPlayCount = 0;
  }

  private stopAllActiveSounds(): void {
    const activeEntries = [
      ...this.activeOneShots.entries(),
    ];

    for (
      const [
        audio,
        cleanup,
      ] of activeEntries
    ) {
      audio.pause();
      audio.currentTime = 0;

      cleanup();
    }
  }

  private clearIntroFadeInterval():
    void {
    if (
      this.introFadeIntervalId === null
    ) {
      return;
    }

    window.clearInterval(
      this.introFadeIntervalId
    );

    this.introFadeIntervalId = null;
  }
}