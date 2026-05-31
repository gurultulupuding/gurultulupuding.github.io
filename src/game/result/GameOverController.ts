import { TurnController } from "../turn/TurnController";
import { CityScoreCalculator } from "../scoring/CityScoreCalculator";
import { PlacedBuildingRegistry } from "../../world/city/PlacedBuildingRegistry";
import { PlacedBuildingScoreRegistry } from "../scoring/PlacedBuildingScoreRegistry";
import { CityPopulationModifierState } from "../scoring/CityPopulationModifierState";
import { GameResultResolver } from "./GameResultResolver";
import { GameOverDisplay } from "../../ui/GameOverDisplay";
import { GameEndUIController } from "./GameEndUIController";
import type { GameWinner } from "./GameResult";

export class GameOverController {
  private prepared = false;
  private resolved = false;

  private readonly cityScoreCalculator: CityScoreCalculator;

  private readonly playerPlacedBuildingRegistry: PlacedBuildingRegistry;
  private readonly playerScoreRegistry: PlacedBuildingScoreRegistry;
  private readonly playerPopulationModifierState: CityPopulationModifierState;

  private readonly aiPlacedBuildingRegistry: PlacedBuildingRegistry;
  private readonly aiScoreRegistry: PlacedBuildingScoreRegistry;
  private readonly aiPopulationModifierState: CityPopulationModifierState;

  private readonly gameResultResolver: GameResultResolver;
  private readonly gameOverDisplay: GameOverDisplay;
  private readonly turnController: TurnController;
  private readonly gameEndUIController: GameEndUIController;

  private readonly onGameResultShown?: (
    winner: GameWinner
  ) => void;

  constructor(
    cityScoreCalculator: CityScoreCalculator,

    playerPlacedBuildingRegistry: PlacedBuildingRegistry,
    playerScoreRegistry: PlacedBuildingScoreRegistry,
    playerPopulationModifierState: CityPopulationModifierState,

    aiPlacedBuildingRegistry: PlacedBuildingRegistry,
    aiScoreRegistry: PlacedBuildingScoreRegistry,
    aiPopulationModifierState: CityPopulationModifierState,

    gameResultResolver: GameResultResolver,
    gameOverDisplay: GameOverDisplay,
    turnController: TurnController,
    gameEndUIController: GameEndUIController,
    onGameResultShown?: (
      winner: GameWinner
    ) => void
  ) {
    this.cityScoreCalculator = cityScoreCalculator;

    this.playerPlacedBuildingRegistry = playerPlacedBuildingRegistry;
    this.playerScoreRegistry = playerScoreRegistry;
    this.playerPopulationModifierState = playerPopulationModifierState;

    this.aiPlacedBuildingRegistry = aiPlacedBuildingRegistry;
    this.aiScoreRegistry = aiScoreRegistry;
    this.aiPopulationModifierState = aiPopulationModifierState;

    this.gameResultResolver = gameResultResolver;
    this.gameOverDisplay = gameOverDisplay;
    this.turnController = turnController;
    this.gameEndUIController = gameEndUIController;
    this.onGameResultShown = onGameResultShown;
  }

  public prepareAfterFinalAIReveal(
    currentTurn: number,
    maxTurns: number
  ): void {
    if (this.prepared || this.resolved) {
      return;
    }

    if (currentTurn < maxTurns) {
      return;
    }

    this.prepared = true;

    this.turnController.enterSeeResultsMode(() => {
      this.showFinalResults();
    });
  }

  public showFinalResults(): void {
    if (this.resolved) {
      return;
    }

    const playerScore = this.cityScoreCalculator.calculate(
      this.playerPlacedBuildingRegistry,
      this.playerScoreRegistry,
      this.playerPopulationModifierState.getPopulationModifier()
    );

    const aiScore = this.cityScoreCalculator.calculate(
      this.aiPlacedBuildingRegistry,
      this.aiScoreRegistry,
      this.aiPopulationModifierState.getPopulationModifier()
    );

    const result = this.gameResultResolver.resolve(
      playerScore,
      aiScore
    );

    this.resolved = true;

    this.gameEndUIController
      .hideGameplayOverlays();

    this.gameOverDisplay.show(result);

    this.onGameResultShown?.(
      result.winner
    );

    this.turnController.markGameOver();

    console.log("Game over result:", result);
  }

  public isResolved(): boolean {
    return this.resolved;
  }
}