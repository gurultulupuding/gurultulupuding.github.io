import { PlacedBuildingRegistry } from "../../world/city/PlacedBuildingRegistry";
import { PopulationDisplay } from "../../ui/PopulationDisplay";
import { AttractionDisplay } from "../../ui/AttractionDisplay";
import { AttractionMigrationDisplay } from "../../ui/AttractionMigrationDisplay";
import { CityScoreCalculator } from "../scoring/CityScoreCalculator";
import { PlacedBuildingScoreRegistry } from "../scoring/PlacedBuildingScoreRegistry";
import { CityPopulationModifierState } from "../scoring/CityPopulationModifierState";
import { AttractionMigrationResolver } from "./AttractionMigrationResolver";
import { ScoreDisplay } from "../../ui/ScoreDisplay";
import type { CityScore } from "../scoring/CityScore";

export class AttractionResolutionController {
  private lastResolvedAttractionTurn: number | null = null;

  private readonly cityScoreCalculator: CityScoreCalculator;

  private readonly playerPlacedBuildingRegistry: PlacedBuildingRegistry;
  private readonly playerScoreRegistry: PlacedBuildingScoreRegistry;
  private readonly playerPopulationModifierState: CityPopulationModifierState;

  private readonly aiPlacedBuildingRegistry: PlacedBuildingRegistry;
  private readonly aiScoreRegistry: PlacedBuildingScoreRegistry;
  private readonly aiPopulationModifierState: CityPopulationModifierState;

  private readonly attractionMigrationResolver: AttractionMigrationResolver;

  private readonly populationDisplay: PopulationDisplay;
  private readonly attractionDisplay: AttractionDisplay;
  private readonly attractionMigrationDisplay: AttractionMigrationDisplay;
  private readonly scoreDisplay: ScoreDisplay;

  constructor(
    cityScoreCalculator: CityScoreCalculator,

    playerPlacedBuildingRegistry: PlacedBuildingRegistry,
    playerScoreRegistry: PlacedBuildingScoreRegistry,
    playerPopulationModifierState: CityPopulationModifierState,

    aiPlacedBuildingRegistry: PlacedBuildingRegistry,
    aiScoreRegistry: PlacedBuildingScoreRegistry,
    aiPopulationModifierState: CityPopulationModifierState,

    attractionMigrationResolver: AttractionMigrationResolver,

    populationDisplay: PopulationDisplay,
    attractionDisplay: AttractionDisplay,
    attractionMigrationDisplay: AttractionMigrationDisplay,
    scoreDisplay: ScoreDisplay
  ) {
    this.cityScoreCalculator = cityScoreCalculator;

    this.playerPlacedBuildingRegistry = playerPlacedBuildingRegistry;
    this.playerScoreRegistry = playerScoreRegistry;
    this.playerPopulationModifierState = playerPopulationModifierState;

    this.aiPlacedBuildingRegistry = aiPlacedBuildingRegistry;
    this.aiScoreRegistry = aiScoreRegistry;
    this.aiPopulationModifierState = aiPopulationModifierState;

    this.attractionMigrationResolver = attractionMigrationResolver;

    this.populationDisplay = populationDisplay;
    this.attractionDisplay = attractionDisplay;
    this.attractionMigrationDisplay = attractionMigrationDisplay;
    this.scoreDisplay = scoreDisplay;
  }

  public resolveForTurn(currentTurn: number): void {
    let playerScore = this.cityScoreCalculator.calculate(
      this.playerPlacedBuildingRegistry,
      this.playerScoreRegistry,
      this.playerPopulationModifierState.getPopulationModifier()
    );

    let aiScore = this.cityScoreCalculator.calculate(
      this.aiPlacedBuildingRegistry,
      this.aiScoreRegistry,
      this.aiPopulationModifierState.getPopulationModifier()
    );

    if (this.lastResolvedAttractionTurn !== currentTurn) {
      const migration = this.attractionMigrationResolver.resolve(
        playerScore,
        aiScore
      );

      let displayedMigration = migration;

      if (migration.amount > 0 && migration.from && migration.to) {
        const sourceLimitedAmount = this.getSourceLimitedMigrationAmount(
          migration.amount,
          migration.from,
          playerScore,
          aiScore
        );

        displayedMigration = {
          ...migration,
          amount: sourceLimitedAmount,
          reason:
            sourceLimitedAmount < migration.amount
              ? `${migration.reason} Migration was limited by source population.`
              : migration.reason,
        };

        if (sourceLimitedAmount > 0) {
          this.applyMigration(
            sourceLimitedAmount,
            migration.from,
            migration.to
          );
        }
      }

      this.lastResolvedAttractionTurn = currentTurn;

      console.log("Attraction migration:", displayedMigration);
      this.attractionMigrationDisplay.show(displayedMigration);

      playerScore = this.cityScoreCalculator.calculate(
        this.playerPlacedBuildingRegistry,
        this.playerScoreRegistry,
        this.playerPopulationModifierState.getPopulationModifier()
      );

      aiScore = this.cityScoreCalculator.calculate(
        this.aiPlacedBuildingRegistry,
        this.aiScoreRegistry,
        this.aiPopulationModifierState.getPopulationModifier()
      );
    }

    this.populationDisplay.updatePlayerPopulation(
      playerScore.finalPopulation,
      playerScore.populationCapacity
    );

    this.populationDisplay.revealAIPopulation(
      aiScore.finalPopulation,
      aiScore.populationCapacity
    );

    this.attractionDisplay.updatePlayerAttraction(
      playerScore.finalAttraction
    );

    this.attractionDisplay.revealAIAttraction(
      aiScore.finalAttraction
    );

    this.scoreDisplay.updatePlayerScore(
      playerScore.finalPopulation,
      playerScore.finalAttraction
    );

    this.scoreDisplay.revealAIScore(
      aiScore.finalPopulation,
      aiScore.finalAttraction
    );

    console.log("Player city score after attraction:", playerScore);
    console.log("AI city score after attraction:", aiScore);
  }

  private getSourceLimitedMigrationAmount(
    requestedAmount: number,
    from: "player" | "ai",
    playerScore: CityScore,
    aiScore: CityScore
  ): number {
    const sourceScore = from === "player" ? playerScore : aiScore;

    return Math.max(
      0,
      Math.min(
        requestedAmount,
        sourceScore.finalPopulation
      )
    );
  }

  private applyMigration(
    amount: number,
    from: "player" | "ai",
    to: "player" | "ai"
  ): void {
    if (from === "player") {
      this.playerPopulationModifierState.addPopulationModifier(-amount);
    }

    if (from === "ai") {
      this.aiPopulationModifierState.addPopulationModifier(-amount);
    }

    if (to === "player") {
      this.playerPopulationModifierState.addPopulationModifier(amount);
    }

    if (to === "ai") {
      this.aiPopulationModifierState.addPopulationModifier(amount);
    }
  }
}