import { PlacedBuildingRegistry } from "../../../world/city/PlacedBuildingRegistry";
import type { PlacedBuildingInstance } from "../../../world/city/PlacedBuildingInstance";
import { PlacedBuildingScoreContributionFactory } from "../../scoring/PlacedBuildingScoreContributionFactory";
import { PlacedBuildingScoreRegistry } from "../../scoring/PlacedBuildingScoreRegistry";
import type { PlacedBuildingScoreContribution } from "../../scoring/PlacedBuildingScoreContribution";
import type { AIPlacementPlan } from "./AIPlacementPlan";
import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "./AIPlacementConsideration";
import { GridModel } from "../../../world/grid/GridModel";
import type { HandCardInstance } from "../../hand/HandCardInstance";
import type { CityScore } from "../../scoring/CityScore";
import type { AIPlacementEvaluationContext } from "./AIPlacementEvaluationContext";

export interface AIPlacementEvaluation {
  score: number;
  contribution: PlacedBuildingScoreContribution;
  reason: string;
  considerationResults: AIPlacementConsiderationResult[];
}

export class AIPlacementEvaluator {
  private readonly placedBuildingRegistry: PlacedBuildingRegistry;
  private readonly scoreContributionFactory: PlacedBuildingScoreContributionFactory;
  private readonly scoreRegistry: PlacedBuildingScoreRegistry;
  private readonly considerations: AIPlacementConsideration[];
  private readonly grid: GridModel;

  constructor(
    grid: GridModel,
    placedBuildingRegistry: PlacedBuildingRegistry,
    scoreContributionFactory: PlacedBuildingScoreContributionFactory,
    scoreRegistry: PlacedBuildingScoreRegistry,
    considerations: AIPlacementConsideration[]
  ) {
    this.grid = grid;
    this.placedBuildingRegistry = placedBuildingRegistry;
    this.scoreContributionFactory = scoreContributionFactory;
    this.scoreRegistry = scoreRegistry;
    this.considerations = considerations;
  }

  public evaluate(
    plan: AIPlacementPlan,
    currentTurn: number,
    handCards: HandCardInstance[],
    aiScore: CityScore,
    playerScore: CityScore
  ): AIPlacementEvaluation {
    const simulatedInstance: PlacedBuildingInstance = {
      id: "ai-simulated-placement",
      owner: "ai",
      building: plan.building,
      anchor: { row: plan.row, col: plan.col },
      rotation: plan.rotation,
      cells: plan.cells,
      placedTurn: currentTurn,
    };

   const contribution =
    this.scoreContributionFactory.createForInstance(
      simulatedInstance,
      this.placedBuildingRegistry,
      this.scoreRegistry,
      aiScore.globalPopulationModifier
    );

    const context: AIPlacementEvaluationContext = {
      plan,
      simulatedInstance,
      contribution,
      registry: this.placedBuildingRegistry,
      grid: this.grid,
      currentTurn,
      handCards,
      aiScore,
      playerScore,
    };

    const considerationResults = this.considerations.map((consideration) =>
      consideration.evaluate(context)
    );

    const score = considerationResults.reduce(
      (total, result) => total + result.score,
      0
    );

    return {
      score,
      contribution,
      reason: this.createReason(plan, contribution, score, considerationResults),
      considerationResults,
    };
  }

  private createReason(
    plan: AIPlacementPlan,
    contribution: PlacedBuildingScoreContribution,
    score: number,
    considerationResults: AIPlacementConsiderationResult[]
  ): string {
    return [
      `${plan.building.name}`,
      `score=${score}`,
      `population=${contribution.finalPopulation}`,
      `capacity=${contribution.populationCapacity}`,
      `wasted=${contribution.wastedPopulation}`,
      `attraction=${contribution.finalAttraction}`,
      `synergyPop=${contribution.synergyPopulationBonus}`,
      `synergyAttr=${contribution.synergyAttractionBonus}`,
      `effects=${contribution.synergyEffects.length}`,
      ...considerationResults.map((result) => result.reason),
    ].join(" | ");
  }
}