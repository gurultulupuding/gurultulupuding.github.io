import type { AttractionMigrationResult } from "../game/attraction/AttractionMigrationResolver";

export class AttractionMigrationDisplay {
  private readonly container: HTMLDivElement;

  constructor() {
    const stack = this.getOrCreateSummaryStack();

    this.container = document.createElement("div");
    this.container.id = "attraction-migration-display";
    this.container.className =
      "os-side-summary-panel os-attraction-migration-panel";

    this.container.style.display = "none";

    stack.appendChild(this.container);
  }

  public show(result: AttractionMigrationResult): void {
    this.container.innerHTML = "";

    const title = document.createElement("div");
    title.textContent = "Attraction shift";
    title.className = "os-side-summary-title";

    const message = document.createElement("div");
    message.className = "os-side-summary-message";

    const detail = document.createElement("div");
    detail.className = "os-side-summary-detail";

    if (result.amount <= 0 || !result.from || !result.to) {
      message.textContent = "No population shifted.";
      detail.textContent = `Attraction difference: ${result.attractionDifference}`;
    } else {
      const fromLabel = this.formatOwner(result.from);
      const toLabel = this.formatOwner(result.to);

      message.textContent =
        `${toLabel} attracted ${result.amount} population from ${fromLabel}.`;

      detail.textContent =
        `Attraction difference: ${result.attractionDifference}`;
    }

    this.container.appendChild(title);
    this.container.appendChild(message);
    this.container.appendChild(detail);

    this.container.style.display = "block";
  }

  public hide(): void {
    this.container.style.display = "none";
  }

  private formatOwner(owner: "player" | "ai"): string {
    return owner === "player" ? "Garmiyo" : "Garmamo";
  }

  private getOrCreateSummaryStack(): HTMLDivElement {
    const existing = document.getElementById("os-turn-summary-stack");

    if (existing instanceof HTMLDivElement) {
      return existing;
    }

    const stack = document.createElement("div");
    stack.id = "os-turn-summary-stack";
    stack.className = "os-turn-summary-stack";

    document.body.appendChild(stack);

    return stack;
  }
}