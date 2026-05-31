export class InGameMenuDisplay {
  private readonly container: HTMLDivElement;

  private onMainMenu?: () => void;
  private onRules?: () => void;

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "in-game-menu-display";
    this.container.className = "os-in-game-menu";

    const mainMenuButton = this.createIconButton(
      "Main Menu",
      "/assets/ui/icons/main-menu.png"
    );

    const rulesButton = this.createIconButton(
      "Rules",
      "/assets/ui/icons/rules.png"
    );

    mainMenuButton.addEventListener("click", () => this.onMainMenu?.());
    rulesButton.addEventListener("click", () => this.onRules?.());

    this.container.appendChild(mainMenuButton);
    this.container.appendChild(rulesButton);

    document.body.appendChild(this.container);
  }

  public setOnMainMenu(callback: () => void): void {
    this.onMainMenu = callback;
  }

  public setOnRules(callback: () => void): void {
    this.onRules = callback;
  }

  public show(): void {
    this.container.style.display = "flex";
  }

  public hide(): void {
    this.container.style.display = "none";
  }

  private createIconButton(
    label: string,
    iconPath: string
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.title = label;
    button.className = "os-icon-button";

    const icon = document.createElement("img");
    icon.src = iconPath;
    icon.alt = "";
    icon.className = "os-icon-button-image";

    const hiddenLabel = document.createElement("span");
    hiddenLabel.textContent = label;
    hiddenLabel.className = "os-icon-button-label";

    button.appendChild(icon);
    button.appendChild(hiddenLabel);

    return button;
  }
}