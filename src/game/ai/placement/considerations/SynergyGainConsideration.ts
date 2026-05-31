import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class SynergyGainConsideration implements AIPlacementConsideration {
  public readonly id = "synergy-gain";

  private readonly populationSynergyWeight: number;
  private readonly attractionSynergyWeight: number;
  private readonly effectCountWeight: number;

  constructor(
    populationSynergyWeight: number = 8,
    attractionSynergyWeight: number = 6,
    effectCountWeight: number = 3
  ) {
    this.populationSynergyWeight = populationSynergyWeight;
    this.attractionSynergyWeight = attractionSynergyWeight;
    this.effectCountWeight = effectCountWeight;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const contribution = context.contribution;

    const populationScore =
      contribution.synergyPopulationBonus * this.populationSynergyWeight;

    const attractionScore =
      contribution.synergyAttractionBonus * this.attractionSynergyWeight;

    const effectScore =
      contribution.synergyEffects.length * this.effectCountWeight;

    const score = populationScore + attractionScore + effectScore;

    return {
      score,
      reason:
        `${this.id}: popSynergy=${populationScore}, ` +
        `attrSynergy=${attractionScore}, effects=${effectScore}, total=${score}`,
    };
  }
}