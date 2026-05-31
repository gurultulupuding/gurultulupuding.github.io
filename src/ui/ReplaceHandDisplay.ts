export class ReplaceHandDisplay {
  private readonly button: HTMLButtonElement;
  private onClicked?: () => void;

  private usesLeft = 0;
  private enabled = false;

  constructor() {
    this.button = document.createElement("button");
    this.button.id = "replace-hand-button";
    this.button.type = "button";
    this.button.className = "os-button os-replace-hand-button";

    this.button.style.position = "fixed";
    this.button.style.left = "16px";
    this.button.style.bottom = "150px";
    this.button.style.zIndex = "1200";
    this.button.style.pointerEvents = "auto";

    this.button.addEventListener("click", () => {
      if (!this.enabled) {
        return;
      }

      this.onClicked?.();
    });

    document.body.appendChild(this.button);

    this.render();
  }

  public setOnClicked(callback: () => void): void {
    this.onClicked = callback;
  }

  public update(usesLeft: number, enabled: boolean): void {
    this.usesLeft = usesLeft;
    this.enabled = enabled;
    this.render();
  }

  public show(): void {
    this.button.style.display = "block";
  }

  public hide(): void {
    this.button.style.display = "none";
  }

  private render(): void {
    this.button.textContent = `Replace\nHand\n${this.usesLeft}`;

    this.button.disabled = !(this.enabled && this.usesLeft > 0);
  }
}