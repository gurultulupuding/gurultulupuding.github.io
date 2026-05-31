import type { PackDefinition } from "../packs/PackDefinition";
import { HandState } from "../hand/HandState";
import { TurnController } from "../turn/TurnController";
import { BuildingSelection } from "../../world/buildings/placements/BuildingSelection";
import { PlacementPreviewController } from "../../world/buildings/placements/PlacementPreviewController";
import { PackSelectionDisplay } from "../../ui/PackSelectionDisplay";
import { HandDisplay } from "../../ui/HandDisplay";
import { PackSelectionResolver } from "../packs/PackSelectionResolver";
import type { HandCardInstance } from "../hand/HandCardInstance";

export class PlayerTurnController {
  private readonly turnController: TurnController;
  private readonly handState: HandState;
  private readonly handDisplay: HandDisplay;
  private readonly packSelectionDisplay: PackSelectionDisplay;
  private readonly previewController: PlacementPreviewController;
  private readonly packSelectionResolver: PackSelectionResolver;
  private readonly onCardSelected?: () => void;
  private readonly onCardDeselected?: () => void;

  private selectedPack: PackDefinition | null = null;
  private selectedBuilding: BuildingSelection | null = null;
  private selectedCard: HandCardInstance | null = null;

  constructor(
    turnController: TurnController,
    handState: HandState,
    handDisplay: HandDisplay,
    packSelectionDisplay: PackSelectionDisplay,
    previewController: PlacementPreviewController,
    packSelectionResolver: PackSelectionResolver,
    onCardSelected?: () => void,
    onCardDeselected?: () => void
  ) {
    this.turnController = turnController;
    this.handState = handState;
    this.handDisplay = handDisplay;
    this.packSelectionDisplay =
      packSelectionDisplay;

    this.previewController =
      previewController;

    this.packSelectionResolver =
      packSelectionResolver;

    this.onCardSelected =
      onCardSelected;

    this.onCardDeselected =
      onCardDeselected;
  }

  public initialize(): void {
    this.packSelectionDisplay.setOnPackSelected((pack) => {
      this.handlePackSelected(pack);
    });

    this.handDisplay.setOnCardSelected((card) => {
      this.handleCardSelected(card);
    });
  }

  public getSelectedBuilding(): BuildingSelection | null {
    return this.selectedBuilding;
  }

  public getSelectedPack(): PackDefinition | null {
    return this.selectedPack;
  }

  public clearSelectedPack(): void {
    this.selectedPack = null;
  }

  public clearSelectedBuilding(): void {
    this.selectedBuilding = null;
    this.selectedCard = null;
    this.handDisplay.clearSelection();
    this.previewController.clearCurrentPreview();
  }

  public clearSelections(): void {
    this.selectedPack = null;
    this.selectedBuilding = null;
    this.selectedCard = null;
    this.handDisplay.clearSelection();
    this.previewController.clearCurrentPreview();
  }

  public consumeSelectedBuildingAfterPlacement(): void {
    const selectedCard = this.selectedCard;

    if (!selectedCard) {
      return;
    }

    this.handState.removeCardById(selectedCard.id);

    if (this.handState.isEmpty()) {
      this.handDisplay.hide();
    } else {
      this.handDisplay.show(this.handState.getCards());
    }

    this.selectedCard = null;
    this.selectedBuilding = null;
    this.handDisplay.clearSelection();
    this.previewController.clearCurrentPreview();
  }

  private handlePackSelected(pack: PackDefinition): void {
    this.selectedPack = pack;

    const generatedBuildings =
      this.packSelectionResolver.resolvePackIntoHand(
        pack,
        this.handState
      );

    this.handDisplay.clearSelection();
    this.selectedBuilding = null;

    this.packSelectionDisplay.hide();
    this.turnController.setPhase("placement");

    console.log("Selected pack:", pack);
    console.log("Generated player hand buildings:", generatedBuildings);
    console.log("Player hand buildings:", this.handState.getBuildings());
  }

  private handleCardSelected(
    card: HandCardInstance | null
  ): void {
    if (card === null) {
      this.selectedCard = null;
      this.selectedBuilding = null;

      this.previewController
        .clearCurrentPreview();

      this.onCardDeselected?.();

      console.log("Hand card deselected.");
      return;
    }

    this.selectedCard = card;

    this.selectedBuilding =
      new BuildingSelection(
        card.building
      );

    this.previewController
      .refreshPreview();

    this.onCardSelected?.();

    console.log(
      "Selected hand card:",
      card
    );

    console.log(
      "Selected building from hand:",
      card.building
    );
  }
}