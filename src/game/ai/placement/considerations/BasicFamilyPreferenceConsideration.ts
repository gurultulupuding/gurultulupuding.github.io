import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class BasicFamilyPreferenceConsideration
  implements AIPlacementConsideration
{
  public readonly id = "basic-family-preference";

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;
    let score = 0;
    const reasons: string[] = [];

    if (building.family === "infrastructure") {
      score += 4;
    }

    if (building.family === "residential") {
      score += 2;
    }

    if (building.family === "culture") {
      score += 2;
    }

    if (building.family === "civic") {
      score += 2;
    }

    return {
      score,
      reason:
        reasons.length > 0
          ? `${this.id}: ${reasons.join(", ")} = ${score}`
          : `${this.id}: no preference = 0`,
    };
  }
}