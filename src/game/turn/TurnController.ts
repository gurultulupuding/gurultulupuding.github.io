import { TurnState, type TurnPhase } from "./TurnState";
import { TurnDisplay } from "../../ui/TurnDisplay";
import { EndTurnButton } from "../../ui/EndTurnButton";

export interface PlayerAdvanceRequestOptions {
  bypassEndTurnGuard?: boolean;
}

export class TurnController {
  private readonly turnState: TurnState;
  private readonly turnDisplay: TurnDisplay;
  private readonly endTurnButton: EndTurnButton;
  private readonly onTurnStateChanged?: (turnState: TurnState) => void;
  private onSeeResultsRequested?: () => void;
  private seeResultsMode = false;
  private beforePlayerAdvanceRequested?: () => boolean;
  private readonly onTurnActionButtonClicked?: () => void;

  constructor(
    onTurnStateChanged?: (turnState: TurnState) => void,
    onTurnActionButtonClicked?: () => void
  ) {
    this.turnState = new TurnState();
    this.turnDisplay = new TurnDisplay();

    this.onTurnStateChanged =
      onTurnStateChanged;

    this.onTurnActionButtonClicked =
      onTurnActionButtonClicked;

    this.endTurnButton = new EndTurnButton(() => {
      this.handleEndTurn();
    });
  }

  public initialize(): void {
    this.refreshDisplay();
    this.notifyTurnStateChanged();
  }

  public setBeforePlayerAdvanceRequested(
    callback: () => boolean
  ): void {
    this.beforePlayerAdvanceRequested = callback;
  }

  public getTurnState(): TurnState {
    return this.turnState;
  }

  private handleEndTurn(): void {
    if (this.seeResultsMode) {
      this.onTurnActionButtonClicked?.();
      this.onSeeResultsRequested?.();
      return;
    }

    const actor =
      this.turnState.getCurrentActor();

    const phase =
      this.turnState.getCurrentPhase();

    if (
      actor === "player" &&
      phase === "placement"
    ) {
      const didAdvance =
        this.requestAdvanceFromPlayer();

      if (didAdvance) {
        this.onTurnActionButtonClicked?.();
      }

      return;
    }

    if (
      actor === "ai" &&
      phase === "ai-reveal"
    ) {
      this.onTurnActionButtonClicked?.();
      this.requestContinueFromAIReveal();
    }
  }

  public requestAdvanceFromPlayer(
    options: PlayerAdvanceRequestOptions = {}
  ): boolean {
    if (this.turnState.getCurrentActor() !== "player") {
      return false;
    }

    if (
      !options.bypassEndTurnGuard &&
      this.beforePlayerAdvanceRequested
    ) {
      const canAdvance =
        this.beforePlayerAdvanceRequested();

      if (!canAdvance) {
        return false;
      }
    }

    this.advanceState();

    return true;
  }

  public requestAdvanceFromAI(): void {
    if (this.turnState.getCurrentActor() !== "ai") {
      return;
    }

    this.advanceState();
  }

  public requestContinueFromAIReveal(): void {
    if (
      this.turnState.getCurrentActor() !== "ai" ||
      this.turnState.getCurrentPhase() !== "ai-reveal"
    ) {
      return;
    }

    this.advanceState();
  }

  private advanceState(): void {
    if (this.turnState.isGameOver()) {
      return;
    }

    this.turnState.advancePhaseOrTurn();

    this.refreshDisplay();

    console.log(
      "Turn advanced:",
      this.turnState.getCurrentTurn(),
      this.turnState.getCurrentActor(),
      this.turnState.getCurrentPhase()
    );

    this.notifyTurnStateChanged();
  }

  private refreshDisplay(): void {
    this.turnDisplay.update(
      this.turnState.getCurrentTurn(),
      this.turnState.getCurrentActor(),
      this.turnState.getCurrentPhase()
    );

    this.refreshEndTurnButton();
  }

  private refreshEndTurnButton(): void {
    if (this.turnState.isGameOver()) {
      this.endTurnButton.show();
      this.endTurnButton.setDisabled(true);
      this.endTurnButton.setText("Game Over");
      return;
    }

    if (this.seeResultsMode) {
      this.endTurnButton.show();
      this.endTurnButton.setDisabled(false);
      this.endTurnButton.setText("See Results");
      return;
    }

    const actor = this.turnState.getCurrentActor();
    const phase = this.turnState.getCurrentPhase();

    const canPlayerEndTurn = actor === "player" && phase === "placement";

    if (canPlayerEndTurn) {
      this.endTurnButton.show();
      this.endTurnButton.setDisabled(false);
      this.endTurnButton.setText("End Turn");
      return;
    }

    const canContinueFromAIReveal =
      actor === "ai" && phase === "ai-reveal";

    if (canContinueFromAIReveal) {
      this.endTurnButton.show();
      this.endTurnButton.setDisabled(false);
      this.endTurnButton.setText("Next Turn");
      return;
    }

    this.endTurnButton.hide();
    this.endTurnButton.setDisabled(true);
  }

  private notifyTurnStateChanged(): void {
    this.onTurnStateChanged?.(this.turnState);
  }

  public disableEndTurnButton(): void {
    this.endTurnButton.setDisabled(true);
  }

  public enableEndTurnButton(): void {
    this.endTurnButton.setDisabled(false);
  }

  public setPhase(phase: TurnPhase): void {
    this.turnState.setPhase(phase);
    this.refreshDisplay();
    this.notifyTurnStateChanged();
  }

  public isGameOver(): boolean {
    return this.turnState.isGameOver();
  }

  public markGameOver(): void {
    if (this.turnState.isGameOver()) {
      return;
    }

    this.seeResultsMode = false;
    this.onSeeResultsRequested = undefined;

    this.turnState.markGameOver();
    this.refreshDisplay();
    this.notifyTurnStateChanged();
  }

  public enterSeeResultsMode(onSeeResultsRequested: () => void): void {
    this.seeResultsMode = true;
    this.onSeeResultsRequested = onSeeResultsRequested;
    this.refreshDisplay();
  }
}