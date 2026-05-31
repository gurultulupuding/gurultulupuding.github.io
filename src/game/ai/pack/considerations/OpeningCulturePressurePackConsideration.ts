import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class OpeningCulturePressurePackConsideration
  implements AIPackConsideration
{
  public readonly id = "opening-culture-pressure-pack";

  private readonly maxOpeningTurn: number;
  private readonly noCultureBonus: number;
  private readonly behindCultureBonus: number;
  private readonly civicSupportBonus: number;
  private readonly unsupportedPenalty: number;
  private readonly maxScore: number;

  constructor(
    maxOpeningTurn: number = 5,
    noCultureBonus: number = 14,
    behindCultureBonus: number = 10,
    civicSupportBonus: number = 8,
    unsupportedPenalty: number = 6,
    maxScore: number = 28
  ) {
    this.maxOpeningTurn = maxOpeningTurn;
    this.noCultureBonus = noCultureBonus;
    this.behindCultureBonus = behindCultureBonus;
    this.civicSupportBonus = civicSupportBonus;
    this.unsupportedPenalty = unsupportedPenalty;
    this.maxScore = maxScore;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (context.currentTurn > this.maxOpeningTurn) {
      return {
        score: 0,
        reason:
          `${this.id}: turn ${context.currentTurn} after opening window ` +
          `${this.maxOpeningTurn} = 0`,
      };
    }

    if (pack.family !== "culture") {
      return {
        score: 0,
        reason: `${this.id}: not culture = 0`,
      };
    }

    const aiCulture = context.aiScore.familyCounts.culture ?? 0;
    const playerCulture = context.playerScore.familyCounts.culture ?? 0;
    const cultureGap = playerCulture - aiCulture;

    const hasCivicSupport =
      this.hasCivicSupportInHand(context) ||
      this.hasEnoughCivicSupportInCity(context);

    let score = 0;
    const reasons: string[] = [];

    if (aiCulture === 0) {
      score += this.noCultureBonus;
      reasons.push(`AI has no culture yet = +${this.noCultureBonus}`);
    }

    if (cultureGap > 0) {
      const gapBonus = Math.min(
        this.behindCultureBonus + cultureGap * 3,
        this.behindCultureBonus + 12
      );

      score += gapBonus;
      reasons.push(
        `player leads culture by ${cultureGap}, pressure = +${gapBonus}`
      );
    }

    if (score <= 0) {
      return {
        score: 0,
        reason:
          `${this.id}: no early culture pressure ` +
          `(aiCulture=${aiCulture}, playerCulture=${playerCulture}) = 0`,
      };
    }

    if (hasCivicSupport) {
      score += this.civicSupportBonus;
      reasons.push(`civic/service support available = +${this.civicSupportBonus}`);
    } else {
      score -= this.unsupportedPenalty;
      reasons.push(`no civic/service support yet = -${this.unsupportedPenalty}`);
    }

    const finalScore = Math.max(0, Math.min(score, this.maxScore));

    return {
      score: finalScore,
      reason:
        `${this.id}: ${reasons.join(" | ")}, ` +
        `raw=${score}, capped=+${finalScore}`,
    };
  }

  private hasCivicSupportInHand(
    context: AIPackEvaluationContext
  ): boolean {
    return context.aiHandCards.some((card) => {
      return (
        card.building.family === "civic" ||
        card.building.tags.includes("service")
      );
    });
  }

  private hasEnoughCivicSupportInCity(
    context: AIPackEvaluationContext
  ): boolean {
    return (context.aiScore.familyCounts.civic ?? 0) >= 2;
  }
}