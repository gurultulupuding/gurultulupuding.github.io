import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class InfrastructureOversupplyPlacementConsideration
  implements AIPlacementConsideration
{
  public readonly id = "infrastructure-oversupply-placement";

  private readonly softLimit: number;
  private readonly hardLimit: number;
  private readonly penaltyPerExtraInfrastructure: number;
  private readonly hardExtraPenalty: number;
  private readonly maxPenalty: number;

  constructor(
    softLimit: number = 6,
    hardLimit: number = 9,
    penaltyPerExtraInfrastructure: number = 4,
    hardExtraPenalty: number = 8,
    maxPenalty: number = 24
  ) {
    this.softLimit = softLimit;
    this.hardLimit = hardLimit;
    this.penaltyPerExtraInfrastructure = penaltyPerExtraInfrastructure;
    this.hardExtraPenalty = hardExtraPenalty;
    this.maxPenalty = maxPenalty;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (!this.isInfrastructureLike(building)) {
      return {
        score: 0,
        reason: `${this.id}: not infrastructure/road/mobility = 0`,
      };
    }

    const currentInfrastructureCount =
      context.aiScore.familyCounts.infrastructure;

    if (currentInfrastructureCount < this.softLimit) {
      return {
        score: 0,
        reason:
          `${this.id}: infrastructure count ${currentInfrastructureCount} ` +
          `below soft limit ${this.softLimit} = 0`,
      };
    }

    const countAfterPlacement = currentInfrastructureCount + 1;
    const extraCount = Math.max(
      0,
      countAfterPlacement - this.softLimit
    );

    let penalty = extraCount * this.penaltyPerExtraInfrastructure;

    if (countAfterPlacement > this.hardLimit) {
      const hardExtraCount = countAfterPlacement - this.hardLimit;
      penalty += hardExtraCount * this.hardExtraPenalty;
    }

    const finalPenalty = Math.min(this.maxPenalty, penalty);

    return {
      score: -finalPenalty,
      reason:
        `${this.id}: infrastructure count ${currentInfrastructureCount} ` +
        `would become ${countAfterPlacement}, softLimit=${this.softLimit}, ` +
        `hardLimit=${this.hardLimit}, penalty=-${finalPenalty}`,
    };
  }

  private isInfrastructureLike(building: {
    family: string;
    tags: string[];
  }): boolean {
    return (
      building.family === "infrastructure" ||
      building.tags.includes("road") ||
      building.tags.includes("mobility")
    );
  }
}