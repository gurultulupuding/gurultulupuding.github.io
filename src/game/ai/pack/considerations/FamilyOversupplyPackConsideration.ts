import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class FamilyOversupplyPackConsideration implements AIPackConsideration {
  public readonly id = "family-oversupply-pack";

  private readonly softLimit: number;
  private readonly penaltyPerExtraBuilding: number;

  constructor(
    softLimit: number = 4,
    penaltyPerExtraBuilding: number = 5
  ) {
    this.softLimit = softLimit;
    this.penaltyPerExtraBuilding = penaltyPerExtraBuilding;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    const currentCount = context.aiScore.familyCounts[pack.family];

    if (currentCount <= this.softLimit) {
      return {
        score: 0,
        reason:
          `${this.id}: ${pack.family} count ${currentCount} within limit ` +
          `${this.softLimit} = 0`,
      };
    }

    const extraCount = currentCount - this.softLimit;
    const score = -extraCount * this.penaltyPerExtraBuilding;

    return {
      score,
      reason:
        `${this.id}: ${pack.family} oversupplied by ${extraCount}, ` +
        `penalty = ${score}`,
    };
  }
}