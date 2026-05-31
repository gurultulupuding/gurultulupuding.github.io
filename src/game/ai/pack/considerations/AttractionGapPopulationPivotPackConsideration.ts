import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class AttractionGapPopulationPivotPackConsideration
  implements AIPackConsideration
{
  public readonly id = "attraction-gap-population-pivot-pack";

  private readonly startTurn: number;
  private readonly attractionGapThreshold: number;
  private readonly populationPackBonus: number;
  private readonly industryExtraBonus: number;
  private readonly residentialExtraBonus: number;

  constructor(
    startTurn: number = 6,
    attractionGapThreshold: number = 10,
    populationPackBonus: number = 14,
    industryExtraBonus: number = 6,
    residentialExtraBonus: number = 4
  ) {
    this.startTurn = startTurn;
    this.attractionGapThreshold = attractionGapThreshold;
    this.populationPackBonus = populationPackBonus;
    this.industryExtraBonus = industryExtraBonus;
    this.residentialExtraBonus = residentialExtraBonus;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (context.currentTurn < this.startTurn) {
      return {
        score: 0,
        reason:
          `${this.id}: turn ${context.currentTurn} before pivot turn ` +
          `${this.startTurn} = 0`,
      };
    }

    const attractionGap = Math.abs(
      context.aiScore.finalAttraction -
        context.playerScore.finalAttraction
    );

    if (attractionGap < this.attractionGapThreshold) {
      return {
        score: 0,
        reason:
          `${this.id}: attraction gap ${attractionGap} below threshold ` +
          `${this.attractionGapThreshold} = 0`,
      };
    }

    if (pack.family !== "industry" && pack.family !== "residential") {
      return {
        score: 0,
        reason:
          `${this.id}: attraction gap is large, but ${pack.family} is not ` +
          `population-oriented = 0`,
      };
    }

    let score = this.populationPackBonus;

    if (pack.family === "industry") {
      score += this.industryExtraBonus;
    }

    if (pack.family === "residential") {
      score += this.residentialExtraBonus;
    }

    return {
      score,
      reason:
        `${this.id}: attraction gap ${attractionGap} is large, ` +
        `pivot to ${pack.family} population = +${score}`,
    };
  }
}