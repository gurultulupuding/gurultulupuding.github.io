import { GAME_BALANCE_CONFIG } from "../game/config/GameBalanceConfig";
import type { PackDefinition } from "../game/packs/PackDefinition";
import { TEST_BUILDING_POOL } from "../world/buildings/definitions/TestBuildingLibrary";
import { getFamilyVisualInfo } from "./BuildingCardUI";

export class PackSelectionDisplay {
  private readonly container: HTMLDivElement;
  private selectedPackId: string | null = null;
  private onPackSelected?: (pack: PackDefinition) => void;

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "pack-selection-display";
    this.container.className = "os-pack-selection";

    document.body.appendChild(this.container);
  }

  public setOnPackSelected(callback: (pack: PackDefinition) => void): void {
    this.onPackSelected = callback;
  }

  public getSelectedPackId(): string | null {
    return this.selectedPackId;
  }

  public clearSelection(): void {
    this.selectedPackId = null;
  }

  public show(packs: PackDefinition[]): void {
    this.container.innerHTML = "";
    this.container.style.display = "flex";

    for (const pack of packs) {
      const isSelected = this.selectedPackId === pack.id;
      const visual = getFamilyVisualInfo(pack.family);

      const card = document.createElement("button");
      card.type = "button";
      card.className =
        `os-pack-card ${visual.className}` +
        (isSelected ? " os-pack-card-selected" : "");

      card.addEventListener("click", () => {
        this.selectedPackId = pack.id;
        this.show(packs);
        this.onPackSelected?.(pack);
      });

      const title = document.createElement("div");
      title.textContent = visual.label;
      title.className = "os-pack-title";

      const contentHint = document.createElement("div");
      contentHint.className = "os-pack-random-label";
      contentHint.textContent =
      pack.family === "infrastructure"
        ? "Contains:"
        : `Random ${GAME_BALANCE_CONFIG.hand.cardsPerPack} of:`;

      const buildingList = document.createElement("ul");
      buildingList.className = "os-pack-building-list";

      if (pack.family === "infrastructure") {
        const mainAvenueItem = document.createElement("li");
        mainAvenueItem.className = "os-pack-building-item";
        mainAvenueItem.textContent = "3 Main Avenue";

        const roadSegmentItem = document.createElement("li");
        roadSegmentItem.className = "os-pack-building-item";
        roadSegmentItem.textContent = "3 Road Segment";

        buildingList.appendChild(mainAvenueItem);
        buildingList.appendChild(roadSegmentItem);
      } else {
        const possibleBuildings = TEST_BUILDING_POOL.filter(
          (building) => building.family === pack.family
        );

        for (const building of possibleBuildings) {
          const item = document.createElement("li");
          item.className = "os-pack-building-item";
          item.textContent = building.name;

          buildingList.appendChild(item);
        }
      }

      card.appendChild(title);
      card.appendChild(contentHint);
      card.appendChild(buildingList);

      this.container.appendChild(card);
    }
  }

  public hide(): void {
    this.container.style.display = "none";
  }
}