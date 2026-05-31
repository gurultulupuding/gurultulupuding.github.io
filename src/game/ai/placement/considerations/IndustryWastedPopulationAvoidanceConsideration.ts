import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class IndustryWastedPopulationAvoidanceConsideration
  implements AIPlacementConsideration
{
  public readonly id = "industry-wasted-population-avoidance";

  private readonly penaltyPerWastedPopulation: number;
  private readonly maxPenalty: number;

  constructor(
    penaltyPerWastedPopulation: number = 3,
    maxPenalty: number = 24
  ) {
    this.penaltyPerWastedPopulation = penaltyPerWastedPopulation;
    this.maxPenalty = maxPenalty;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    if (context.plan.building.family !== "industry") {
      return {
        score: 0,
        reason: `${this.id}: not industry = 0`,
      };
    }

    const wasted = context.contribution.wastedPopulation;

    if (wasted <= 0) {
      return {
        score: 0,
        reason: `${this.id}: no wasted population = 0`,
      };
    }

    const penalty = Math.min(
      this.maxPenalty,
      wasted * this.penaltyPerWastedPopulation
    );

    return {
      score: -penalty,
      reason:
        `${this.id}: wastedPopulation=${wasted} × ` +
        `-${this.penaltyPerWastedPopulation}, capped=-${penalty}`,
    };
  }
}