import type { BuildingDefinition } from "../buildings/definitions/BuildingDefinition";
import type { BuildingRenderDefinition } from "./BuildingRenderDefinition";

export class BuildingRenderCatalog {
  private readonly definitionsByBuildingId =
    new Map<string, BuildingRenderDefinition>();

  constructor(definitions: BuildingRenderDefinition[]) {
    for (const definition of definitions) {
      this.definitionsByBuildingId.set(definition.buildingId, definition);
    }
  }

  public getForBuilding(
    building: BuildingDefinition
  ): BuildingRenderDefinition | null {
    return this.definitionsByBuildingId.get(building.id) ?? null;
  }
}