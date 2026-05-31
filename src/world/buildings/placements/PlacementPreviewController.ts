import "@babylonjs/core/Culling/ray";

import { Scene } from "@babylonjs/core/scene";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GridModel } from "../../grid/GridModel";
import { BuildingSelection } from "./BuildingSelection";
import { getFootprintCellsAt } from "../footprint/FootprintUtils";
import { validateFootprintPlacement } from "./PlacementValidation";
import { createFlatColorMaterial } from "../../rendering/MaterialFactory";
import { BuildingGhostPreviewRenderer } from "../../rendering/BuildingGhostPreviewRenderer";
import { PreviewSynergyFeedbackController } from "../../../game/scoring/synergy/preview/PreviewSynergyFeedbackController";

export class PlacementPreviewController {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly getSelectedBuilding: () => BuildingSelection | null;

  private hoveredCell: { row: number; col: number } | null = null;
  private previewMeshes: Mesh[] = [];

  private readonly validMaterial: StandardMaterial;
  private readonly invalidMaterial: StandardMaterial;

  private readonly ghostPreviewRenderer: BuildingGhostPreviewRenderer;

  private readonly synergyFeedbackController: PreviewSynergyFeedbackController;
  private readonly getCurrentTurn: () => number;

  private lastPointerMoveProcessTime = 0;
  private readonly pointerMoveThrottleMs = 40;

  constructor(
    scene: Scene,
    grid: GridModel,
    getSelectedBuilding: () => BuildingSelection | null,
    ghostPreviewRenderer: BuildingGhostPreviewRenderer,
    synergyFeedbackController: PreviewSynergyFeedbackController,
    getCurrentTurn: () => number
  ) {
    this.scene = scene;
    this.grid = grid;
    this.getSelectedBuilding = getSelectedBuilding;
    this.ghostPreviewRenderer = ghostPreviewRenderer;
    this.synergyFeedbackController = synergyFeedbackController;
    this.getCurrentTurn = getCurrentTurn;

    this.validMaterial = createFlatColorMaterial(
      this.scene,
      "preview-valid-material",
      new Color3(0.35, 0.85, 0.45),
      0.65
    );

    this.invalidMaterial = createFlatColorMaterial(
      this.scene,
      "preview-invalid-material",
      new Color3(0.95, 0.35, 0.35),
      0.65
    );
  }

  public initialize(): void {
    console.log("Placement preview initialized");

    this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type !== PointerEventTypes.POINTERMOVE) {
        return;
      }

      const selectedBuilding = this.getSelectedBuilding();

      if (!selectedBuilding) {
        if (this.hoveredCell !== null) {
          this.hoveredCell = null;
          this.clearPreview();
        }

        return;
      }

      const now = performance.now();

      if (now - this.lastPointerMoveProcessTime < this.pointerMoveThrottleMs) {
        return;
      }

      this.lastPointerMoveProcessTime = now;

      const pick = this.scene.pick(
        this.scene.pointerX,
        this.scene.pointerY,
        (mesh) => mesh.metadata?.isPlacementPickTile === true,
        true
      );

      if (!pick?.hit || !pick.pickedPoint) {
        if (this.hoveredCell !== null) {
          this.hoveredCell = null;
          this.clearPreview();
        }

        return;
      }

      const hoveredCell = this.grid.worldToCell(
        pick.pickedPoint.x,
        pick.pickedPoint.z
      );

      if (this.isSameCell(this.hoveredCell, hoveredCell)) {
        return;
      }

      this.hoveredCell = hoveredCell;
      this.refreshPreview();
    });
  }

  public refreshPreview(): void {
    this.clearPreview();

    if (!this.hoveredCell) {
      return;
    }

    const selectedBuilding = this.getSelectedBuilding();
    if (!selectedBuilding) {
      return;
    }

    const footprint = selectedBuilding.getCurrentFootprint();
    const occupiedCells = getFootprintCellsAt(
      footprint,
      this.hoveredCell.row,
      this.hoveredCell.col
    );

    const validation = validateFootprintPlacement(
      this.grid,
      occupiedCells,
      selectedBuilding.getBuilding()
    );
    const isValid = validation.isValid;

    for (const cell of occupiedCells) {
      const world = this.grid.cellToWorld(cell.row, cell.col);

      const mesh = MeshBuilder.CreateGround(
        `preview-${cell.row}-${cell.col}-${Math.random()}`,
        {
          width: this.grid.cellSize * 0.8,
          height: this.grid.cellSize * 0.8,
        },
        this.scene
      );

      mesh.position = new Vector3(world.x, 0.03, world.z);
      mesh.material = isValid ? this.validMaterial : this.invalidMaterial;
      mesh.isPickable = false;

      this.previewMeshes.push(mesh);
    }

    this.ghostPreviewRenderer.renderGhost(
      selectedBuilding.getBuilding(),
      selectedBuilding.getRotation(),
      occupiedCells,
      isValid
    );

    this.synergyFeedbackController.updatePreview(
      selectedBuilding.getBuilding(),
      selectedBuilding.getRotation(),
      occupiedCells,
      isValid,
      this.getCurrentTurn()
    );
  }

  private clearPreview(): void {
    for (const mesh of this.previewMeshes) {
      mesh.dispose();
    }

    this.previewMeshes = [];
    this.ghostPreviewRenderer.clear();
    this.synergyFeedbackController.clear();
  }

  public clearCurrentPreview(): void {
    this.hoveredCell = null;
    this.clearPreview();
  }

  public getHoveredCell(): { row: number; col: number } | null {
    return this.hoveredCell;
  }

  public canPlaceCurrentSelection(): boolean {
    if (!this.hoveredCell) {
      return false;
    }

    const selectedBuilding = this.getSelectedBuilding();
    if (!selectedBuilding) {
      return false;
    }

    const footprint = selectedBuilding.getCurrentFootprint();
    const occupiedCells = getFootprintCellsAt(
      footprint,
      this.hoveredCell.row,
      this.hoveredCell.col
    );

    const validation = validateFootprintPlacement(
      this.grid,
      occupiedCells,
      selectedBuilding.getBuilding()
    );
    return validation.isValid;
  }

  public getCurrentPlacementCells(): { row: number; col: number }[] {
    if (!this.hoveredCell) {
      return [];
    }

    const selectedBuilding = this.getSelectedBuilding();
    if (!selectedBuilding) {
      return [];
    }

    const footprint = selectedBuilding.getCurrentFootprint();

    return getFootprintCellsAt(
      footprint,
      this.hoveredCell.row,
      this.hoveredCell.col
    );
  }

  private isSameCell(
    first: { row: number; col: number } | null,
    second: { row: number; col: number } | null
  ): boolean {
    if (!first || !second) {
      return first === second;
    }

    return first.row === second.row && first.col === second.col;
  }
}