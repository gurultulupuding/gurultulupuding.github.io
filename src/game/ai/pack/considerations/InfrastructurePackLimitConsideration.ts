import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";
import type { PackDefinition } from "../../../packs/PackDefinition";
import { AIPackMemoryState } from "../AIPackMemoryState";

export class InfrastructurePackLimitConsideration
  implements AIPackConsideration
{
  public readonly id = "infrastructure-pack-limit";

  private readonly aiPackMemoryState: AIPackMemoryState;
  private readonly maxInfrastructurePacksPerGame: number;
  private readonly penaltyAfterLimit: number;

  constructor(
    aiPackMemoryState: AIPackMemoryState,
    maxInfrastructurePacksPerGame: number = 3,
    penaltyAfterLimit: number = 100
  ) {
    this.aiPackMemoryState = aiPackMemoryState;
    this.maxInfrastructurePacksPerGame =
      maxInfrastructurePacksPerGame;
    this.penaltyAfterLimit = penaltyAfterLimit;
  }

  public evaluate(
    pack: PackDefinition,
    _context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (pack.family !== "infrastructure") {
      return {
        score: 0,
        reason: "not infrastructure = 0",
      };
    }

    const selectedInfrastructurePackCount =
      this.aiPackMemoryState.getSelectedPackCount("infrastructure");

    if (
      selectedInfrastructurePackCount <
      this.maxInfrastructurePacksPerGame
    ) {
      return {
        score: 0,
        reason:
          `infrastructure packs selected ` +
          `${selectedInfrastructurePackCount}/` +
          `${this.maxInfrastructurePacksPerGame}, still allowed = 0`,
      };
    }

    return {
      score: -this.penaltyAfterLimit,
      reason:
        `infrastructure packs selected ` +
        `${selectedInfrastructurePackCount}/` +
        `${this.maxInfrastructurePacksPerGame}, ` +
        `infrastructure pack blocked = -${this.penaltyAfterLimit}`,
    };
  }
}