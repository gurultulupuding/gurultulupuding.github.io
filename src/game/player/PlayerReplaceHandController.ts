import { HandState } from "../hand/HandState";
import { HandReplacementService } from "../hand/HandReplacementService";
import { HandDisplay } from "../../ui/HandDisplay";
import { ReplaceHandDisplay } from "../../ui/ReplaceHandDisplay";
import { TurnController } from "../turn/TurnController";

export class PlayerReplaceHandController {
  private readonly handState: HandState;
  private readonly handReplacementService: HandReplacementService;
  private readonly handDisplay: HandDisplay;
  private readonly replaceHandDisplay: ReplaceHandDisplay;
  private readonly turnController: TurnController;
  private readonly clearSelectedBuilding: () => void;
  private readonly isDiscardActive: () => boolean;
  private readonly onHandReplaced?: () => void;

  private usesLeft: number;

  constructor(
    handState: HandState,
    handReplacementService: HandReplacementService,
    handDisplay: HandDisplay,
    replaceHandDisplay: ReplaceHandDisplay,
    turnController: TurnController,
    maxUsesPerGame: number,
    clearSelectedBuilding: () => void,
    isDiscardActive: () => boolean,
    onHandReplaced?: () => void
  ) {
    this.handState = handState;
    this.handReplacementService = handReplacementService;
    this.handDisplay = handDisplay;
    this.replaceHandDisplay = replaceHandDisplay;
    this.turnController = turnController;
    this.usesLeft = maxUsesPerGame;
    this.clearSelectedBuilding = clearSelectedBuilding;
    this.isDiscardActive = isDiscardActive;
    this.onHandReplaced = onHandReplaced;

    this.replaceHandDisplay.setOnClicked(() => {
      this.tryReplaceHand();
    });

    this.refreshDisplayState();
  }

  public refreshDisplayState(): void {
    this.replaceHandDisplay.update(
      this.usesLeft,
      this.canReplaceHand()
    );
  }

  private tryReplaceHand(): void {
    if (!this.canReplaceHand()) {
      this.refreshDisplayState();
      return;
    }

    const newBuildings =
      this.handReplacementService.replaceHandWithRandomBuildings(
        this.handState
      );

    if (newBuildings.length === 0) {
      this.refreshDisplayState();
      return;
    }

    this.usesLeft--;

    this.clearSelectedBuilding();
    this.handDisplay.clearSelection();
    this.handDisplay.show(this.handState.getCards());

    this.refreshDisplayState();

    this.onHandReplaced?.();

    console.log(
      "Player replaced hand:",
      newBuildings
    );
  }

  private canReplaceHand(): boolean {
    if (this.usesLeft <= 0) {
      return false;
    }

    if (this.isDiscardActive()) {
      return false;
    }

    const cards = this.handState.getCards();

    if (cards.length <= 0) {
      return false;
    }

    const turnState = this.turnController.getTurnState();

    if (turnState.isGameOver()) {
      return false;
    }

    if (turnState.getCurrentActor() !== "player") {
      return false;
    }

    if (turnState.getCurrentPhase() !== "placement") {
      return false;
    }

    return true;
  }
}