import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class LateGameNonScoringPlacementPenaltyConsideration
  implements AIPlacementConsideration
{
  public readonly id = "late-game-non-scoring-placement-penalty";

  private readonly startTurn: number;
  private readonly penalty: number;

  constructor(startTurn: number = 11, penalty: number = 12) {
    this.startTurn = startTurn;
    this.penalty = penalty;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    if (context.currentTurn < this.startTurn) {
      return {
        score: 0,
        reason:
          `${this.id}: turn ${context.currentTurn} before late game ` +
          `${this.startTurn} = 0`,
      };
    }

    const building = context.plan.building;

    if (!this.isSupportLike(building)) {
      return {
        score: 0,
        reason: `${this.id}: not support-like building = 0`,
      };
    }

    const contribution = context.contribution;

    const producesPopulation = contribution.finalPopulation > 0;
    const producesCapacity = contribution.populationCapacity > 0;
    const producesAttraction = contribution.finalAttraction > 0;
    const producesSynergy =
      contribution.synergyPopulationBonus > 0 ||
      contribution.synergyAttractionBonus > 0 ||
      contribution.synergyEffects.length > 0;

    const hasImmediateScoreValue =
      producesPopulation ||
      producesCapacity ||
      producesAttraction ||
      producesSynergy;

    if (hasImmediateScoreValue) {
      return {
        score: 0,
        reason:
          `${this.id}: support-like building has immediate score value ` +
          `(population=${contribution.finalPopulation}, ` +
          `capacity=${contribution.populationCapacity}, ` +
          `attraction=${contribution.finalAttraction}, ` +
          `synergyEffects=${contribution.synergyEffects.length}) = 0`,
      };
    }

    return {
      score: -this.penalty,
      reason:
        `${this.id}: late-game support-like placement has no immediate ` +
        `score value, penalty=-${this.penalty}`,
    };
  }

  private isSupportLike(building: {
    family: string;
    tags: string[];
  }): boolean {
    return (
      building.family === "infrastructure" ||
      building.family === "civic" ||
      building.tags.includes("road") ||
      building.tags.includes("mobility") ||
      building.tags.includes("service")
    );
  }
}