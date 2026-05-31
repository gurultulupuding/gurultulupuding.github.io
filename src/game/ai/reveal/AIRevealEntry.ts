import type { PlacedBuildingInstance } from "../../../world/city/PlacedBuildingInstance";
import type { PlacedBuildingScoreContribution } from "../../scoring/PlacedBuildingScoreContribution";

export interface AIRevealEntry {
  instance: PlacedBuildingInstance;
  contribution: PlacedBuildingScoreContribution;
}