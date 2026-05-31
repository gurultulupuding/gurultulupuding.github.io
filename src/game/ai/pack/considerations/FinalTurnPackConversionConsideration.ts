import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class FinalTurnPackConversionConsideration
  implements AIPackConsideration
{
  public readonly id = "final-turn-pack-conversion";

  private readonly finalWindowTurns: number;
  private readonly industryComebackBonus: number;
  private readonly cultureComebackBonus: number;
  private readonly residentialWithIndustryBonus: number;
  private readonly residentialWithoutIndustryPenalty: number;
  private readonly supportPackPenalty: number;

  constructor(
    finalWindowTurns: number = 2,
    industryComebackBonus: number = 18,
    cultureComebackBonus: number = 18,
    residentialWithIndustryBonus: number = 10,
    residentialWithoutIndustryPenalty: number = 14,
    supportPackPenalty: number = 12
  ) {
    this.finalWindowTurns = finalWindowTurns;
    this.industryComebackBonus = industryComebackBonus;
    this.cultureComebackBonus = cultureComebackBonus;
    this.residentialWithIndustryBonus = residentialWithIndustryBonus;
    this.residentialWithoutIndustryPenalty =
      residentialWithoutIndustryPenalty;
    this.supportPackPenalty = supportPackPenalty;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    const turnsRemaining = context.maxTurns - context.currentTurn;

    if (turnsRemaining > this.finalWindowTurns) {
      return {
        score: 0,
        reason:
          `${this.id}: ${turnsRemaining} turns remaining, outside final ` +
          `window ${this.finalWindowTurns} = 0`,
      };
    }

    const populationGap =
      context.playerScore.finalPopulation -
      context.aiScore.finalPopulation;

    const attractionGap =
      context.playerScore.finalAttraction -
      context.aiScore.finalAttraction;

    const availableCapacity =
      context.aiScore.availablePopulationCapacity;

    const hasIndustryInHand = context.aiHandCards.some(
      (card) => card.building.family === "industry"
    );

    if (pack.family === "industry") {
      if (availableCapacity <= 0) {
        return {
          score: -this.supportPackPenalty,
          reason:
            `${this.id}: final window, industry pack has no available ` +
            `capacity to convert population = -${this.supportPackPenalty}`,
        };
      }

      if (populationGap > 0) {
        return {
          score: this.industryComebackBonus,
          reason:
            `${this.id}: final window, AI behind by ${populationGap} ` +
            `population and has ${availableCapacity} capacity, ` +
            `industry conversion = +${this.industryComebackBonus}`,
        };
      }

      return {
        score: Math.floor(this.industryComebackBonus * 0.5),
        reason:
          `${this.id}: final window, industry can still convert ` +
          `${availableCapacity} free capacity = +${Math.floor(
            this.industryComebackBonus * 0.5
          )}`,
      };
    }

    if (pack.family === "culture") {
      if (attractionGap > 0) {
        return {
          score: this.cultureComebackBonus,
          reason:
            `${this.id}: final window, AI behind by ${attractionGap} ` +
            `attraction, culture conversion = +${this.cultureComebackBonus}`,
        };
      }

      return {
        score: 0,
        reason:
          `${this.id}: final window, AI not behind in attraction, ` +
          `culture not urgent = 0`,
      };
    }

    if (pack.family === "residential") {
      if (availableCapacity <= 1 && hasIndustryInHand) {
        return {
          score: this.residentialWithIndustryBonus,
          reason:
            `${this.id}: final window, low capacity and industry in hand, ` +
            `residential can unlock population = +${this.residentialWithIndustryBonus}`,
        };
      }

      if (!hasIndustryInHand) {
        return {
          score: -this.residentialWithoutIndustryPenalty,
          reason:
            `${this.id}: final window, residential creates capacity but ` +
            `no industry in hand to convert it = -${this.residentialWithoutIndustryPenalty}`,
        };
      }

      return {
        score: 0,
        reason:
          `${this.id}: final window, residential has possible but not urgent ` +
          `conversion value = 0`,
      };
    }

    if (pack.family === "infrastructure" || pack.family === "civic") {
      return {
        score: -this.supportPackPenalty,
        reason:
          `${this.id}: final window, ${pack.family} is mostly setup, ` +
          `penalty=-${this.supportPackPenalty}`,
      };
    }

    return {
      score: 0,
      reason: `${this.id}: no final conversion rule = 0`,
    };
  }
}