import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class IndustryCapacityFitConsideration
  implements AIPlacementConsideration
{
  public readonly id = "industry-capacity-fit";

  private readonly usefulIndustryBonus: number;
  private readonly exactNeedBonus: number;
  private readonly noCapacityPenalty: number;

  constructor(
    usefulIndustryBonus: number = 12,
    exactNeedBonus: number = 6,
    noCapacityPenalty: number = 18
  ) {
    this.usefulIndustryBonus = usefulIndustryBonus;
    this.exactNeedBonus = exactNeedBonus;
    this.noCapacityPenalty = noCapacityPenalty;
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

    const availableCapacity = context.aiScore.availablePopulationCapacity;
    const realizedPopulation = context.contribution.finalPopulation;

    if (availableCapacity <= 0 || realizedPopulation <= 0) {
      return {
        score: -this.noCapacityPenalty,
        reason:
          `${this.id}: no available capacity, industry population would be wasted ` +
          `= -${this.noCapacityPenalty}`,
      };
    }

    const exactNeedBonus =
      realizedPopulation >= availableCapacity ? this.exactNeedBonus : 0;

    const score = this.usefulIndustryBonus + exactNeedBonus;

    return {
      score,
      reason:
        `${this.id}: industry realizes ${realizedPopulation} population ` +
        `into ${availableCapacity} available capacity, exactNeedBonus=${exactNeedBonus}, ` +
        `total=+${score}`,
    };
  }
}