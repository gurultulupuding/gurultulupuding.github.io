import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";
import type { PackDefinition } from "../../../packs/PackDefinition";

export class OpeningInfrastructurePackConsideration
  implements AIPackConsideration
{
  public readonly id = "opening-infrastructure-pack";

  private readonly openingTurn: number;
  private readonly infrastructureBonus: number;
  private readonly nonInfrastructurePenalty: number;

  public constructor(
    openingTurn: number = 1,
    infrastructureBonus: number = 40,
    nonInfrastructurePenalty: number = 0
  ) {
    this.openingTurn = openingTurn;
    this.infrastructureBonus = infrastructureBonus;
    this.nonInfrastructurePenalty = nonInfrastructurePenalty;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (context.currentTurn !== this.openingTurn) {
      return {
        score: 0,
        reason: `${this.id}: not opening turn = 0`,
      };
    }

    if (pack.family === "infrastructure") {
      return {
        score: this.infrastructureBonus,
        reason:
          `${this.id}: turn ${context.currentTurn}, infrastructure opening setup ` +
          `= +${this.infrastructureBonus}`,
      };
    }

    return {
      score: -this.nonInfrastructurePenalty,
      reason:
        `${this.id}: turn ${context.currentTurn}, not infrastructure ` +
        `= -${this.nonInfrastructurePenalty}`,
    };
  }
}