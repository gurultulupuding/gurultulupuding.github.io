import type { PlacedBuildingInstance } from "../../../../world/city/PlacedBuildingInstance";
import { PlacedBuildingRegistry } from "../../../../world/city/PlacedBuildingRegistry";
import type { SynergyEffect } from "../SynergyEffect";
import type { SynergyRule } from "../SynergyRule";

export class ResidentialRoadAccessRule implements SynergyRule {
  public readonly id = "residential-road-access";

  private readonly bonusPerRoad: number;

  constructor(bonusPerRoad: number = 2) {
    this.bonusPerRoad = bonusPerRoad;
  }

  public evaluate(
    instance: PlacedBuildingInstance,
    registry: PlacedBuildingRegistry
  ): SynergyEffect[] {
    if (instance.building.family !== "residential") {
      return [];
    }

    const neighboringRoads = registry
      .getNeighborsOf(instance)
      .filter((neighbor) => neighbor.building.tags.includes("road"));

    return neighboringRoads.map((road) => ({
      ruleId: this.id,

      sourceInstanceId: instance.id,
      sourceBuildingName: instance.building.name,

      targetInstanceId: road.id,
      targetBuildingName: road.building.name,

      populationDelta: this.bonusPerRoad,
      attractionDelta: 0,

      type: "positive",
      reason: `${instance.building.name} gains +${this.bonusPerRoad} population from direct road access to ${road.building.name}.`,
    }));
  }
}