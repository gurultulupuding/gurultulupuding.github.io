import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class CulturePollutionAvoidanceConsideration
  implements AIPlacementConsideration
{
  public readonly id = "culture-pollution-avoidance";

  private readonly radius: number;
  private readonly penaltyPerPollutionSource: number;

  constructor(radius: number = 2, penaltyPerPollutionSource: number = 10) {
    this.radius = radius;
    this.penaltyPerPollutionSource = penaltyPerPollutionSource;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (building.family !== "culture") {
      return {
        score: 0,
        reason: `${this.id}: not culture = 0`,
      };
    }

    const pollutionSources =
      context.registry
        .getInstancesWithinManhattanRadius(
          context.plan.cells,
          this.radius
        )
        .filter((nearby) => nearby.building.tags.includes("pollution"));

    if (pollutionSources.length === 0) {
      return {
        score: 0,
        reason: `${this.id}: no nearby pollution = 0`,
      };
    }

    const score =
      -pollutionSources.length * this.penaltyPerPollutionSource;

    return {
      score,
      reason:
        `${this.id}: ${pollutionSources.length} nearby pollution source(s) ` +
        `within radius ${this.radius} × -${this.penaltyPerPollutionSource} = ${score}`,
    };
  }
}