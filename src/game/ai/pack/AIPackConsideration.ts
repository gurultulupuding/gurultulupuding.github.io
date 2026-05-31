import type { PackDefinition } from "../../packs/PackDefinition";
import type { AIPackEvaluationContext } from "./AIPackEvaluationContext";

export interface AIPackConsiderationResult {
  score: number;
  reason: string;
}

export interface AIPackConsideration {
  readonly id: string;

  evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackConsiderationResult;
}