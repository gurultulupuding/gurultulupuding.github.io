import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class ResidentialCapacityGainConsideration
  implements AIPlacementConsideration
{
  public readonly id = "residential-capacity-gain";

  private readonly capacityWeight: number;
  private readonly lowCapacityBonus: number;
  private readonly maxScore: number;

  constructor(
    capacityWeight: number = 2,
    lowCapacityBonus: number = 8,
    maxScore: number = 22
  ) {
    this.capacityWeight = capacityWeight;
    this.lowCapacityBonus = lowCapacityBonus;
    this.maxScore = maxScore;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    if (context.plan.building.family !== "residential") {
      return {
        score: 0,
        reason: `${this.id}: not residential = 0`,
      };
    }

    const capacityGain = context.contribution.populationCapacity;

    if (capacityGain <= 0) {
      return {
        score: -8,
        reason: `${this.id}: residential adds no effective capacity = -8`,
      };
    }

    const availableCapacity = context.aiScore.availablePopulationCapacity;
    const needBonus = availableCapacity <= 2 ? this.lowCapacityBonus : 0;

    const score = Math.min(
      this.maxScore,
      capacityGain * this.capacityWeight + needBonus
    );

    return {
      score,
      reason:
        `${this.id}: capacityGain=${capacityGain} × ${this.capacityWeight}, ` +
        `availableCapacity=${availableCapacity}, needBonus=${needBonus}, ` +
        `total=+${score}`,
    };
  }
}