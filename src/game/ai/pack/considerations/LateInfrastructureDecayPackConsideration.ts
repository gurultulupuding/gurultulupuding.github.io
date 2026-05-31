import type { PackDefinition } from "../../../packs/PackDefinition";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class LateInfrastructureDecayPackConsideration
  implements AIPackConsideration
{
  public readonly id = "late-infrastructure-decay-pack";

  private readonly startTurn: number;
  private readonly hardDecayTurn: number;

  private readonly mediumPenalty: number;
  private readonly hardPenalty: number;
  private readonly noImmediateUserPenalty: number;

  constructor(
    startTurn: number = 9,
    hardDecayTurn: number = 12,
    mediumPenalty: number = 8,
    hardPenalty: number = 22,
    noImmediateUserPenalty: number = 10
  ) {
    this.startTurn = startTurn;
    this.hardDecayTurn = hardDecayTurn;
    this.mediumPenalty = mediumPenalty;
    this.hardPenalty = hardPenalty;
    this.noImmediateUserPenalty = noImmediateUserPenalty;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (pack.family !== "infrastructure") {
      return {
        score: 0,
        reason: `${this.id}: not infrastructure = 0`,
      };
    }

    if (context.currentTurn < this.startTurn) {
      return {
        score: 0,
        reason:
          `${this.id}: turn ${context.currentTurn} before decay turn ` +
          `${this.startTurn} = 0`,
      };
    }

    const hasImmediateInfrastructureUser =
      context.aiHandCards.some((card) =>
        this.canUseInfrastructureSoon(card.building.family, card.building.tags)
      );

    let penalty =
      context.currentTurn >= this.hardDecayTurn
        ? this.hardPenalty
        : this.mediumPenalty;

    if (!hasImmediateInfrastructureUser) {
      penalty += this.noImmediateUserPenalty;
    }

    return {
      score: -penalty,
      reason:
        `${this.id}: infrastructure is lower value at turn ` +
        `${context.currentTurn}, ` +
        `immediateUser=${hasImmediateInfrastructureUser}, penalty=-${penalty}`,
    };
  }

  private canUseInfrastructureSoon(
    family: string,
    tags: string[]
  ): boolean {
    return (
      family === "residential" ||
      family === "industry" ||
      family === "culture" ||
      tags.includes("housing") ||
      tags.includes("production") ||
      tags.includes("culture")
    );
  }
}