import type { PlacedBuildingInstance } from "../../../../world/city/PlacedBuildingInstance";
import { PlacedBuildingRegistry } from "../../../../world/city/PlacedBuildingRegistry";
import type { SynergyEffect } from "../SynergyEffect";
import type { SynergyRule } from "../SynergyRule";

export class ResidentialPollutionSynergyRule implements SynergyRule {
  public readonly id = "residential-pollution-synergy";

  private readonly radius: number;
  private readonly populationPenaltyPerPollutionSource: number;

  constructor(
    radius: number = 2,
    populationPenaltyPerPollutionSource: number = -2
  ) {
    this.radius = radius;
    this.populationPenaltyPerPollutionSource =
      populationPenaltyPerPollutionSource;
  }

  public evaluate(
    instance: PlacedBuildingInstance,
    registry: PlacedBuildingRegistry
  ): SynergyEffect[] {
    if (instance.building.family !== "residential") {
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

      populationDelta: this.populationPenaltyPerPollutionSource,
      attractionDelta: 0,

      type: "negative",
      reason: `${instance.building.name} loses ${Math.abs(
        this.populationPenaltyPerPollutionSource
      )} population from nearby pollution caused by ${pollutionSource.building.name}.`,
    }));
  }
}