import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class AttractionGainConsideration implements AIPlacementConsideration {
  public readonly id = "attraction-gain";

  private readonly weight: number;

  constructor(weight: number = 7) {
    this.weight = weight;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const attraction = context.contribution.finalAttraction;
    const score = attraction * this.weight;

    return {
      score,
      reason: `${this.id}: ${attraction} attraction × ${this.weight} = ${score}`,
    };
  }
}