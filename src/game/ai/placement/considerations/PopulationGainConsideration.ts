import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class PopulationGainConsideration implements AIPlacementConsideration {
  public readonly id = "population-gain";

  private readonly weight: number;

  constructor(weight: number = 10) {
    this.weight = weight;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const population = context.contribution.finalPopulation;
    const score = population * this.weight;

    return {
      score,
      reason: `${this.id}: ${population} population × ${this.weight} = ${score}`,
    };
  }
}