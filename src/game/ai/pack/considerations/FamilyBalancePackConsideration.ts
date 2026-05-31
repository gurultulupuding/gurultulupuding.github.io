import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class FamilyBalancePackConsideration implements AIPackConsideration {
  public readonly id = "family-balance-pack";

  private readonly missingFamilyBonus: number;
  private readonly lowFamilyBonus: number;

  constructor(missingFamilyBonus: number = 6, lowFamilyBonus: number = 3) {
    this.missingFamilyBonus = missingFamilyBonus;
    this.lowFamilyBonus = lowFamilyBonus;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    const currentCount = context.aiScore.familyCounts[pack.family];

    if (currentCount === 0) {
      return {
        score: this.missingFamilyBonus,
        reason:
          `${this.id}: AI has no ${pack.family} buildings = +${this.missingFamilyBonus}`,
      };
    }

    if (currentCount === 1) {
      return {
        score: this.lowFamilyBonus,
        reason:
          `${this.id}: AI has only one ${pack.family} building = +${this.lowFamilyBonus}`,
      };
    }

    return {
      score: 0,
      reason: `${this.id}: ${pack.family} already represented = 0`,
    };
  }
}