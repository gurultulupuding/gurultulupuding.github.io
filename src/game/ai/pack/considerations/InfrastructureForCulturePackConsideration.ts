import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class InfrastructureForCulturePackConsideration
  implements AIPackConsideration
{
  public readonly id = "infrastructure-for-culture-pack";

  private readonly bonus: number;

  constructor(bonus: number = 8) {
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

    const hasCultureInHand = context.aiHandCards.some(
      (card) => card.building.family === "culture"
    );

    if (!hasCultureInHand) {
      return {
        score: 0,
        reason: `${this.id}: no culture card in hand = 0`,
      };
    }

    return {
      score: this.bonus,
      reason:
        `${this.id}: culture in hand, infrastructure may enable road/mobility access = ` +
        `+${this.bonus}`,
    };
  }
}