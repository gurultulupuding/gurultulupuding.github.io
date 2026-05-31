import type { BuildingDefinition } from "../../world/buildings/definitions/BuildingDefinition";
import { HandState } from "../hand/HandState";
import type { PackDefinition } from "./PackDefinition";
import { PackContentGenerator } from "./PackContentGenerator";

export class PackSelectionResolver {
  private readonly packContentGenerator: PackContentGenerator;
  private readonly buildingPool: BuildingDefinition[];
  private readonly cardsPerPack: number;

  constructor(
    packContentGenerator: PackContentGenerator,
    buildingPool: BuildingDefinition[],
    cardsPerPack: number = 4
  ) {
    this.packContentGenerator = packContentGenerator;
    this.buildingPool = buildingPool;
    this.cardsPerPack = cardsPerPack;
  }

  public resolvePackIntoHand(
    pack: PackDefinition,
    handState: HandState
  ): BuildingDefinition[] {
    const buildings =
      pack.offeredBuildings ??
      this.packContentGenerator.generateBuildingsForPack(
        pack,
        this.buildingPool,
        this.cardsPerPack
      );

    handState.addBuildings(buildings);

    return buildings;
  }
}