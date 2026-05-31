import type { BuildingDefinition } from "../../world/buildings/definitions/BuildingDefinition";
import { HandState } from "./HandState";

export class HandReplacementService {
  private readonly buildingPool: BuildingDefinition[];

  constructor(buildingPool: BuildingDefinition[]) {
    this.buildingPool = buildingPool;
  }

  public replaceHandWithRandomBuildings(handState: HandState): BuildingDefinition[] {
    const currentCardCount = handState.getCards().length;

    if (currentCardCount <= 0) {
      return [];
    }

    const newBuildings = this.drawRandomBuildings(currentCardCount);
    handState.replaceBuildings(newBuildings);

    return newBuildings;
  }

  private drawRandomBuildings(count: number): BuildingDefinition[] {
    if (this.buildingPool.length === 0) {
      return [];
    }

    const buildings: BuildingDefinition[] = [];

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * this.buildingPool.length);
      buildings.push(this.buildingPool[randomIndex]);
    }

    return buildings;
  }
}