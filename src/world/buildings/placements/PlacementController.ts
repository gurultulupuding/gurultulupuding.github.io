import { GridModel } from "../../grid/GridModel";
import { BuildingSelection } from "./BuildingSelection";
import { PlacementPreviewController } from "./PlacementPreviewController";

export class PlacementController {
  private readonly grid: GridModel;
  private readonly previewController: PlacementPreviewController;
  private readonly getSelectedBuilding: () => BuildingSelection | null;
  private readonly onPlacementConfirmed: (cells: { row: number; col: number }[]) => void;

  private isPlacementClickPressed = false;

  constructor(
    grid: GridModel,
    previewController: PlacementPreviewController,
    getSelectedBuilding: () => BuildingSelection | null,
    onPlacementConfirmed: (cells: { row: number; col: number }[]) => void
  ) {
    this.grid = grid;
    this.previewController = previewController;
    this.getSelectedBuilding = getSelectedBuilding;
    this.onPlacementConfirmed = onPlacementConfirmed;
  }

  public initialize(): void {
    window.addEventListener("pointerdown", this.handlePointerDown);
    window.addEventListener("pointerup", this.handlePointerUp);
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || this.isPlacementClickPressed) {
      return;
    }

    this.isPlacementClickPressed = true;

    const selectedBuilding = this.getSelectedBuilding();
    if (!selectedBuilding) {
      return;
    }

    const hoveredCell = this.previewController.getHoveredCell();
    if (!hoveredCell) {
      return;
    }

    if (!this.previewController.canPlaceCurrentSelection()) {
      console.log("Placement rejected: invalid preview position.");
        return;
    }

    const placementCells = this.previewController.getCurrentPlacementCells();
    const building = selectedBuilding.getBuilding();

    for (const cell of placementCells) {
      this.grid.setOccupied(cell.row, cell.col, true, {
        family: building.family,
        tags: building.tags,
      });
    }

    this.onPlacementConfirmed(placementCells);
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (event.button === 0) {
      this.isPlacementClickPressed = false;
    }
  };
}