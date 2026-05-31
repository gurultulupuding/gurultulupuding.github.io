import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class RoadAccessNeedPackConsideration implements AIPackConsideration {
  public readonly id = "road-access-need-pack";

  private readonly baseBonus: number;
  private readonly setupBonus: number;
  private readonly criticalBonus: number;

  constructor(
    baseBonus: number = 8,
    setupBonus: number = 14,
    criticalBonus: number = 18
  ) {
    this.baseBonus = baseBonus;
    this.setupBonus = setupBonus;
    this.criticalBonus = criticalBonus;
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

    const hasCultureInHand = context.aiHandCards.some(
      (card) => card.building.family === "culture"
    );

    const hasIndustryInHand = context.aiHandCards.some(
      (card) => card.building.family === "industry"
    );

    const currentInfrastructure =
      context.aiScore.familyCounts.infrastructure;

    if (currentInfrastructure === 0) {
      return {
        score: this.criticalBonus,
        reason:
          `${this.id}: AI has no infrastructure, roads enable capacity, ` +
          `industry and culture access = +${this.criticalBonus}`,
      };
    }

    if (hasResidentialInHand || hasCultureInHand || hasIndustryInHand) {
      return {
        score: this.setupBonus,
        reason:
          `${this.id}: infrastructure supports cards in hand ` +
          `(residential=${hasResidentialInHand}, culture=${hasCultureInHand}, ` +
          `industry=${hasIndustryInHand}) = +${this.setupBonus}`,
      };
    }

    if (currentInfrastructure <= 2 && context.currentTurn <= 7) {
      return {
        score: this.baseBonus,
        reason:
          `${this.id}: early/mid infrastructure foundation still useful = +${this.baseBonus}`,
      };
    }

    return {
      score: 0,
      reason: `${this.id}: no immediate road access need = 0`,
    };
  }
}