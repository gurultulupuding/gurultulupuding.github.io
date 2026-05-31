import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class CapacityNeedPackConsideration implements AIPackConsideration {
  public readonly id = "capacity-need-pack";

  private readonly lowCapacityBonus: number;
  private readonly noCapacityBonus: number;
  private readonly criticalCapacityBonus: number;

  constructor(
    lowCapacityBonus: number = 12,
    noCapacityBonus: number = 18,
    criticalCapacityBonus: number = 24
  ) {
    this.lowCapacityBonus = lowCapacityBonus;
    this.noCapacityBonus = noCapacityBonus;
    this.criticalCapacityBonus = criticalCapacityBonus;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (pack.family !== "residential") {
      return {
        score: 0,
        reason: `${this.id}: not residential = 0`,
      };
    }

    const capacity = context.aiScore.populationCapacity;
    const population = context.aiScore.finalPopulation;
    const availableCapacity = context.aiScore.availablePopulationCapacity;

    const hasIndustryInHand = context.aiHandCards.some(
      (card) => card.building.family === "industry"
    );

    if (capacity <= 0) {
      const score = hasIndustryInHand
        ? this.criticalCapacityBonus
        : this.noCapacityBonus;

      return {
        score,
        reason:
          `${this.id}: AI has no capacity, ` +
          `industryInHand=${hasIndustryInHand}, residential pack = +${score}`,
      };
    }

    if (availableCapacity <= 2) {
      const score = hasIndustryInHand
        ? this.lowCapacityBonus + 4
        : this.lowCapacityBonus;

      return {
        score,
        reason:
          `${this.id}: available capacity is low ` +
          `(${population}/${capacity}), residential pack = +${score}`,
      };
    }

    return {
      score: 0,
      reason:
        `${this.id}: capacity is acceptable ` +
        `(${population}/${capacity}) = 0`,
    };
  }
}