import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class InfrastructureForIndustryPackConsideration
  implements AIPackConsideration
{
  public readonly id = "infrastructure-for-industry-pack";

  private readonly bonus: number;

  constructor(bonus: number = 10) {
    this.bonus = bonus;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (pack.family !== "infrastructure") {
      return {
        score: 0,
        reason: `${this.id}: not infrastructure = 0`,
      };
    }

    const hasIndustryInHand = context.aiHandCards.some(
      (card) => card.building.family === "industry"
    );

    if (!hasIndustryInHand) {
      return {
        score: 0,
        reason: `${this.id}: no industry card in hand = 0`,
      };
    }

    return {
      score: this.bonus,
      reason:
        `${this.id}: industry in hand, infrastructure may enable production support = ` +
        `+${this.bonus}`,
    };
  }
}