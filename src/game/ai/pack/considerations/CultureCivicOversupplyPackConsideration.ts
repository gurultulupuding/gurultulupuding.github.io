import type { PackDefinition } from "../../../packs/PackDefinition";
import type { AIPackConsideration, AIPackConsiderationResult } from "../AIPackConsideration";
import type { AIPackEvaluationContext } from "../AIPackEvaluationContext";

export class CultureCivicOversupplyPackConsideration
  implements AIPackConsideration
{
  public readonly id = "culture-civic-oversupply-pack";

  private readonly softLimit: number;
  private readonly hardLimit: number;
  private readonly penaltyPerExtra: number;
  private readonly imbalancePenalty: number;

  constructor(
    softLimit: number = 8,
    hardLimit: number = 12,
    penaltyPerExtra: number = 4,
    imbalancePenalty: number = 3
  ) {
    this.softLimit = softLimit;
    this.hardLimit = hardLimit;
    this.penaltyPerExtra = penaltyPerExtra;
    this.imbalancePenalty = imbalancePenalty;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult {
    if (pack.family !== "culture" && pack.family !== "civic") {
      return {
        score: 0,
        reason: "not culture/civic = 0",
      };
    }

    const familyCounts = context.aiScore.familyCounts;
    const cultureCount = familyCounts.culture ?? 0;
    const civicCount = familyCounts.civic ?? 0;

    const currentCount =
      pack.family === "culture" ? cultureCount : civicCount;

    let penalty = 0;
    const reasons: string[] = [];

    if (currentCount >= this.hardLimit) {
      penalty += 30;
      reasons.push(
        `${pack.family} count ${currentCount} reaches hard limit ${this.hardLimit}: -30`
      );
    } else if (currentCount >= this.softLimit) {
      const extra = currentCount - this.softLimit + 1;
      const p = extra * this.penaltyPerExtra;
      penalty += p;
      reasons.push(
        `${pack.family} count ${currentCount} above soft limit ${this.softLimit}: -${p}`
      );
    }

    if (pack.family === "culture" && cultureCount > civicCount + 4) {
      const p = (cultureCount - civicCount - 4) * this.imbalancePenalty;
      penalty += p;
      reasons.push(
        `culture already exceeds civic by ${cultureCount - civicCount}: -${p}`
      );
    }

    if (pack.family === "civic" && civicCount > cultureCount + 4) {
      const p = (civicCount - cultureCount - 4) * this.imbalancePenalty;
      penalty += p;
      reasons.push(
        `civic already exceeds culture by ${civicCount - cultureCount}: -${p}`
      );
    }

    if (penalty === 0) {
      return {
        score: 0,
        reason: `culture/civic supply acceptable: culture=${cultureCount}, civic=${civicCount} = 0`,
      };
    }

    return {
      score: -penalty,
      reason: reasons.join(" | "),
    };
  }
}