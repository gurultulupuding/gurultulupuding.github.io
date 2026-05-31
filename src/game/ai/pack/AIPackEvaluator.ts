import type { PackDefinition } from "../../packs/PackDefinition";
import type { AIPackEvaluationContext } from "./AIPackEvaluationContext";
import type {
  AIPackConsideration,
  AIPackConsiderationResult,
} from "./AIPackConsideration";

export interface AIPackEvaluation {
  pack: PackDefinition;
  score: number;
  reason: string;
  considerationResults: AIPackConsiderationResult[];
}

export class AIPackEvaluator {
  private readonly considerations: AIPackConsideration[];

  constructor(considerations: AIPackConsideration[]) {
    this.considerations = considerations;
  }

  public evaluate(
    pack: PackDefinition,
    context: AIPackEvaluationContext
  ): AIPackEvaluation {
    const considerationResults = this.considerations.map((consideration) =>
      consideration.evaluate(pack, context)
    );

    const score = considerationResults.reduce(
      (total, result) => total + result.score,
      0
    );

    return {
      pack,
      score,
      considerationResults,
      reason: this.createReason(pack, score, considerationResults),
    };
  }

  private createReason(
    pack: PackDefinition,
    score: number,
    considerationResults: AIPackConsiderationResult[]
  ): string {
    return [
      `${pack.title}`,
      `family=${pack.family}`,
      `score=${score}`,
      ...considerationResults.map((result) => result.reason),
    ].join(" | ");
  }
}