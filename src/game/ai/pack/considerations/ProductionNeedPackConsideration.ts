import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class ProductionNeedPackConsideration implements AIPackConsideration {
  public readonly id = "production-need-pack";

  private readonly baseBonus: number;
  private readonly behindBonus: number;
  private readonly criticalBonus: number;

  constructor(
    baseBonus: number = 10,
    behindBonus: number = 16,
    criticalBonus: number = 24
  ) {
    this.baseBonus = baseBonus;
    this.behindBonus = behindBonus;
    this.criticalBonus = criticalBonus;
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

    const availableCapacity = context.aiScore.availablePopulationCapacity;
    const populationGap =
      context.playerScore.finalPopulation - context.aiScore.finalPopulation;

    if (availableCapacity <= 0) {
      return {
        score: -14,
        reason:
          `${this.id}: no available capacity, industry population would be wasted = -14`,
      };
    }

    if (populationGap >= 12) {
      return {
        score: this.criticalBonus,
        reason:
          `${this.id}: AI behind by ${populationGap} population and has ` +
          `${availableCapacity} free capacity, industry pack = +${this.criticalBonus}`,
      };
    }

    if (populationGap > 0) {
      return {
        score: this.behindBonus,
        reason:
          `${this.id}: AI behind by ${populationGap} population and has ` +
          `${availableCapacity} free capacity, industry pack = +${this.behindBonus}`,
      };
    }

    return {
      score: this.baseBonus,
      reason:
        `${this.id}: AI has ${availableCapacity} free capacity, ` +
        `industry can convert it into real population = +${this.baseBonus}`,
    };
  }
}