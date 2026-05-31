export class EndTurnButton {
  private readonly button: HTMLButtonElement;

  constructor(onClick: () => void) {
    this.button = document.createElement("button");
    this.button.id = "end-turn-button";
    this.button.type = "button";
    this.button.textContent = "End Turn";
    this.button.className = "os-button os-small-button";

    this.button.style.position = "fixed";
    this.button.style.bottom = "16px";
    this.button.style.right = "16px";
    this.button.style.zIndex = "1000";

    this.button.addEventListener("click", onClick);

    document.body.appendChild(this.button);
  }

  public setDisabled(disabled: boolean): void {
    this.button.disabled = disabled;
  }

  public setText(text: string): void {
    this.button.textContent = text;
  }

  public show(): void {
    this.button.style.display = "block";
  }

  public hide(): void {
    this.button.style.display = "none";
  }
}