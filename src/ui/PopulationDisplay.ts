export interface PopulationDisplayData {
  playerPopulation: number;
  playerCapacity: number;

  aiPopulation: number;
  aiCapacity: number;

  aiPopulationKnown: boolean;
}

export class PopulationDisplay {
  private readonly container: HTMLDivElement;
  private readonly playerRow: HTMLDivElement;
  private readonly aiRow: HTMLDivElement;

  private lastPlayerPopulation = 0;
  private lastPlayerCapacity = 0;

  private lastAIPopulation = 0;
  private lastAICapacity = 0;
  private lastAIPopulationKnown = false;

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "population-display";
    this.container.className = "os-hud-panel os-hud-population";

    const title = document.createElement("div");
    title.textContent = "Population";
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
      playerPopulation: 0,
      playerCapacity: 0,
      aiPopulation: 0,
      aiCapacity: 0,
      aiPopulationKnown: false,
    });
  }

  public update(data: PopulationDisplayData): void {
    this.lastPlayerPopulation = data.playerPopulation;
    this.lastPlayerCapacity = data.playerCapacity;

    this.lastAIPopulation = data.aiPopulation;
    this.lastAICapacity = data.aiCapacity;

    this.lastAIPopulationKnown = data.aiPopulationKnown;

    this.render();
  }

  public updatePlayerPopulation(
    playerPopulation: number,
    playerCapacity: number
  ): void {
    this.lastPlayerPopulation = playerPopulation;
    this.lastPlayerCapacity = playerCapacity;
    this.render();
  }

  public revealAIPopulation(
    aiPopulation: number,
    aiCapacity: number
  ): void {
    this.lastAIPopulation = aiPopulation;
    this.lastAICapacity = aiCapacity;
    this.lastAIPopulationKnown = true;
    this.render();
  }

  public markAIPopulationAsUncertain(): void {
    this.lastAIPopulationKnown = false;
    this.render();
  }

  private render(): void {
    this.playerRow.textContent =
      `Garmiyo (P) : ${this.lastPlayerPopulation} / ${this.lastPlayerCapacity}`;

    this.aiRow.innerHTML = "";

    const label = document.createElement("span");
    label.textContent = "Garmamo (AI) : ";

    const value = document.createElement("span");

    if (this.lastAIPopulationKnown) {
      value.textContent =
        `${this.lastAIPopulation} / ${this.lastAICapacity}`;
    } else {
      value.textContent =
        `${this.lastAIPopulation} / ${this.lastAICapacity}?`;
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