import type { BuildingDefinition } from "../../world/buildings/definitions/BuildingDefinition";
import type { PackDefinition } from "./PackDefinition";

export class PackContentGenerator {
  private readonly fixedPackContentsByPackId: Record<string, string[]> = {
    "pack-infrastructure": [
      "road-segment",
      "road-segment",
      "road-segment",
      "main-avenue",
      "main-avenue",
      "main-avenue",
    ],
  };

  public generateBuildingsForPack(
    pack: PackDefinition,
    buildingPool: BuildingDefinition[],
    count: number = 4
  ): BuildingDefinition[] {
    const fixedBuildingIds = this.fixedPackContentsByPackId[pack.id];

    if (fixedBuildingIds) {
      return this.generateFixedBuildingsForPack(
        pack,
        buildingPool,
        fixedBuildingIds
      );
    }

    return this.generateRandomBuildingsForPack(
      pack,
      buildingPool,
      count
    );
  }

  private generateFixedBuildingsForPack(
    pack: PackDefinition,
    buildingPool: BuildingDefinition[],
    buildingIds: string[]
  ): BuildingDefinition[] {
    const generatedBuildings: BuildingDefinition[] = [];

    for (const buildingId of buildingIds) {
      const building = buildingPool.find(
        (candidate) => candidate.id === buildingId
      );

      if (!building) {
        console.warn(
          `Fixed pack content could not find building "${buildingId}" for pack "${pack.id}".`
        );
        continue;
      }

      generatedBuildings.push(building);
    }

    return generatedBuildings;
  }

  private generateRandomBuildingsForPack(
    pack: PackDefinition,
    buildingPool: BuildingDefinition[],
    count: number
  ): BuildingDefinition[] {
    const familyPool = buildingPool.filter(
      (building) => building.family === pack.family
    );

    if (familyPool.length === 0) {
      console.warn("No buildings found for pack family:", pack.family);
      return [];
    }

    const generatedBuildings: BuildingDefinition[] = [];

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * familyPool.length);
      generatedBuildings.push(familyPool[randomIndex]);
    }

    return generatedBuildings;
  }
}