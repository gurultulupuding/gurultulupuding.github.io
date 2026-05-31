import type { GridModel } from "../../../world/grid/GridModel";
import type { PlacedBuildingRegistry } from "../../../world/city/PlacedBuildingRegistry";
import type { PlacedBuildingInstance } from "../../../world/city/PlacedBuildingInstance";
import type { PlacedBuildingScoreContribution } from "../../scoring/PlacedBuildingScoreContribution";
import type { HandCardInstance } from "../../hand/HandCardInstance";
import type { AIPlacementPlan } from "./AIPlacementPlan";
import type { CityScore } from "../../scoring/CityScore";

export interface AIPlacementEvaluationContext {
  plan: AIPlacementPlan;
  simulatedInstance: PlacedBuildingInstance;
  contribution: PlacedBuildingScoreContribution;

  registry: PlacedBuildingRegistry;
  grid: GridModel;

  currentTurn: number;
  handCards: HandCardInstance[];

  aiScore: CityScore;
  playerScore: CityScore;
}