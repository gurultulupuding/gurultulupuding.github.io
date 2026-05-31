import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class IndustryRequiresInfrastructurePackConsideration
  implements AIPackConsideration
{
  public readonly id = "industry-requires-infrastructure-pack";

  private readonly earlyTurnLimit: number;
  private readonly penaltyWithoutFoundation: number;
  private readonly softPenaltyWithoutFoundation: number;

  constructor(
    earlyTurnLimit: number = 8,
    penaltyWithoutFoundation: number = 70,
    softPenaltyWithoutFoundation: number = 35
  ) {
    this.earlyTurnLimit = earlyTurnLimit;
    this.penaltyWithoutFoundation = penaltyWithoutFoundation;
    this.softPenaltyWithoutFoundation = softPenaltyWithoutFoundation;
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

    const infrastructureCount =
      context.aiScore.familyCounts.infrastructure;

    const hasRoadOrInfrastructureInHand = context.aiHandCards.some(
      (card) =>
        card.building.family === "infrastructure" ||
        card.building.tags.includes("road") ||
        card.building.tags.includes("mobility")
    );

    const hasInfrastructureFoundation =
      infrastructureCount > 0 || hasRoadOrInfrastructureInHand;

    if (hasInfrastructureFoundation) {
      return {
        score: 0,
        reason:
          `${this.id}: AI already has infrastructure foundation ` +
          `(city=${infrastructureCount}, handRoad=${hasRoadOrInfrastructureInHand}) = 0`,
      };
    }

    if (context.currentTurn <= this.earlyTurnLimit) {
      return {
        score: -this.penaltyWithoutFoundation,
        reason:
          `${this.id}: industry before infrastructure foundation in early/mid game ` +
          `is blocked by adjacency growth, penalty=-${this.penaltyWithoutFoundation}`,
      };
    }

    return {
      score: -this.softPenaltyWithoutFoundation,
      reason:
        `${this.id}: industry without infrastructure foundation is risky, ` +
        `late-game soft penalty=-${this.softPenaltyWithoutFoundation}`,
    };
  }
}