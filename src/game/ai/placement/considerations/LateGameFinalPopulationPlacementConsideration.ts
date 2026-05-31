import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

type PopulationContributionView = {
  finalPopulation?: number;
  population?: number;
  basePopulation?: number;
  synergyPopulationBonus?: number;
};

export class LateGameFinalPopulationPlacementConsideration
  implements AIPlacementConsideration
{
  public readonly id = "late-game-final-population-placement";

  private readonly startTurn: number;
  private readonly baseBonus: number;
  private readonly populationWeight: number;
  private readonly populationGapWeight: number;
  private readonly maxBonus: number;

  constructor(
    startTurn: number = 13,
    baseBonus: number = 10,
    populationWeight: number = 3,
    populationGapWeight: number = 0.25,
    maxBonus: number = 28
  ) {
    this.startTurn = startTurn;
    this.baseBonus = baseBonus;
    this.populationWeight = populationWeight;
    this.populationGapWeight = populationGapWeight;
    this.maxBonus = maxBonus;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    if (context.currentTurn < this.startTurn) {
      return {
        score: 0,
        reason:
          `${this.id}: turn ${context.currentTurn} before ` +
          `late game ${this.startTurn} = 0`,
      };
    }

    const building = context.plan.building;

    if (building.family !== "residential") {
      return {
        score: 0,
        reason: `${this.id}: not residential = 0`,
      };
    }

    const contribution =
      context.contribution as unknown as PopulationContributionView;

    const populationGain =
      contribution.finalPopulation ??
      contribution.population ??
      ((contribution.basePopulation ?? building.basePopulation ?? 0) +
        (contribution.synergyPopulationBonus ?? 0));

    if (populationGain <= 0) {
      return {
        score: 0,
        reason: `${this.id}: residential has no population gain = 0`,
      };
    }

    const populationDifference =
      context.playerScore.finalPopulation -
      context.aiScore.finalPopulation;

    const comebackBonus =
      populationDifference > 0
        ? populationDifference * this.populationGapWeight
        : 0;

    const score = Math.min(
      this.maxBonus,
      this.baseBonus +
        populationGain * this.populationWeight +
        comebackBonus
    );

    return {
      score,
      reason:
        `${this.id}: turn ${context.currentTurn}, residential final ` +
        `population gain=${populationGain}, populationGap=${populationDifference}, ` +
        `bonus=+${score}`,
    };
  }
}