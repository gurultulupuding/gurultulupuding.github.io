import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";
import type { PackDefinition } from "../../../packs/PackDefinition";
import { AIPackMemoryState } from "../AIPackMemoryState";

export class FamilyPackLimitConsideration implements AIPackConsideration {
  public readonly id: string;

  private readonly aiPackMemoryState: AIPackMemoryState;
  private readonly family: string;
  private readonly maxPacksPerGame: number;
  private readonly penaltyAfterLimit: number;

  constructor(
    aiPackMemoryState: AIPackMemoryState,
    family: string,
    maxPacksPerGame: number,
    penaltyAfterLimit: number
  ) {
    this.aiPackMemoryState = aiPackMemoryState;
    this.family = family;
    this.maxPacksPerGame = maxPacksPerGame;
    this.penaltyAfterLimit = penaltyAfterLimit;
    this.id = `${family}-pack-limit`;
  }

  public evaluate(
    pack: PackDefinition,
    _context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (pack.family !== this.family) {
      return {
        score: 0,
        reason: `not ${this.family} = 0`,
      };
    }

    const selectedPackCount =
      this.aiPackMemoryState.getSelectedPackCount(this.family);

    if (selectedPackCount < this.maxPacksPerGame) {
      return {
        score: 0,
        reason:
          `${this.family} packs selected ` +
          `${selectedPackCount}/${this.maxPacksPerGame}, still allowed = 0`,
      };
    }

    return {
      score: -this.penaltyAfterLimit,
      reason:
        `${this.family} packs selected ` +
        `${selectedPackCount}/${this.maxPacksPerGame}, ` +
        `${this.family} pack blocked = -${this.penaltyAfterLimit}`,
    };
  }
}