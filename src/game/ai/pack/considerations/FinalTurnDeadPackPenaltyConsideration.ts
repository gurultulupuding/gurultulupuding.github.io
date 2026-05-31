import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";
import type { PackDefinition } from "../../../packs/PackDefinition";

export class FinalTurnDeadPackPenaltyConsideration
  implements AIPackConsideration
{
  public readonly id = "final-turn-dead-pack-penalty";

  private readonly finalWindowTurns: number;
  private readonly residentialWithoutIndustryPenalty: number;
  private readonly civicWithoutCultureOrIndustryPenalty: number;
  private readonly infrastructureWithoutUsefulHandPenalty: number;

  public constructor(
    finalWindowTurns: number = 1,
    residentialWithoutIndustryPenalty: number = 40,
    civicWithoutCultureOrIndustryPenalty: number = 36,
    infrastructureWithoutUsefulHandPenalty: number = 28
  ) {
    this.finalWindowTurns = finalWindowTurns;
    this.residentialWithoutIndustryPenalty =
      residentialWithoutIndustryPenalty;
    this.civicWithoutCultureOrIndustryPenalty =
      civicWithoutCultureOrIndustryPenalty;
    this.infrastructureWithoutUsefulHandPenalty =
      infrastructureWithoutUsefulHandPenalty;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    const turnsRemaining = context.maxTurns - context.currentTurn;

    if (turnsRemaining > this.finalWindowTurns) {
      return {
        score: 0,
        reason:
          `${this.id}: ${turnsRemaining} turns remaining, outside final window ` +
          `${this.finalWindowTurns} = 0`,
      };
    }

    const hasIndustryInHand = context.aiHandCards.some(
      (card) => card.building.family === "industry"
    );

    const hasCultureInHand = context.aiHandCards.some(
      (card) => card.building.family === "culture"
    );

    const hasResidentialInHand = context.aiHandCards.some(
      (card) => card.building.family === "residential"
    );

    if (pack.family === "residential" && !hasIndustryInHand) {
      return {
        score: -this.residentialWithoutIndustryPenalty,
        reason:
          `${this.id}: final turn residential only creates capacity, ` +
          `but AI has no industry in hand to convert it, ` +
          `penalty=-${this.residentialWithoutIndustryPenalty}`,
      };
    }

    if (
      pack.family === "civic" &&
      !hasCultureInHand &&
      !hasIndustryInHand
    ) {
      return {
        score: -this.civicWithoutCultureOrIndustryPenalty,
        reason:
          `${this.id}: final turn civic is setup only, ` +
          `but AI has no culture/industry in hand to benefit, ` +
          `penalty=-${this.civicWithoutCultureOrIndustryPenalty}`,
      };
    }

    if (
      pack.family === "infrastructure" &&
      !hasResidentialInHand &&
      !hasIndustryInHand &&
      !hasCultureInHand
    ) {
      return {
        score: -this.infrastructureWithoutUsefulHandPenalty,
        reason:
          `${this.id}: final turn infrastructure is setup only, ` +
          `but AI has no useful scoring cards in hand, ` +
          `penalty=-${this.infrastructureWithoutUsefulHandPenalty}`,
      };
    }

    return {
      score: 0,
      reason: `${this.id}: pack still has final-turn utility = 0`,
    };
  }
}