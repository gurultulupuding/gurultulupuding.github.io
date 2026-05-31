export type SynergyEffectType = "positive" | "negative";

export interface SynergyEffect {
  ruleId: string;

  sourceInstanceId: string;
  sourceBuildingName: string;

  targetInstanceId: string;
  targetBuildingName: string;

  populationDelta: number;
  attractionDelta: number;

  type: SynergyEffectType;
  reason: string;
}