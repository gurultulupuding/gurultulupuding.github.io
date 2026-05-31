import type { HandCardInstance } from "../game/hand/HandCardInstance";
import {
  createBuildingShapeLines,
  createBuildingValuePills,
  createValuePillElement,
  getFamilyVisualInfo,
} from "./BuildingCardUI";

export class HandDisplay {
  private readonly container: HTMLDivElement;
  private selectedCardId: string | null = null;
  private onCardSelected?: (card: HandCardInstance | null) => void;
  private readonly wrapper: HTMLDivElement;
  private readonly limitLabel: HTMLDivElement;
  private maxCards: number | null = null;
  private isPointerInsideHandArea = false;

  constructor() {
    this.wrapper = document.createElement("div");
    this.wrapper.id = "hand-display-wrapper";
    this.wrapper.className = "os-hand-wrapper";

    this.limitLabel = document.createElement("div");
    this.limitLabel.id = "hand-limit-label";
    this.limitLabel.className = "os-hand-limit-label";

    this.container = document.createElement("div");
    this.container.id = "hand-display";
    this.container.className = "os-hand-card-row";

    this.container.addEventListener("pointerenter", () => {
      this.isPointerInsideHandArea = true;
      this.wrapper.classList.add("os-hand-wrapper-expanded");
    });

    this.container.addEventListener("pointerleave", () => {
      this.isPointerInsideHandArea = false;

      if (this.selectedCardId === null) {
        this.wrapper.classList.remove("os-hand-wrapper-expanded");
      }
    });

    this.wrapper.appendChild(this.container);

    document.body.appendChild(this.limitLabel);
    document.body.appendChild(this.wrapper);
  }

  public setOnCardSelected(
    callback: (card: HandCardInstance | null) => void
  ): void {
    this.onCardSelected = callback;
  }

  public clearSelection(): void {
    this.selectedCardId = null;
    this.syncSelectedCardVisuals();
  }

  public show(cards: HandCardInstance[]): void {
    this.container.innerHTML = "";
    this.wrapper.style.display = "flex";
    this.container.style.display = "flex";

    this.wrapper.classList.toggle(
      "os-hand-wrapper-expanded",
      this.selectedCardId !== null || this.isPointerInsideHandArea
    );

    this.updateLimitLabel(cards.length);

    for (const cardInstance of cards) {
      const card = this.createCard(cardInstance);
      this.container.appendChild(card);
    }
  }

  public hide(): void {
    this.wrapper.style.display = "none";
    this.container.style.display = "none";
    this.limitLabel.style.display = "none";

    this.selectedCardId = null;
    this.isPointerInsideHandArea = false;
    this.wrapper.classList.remove("os-hand-wrapper-expanded");
  }

  public clear(): void {
    this.selectedCardId = null;
    this.isPointerInsideHandArea = false;

    this.container.innerHTML = "";
    this.container.style.display = "none";
    this.limitLabel.style.display = "none";
    this.wrapper.style.display = "none";

    this.wrapper.classList.remove("os-hand-wrapper-expanded");
  }

  public setHandLimit(maxCards: number): void {
    this.maxCards = maxCards;
  }

  private createCard(
    cardInstance: HandCardInstance
  ): HTMLButtonElement {
    const building = cardInstance.building;
    const visual = getFamilyVisualInfo(building.family);
    const isSelected = this.selectedCardId === cardInstance.id;

    const card = document.createElement("button");
    card.type = "button";
    card.className =
      `os-hand-card ${visual.className}` +
      (isSelected ? " os-hand-card-selected" : "");
    card.dataset.cardId = cardInstance.id;

    const stopCardPointerEvent = (event: Event): void => {
      event.preventDefault();
      event.stopPropagation();

      if ("stopImmediatePropagation" in event) {
        event.stopImmediatePropagation();
      }
    };

    card.addEventListener("pointerdown", stopCardPointerEvent, {
      capture: true,
    });

    card.addEventListener("pointerup", stopCardPointerEvent, {
      capture: true,
    });

    card.addEventListener("mousedown", stopCardPointerEvent, {
      capture: true,
    });

    card.addEventListener("mouseup", stopCardPointerEvent, {
      capture: true,
    });

    card.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        if ("stopImmediatePropagation" in event) {
          event.stopImmediatePropagation();
        }

        const isAlreadySelected = this.selectedCardId === cardInstance.id;

        if (isAlreadySelected) {
          this.selectedCardId = null;
          this.isPointerInsideHandArea = true;
          this.syncSelectedCardVisuals();
          this.onCardSelected?.(null);
          return;
        }

        this.selectedCardId = cardInstance.id;
        this.isPointerInsideHandArea = true;
        this.syncSelectedCardVisuals();
        this.onCardSelected?.(cardInstance);
        },
      {
        capture: true,
      }
    );

    const title = document.createElement("div");
    title.textContent = building.name;
    title.className = "os-hand-card-title";

    const collapsedHint = document.createElement("div");
    collapsedHint.textContent = visual.label;
    collapsedHint.className = "os-hand-card-collapsed-hint";

    const details = document.createElement("div");
    details.className = "os-hand-card-details";

    const values = document.createElement("div");
    values.className = "os-hand-card-values";

    const valuePills = createBuildingValuePills(building);

    for (const pill of valuePills) {
      values.appendChild(createValuePillElement(pill));
    }

    const ruleList = document.createElement("div");
    ruleList.className = "os-hand-card-rule-list";

    for (const line of createBuildingShapeLines(building)) {
      const rule = document.createElement("div");
      rule.className = "os-hand-card-rule";
      rule.textContent = line;

      ruleList.appendChild(rule);
    }

    const familyLabel = document.createElement("div");
    familyLabel.textContent = visual.label;
    familyLabel.className = "os-hand-card-family-label";

    details.appendChild(values);
    details.appendChild(ruleList);
    details.appendChild(familyLabel);

    card.appendChild(title);
    card.appendChild(collapsedHint);
    card.appendChild(details);

    return card;
  }

  private updateLimitLabel(cardCount: number): void {
    if (this.maxCards === null) {
      this.limitLabel.style.display = "none";
      return;
    }

    this.limitLabel.style.display = "block";
    this.limitLabel.textContent = `Hand: ${cardCount} / ${this.maxCards}`;

    this.limitLabel.classList.toggle(
      "os-hand-limit-over",
      cardCount > this.maxCards
    );
  }

  private syncSelectedCardVisuals(): void {
    const cards = this.container.querySelectorAll<HTMLButtonElement>(
      ".os-hand-card"
    );

    for (const card of cards) {
      const cardId = card.dataset.cardId;

      card.classList.toggle(
        "os-hand-card-selected",
        cardId === this.selectedCardId
      );
    }

    this.wrapper.classList.toggle(
      "os-hand-wrapper-expanded",
      this.selectedCardId !== null || this.isPointerInsideHandArea
    );
  }
}