import type { PackDefinition } from "../../packs/PackDefinition";
import type { AIPackEvaluationContext } from "./AIPackEvaluationContext";
import { AIPackEvaluator } from "./AIPackEvaluator";

export class AIPackDecision {
  private readonly packEvaluator: AIPackEvaluator;

  constructor(packEvaluator: AIPackEvaluator) {
    this.packEvaluator = packEvaluator;
  }

  public choosePack(
    context: AIPackEvaluationContext
  ): PackDefinition | null {
    let bestPack: PackDefinition | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestReason = "";

    for (const pack of context.offeredPacks) {
      const evaluation = this.packEvaluator.evaluate(pack, context);

      if (evaluation.score > bestScore) {
        bestPack = pack;
        bestScore = evaluation.score;
        bestReason = evaluation.reason;
      }
    }

    if (bestPack) {
      console.log("AI pack decision:", {
        selectedPack: bestPack.title,
        score: bestScore,
        reason: bestReason,
      });
    }

    return bestPack;
  }
}