import type { AIRevealEntry } from "../game/ai/reveal/AIRevealEntry";

type RevealContributionView = {
  finalPopulation?: number;
  basePopulation?: number;
  synergyPopulationBonus?: number;

  finalAttraction?: number;
  baseAttraction?: number;
  synergyAttractionBonus?: number;

  populationCapacity?: number;
  wastedPopulation?: number;
};

export class AIRevealDisplay {
  private readonly container: HTMLDivElement;

  constructor() {
    const stack = this.getOrCreateSummaryStack();

    this.container = document.createElement("div");
    this.container.id = "ai-reveal-display";
    this.container.className =
      "os-side-summary-panel os-ai-reveal-panel";

    this.container.style.display = "none";

    this.container.addEventListener(
      "wheel",
      (event) => {
        event.stopPropagation();
      },
      { passive: true }
    );

    this.container.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });

    stack.appendChild(this.container);
  }

  public show(entries: AIRevealEntry[]): void {
    this.container.innerHTML = "";

    const title = document.createElement("div");
    title.textContent = "Mamo's Turn Summary";
    title.className = "os-side-summary-title";

    this.container.appendChild(title);

    if (entries.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "Nothing this turn.";
      empty.className = "os-ai-reveal-empty";

      this.container.appendChild(empty);
      this.container.style.display = "block";
      return;
    }

    const list = document.createElement("div");
    list.className = "os-ai-reveal-list";

    let totalPopulationGain = 0;
    let totalAttractionGain = 0;
    let totalCapacityGain = 0;

    for (const entry of entries) {
      const instance = entry.instance;
      const contribution =
        entry.contribution as RevealContributionView;

      const building = instance.building;

      const finalPopulation = contribution.finalPopulation ?? 0;
      const finalAttraction = contribution.finalAttraction ?? 0;
      const populationCapacity = contribution.populationCapacity ?? 0;

      totalPopulationGain += finalPopulation;
      totalAttractionGain += finalAttraction;
      totalCapacityGain += populationCapacity;

      const row = document.createElement("div");
      row.className = "os-ai-reveal-row";

      const buildingName = document.createElement("div");
      buildingName.textContent = building.name;
      buildingName.className = "os-ai-reveal-building-name";

      const values = document.createElement("div");
      values.className = "os-ai-reveal-values";

      const populationPill = document.createElement("div");
      populationPill.className =
        "os-ai-reveal-pill os-ai-reveal-pill-population";
      populationPill.textContent =
        `${finalPopulation} POP${this.formatPopulationBreakdown(contribution)}`;

      const attractionPill = document.createElement("div");
      attractionPill.className =
        "os-ai-reveal-pill os-ai-reveal-pill-attraction";
      attractionPill.textContent =
        `${finalAttraction} ATT${this.formatAttractionBreakdown(contribution)}`;
      
      const capacityPill = document.createElement("div");
      capacityPill.className =
        "os-ai-reveal-pill os-ai-reveal-pill-capacity";
      capacityPill.textContent = `${populationCapacity} CAP`;

      if (finalPopulation !== 0) {
        values.appendChild(populationPill);
      }

      if (finalAttraction !== 0) {
        values.appendChild(attractionPill);
      }

      if (populationCapacity !== 0) {
        values.appendChild(capacityPill);
      }

      row.appendChild(buildingName);
      row.appendChild(values);

      list.appendChild(row);
    }

    const bilan = document.createElement("div");
    bilan.className = "os-ai-reveal-bilan";

    const bilanTitle = document.createElement("div");
    bilanTitle.textContent = "Turn Total";
    bilanTitle.className = "os-ai-reveal-bilan-title";

    const bilanValues = document.createElement("div");
    bilanValues.className = "os-ai-reveal-bilan-values";

    const totalPopulation = document.createElement("div");
    totalPopulation.className =
      "os-ai-reveal-pill os-ai-reveal-pill-population";
    totalPopulation.textContent = `Total: ${totalPopulationGain} POP`;

    const totalAttraction = document.createElement("div");
    totalAttraction.className =
      "os-ai-reveal-pill os-ai-reveal-pill-attraction";
    totalAttraction.textContent = `Total: ${totalAttractionGain} ATT`;

    const totalCapacity = document.createElement("div");
    totalCapacity.className =
      "os-ai-reveal-pill os-ai-reveal-pill-capacity";
    totalCapacity.textContent = `Total: ${totalCapacityGain} CAP`;

    bilanValues.appendChild(totalPopulation);
    bilanValues.appendChild(totalAttraction);
    bilanValues.appendChild(totalCapacity);

    bilan.appendChild(bilanTitle);
    bilan.appendChild(bilanValues);

    this.container.appendChild(list);
    this.container.appendChild(bilan);

    this.container.style.display = "block";
  }

  public hide(): void {
    this.container.style.display = "none";
  }

  private formatPopulationBreakdown(
    contribution: RevealContributionView
  ): string {
    const basePopulation = contribution.basePopulation ?? 0;
    const synergyPopulationBonus =
      contribution.synergyPopulationBonus ?? 0;

    if (synergyPopulationBonus === 0) {
      return "";
    }

    return ` (${basePopulation} + ${synergyPopulationBonus})`;
  }

  private formatAttractionBreakdown(
    contribution: RevealContributionView
  ): string {
    const baseAttraction = contribution.baseAttraction ?? 0;
    const synergyAttractionBonus =
      contribution.synergyAttractionBonus ?? 0;

    if (synergyAttractionBonus === 0) {
      return "";
    }

    return ` (${baseAttraction} + ${synergyAttractionBonus})`;
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