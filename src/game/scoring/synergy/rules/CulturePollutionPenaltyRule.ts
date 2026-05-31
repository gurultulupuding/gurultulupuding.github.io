import type { PlacedBuildingInstance } from "../../../../world/city/PlacedBuildingInstance";
import { PlacedBuildingRegistry } from "../../../../world/city/PlacedBuildingRegistry";
import type { SynergyEffect } from "../SynergyEffect";
import type { SynergyRule } from "../SynergyRule";

export class CulturePollutionPenaltyRule implements SynergyRule {
  public readonly id = "culture-pollution-penalty";

  private readonly radius: number;
  private readonly attractionPenaltyPerPollutionSource: number;

  constructor(
    radius: number = 2,
    attractionPenaltyPerPollutionSource: number = -1
  ) {
    this.radius = radius;
    this.attractionPenaltyPerPollutionSource =
      attractionPenaltyPerPollutionSource;
  }

  public evaluate(
    instance: PlacedBuildingInstance,
    registry: PlacedBuildingRegistry
  ): SynergyEffect[] {
    if (instance.building.family !== "culture") {
      return [];
    }

    const pollutionSources = registry
      .getInstancesWithinManhattanRadius(
        instance.cells,
        this.radius,
        instance.id
      )
      .filter((nearby) => nearby.building.tags.includes("pollution"));

    return pollutionSources.map((pollutionSource) => ({
      ruleId: this.id,

      sourceInstanceId: instance.id,
      sourceBuildingName: instance.building.name,

      targetInstanceId: pollutionSource.id,
      targetBuildingName: pollutionSource.building.name,

      populationDelta: 0,
      attractionDelta: this.attractionPenaltyPerPollutionSource,

      type: "negative",
      reason: `${instance.building.name} loses ${Math.abs(
        this.attractionPenaltyPerPollutionSource
      )} attraction from nearby pollution caused by ${pollutionSource.building.name}.`,
    }));
  }
}