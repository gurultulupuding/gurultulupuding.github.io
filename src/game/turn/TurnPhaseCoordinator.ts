import type { PackDefinition } from "../packs/PackDefinition";
import type { TurnState } from "./TurnState";

import type { BuildingSelection } from "../../world/buildings/placements/BuildingSelection";
import { HandState } from "../hand/HandState";
import { PlacementPreviewController } from "../../world/buildings/placements/PlacementPreviewController";
import { PackSelectionDisplay } from "../../ui/PackSelectionDisplay";
import { HandDisplay } from "../../ui/HandDisplay";
import { PackOfferController } from "../packs/PackOfferController";

export class TurnPhaseCoordinator {
  private readonly packSelectionDisplay: PackSelectionDisplay;
  private readonly handDisplay: HandDisplay;
  private readonly handState: HandState;
  private readonly previewController: PlacementPreviewController;
  private readonly packOfferController: PackOfferController;

  private readonly setSelectedPack: (pack: PackDefinition | null) => void;
  private readonly setSelectedBuilding: (
    building: BuildingSelection | null
  ) => void;

  constructor(
    packSelectionDisplay: PackSelectionDisplay,
    handDisplay: HandDisplay,
    handState: HandState,
    previewController: PlacementPreviewController,
    packOfferController: PackOfferController,
    setSelectedPack: (pack: PackDefinition | null) => void,
    setSelectedBuilding: (building: BuildingSelection | null) => void
  ) {
    this.packSelectionDisplay = packSelectionDisplay;
    this.handDisplay = handDisplay;
    this.handState = handState;
    this.previewController = previewController;
    this.packOfferController = packOfferController;
    this.setSelectedPack = setSelectedPack;
    this.setSelectedBuilding = setSelectedBuilding;
  }

  public apply(turnState: TurnState): void {
    const actor = turnState.getCurrentActor();
    const phase = turnState.getCurrentPhase();

    if (actor === "player" && phase === "pack-selection") {
      this.packOfferController.refreshOffer(
        turnState.getCurrentTurn()
      );

      this.setSelectedPack(null);
      this.setSelectedBuilding(null);

      this.previewController.clearCurrentPreview();

      this.handDisplay.clearSelection();
      this.handDisplay.hide();

      this.packSelectionDisplay.clearSelection();
      this.packSelectionDisplay.show(this.packOfferController.getOfferedPacks());
      return;
    }

    if (actor === "player" && phase === "placement") {
      this.packSelectionDisplay.hide();

      if (!this.handState.isEmpty()) {
        this.handDisplay.show(this.handState.getCards());
      } else {
        this.handDisplay.hide();
      }
      return;
    }

    if (actor === "ai" && phase === "pack-selection") {
      this.setSelectedBuilding(null);
      this.previewController.clearCurrentPreview();

      this.packSelectionDisplay.hide();
      this.handDisplay.clearSelection();
      this.handDisplay.hide();
      return;
    }

    if (actor === "ai" && phase === "placement") {
      this.setSelectedBuilding(null);
      this.previewController.clearCurrentPreview();

      this.packSelectionDisplay.hide();
      this.handDisplay.clearSelection();
      this.handDisplay.hide();
    }

    if (actor === "ai" && phase === "ai-reveal") {
      this.setSelectedBuilding(null);
      this.previewController.clearCurrentPreview();

      this.packSelectionDisplay.hide();
      this.handDisplay.clearSelection();
      this.handDisplay.hide();

      console.log("AI reveal phase started.");
      return;
    }
  }
}