import { GridModel } from "../../../world/grid/GridModel";
import type { BuildingDefinition } from "../../../world/buildings/definitions/BuildingDefinition";
import { BuildingSelection } from "../../../world/buildings/placements/BuildingSelection";
import { getFootprintCellsAt } from "../../../world/buildings/footprint/FootprintUtils";
import { validateFootprintPlacement } from "../../../world/buildings/placements/PlacementValidation";
import type { FootprintRotation } from "../../../world/buildings/footprint/FootprintRotation";
import type { AIPlacementPlan } from "./AIPlacementPlan";

export class AIPlacementPlanner {
  private readonly grid: GridModel;

  constructor(grid: GridModel) {
    this.grid = grid;
  }

  public findAllValidPlacements(
    building: BuildingDefinition
  ): AIPlacementPlan[] {
    const plans: AIPlacementPlan[] = [];
    const selection = new BuildingSelection(building);
    const rotations: FootprintRotation[] = [0, 90, 180, 270];

    for (const rotation of rotations) {
      this.rotateSelectionTo(selection, rotation);

      const footprint = selection.getCurrentFootprint();

      for (let row = 0; row < this.grid.rows; row++) {
        for (let col = 0; col < this.grid.cols; col++) {
          const cells = getFootprintCellsAt(footprint, row, col);
          const validation = validateFootprintPlacement(
            this.grid,
            cells,
            building
          );

          if (!validation.isValid) {
            continue;
          }

          plans.push({
            building,
            row,
            col,
            rotation,
            cells,
          });
        }
      }
    }

    return plans;
  }

  public findFirstValidPlacement(
    building: BuildingDefinition
  ): AIPlacementPlan | null {
    return this.findAllValidPlacements(building)[0] ?? null;
  }

  private rotateSelectionTo(
    selection: BuildingSelection,
    targetRotation: FootprintRotation
  ): void {
    while (selection.getRotation() !== targetRotation) {
      selection.rotateClockwise();
    }
  }
}