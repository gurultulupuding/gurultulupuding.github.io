import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class EarlyPopulationFoundationPackConsideration
  implements AIPackConsideration
{
  public readonly id = "early-population-foundation-pack";

  private readonly strongBonus: number;
  private readonly mediumBonus: number;
  private readonly earlyTurnLimit: number;
  private readonly lowPopulationThreshold: number;

  constructor(
    strongBonus: number = 16,
    mediumBonus: number = 8,
    earlyTurnLimit: number = 4,
    lowPopulationThreshold: number = 6
  ) {
    this.strongBonus = strongBonus;
    this.mediumBonus = mediumBonus;
    this.earlyTurnLimit = earlyTurnLimit;
    this.lowPopulationThreshold = lowPopulationThreshold;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (pack.family !== "residential" && pack.family !== "industry") {
      return {
        score: 0,
        reason: `${this.id}: not population-oriented = 0`,
      };
    }

    if (context.currentTurn > this.earlyTurnLimit) {
      return {
        score: 0,
        reason: `${this.id}: not early game = 0`,
      };
    }

    if (context.aiScore.finalPopulation === 0) {
      return {
        score: this.strongBonus,
        reason:
          `${this.id}: early game with no AI population, ` +
          `${pack.family} pack = +${this.strongBonus}`,
      };
    }

    if (context.aiScore.finalPopulation < this.lowPopulationThreshold) {
      return {
        score: this.mediumBonus,
        reason:
          `${this.id}: early game with low AI population, ` +
          `${pack.family} pack = +${this.mediumBonus}`,
      };
    }

    return {
      score: 0,
      reason: `${this.id}: population foundation acceptable = 0`,
    };
  }
}