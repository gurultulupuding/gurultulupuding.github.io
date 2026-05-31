import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class AttractionNeedPackConsideration implements AIPackConsideration {
  public readonly id = "attraction-need-pack";

  private readonly civicSupportBonus: number;
  private readonly unsupportedCulturePenalty: number;

  constructor(
    civicSupportBonus: number = 8,
    unsupportedCulturePenalty: number = 12
  ) {
    this.civicSupportBonus = civicSupportBonus;
    this.unsupportedCulturePenalty = unsupportedCulturePenalty;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    const attractionDifference =
      context.playerScore.finalAttraction - context.aiScore.finalAttraction;

    if (attractionDifference <= 0) {
      return {
        score: 0,
        reason: `${this.id}: AI not behind in attraction = 0`,
      };
    }

    if (pack.family !== "culture" && pack.family !== "civic") {
      return {
        score: 0,
        reason: `${this.id}: pack not attraction-oriented = 0`,
      };
    }

    const urgencyScore =
      this.getAttractionUrgencyScore(attractionDifference);

    if (urgencyScore <= 0) {
      return {
        score: 0,
        reason:
          `${this.id}: attraction difference ${attractionDifference} ` +
          `outside comeback window = 0`,
      };
    }

    const hasCivicSupport =
      this.hasCivicSupportInHand(context) ||
      this.hasCivicSupportInCity(context);

    if (pack.family === "culture") {
      return this.evaluateCulturePack(
        attractionDifference,
        urgencyScore,
        hasCivicSupport
      );
    }

    if (pack.family === "civic") {
      return this.evaluateCivicPack(
        attractionDifference,
        urgencyScore,
        hasCivicSupport,
        context
      );
    }

    return {
      score: 0,
      reason: `${this.id}: no matching attraction logic = 0`,
    };
  }

  private evaluateCulturePack(
    attractionDifference: number,
    urgencyScore: number,
    hasCivicSupport: boolean
  ): AIPackConsiderationResult {
    if (!hasCivicSupport) {
      const score = Math.max(
        0,
        urgencyScore - this.unsupportedCulturePenalty
      );

      return {
        score,
        reason:
          `${this.id}: AI behind by ${attractionDifference} attraction, ` +
          `culture urgency=${urgencyScore}, but no civic/service support, ` +
          `penalty=-${this.unsupportedCulturePenalty}, total=+${score}`,
      };
    }

    const score = urgencyScore + this.civicSupportBonus;

    return {
      score,
      reason:
        `${this.id}: AI behind by ${attractionDifference} attraction, ` +
        `culture is supported by civic/service, ` +
        `urgency=${urgencyScore}, support=+${this.civicSupportBonus}, ` +
        `total=+${score}`,
    };
  }

  private evaluateCivicPack(
    attractionDifference: number,
    urgencyScore: number,
    hasCivicSupport: boolean,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    const hasCultureInHand = this.hasCultureInHand(context);

    if (!hasCivicSupport) {
      const score =
        Math.floor(urgencyScore * 0.75) + this.civicSupportBonus;

      return {
        score,
        reason:
          `${this.id}: AI behind by ${attractionDifference} attraction, ` +
          `needs civic/service setup before culture, ` +
          `urgency=${urgencyScore}, setupMultiplier=0.75, ` +
          `setup=+${this.civicSupportBonus}, total=+${score}`,
      };
    }

    if (!hasCultureInHand) {
      const score = Math.floor(urgencyScore * 0.1);

      return {
        score,
        reason:
          `${this.id}: AI behind by ${attractionDifference} attraction, ` +
          `already has civic support and no culture card in hand, ` +
          `civic pack very low priority = +${score}`,
      };
    }

    const score = Math.floor(urgencyScore * 0.3);

    return {
      score,
      reason:
        `${this.id}: AI behind by ${attractionDifference} attraction, ` +
        `already has civic support but culture card in hand can use more support, ` +
        `urgency=${urgencyScore}, multiplier=0.3, total=+${score}`,
    };
  }

  private getAttractionUrgencyScore(
    attractionDifference: number
  ): number {
    if (attractionDifference < 4) {
      return 0;
    }

    if (attractionDifference <= 6) {
      return 14;
    }

    if (attractionDifference <= 9) {
      return 28;
    }

    if (attractionDifference <= 12) {
      return 40;
    }

    if (attractionDifference <= 16) {
      return 52;
    }

    return 60;
  }

  private hasCultureInHand(context: AIPackEvaluationContext): boolean {
    return context.aiHandCards.some(
      (card) => card.building.family === "culture"
    );
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

  private hasCivicSupportInCity(
    context: AIPackEvaluationContext
  ): boolean {
    return context.aiScore.familyCounts.civic > 0;
  }
}