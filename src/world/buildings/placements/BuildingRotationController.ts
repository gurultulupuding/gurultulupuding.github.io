import { PlacementPreviewController } from "./PlacementPreviewController";
import { PlayerTurnController } from "../../../game/player/PlayerTurnController";

export class BuildingRotationController {
  private readonly playerTurnController: PlayerTurnController;
  private readonly previewController: PlacementPreviewController;

  private isRotateKeyPressed = false;

  constructor(
    playerTurnController: PlayerTurnController,
    previewController: PlacementPreviewController
  ) {
    this.playerTurnController = playerTurnController;
    this.previewController = previewController;
  }

  public initialize(): void {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== "KeyR" || this.isRotateKeyPressed) {
      return;
    }

    const selectedBuilding = this.playerTurnController.getSelectedBuilding();
    if (!selectedBuilding) {
      return;
    }

    this.isRotateKeyPressed = true;
    selectedBuilding.rotateClockwise();
    this.previewController.refreshPreview();

    console.log(
      "Rotated building:",
      selectedBuilding.getRotation(),
      selectedBuilding.getCurrentFootprint().cells
    );
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    if (event.code === "KeyR") {
      this.isRotateKeyPressed = false;
    }
  };
}