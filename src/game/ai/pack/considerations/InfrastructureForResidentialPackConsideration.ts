import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class InfrastructureForResidentialPackConsideration
  implements AIPackConsideration
{
  public readonly id = "infrastructure-for-residential-pack";

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
        `${this.id}: residential in hand, infrastructure may enable road access = +${this.bonus}`,
    };
  }
}