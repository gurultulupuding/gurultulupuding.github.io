import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class AttractionComebackPlacementConsideration
  implements AIPlacementConsideration
{
  public readonly id = "attraction-comeback-placement";

  private readonly minimumDifference: number;
  private readonly cultureBaseBonus: number;
  private readonly cultureDifferenceWeight: number;
  private readonly civicSupportBonus: number;

  constructor(
    minimumDifference: number = 6,
    cultureBaseBonus: number = 12,
    cultureDifferenceWeight: number = 1,
    civicSupportBonus: number = 5
  ) {
    this.minimumDifference = minimumDifference;
    this.cultureBaseBonus = cultureBaseBonus;
    this.cultureDifferenceWeight = cultureDifferenceWeight;
    this.civicSupportBonus = civicSupportBonus;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const attractionDifference =
      context.playerScore.finalAttraction -
      context.aiScore.finalAttraction;

    if (attractionDifference < this.minimumDifference) {
      return {
        score: 0,
        reason:
          `${this.id}: attraction difference ${attractionDifference} below ` +
          `minimum ${this.minimumDifference} = 0`,
      };
    }

    const building = context.plan.building;

    if (building.family === "culture") {
  const attractionGain = context.contribution.finalAttraction;

  if (attractionGain <= 0) {
      return {
        score: 0,
        reason:
          `${this.id}: AI behind by ${attractionDifference} attraction, ` +
          `but this culture placement gives ${attractionGain} attraction = 0`,
      };
    }

    const score =
      this.cultureBaseBonus +
      attractionDifference * this.cultureDifferenceWeight;

    return {
      score,
      reason:
        `${this.id}: AI behind by ${attractionDifference} attraction, ` +
        `culture gives ${attractionGain} attraction, comeback = +${score}`,
    };
  }

    if (
      building.family === "civic" ||
      building.tags.includes("service")
    ) {
      const hasCultureInHand = context.handCards.some(
        (card) => card.building.family === "culture"
      );

      if (!hasCultureInHand) {
        return {
          score: 0,
          reason:
            `${this.id}: civic support but no culture card in hand = 0`,
        };
      }

      return {
        score: this.civicSupportBonus,
        reason:
          `${this.id}: AI behind in attraction and has culture in hand, ` +
          `civic support = +${this.civicSupportBonus}`,
      };
    }

    return {
      score: 0,
      reason: `${this.id}: not attraction comeback relevant = 0`,
    };
  }
}