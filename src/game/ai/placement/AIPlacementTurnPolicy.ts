import type { BuildingDefinition } from "../../../world/buildings/definitions/BuildingDefinition";

export interface AIPlacementTurnPolicyContext {
  handSizeBeforePlacement: number;
  maxHandCards: number;
  decisionScore: number;
  placementsAlreadyMade: number;
  building: BuildingDefinition;

  currentTurn: number;
  maxTurns: number;
}

export class AIPlacementTurnPolicy {
  private readonly optionalPlacementScoreThreshold: number;
  private readonly forcedPlacementScoreThreshold: number;
  private readonly maxPlacementsPerTurn: number;
  private readonly forcedSupportPlacementScoreThreshold: number;

  private readonly lateGameStartTurn: number;
  private readonly lateGameOptionalPlacementScoreThreshold: number;

  private readonly finalTurnPlacementScoreThreshold: number;
  private readonly finalTurnMaxPlacements: number;

  constructor(
    optionalPlacementScoreThreshold: number,
    forcedPlacementScoreThreshold: number,
    maxPlacementsPerTurn: number,
    forcedSupportPlacementScoreThreshold: number,

    lateGameStartTurn: number,
    lateGameOptionalPlacementScoreThreshold: number,

    finalTurnPlacementScoreThreshold: number,
    finalTurnMaxPlacements: number
  ) {
    this.optionalPlacementScoreThreshold =
      optionalPlacementScoreThreshold;
    this.forcedPlacementScoreThreshold =
      forcedPlacementScoreThreshold;
    this.maxPlacementsPerTurn = maxPlacementsPerTurn;
    this.forcedSupportPlacementScoreThreshold =
      forcedSupportPlacementScoreThreshold;

    this.lateGameStartTurn = lateGameStartTurn;
    this.lateGameOptionalPlacementScoreThreshold =
      lateGameOptionalPlacementScoreThreshold;

    this.finalTurnPlacementScoreThreshold =
      finalTurnPlacementScoreThreshold;
    this.finalTurnMaxPlacements = finalTurnMaxPlacements;
  }

  public shouldPlace(context: AIPlacementTurnPolicyContext): boolean {
    const isFinalTurn = context.currentTurn >= context.maxTurns;
    const isLateGame = context.currentTurn >= this.lateGameStartTurn;

    const maxPlacementsThisTurn = isFinalTurn
      ? this.finalTurnMaxPlacements
      : this.maxPlacementsPerTurn;

    if (context.placementsAlreadyMade >= maxPlacementsThisTurn) {
      return false;
    }

    if (isFinalTurn) {
      return (
        context.decisionScore >=
        this.finalTurnPlacementScoreThreshold
      );
    }

    const isOverHandLimit =
      context.handSizeBeforePlacement > context.maxHandCards;

    if (isOverHandLimit) {
      return (
        context.decisionScore >=
        this.forcedPlacementScoreThreshold
      );
    }

    if (isLateGame) {
      return (
        context.decisionScore >=
        this.lateGameOptionalPlacementScoreThreshold
      );
    }

    if (this.isSupportBuilding(context.building)) {
      return (
        context.decisionScore >=
        this.forcedSupportPlacementScoreThreshold
      );
    }

    return (
      context.decisionScore >=
      this.optionalPlacementScoreThreshold
    );
  }

  private isSupportBuilding(building: BuildingDefinition): boolean {
    return (
      building.family === "civic" ||
      building.family === "infrastructure" ||
      building.tags.includes("service") ||
      building.tags.includes("road") ||
      building.tags.includes("mobility")
    );
  }
}