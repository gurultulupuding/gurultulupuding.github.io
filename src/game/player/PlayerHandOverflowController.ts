import { HandState } from "../hand/HandState";
import { HandLimitResolver } from "../hand/HandLimitResolver";
import { HandDisplay } from "../../ui/HandDisplay";
import { PlayerDiscardDisplay } from "../../ui/PlayerDiscardDisplay";
import { TurnController } from "../turn/TurnController";

export class PlayerHandOverflowController {
  private readonly playerHandState:
    HandState;

  private readonly handLimitResolver:
    HandLimitResolver;

  private readonly handDisplay:
    HandDisplay;

  private readonly playerDiscardDisplay:
    PlayerDiscardDisplay;

  private readonly turnController:
    TurnController;

  private readonly onDiscardFlowStarted:
    () => void;

  private readonly onDiscardFlowCompleted:
    () => void;

  private readonly onDiscardConfirmed?:
    () => void;

  private discardInProgress = false;

  constructor(
    playerHandState: HandState,
    handLimitResolver: HandLimitResolver,
    handDisplay: HandDisplay,
    playerDiscardDisplay: PlayerDiscardDisplay,
    turnController: TurnController,
    onDiscardFlowStarted: () => void,
    onDiscardFlowCompleted: () => void,
    onDiscardConfirmed?: () => void
  ) {
    this.playerHandState =playerHandState;
    this.handLimitResolver =handLimitResolver;
    this.handDisplay =handDisplay;
    this.playerDiscardDisplay =playerDiscardDisplay;
    this.turnController =turnController;

    this.onDiscardFlowStarted =onDiscardFlowStarted;

    this.onDiscardFlowCompleted =onDiscardFlowCompleted;

    this.onDiscardConfirmed =onDiscardConfirmed;

    this.playerDiscardDisplay
      .setOnConfirmed(
        (discardedCardIds) => {
          this.confirmDiscard(
            discardedCardIds
          );
        }
      );
  }

  public requestPlayerEndTurn(): boolean {
    if (this.discardInProgress) {
      return false;
    }

    if (!this.handLimitResolver.isOverLimit(this.playerHandState)) {
      return true;
    }

    this.openDiscardSelection();

    return false;
  }

  public isDiscardInProgress(): boolean {
    return this.discardInProgress;
  }

  private openDiscardSelection(): void {
    this.discardInProgress = true;

    this.onDiscardFlowStarted();

    const cards =this.playerHandState.getCards();

    const discardCount =this.handLimitResolver.getOverflowCount(this.playerHandState);

    this.handDisplay.hide();

    this.playerDiscardDisplay.show(cards,discardCount);
  }

  private confirmDiscard(
    discardedCardIds: string[]
  ): void {
    this.handLimitResolver.discardCardsByIds(this.playerHandState,discardedCardIds);

    this.playerDiscardDisplay.hide();

    this.discardInProgress = false;

    if (
      this.playerHandState.isEmpty()
    ) {
      this.handDisplay.hide();
    } else {
      this.handDisplay.show(
        this.playerHandState.getCards()
      );
    }

    this.onDiscardFlowCompleted();
    this.onDiscardConfirmed?.();

    console.log(
      "Player manually discarded cards:",
      discardedCardIds
    );

    this.turnController.requestAdvanceFromPlayer({bypassEndTurnGuard: true,});
  }
}