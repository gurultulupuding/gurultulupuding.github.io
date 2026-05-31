export interface AttractionDisplayData {
  playerAttraction: number;
  aiAttraction: number;
  aiAttractionKnown: boolean;
}

export class AttractionDisplay {
  private readonly container: HTMLDivElement;
  private readonly playerRow: HTMLDivElement;
  private readonly aiRow: HTMLDivElement;

  private lastPlayerAttraction = 0;
  private lastAIAttraction = 0;
  private lastAIAttractionKnown = false;

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "attraction-display";
    this.container.className = "os-hud-panel os-hud-attraction";

    const title = document.createElement("div");
    title.textContent = "Attraction";
    title.className = "os-hud-title";

    this.playerRow = document.createElement("div");
    this.playerRow.className = "os-hud-row";

    this.aiRow = document.createElement("div");
    this.aiRow.className = "os-hud-row";

    this.container.appendChild(title);
    this.container.appendChild(this.playerRow);
    this.container.appendChild(this.aiRow);

    document.body.appendChild(this.container);

    this.update({
      playerAttraction: 0,
      aiAttraction: 0,
      aiAttractionKnown: false,
    });
  }

  public update(data: AttractionDisplayData): void {
    this.lastPlayerAttraction = data.playerAttraction;
    this.lastAIAttraction = data.aiAttraction;
    this.lastAIAttractionKnown = data.aiAttractionKnown;

    this.render();
  }

  public updatePlayerAttraction(playerAttraction: number): void {
    this.lastPlayerAttraction = playerAttraction;
    this.render();
  }

  public revealAIAttraction(aiAttraction: number): void {
    this.lastAIAttraction = aiAttraction;
    this.lastAIAttractionKnown = true;
    this.render();
  }

  public markAIAttractionAsUncertain(): void {
    this.lastAIAttractionKnown = false;
    this.render();
  }

  private render(): void {
    this.playerRow.textContent = `Garmiyo (P) : ${this.lastPlayerAttraction}`;

    this.aiRow.innerHTML = "";

    const label = document.createElement("span");
    label.textContent = "Garmamo (AI) : ";

    const value = document.createElement("span");

    if (this.lastAIAttractionKnown) {
      value.textContent = `${this.lastAIAttraction}`;
    } else {
      value.textContent = `${this.lastAIAttraction}?`;
      value.className = "os-hud-muted";
    }

    this.aiRow.appendChild(label);
    this.aiRow.appendChild(value);
  }

  public show(): void {
    this.container.style.display = "block";
  }

  public hide(): void {
    this.container.style.display = "none";
  }
}