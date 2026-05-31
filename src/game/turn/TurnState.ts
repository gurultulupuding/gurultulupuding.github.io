export type TurnActor = "player" | "ai";

export type TurnPhase =
  | "pack-selection"
  | "placement"
  | "ai-reveal";

export class TurnState {
  private currentTurn = 1;
  private readonly maxTurns: number;
  private currentActor: TurnActor = "player";
  private currentPhase: TurnPhase = "pack-selection";
  private gameOver = false;

  constructor(maxTurns: number = 15) {
    this.maxTurns = maxTurns;
  }

  public getCurrentTurn(): number {
    return this.currentTurn;
  }

  public getMaxTurns(): number {
    return this.maxTurns;
  }

  public getCurrentActor(): TurnActor {
    return this.currentActor;
  }

  public getCurrentPhase(): TurnPhase {
    return this.currentPhase;
  }

  public isGameOver(): boolean {
    return this.gameOver;
  }

  public markGameOver(): void {
    this.gameOver = true;
  }

  public setActor(actor: TurnActor): void {
    this.currentActor = actor;
  }

  public setPhase(phase: TurnPhase): void {
    this.currentPhase = phase;
  }

  public advanceToNextTurn(): void {
    if (this.currentTurn >= this.maxTurns) {
      this.gameOver = true;
      return;
    }

    this.currentTurn += 1;
    this.currentActor = "player";
    this.currentPhase = "pack-selection";
  }

  public advancePhaseOrTurn(): void {
    if (this.gameOver) {
      return;
    }

    if (this.currentActor === "player") {
      if (this.currentPhase === "pack-selection") {
        this.currentPhase = "placement";
        return;
      }

      if (this.currentPhase === "placement") {
        this.currentActor = "ai";
        this.currentPhase = "pack-selection";
        return;
      }
    }

    if (this.currentActor === "ai") {
      if (this.currentPhase === "pack-selection") {
        this.currentPhase = "placement";
        return;
      }

      if (this.currentPhase === "placement") {
        this.currentPhase = "ai-reveal";
        return;
      }

      if (this.currentPhase === "ai-reveal") {
        this.advanceToNextTurn();
        return;
      }
    }
  }
}