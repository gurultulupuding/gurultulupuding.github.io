import type { AIPlacementEvaluationContext } from "./AIPlacementEvaluationContext";

export interface AIPlacementConsiderationResult {
  score: number;
  reason: string;
}

export interface AIPlacementConsideration {
  readonly id: string;

  evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult;
}