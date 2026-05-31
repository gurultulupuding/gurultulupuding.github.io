import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";
import type { PackDefinition } from "../../../packs/PackDefinition";

export class IndustryPackCapacityPressureConsideration
  implements AIPackConsideration
{
  public readonly id = "industry-pack-capacity-pressure";

  private readonly estimatedIndustryPopulationPerCard: number;
  private readonly expectedIndustryCardsFromPack: number;
  private readonly existingIndustryDemandWeight: number;
  private readonly penaltyPerMissingCapacity: number;
  private readonly maxPenalty: number;

  constructor(
    estimatedIndustryPopulationPerCard: number = 8,
    expectedIndustryCardsFromPack: number = 4,
    existingIndustryDemandWeight: number = 0.75,
    penaltyPerMissingCapacity: number = 1,
    maxPenalty: number = 30
  ) {
    this.estimatedIndustryPopulationPerCard =
      estimatedIndustryPopulationPerCard;
    this.expectedIndustryCardsFromPack = expectedIndustryCardsFromPack;
    this.existingIndustryDemandWeight = existingIndustryDemandWeight;
    this.penaltyPerMissingCapacity = penaltyPerMissingCapacity;
    this.maxPenalty = maxPenalty;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (pack.family !== "industry") {
      return {
        score: 0,
        reason: "not industry = 0",
      };
    }

    const availablePopulationCapacity =
      context.aiScore.availablePopulationCapacity;

    const existingIndustryCardsInHand = context.aiHandCards.filter(
      (card) => card.building.family === "industry"
    ).length;

    const existingIndustryDemand =
      existingIndustryCardsInHand *
      this.estimatedIndustryPopulationPerCard *
      this.existingIndustryDemandWeight;

    const incomingIndustryDemand =
      this.expectedIndustryCardsFromPack *
      this.estimatedIndustryPopulationPerCard;

    const totalExpectedIndustryDemand =
      existingIndustryDemand + incomingIndustryDemand;

    const missingCapacity =
      totalExpectedIndustryDemand - availablePopulationCapacity;

    if (missingCapacity <= 0) {
      return {
        score: 0,
        reason:
          `industry pack fits capacity: availableCapacity=${availablePopulationCapacity}, ` +
          `expectedDemand=${totalExpectedIndustryDemand.toFixed(1)} = 0`,
      };
    }

    const penalty = Math.min(
      this.maxPenalty,
      Math.round(missingCapacity * this.penaltyPerMissingCapacity)
    );

    return {
      score: -penalty,
      reason:
        `industry pack overfills capacity: availableCapacity=${availablePopulationCapacity}, ` +
        `existingIndustryCards=${existingIndustryCardsInHand}, ` +
        `expectedDemand=${totalExpectedIndustryDemand.toFixed(1)}, ` +
        `missingCapacity=${missingCapacity.toFixed(1)}, penalty=-${penalty}`,
    };
  }
}