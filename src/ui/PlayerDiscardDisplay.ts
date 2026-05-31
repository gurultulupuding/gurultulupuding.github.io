import type { HandCardInstance } from "../game/hand/HandCardInstance";
import {
  createBuildingValuePills,
  createValuePillElement,
  getFamilyVisualInfo,
} from "./BuildingCardUI";

export class PlayerDiscardDisplay {
  private readonly container: HTMLDivElement;
  private readonly selectedCardIds = new Set<string>();

  private readonly onCardSelected?: () => void;
  private readonly onCardDeselected?: () => void;

  private onConfirmed?: (
    discardedCardIds: string[]
  ) => void;

  private visible = false;

  constructor(
    onCardSelected?: () => void,
    onCardDeselected?: () => void
  ) {
    this.onCardSelected =
      onCardSelected;

    this.onCardDeselected =
      onCardDeselected;

    this.container =
      document.createElement("div");

    this.container.id =
      "player-discard-display";

    this.container.className =
      "os-discard-panel";

    document.body.appendChild(
      this.container
    );
  }

  public setOnConfirmed(
    callback: (
      discardedCardIds: string[]
    ) => void
  ): void {
    this.onConfirmed = callback;
  }

  public show(
    cards: HandCardInstance[],
    discardCount: number
  ): void {
    this.selectedCardIds.clear();
    this.container.innerHTML = "";

    const title =
      document.createElement("div");

    title.textContent =
      "Discard Cards";

    title.className =
      "os-discard-title";

    const subtitle =
      document.createElement("div");

    subtitle.textContent =
      `Choose ${discardCount} card(s) to discard before ending your turn.`;

    subtitle.className =
      "os-discard-subtitle";

    const cardList =
      document.createElement("div");

    cardList.className =
      "os-discard-card-list";

    const confirmButton =
      document.createElement("button");

    confirmButton.type =
      "button";

    confirmButton.textContent =
      `Confirm Discard 0 / ${discardCount}`;

    confirmButton.disabled = true;

    confirmButton.className =
      "os-button os-discard-confirm-button";

    const refreshConfirmButton =
      (): void => {
        const selectedCount =
          this.selectedCardIds.size;

        confirmButton.textContent =
          `Confirm Discard ${selectedCount} / ${discardCount}`;

        confirmButton.disabled =
          selectedCount !== discardCount;
      };

    for (const cardInstance of cards) {
      const cardButton =
        this.createCardButton(
          cardInstance,
          discardCount,
          refreshConfirmButton
        );

      cardList.appendChild(
        cardButton
      );
    }

    confirmButton.addEventListener(
      "click",
      () => {
        if (
          this.selectedCardIds.size !==
          discardCount
        ) {
          return;
        }

        this.onConfirmed?.([
          ...this.selectedCardIds,
        ]);
      }
    );

    this.container.appendChild(title);
    this.container.appendChild(subtitle);
    this.container.appendChild(cardList);

    this.container.appendChild(
      confirmButton
    );

    this.visible = true;

    this.container.style.display =
      "block";
  }

  public hide(): void {
    this.visible = false;

    this.container.style.display =
      "none";
  }

  public isVisible(): boolean {
    return this.visible;
  }

  private createCardButton(
    cardInstance: HandCardInstance,
    discardCount: number,
    refreshConfirmButton: () => void
  ): HTMLButtonElement {
    const building =
      cardInstance.building;

    const visual =
      getFamilyVisualInfo(
        building.family
      );

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      `os-discard-card ${visual.className}`;

    const title =
      document.createElement("div");

    title.textContent =
      building.name;

    title.className =
      "os-discard-card-title";

    const values =
      document.createElement("div");

    values.className =
      "os-discard-card-values";

    for (
      const pill of
      createBuildingValuePills(building)
    ) {
      values.appendChild(
        createValuePillElement(pill)
      );
    }

    button.appendChild(title);
    button.appendChild(values);

    const refreshVisual =
      (): void => {
        const selected =
          this.selectedCardIds.has(
            cardInstance.id
          );

        button.classList.toggle(
          "os-discard-card-selected",
          selected
        );
      };

    button.addEventListener(
      "click",
      () => {
        if (
          this.selectedCardIds.has(
            cardInstance.id
          )
        ) {
          this.selectedCardIds.delete(
            cardInstance.id
          );

          refreshVisual();
          refreshConfirmButton();

          this.onCardDeselected?.();

          return;
        }

        if (
          this.selectedCardIds.size >=
          discardCount
        ) {
          return;
        }

        this.selectedCardIds.add(
          cardInstance.id
        );

        refreshVisual();
        refreshConfirmButton();

        this.onCardSelected?.();
      }
    );

    refreshVisual();

    return button;
  }
}