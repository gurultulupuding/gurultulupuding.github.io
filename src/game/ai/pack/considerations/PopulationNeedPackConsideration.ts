import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class PopulationNeedPackConsideration implements AIPackConsideration {
  public readonly id = "population-need-pack";

  private readonly baseBonus: number;
  private readonly differenceWeight: number;

  constructor(baseBonus: number = 8, differenceWeight: number = 1) {
    this.baseBonus = baseBonus;
    this.differenceWeight = differenceWeight;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    const populationDifference =
      context.playerScore.finalPopulation - context.aiScore.finalPopulation;

    if (populationDifference <= 0) {
      return {
        score: 0,
        reason: `${this.id}: AI not behind in population = 0`,
      };
    }

    if (pack.family !== "residential" && pack.family !== "industry") {
      return {
        score: 0,
        reason: `${this.id}: pack not population-oriented = 0`,
      };
    }

    const score =
      this.baseBonus + populationDifference * this.differenceWeight;

    return {
      score,
      reason:
        `${this.id}: AI behind by ${populationDifference} population, ` +
        `${pack.family} pack = +${score}`,
    };
  }
}