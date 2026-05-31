import type { BuildingDefinition } from "../definitions/BuildingDefinition";
import type { BuildingFootprint } from "../footprint/Footprint";
import { rotateFootprint, type FootprintRotation } from "../footprint/FootprintRotation";

export class BuildingSelection {
  public readonly building: BuildingDefinition;
  private rotation: FootprintRotation = 0;

  constructor(building: BuildingDefinition) {
    this.building = building;
  }

  public getRotation(): FootprintRotation {
    return this.rotation;
  }

  public getBuilding(): BuildingDefinition {
    return this.building;
  }

  public rotateClockwise(): void {
    this.rotation = this.getNextRotation(this.rotation);
  }

  public getCurrentFootprint(): BuildingFootprint {
    return rotateFootprint(this.building.footprint, this.rotation);
  }

  private getNextRotation(rotation: FootprintRotation): FootprintRotation {
    switch (rotation) {
      case 0:
        return 90;
      case 90:
        return 180;
      case 180:
        return 270;
      case 270:
        return 0;
    }
  }
}