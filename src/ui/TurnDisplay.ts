import type { TurnActor, TurnPhase } from "../game/turn/TurnState";

export class TurnDisplay {
  private readonly element: HTMLDivElement;

  constructor() {
    this.element = document.createElement("div");
    this.element.id = "turn-display";
    this.element.className = "os-hud-panel os-hud-turn os-hud-turn-value";

    this.element.textContent = "Turn 1";

    document.body.appendChild(this.element);
  }

  public update(
    turn: number,
    _actor: TurnActor,
    _phase: TurnPhase
  ): void {
    this.element.textContent = `Turn ${turn}`;
  }
}