import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class CivicShortagePlacementConsideration
  implements AIPlacementConsideration
{
  public readonly id = "civic-shortage-placement";

  private readonly targetCivicCount: number;
  private readonly shortageBonus: number;
  private readonly cultureInHandBonus: number;
  private readonly maxScore: number;

  constructor(
    targetCivicCount: number = 3,
    shortageBonus: number = 8,
    cultureInHandBonus: number = 6,
    maxScore: number = 18
  ) {
    this.targetCivicCount = targetCivicCount;
    this.shortageBonus = shortageBonus;
    this.cultureInHandBonus = cultureInHandBonus;
    this.maxScore = maxScore;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    const isCivic =
      building.family === "civic" ||
      building.tags.includes("service") ||
      building.tags.includes("civic");

    if (!isCivic) {
      return {
        score: 0,
        reason: `${this.id}: not civic/service = 0`,
      };
    }

    const civicCount = context.aiScore.familyCounts.civic;
    const shortage = Math.max(0, this.targetCivicCount - civicCount);

    if (shortage <= 0) {
      return {
        score: 0,
        reason:
          `${this.id}: civic count ${civicCount} already reaches target ` +
          `${this.targetCivicCount} = 0`,
      };
    }

    const hasCultureInHand = context.handCards.some(
      (card) => card.building.family === "culture"
    );

    const rawScore =
      shortage * this.shortageBonus +
      (hasCultureInHand ? this.cultureInHandBonus : 0);

    const score = Math.min(this.maxScore, rawScore);

    return {
      score,
      reason:
        `${this.id}: civic shortage ${civicCount}/${this.targetCivicCount}, ` +
        `shortage=${shortage}, cultureInHand=${hasCultureInHand}, ` +
        `raw=${rawScore}, capped=+${score}`,
    };
  }
}