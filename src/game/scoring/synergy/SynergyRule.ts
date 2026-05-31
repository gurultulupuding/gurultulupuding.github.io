import type { PlacedBuildingInstance } from "../../../world/city/PlacedBuildingInstance";
import { PlacedBuildingRegistry } from "../../../world/city/PlacedBuildingRegistry";
import type { SynergyEffect } from "./SynergyEffect";

export interface SynergyRule {
  readonly id: string;

  evaluate(
    instance: PlacedBuildingInstance,
    registry: PlacedBuildingRegistry
  ): SynergyEffect[];
}