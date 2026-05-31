import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class CivicForResidentialPackConsideration
  implements AIPackConsideration
{
  public readonly id = "civic-for-residential-pack";

  private readonly bonus: number;

  constructor(bonus: number = 8) {
    this.bonus = bonus;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (pack.family !== "civic") {
      return {
        score: 0,
        reason: `${this.id}: not civic = 0`,
      };
    }

    const hasResidentialInHand = context.aiHandCards.some(
      (card) => card.building.family === "residential"
    );

    if (!hasResidentialInHand) {
      return {
        score: 0,
        reason: `${this.id}: no residential card in hand = 0`,
      };
    }

    return {
      score: this.bonus,
      reason:
        `${this.id}: residential in hand, civic may enable housing support = ` +
        `+${this.bonus}`,
    };
  }
}