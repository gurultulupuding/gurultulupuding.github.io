import type { PackDefinition } from "../../packs/PackDefinition";
import type { HandCardInstance } from "../../hand/HandCardInstance";
import type { CityScore } from "../../scoring/CityScore";

export interface AIPackEvaluationContext {
  offeredPacks: PackDefinition[];

  aiHandCards: HandCardInstance[];

  aiScore: CityScore;
  playerScore: CityScore;

  currentTurn: number;
  maxTurns: number;
}