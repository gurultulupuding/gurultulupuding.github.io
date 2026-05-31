import type { PackDefinition } from "../../../packs/PackDefinition";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";

export class LateGamePopulationFinisherPackConsideration
  implements AIPackConsideration
{
  public readonly id = "late-game-population-finisher-pack";

  private readonly startTurn: number;
  private readonly behindBaseBonus: number;
  private readonly aheadBaseBonus: number;
  private readonly populationGapWeight: number;
  private readonly maxBonus: number;

  constructor(
    startTurn: number = 13,
    behindBaseBonus: number = 24,
    aheadBaseBonus: number = 14,
    populationGapWeight: number = 0.5,
    maxBonus: number = 36
  ) {
    this.startTurn = startTurn;
    this.behindBaseBonus = behindBaseBonus;
    this.aheadBaseBonus = aheadBaseBonus;
    this.populationGapWeight = populationGapWeight;
    this.maxBonus = maxBonus;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (context.currentTurn < this.startTurn) {
      return {
        score: 0,
        reason:
          `${this.id}: turn ${context.currentTurn} before ` +
          `late game ${this.startTurn} = 0`,
      };
    }

    if (pack.family !== "residential") {
      return {
        score: 0,
        reason: `${this.id}: not residential = 0`,
      };
    }

    const populationDifference =
      context.playerScore.finalPopulation -
      context.aiScore.finalPopulation;

    if (populationDifference > 0) {
      const score = Math.min(
        this.maxBonus,
        this.behindBaseBonus +
          populationDifference * this.populationGapWeight
      );

      return {
        score,
        reason:
          `${this.id}: AI behind by ${populationDifference} population, ` +
          `residential final comeback = +${score}`,
      };
    }

    const aiLead = Math.abs(populationDifference);

    const score = Math.max(
      6,
      this.aheadBaseBonus - aiLead * 0.25
    );

    return {
      score,
      reason:
        `${this.id}: AI ahead by ${aiLead} population, ` +
        `residential still useful as final score finisher = +${score}`,
    };
  }
}