import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class EarlyInfrastructureFoundationPackConsideration
  implements AIPackConsideration
{
  public readonly id = "early-infrastructure-foundation-pack";

  private readonly strongBonus: number;
  private readonly mediumBonus: number;
  private readonly earlyTurnLimit: number;
  private readonly midTurnLimit: number;

  constructor(
    strongBonus: number = 14,
    mediumBonus: number = 8,
    earlyTurnLimit: number = 5,
    midTurnLimit: number = 8
  ) {
    this.strongBonus = strongBonus;
    this.mediumBonus = mediumBonus;
    this.earlyTurnLimit = earlyTurnLimit;
    this.midTurnLimit = midTurnLimit;
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

    const infrastructureCount =
      context.aiScore.familyCounts.infrastructure;

    const hasRoadInHand = context.aiHandCards.some((card) =>
      card.building.tags.includes("road")
    );

    if (
      context.currentTurn <= this.earlyTurnLimit &&
      infrastructureCount === 0 &&
      !hasRoadInHand
    ) {
      return {
        score: this.strongBonus,
        reason:
          `${this.id}: early game with no infrastructure/road foundation = ` +
          `+${this.strongBonus}`,
      };
    }

    if (
      context.currentTurn <= this.midTurnLimit &&
      infrastructureCount <= 1
    ) {
      return {
        score: this.mediumBonus,
        reason:
          `${this.id}: low infrastructure before midgame = ` +
          `+${this.mediumBonus}`,
      };
    }

    return {
      score: 0,
      reason: `${this.id}: infrastructure foundation already acceptable = 0`,
    };
  }
}