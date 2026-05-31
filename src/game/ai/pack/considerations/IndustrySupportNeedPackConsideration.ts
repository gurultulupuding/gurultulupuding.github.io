import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class IndustrySupportNeedPackConsideration implements AIPackConsideration {
  public readonly id = "industry-support-need-pack";

  private readonly civicBonus: number;
  private readonly infrastructureBonus: number;
  private readonly strongNeedBonus: number;

  constructor(
    civicBonus: number = 6,
    infrastructureBonus: number = 10,
    strongNeedBonus: number = 14
  ) {
    this.civicBonus = civicBonus;
    this.infrastructureBonus = infrastructureBonus;
    this.strongNeedBonus = strongNeedBonus;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    const hasIndustryInHand = context.aiHandCards.some(
      (card) => card.building.family === "industry"
    );

    const industryCount = context.aiScore.familyCounts.industry;

    if (!hasIndustryInHand && industryCount === 0) {
      return {
        score: 0,
        reason: `${this.id}: no industry plan = 0`,
      };
    }

    if (pack.family === "infrastructure") {
      const score =
        context.aiScore.familyCounts.infrastructure === 0
          ? this.strongNeedBonus
          : this.infrastructureBonus;

      return {
        score,
        reason:
          `${this.id}: infrastructure gives strong production support ` +
          `for industry = +${score}`,
      };
    }

    if (pack.family === "civic") {
      return {
        score: this.civicBonus,
        reason:
          `${this.id}: civic gives weak production support for industry = +${this.civicBonus}`,
      };
    }

    return {
      score: 0,
      reason: `${this.id}: not industry support pack = 0`,
    };
  }
}