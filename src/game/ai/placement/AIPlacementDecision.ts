import type { HandCardInstance } from "../../hand/HandCardInstance";
import type { AIPlacementPlan } from "./AIPlacementPlan";
import type { PlacedBuildingScoreContribution } from "../../scoring/PlacedBuildingScoreContribution";
import type { AIPlacementConsiderationResult } from "./AIPlacementConsideration";

export interface AIPlacementDecision {
  card: HandCardInstance;
  plan: AIPlacementPlan;
  score: number;
  contribution: PlacedBuildingScoreContribution;
  reason: string;
  considerationResults: AIPlacementConsiderationResult[];
}