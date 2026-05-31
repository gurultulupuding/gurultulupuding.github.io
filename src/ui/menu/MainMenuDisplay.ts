export class MainMenuDisplay {
  private readonly container: HTMLDivElement;

  private onPlay?: () => void;
  private onRules?: () => void;
  private onSettings?: () => void;
  private onCredits?: () => void;

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "main-menu";
    this.container.className = "os-main-menu";

    const titleBackplate = document.createElement("div");
    titleBackplate.className = "os-main-title-backplate";

    const title = document.createElement("div");
    title.textContent = "Opposite Shores";
    title.className = "os-main-title-text";

    titleBackplate.appendChild(title);

    const playButton = this.createButton("Play");
    const rulesButton = this.createButton("Rules");
    const settingsButton = this.createButton("Settings");
    const creditsButton = this.createButton("Credits");

    playButton.addEventListener("click", () => this.onPlay?.());
    rulesButton.addEventListener("click", () => this.onRules?.());
    settingsButton.addEventListener("click", () => this.onSettings?.());
    creditsButton.addEventListener("click", () => this.onCredits?.());

    this.container.appendChild(titleBackplate);
    this.container.appendChild(playButton);
    this.container.appendChild(rulesButton);
    this.container.appendChild(settingsButton);
    this.container.appendChild(creditsButton);

    document.body.appendChild(this.container);
  }

  public setOnPlay(callback: () => void): void {
    this.onPlay = callback;
  }

  public setOnRules(callback: () => void): void {
    this.onRules = callback;
  }

  public setOnSettings(callback: () => void): void {
    this.onSettings = callback;
  }

  public setOnCredits(callback: () => void): void {
    this.onCredits = callback;
  }

  public show(): void {
    this.container.style.display = "flex";
  }

  public hide(): void {
    this.container.style.display = "none";
  }

  private createButton(label: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = "os-button os-main-menu-button";

    return button;
  }
}