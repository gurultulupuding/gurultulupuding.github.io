import { GAME_BALANCE_CONFIG } from "../game/config/GameBalanceConfig";
import type { GameResult } from "../game/result/GameResult";

export class GameOverDisplay {
  private readonly overlay: HTMLDivElement;
  private readonly panel: HTMLDivElement;
  private readonly onRestart?: () => void;

  constructor(onRestart?: () => void) {
    this.onRestart = onRestart;

    this.overlay = document.createElement("div");
    this.overlay.id = "game-over-display";
    this.overlay.className = "os-game-over-overlay";

    this.panel = document.createElement("div");
    this.panel.className = "os-game-over-panel";

    this.overlay.appendChild(this.panel);
    document.body.appendChild(this.overlay);
  }

  public show(result: GameResult): void {
    this.panel.innerHTML = "";

    const title = document.createElement("div");
    title.textContent = this.getTitle(result);
    title.className = "os-game-over-title";

    const scoreBox = document.createElement("div");
    scoreBox.className = "os-game-over-score-grid";

    scoreBox.appendChild(
      this.createCityScoreCard(
        "Garmiyo",
        result.playerPopulation,
        result.playerAttraction,
        result.playerScore
      )
    );

    scoreBox.appendChild(
      this.createCityScoreCard(
        "Garmamo",
        result.aiPopulation,
        result.aiAttraction,
        result.aiScore
      )
    );

    const note = document.createElement("div");
    note.textContent =
      `Victory is decided by Score = (Population × ${GAME_BALANCE_CONFIG.scoring.populationWeight}) + (Attraction × ${GAME_BALANCE_CONFIG.scoring.attractionWeight}).`;
    note.className = "os-game-over-note";

    const restartButton = document.createElement("button");
    restartButton.type = "button";
    restartButton.textContent = "Restart";
    restartButton.className = "os-button os-game-over-restart-button";

    restartButton.addEventListener("click", () => {
      this.onRestart?.();
    });

    this.panel.appendChild(title);
    this.panel.appendChild(scoreBox);
    this.panel.appendChild(note);
    this.panel.appendChild(restartButton);

    this.overlay.style.display = "flex";
  }

  public hide(): void {
    this.overlay.style.display = "none";
  }

  private getTitle(result: GameResult): string {
    if (result.winner === "player") {
      return " You won! Garmiyo prevails!";
    }

    if (result.winner === "ai") {
      return "You lost! Garmamo prevails!";
    }

    return "A Balanced Shore!";
  }

  private createCityScoreCard(
    label: string,
    population: number,
    attraction: number,
    score: number
  ): HTMLDivElement {
    const card = document.createElement("div");
    card.className = "os-game-over-score-card";

    const title = document.createElement("div");
    title.textContent = label;
    title.className = "os-game-over-score-card-title";

    const populationRow = document.createElement("div");
    populationRow.textContent = `Population : ${population}`;
    populationRow.className = "os-game-over-score-row";

    const attractionRow = document.createElement("div");
    attractionRow.textContent = `Attraction : ${attraction}`;
    attractionRow.className = "os-game-over-score-row";

    const scoreRow = document.createElement("div");
    const populationScore =
      population * GAME_BALANCE_CONFIG.scoring.populationWeight;

    const attractionScore =
      attraction * GAME_BALANCE_CONFIG.scoring.attractionWeight;

    scoreRow.textContent =
      `Score : ${populationScore} + ${attractionScore} = ${score}`;
    scoreRow.className = "os-game-over-final-score";

    card.appendChild(title);
    card.appendChild(populationRow);
    card.appendChild(attractionRow);
    card.appendChild(scoreRow);

    return card;
  }
}