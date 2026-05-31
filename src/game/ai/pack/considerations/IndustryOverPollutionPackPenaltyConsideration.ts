import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";
import type { PackDefinition } from "../../../packs/PackDefinition";

export class IndustryOverPollutionPackPenaltyConsideration
  implements AIPackConsideration
{
  public readonly id = "industry-over-pollution-pack-penalty";

  private readonly minIndustryCount: number;
  private readonly maxSafeAttraction: number;
  private readonly penalty: number;

  constructor(
    minIndustryCount: number = 4,
    maxSafeAttraction: number = 0,
    penalty: number = 28
  ) {
    this.minIndustryCount = minIndustryCount;
    this.maxSafeAttraction = maxSafeAttraction;
    this.penalty = penalty;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (pack.family !== "industry") {
      return {
        score: 0,
        reason: `${this.id}: not industry = 0`,
      };
    }

    const industryCount = context.aiScore.familyCounts.industry;
    const attraction = context.aiScore.finalAttraction;

    if (
      industryCount >= this.minIndustryCount &&
      attraction <= this.maxSafeAttraction
    ) {
      return {
        score: -this.penalty,
        reason:
          `${this.id}: industry=${industryCount}, attraction=${attraction}, ` +
          `avoid more pollution = -${this.penalty}`,
      };
    }

    return {
      score: 0,
      reason:
        `${this.id}: industry=${industryCount}, attraction=${attraction}, ` +
        `no penalty = 0`,
    };
  }
}