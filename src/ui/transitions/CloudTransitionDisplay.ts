export type CloudTransitionDirection = "left-to-right" | "right-to-left";

export type CloudTransitionOptions = {
  direction: CloudTransitionDirection;
  enterDurationMs?: number;
  holdDurationMs?: number;
  exitDurationMs?: number;
  showLoadingText?: boolean;
  loadingText?: string;
  onCovered?: () => Promise<void> | void;
};

export type LoadingIntroTransitionAudioCallbacks = {
  onIntroStarted?: () => void;
  onIntroFinished?: () => Promise<void> | void;
  onBeforeCloudExit?: () => Promise<void> | void;
};

export class CloudTransitionDisplay {
  private readonly overlay: HTMLDivElement;
  private readonly cloudStrip: HTMLDivElement;
  private readonly leftCap: HTMLDivElement;
  private readonly centerCloud: HTMLDivElement;
  private readonly rightCap: HTMLDivElement;

  private readonly loadingLabel: HTMLDivElement;
  private readonly introLabel: HTMLDivElement;
  private readonly skipLabel: HTMLDivElement;

  private introSkipRequested = false;
  private introSequenceRunning = false;

  private dotIntervalId: number | null = null;
  private dotCount = 1;

  private readonly hiddenLeftTransform = "translateX(-160vw)";
  private readonly hiddenRightTransform = "translateX(100vw)";
  private readonly centeredTransform = "translateX(-30vw)";

  constructor(texturePath: string) {
    this.overlay = document.createElement("div");
    this.overlay.id = "cloud-transition-overlay";

    this.overlay.style.position = "fixed";
    this.overlay.style.inset = "0";
    this.overlay.style.zIndex = "5000";
    this.overlay.style.pointerEvents = "none";
    this.overlay.style.overflow = "hidden";
    this.overlay.style.display = "none";

    this.cloudStrip = document.createElement("div");
    this.cloudStrip.id = "cloud-transition-strip";

    this.cloudStrip.style.position = "absolute";
    this.cloudStrip.style.left = "0";
    this.cloudStrip.style.top = "0";
    this.cloudStrip.style.width = "160vw";
    this.cloudStrip.style.height = "100vh";
    this.cloudStrip.style.display = "flex";
    this.cloudStrip.style.willChange = "transform";

    this.leftCap = this.createCloudPart(texturePath, "30vw", "left center");
    this.centerCloud = this.createCloudPart(
      texturePath,
      "100vw",
      "center center"
    );
    this.rightCap = this.createCloudPart(texturePath, "30vw", "right center");

    this.cloudStrip.appendChild(this.leftCap);
    this.cloudStrip.appendChild(this.centerCloud);
    this.cloudStrip.appendChild(this.rightCap);

    this.loadingLabel = document.createElement("div");
    this.loadingLabel.id = "cloud-transition-loading-label";
    this.loadingLabel.className = "os-loading-text";

    this.loadingLabel.style.position = "absolute";
    this.loadingLabel.style.left = "50%";
    this.loadingLabel.style.top = "50%";
    this.loadingLabel.style.transform = "translate(-50%, -50%)";
    this.loadingLabel.style.display = "none";
    this.loadingLabel.style.opacity = "0";
    this.loadingLabel.style.transition = "opacity 350ms ease";

    this.introLabel = document.createElement("div");
    this.introLabel.id = "cloud-transition-intro-label";
    this.introLabel.className = "os-intro-text";

    this.introLabel.style.position = "absolute";
    this.introLabel.style.left = "50%";
    this.introLabel.style.top = "46%";
    this.introLabel.style.transform = "translate(-50%, -50%)";
    this.introLabel.style.width = "min(980px, 88vw)";
    this.introLabel.style.display = "none";
    this.introLabel.style.opacity = "0";
    this.introLabel.style.transition = "opacity 700ms ease";

    this.skipLabel = document.createElement("div");
    this.skipLabel.id = "cloud-transition-skip-label";
    this.skipLabel.className = "os-intro-skip-text";
    this.skipLabel.textContent = "Press Enter to skip";

    this.skipLabel.style.position = "absolute";
    this.skipLabel.style.left = "50%";
    this.skipLabel.style.bottom = "72px";
    this.skipLabel.style.transform = "translateX(-50%)";
    this.skipLabel.style.display = "none";
    this.skipLabel.style.opacity = "0";
    this.skipLabel.style.transition = "opacity 450ms ease";

    this.overlay.appendChild(this.cloudStrip);
    this.overlay.appendChild(this.loadingLabel);
    this.overlay.appendChild(this.introLabel);
    this.overlay.appendChild(this.skipLabel);

    document.body.appendChild(this.overlay);
  }

  public async play(options: CloudTransitionOptions): Promise<void> {
    const enterDurationMs = options.enterDurationMs ?? 850;
    const holdDurationMs = options.holdDurationMs ?? 1000;
    const exitDurationMs = options.exitDurationMs ?? 850;

    this.overlay.style.display = "block";
    this.overlay.style.pointerEvents = "auto";

    this.cloudStrip.style.opacity = "1";

    this.configureLoadingText(
      options.showLoadingText ?? false,
      options.loadingText ?? "Loading"
    );

    const startTransform =
      options.direction === "left-to-right"
        ? this.hiddenLeftTransform
        : this.hiddenRightTransform;

    const endTransform =
      options.direction === "left-to-right"
        ? this.hiddenRightTransform
        : this.hiddenLeftTransform;

    this.cloudStrip.style.transition = "none";
    this.cloudStrip.style.transform = startTransform;

    await this.waitFrame();

    this.cloudStrip.style.transition =
      `transform ${enterDurationMs}ms ease-in-out`;
    this.cloudStrip.style.transform = this.centeredTransform;

    await this.wait(enterDurationMs);

    if (options.onCovered) {
      await Promise.resolve(options.onCovered());
    }

    await this.wait(holdDurationMs);

    if (options.showLoadingText) {
      this.loadingLabel.style.opacity = "0";
      this.stopDots();
      await this.wait(400);
    }

    this.cloudStrip.style.transition =
      `transform ${exitDurationMs}ms ease-in-out`;
    this.cloudStrip.style.transform = endTransform;

    await this.wait(exitDurationMs);

    this.cleanupAfterTransition();
  }

  public async playLoadingThenHide(
    loadingDurationMs: number = 10000
  ): Promise<void> {
    this.overlay.style.display = "block";
    this.overlay.style.pointerEvents = "auto";

    this.configureLoadingText(true, "Loading");

    this.cloudStrip.style.opacity = "1";
    this.cloudStrip.style.transition = "none";
    this.cloudStrip.style.transform = this.hiddenLeftTransform;

    await this.waitFrame();

    this.cloudStrip.style.transition = "transform 1100ms ease-in-out";
    this.cloudStrip.style.transform = this.centeredTransform;

    await this.wait(1100);
    await this.wait(loadingDurationMs);

    this.loadingLabel.style.opacity = "0";
    this.stopDots();

    await this.wait(400);

    this.cloudStrip.style.transition = "transform 850ms ease-in-out";
    this.cloudStrip.style.transform = this.hiddenRightTransform;

    await this.wait(850);

    this.cleanupAfterTransition();
  }

  public async playLoadingOverMenuThenHide(
    onCovered: () => void,
    loadingDurationMs: number = 10000
  ): Promise<void> {
    this.overlay.style.display = "block";
    this.overlay.style.pointerEvents = "auto";

    this.cloudStrip.style.opacity = "1";
    this.cloudStrip.style.transition = "none";
    this.cloudStrip.style.transform = this.hiddenLeftTransform;

    this.loadingLabel.style.display = "none";
    this.loadingLabel.style.opacity = "0";
    this.stopDots();

    await this.waitFrame();

    this.cloudStrip.style.transition = "transform 1100ms ease-in-out";
    this.cloudStrip.style.transform = this.centeredTransform;

    await this.wait(1100);

    onCovered();

    await this.wait(250);

    this.configureLoadingText(true, "Loading");

    await this.wait(loadingDurationMs);

    this.loadingLabel.style.opacity = "0";
    this.stopDots();

    await this.wait(400);

    this.cloudStrip.style.transition = "transform 850ms ease-in-out";
    this.cloudStrip.style.transform = this.hiddenRightTransform;

    await this.wait(850);

    this.cleanupAfterTransition();
  }

  public async playLoadingOverMenuUntilReady(
    onCovered: () => Promise<void> | void,
    minimumLoadingDurationMs: number = 1200
  ): Promise<void> {
    this.overlay.style.display = "block";
    this.overlay.style.pointerEvents = "auto";

    this.cloudStrip.style.opacity = "1";
    this.cloudStrip.style.transition = "none";
    this.cloudStrip.style.transform = this.hiddenLeftTransform;

    this.loadingLabel.style.display = "none";
    this.loadingLabel.style.opacity = "0";
    this.stopDots();

    await this.waitFrame();

    this.cloudStrip.style.transition = "transform 1100ms ease-in-out";
    this.cloudStrip.style.transform = this.centeredTransform;

    await this.wait(1100);

    const readyPromise = Promise.resolve(onCovered());

    await this.wait(250);

    this.configureLoadingText(true, "Loading");

    await Promise.all([
      readyPromise,
      this.wait(minimumLoadingDurationMs),
    ]);

    this.loadingLabel.style.opacity = "0";
    this.stopDots();

    await this.wait(400);

    this.cloudStrip.style.transition = "transform 850ms ease-in-out";
    this.cloudStrip.style.transform = this.hiddenRightTransform;

    await this.wait(850);

    this.cleanupAfterTransition();
  }

  public async playLoadingIntroOverMenuUntilReady(
    onCovered: () => Promise<void> | void,
    showIntro: boolean,
    minimumLoadingDurationMs: number = 1200,
    audioCallbacks: LoadingIntroTransitionAudioCallbacks = {}
  ): Promise<void> {
    this.overlay.style.display = "block";
    this.overlay.style.pointerEvents = "auto";

    this.cloudStrip.style.opacity = "1";
    this.cloudStrip.style.transition = "none";
    this.cloudStrip.style.transform = this.hiddenLeftTransform;

    this.loadingLabel.style.display = "none";
    this.loadingLabel.style.opacity = "0";

    this.introLabel.style.display = "none";
    this.introLabel.style.opacity = "0";

    this.skipLabel.style.display = "none";
    this.skipLabel.style.opacity = "0";

    this.stopDots();
    this.introSkipRequested = false;

    await this.waitFrame();

    this.cloudStrip.style.transition = "transform 1100ms ease-in-out";
    this.cloudStrip.style.transform = this.centeredTransform;

    await this.wait(1100);

    const readyPromise = Promise.resolve(onCovered());

    await this.wait(250);

    this.configureLoadingText(true, "Loading");

    await Promise.all([
      readyPromise,
      this.wait(minimumLoadingDurationMs),
    ]);

    this.loadingLabel.style.opacity = "0";
    this.stopDots();

    await this.wait(400);

    this.loadingLabel.style.display = "none";

    if (showIntro) {
      audioCallbacks.onIntroStarted?.();

      await this.playIntroSequence();

      if (audioCallbacks.onIntroFinished) {
        await Promise.resolve(audioCallbacks.onIntroFinished());
      }
    }

    if (audioCallbacks.onBeforeCloudExit) {
      await Promise.resolve(audioCallbacks.onBeforeCloudExit());
    }

    this.cloudStrip.style.transition = "transform 850ms ease-in-out";
    this.cloudStrip.style.transform = this.hiddenRightTransform;

    await this.wait(850);

    this.cleanupAfterTransition();
  }

  private createCloudPart(
    texturePath: string,
    width: string,
    backgroundPosition: string
  ): HTMLDivElement {
    const part = document.createElement("div");

    part.style.width = width;
    part.style.height = "100vh";
    part.style.flex = "0 0 auto";

    part.style.backgroundImage = `url("${texturePath}")`;
    part.style.backgroundRepeat = "no-repeat";
    part.style.backgroundSize = "160vw 100vh";
    part.style.backgroundPosition = backgroundPosition;

    return part;
  }

  private async playIntroSequence(): Promise<void> {
    if (this.introSequenceRunning) {
      return;
    }

    this.introSequenceRunning = true;
    this.introSkipRequested = false;

    const pages = [
      `In the untouched, heaven-like lands above the pink clouds lies <strong>Sta Garyo</strong>, a peaceful realm shaped by the river <strong>Nimro</strong>. On opposite shores of this river stand two twin cities: <strong>Garmiyo</strong> and <strong>Garmamo</strong>.`,

      `The cities were founded by two brothers, <strong>Miyo</strong> and <strong>Mamo</strong>, whose shared dream slowly turned into a fierce rivalry. Each brother wanted to prove that his city could become the most prosperous, beautiful and beloved settlement on the shores of <strong>Nimro</strong>.`,

      `Step into the role of <strong>Miyo</strong> and build <strong>Garmiyo</strong> from the ground up. Plan your city, shape its identity, attract new citizens, and outscore <strong>Mamo’s city</strong> across the river. The shores of <strong>Nimro</strong> are waiting, which city will rise above the clouds?`,
    ];

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.code !== "Enter") {
        return;
      }

      this.introSkipRequested = true;
    };

    window.addEventListener("keydown", handleKeyDown);

    this.skipLabel.style.display = "block";
    this.skipLabel.style.opacity = "0";

    await this.waitFrame();
    this.skipLabel.style.opacity = "1";

    try {
      for (const page of pages) {
        if (this.introSkipRequested) {
          break;
        }

        await this.showIntroPage(page);

        if (this.introSkipRequested) {
          break;
        }

        await this.waitOrSkip(7800);

        await this.hideIntroPage();
      }

      if (this.introLabel.style.opacity !== "0") {
        await this.hideIntroPage();
      }

      this.skipLabel.style.opacity = "0";
      await this.wait(450);
      this.skipLabel.style.display = "none";
    } finally {
      window.removeEventListener("keydown", handleKeyDown);
      this.introSequenceRunning = false;
      this.introSkipRequested = false;
    }
  }

  private async showIntroPage(html: string): Promise<void> {
    this.introLabel.innerHTML = html;
    this.introLabel.style.display = "block";
    this.introLabel.style.opacity = "0";

    await this.waitFrame();

    this.introLabel.style.opacity = "1";

    await this.wait(700);
  }

  private async hideIntroPage(): Promise<void> {
    if (this.introLabel.style.display === "none") {
      return;
    }

    if (this.introLabel.style.opacity === "0") {
      await this.wait(700);
      this.introLabel.style.display = "none";
      return;
    }

    this.introLabel.style.opacity = "0";

    await this.wait(700);

    this.introLabel.style.display = "none";
  }

  private async waitOrSkip(ms: number): Promise<void> {
    const step = 80;
    let elapsed = 0;

    while (elapsed < ms) {
      if (this.introSkipRequested) {
        return;
      }

      await this.wait(step);
      elapsed += step;
    }
  }

  private configureLoadingText(show: boolean, text: string): void {
    if (!show) {
      this.stopDots();
      this.loadingLabel.style.opacity = "0";

      window.setTimeout(() => {
        this.loadingLabel.style.display = "none";
      }, 350);

      return;
    }

    this.loadingLabel.style.display = "block";
    this.loadingLabel.style.opacity = "0";

    window.requestAnimationFrame(() => {
      this.loadingLabel.style.opacity = "1";
    });

    this.startDots(text);
  }

  private startDots(baseText: string): void {
    this.stopDots();

    this.dotCount = 1;
    this.loadingLabel.textContent = `${baseText}.`;

    this.dotIntervalId = window.setInterval(() => {
      this.dotCount++;

      if (this.dotCount > 3) {
        this.dotCount = 1;
      }

      this.loadingLabel.textContent = `${baseText}${".".repeat(this.dotCount)}`;
    }, 420);
  }

  private stopDots(): void {
    if (this.dotIntervalId === null) {
      return;
    }

    window.clearInterval(this.dotIntervalId);
    this.dotIntervalId = null;
  }

  private cleanupAfterTransition(): void {
    this.stopDots();

    this.loadingLabel.style.display = "none";
    this.loadingLabel.style.opacity = "0";

    this.introLabel.style.display = "none";
    this.introLabel.style.opacity = "0";

    this.skipLabel.style.display = "none";
    this.skipLabel.style.opacity = "0";

    this.overlay.style.display = "none";
    this.overlay.style.pointerEvents = "none";

    this.cloudStrip.style.opacity = "1";
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  private waitFrame(): Promise<void> {
    return new Promise((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
  }
}