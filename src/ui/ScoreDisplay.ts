import { GAME_BALANCE_CONFIG } from "../game/config/GameBalanceConfig";

export interface ScoreDisplayData {
  playerPopulation: number;
  playerAttraction: number;

  aiPopulation: number;
  aiAttraction: number;

  aiScoreKnown: boolean;
}

export class ScoreDisplay {
  private readonly container: HTMLDivElement;
  private readonly playerRow: HTMLDivElement;
  private readonly aiRow: HTMLDivElement;

  private lastPlayerPopulation = 0;
  private lastPlayerAttraction = 0;

  private lastAIPopulation = 0;
  private lastAIAttraction = 0;

  private lastAIScoreKnown = false;

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "score-display";
    this.container.className = "os-hud-panel os-hud-score";

    const title = document.createElement("div");
    title.textContent = "Score";
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
      playerAttraction: 0,
      aiPopulation: 0,
      aiAttraction: 0,
      aiScoreKnown: false,
    });
  }

  public update(data: ScoreDisplayData): void {
    this.lastPlayerPopulation = data.playerPopulation;
    this.lastPlayerAttraction = data.playerAttraction;

    this.lastAIPopulation = data.aiPopulation;
    this.lastAIAttraction = data.aiAttraction;

    this.lastAIScoreKnown = data.aiScoreKnown;

    this.render();
  }

  public updatePlayerScore(
    playerPopulation: number,
    playerAttraction: number
  ): void {
    this.lastPlayerPopulation = playerPopulation;
    this.lastPlayerAttraction = playerAttraction;

    this.render();
  }

  public revealAIScore(
    aiPopulation: number,
    aiAttraction: number
  ): void {
    this.lastAIPopulation = aiPopulation;
    this.lastAIAttraction = aiAttraction;
    this.lastAIScoreKnown = true;

    this.render();
  }

  public markAIScoreAsUncertain(): void {
    this.lastAIScoreKnown = false;
    this.render();
  }

  private render(): void {
    const playerScore =
      this.lastPlayerPopulation * GAME_BALANCE_CONFIG.scoring.populationWeight +
      this.lastPlayerAttraction * GAME_BALANCE_CONFIG.scoring.attractionWeight;

    this.playerRow.textContent = `Garmiyo (P) : ${playerScore}`;

    this.aiRow.innerHTML = "";

    const label = document.createElement("span");
    label.textContent = "Garmamo (AI) : ";

    const value = document.createElement("span");

    const aiScore =
      this.lastAIPopulation * GAME_BALANCE_CONFIG.scoring.populationWeight +
      this.lastAIAttraction * GAME_BALANCE_CONFIG.scoring.attractionWeight;

    if (this.lastAIScoreKnown) {
      value.textContent = `${aiScore}`;
    } else {
      value.textContent = `${aiScore}?`;
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