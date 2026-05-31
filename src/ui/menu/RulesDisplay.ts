import { GAME_BALANCE_CONFIG } from "../../game/config/GameBalanceConfig";
import type { StructureFamily } from "../../game/packs/StructureFamily";
import type { BuildingDefinition } from "../../world/buildings/definitions/BuildingDefinition";
import { TEST_BUILDING_POOL } from "../../world/buildings/definitions/TestBuildingLibrary";
import { createBuildingShapeLines, getFamilyVisualInfo } from "../BuildingCardUI";

export class RulesDisplay {
  private readonly overlay: HTMLDivElement;
  private readonly panel: HTMLDivElement;

  private onClose?: () => void;

  constructor() {
    this.overlay = document.createElement("div");
    this.overlay.id = "rules-overlay";
    this.overlay.className = "os-modal-overlay";

    this.panel = document.createElement("div");
    this.panel.className =
      "os-modal-panel os-rules-panel";

    this.overlay.appendChild(this.panel);
    document.body.appendChild(this.overlay);

    this.render();
  }

  public show(): void {
    this.overlay.style.display = "flex";
  }

  public hide(): void {
    this.overlay.style.display = "none";
  }

  public setOnClose(callback: () => void): void {
    this.onClose = callback;
  }

  private render(): void {
    this.panel.innerHTML = "";

    const title = document.createElement("div");
    title.textContent = "Rules";
    title.className = "os-modal-title";

    const content = document.createElement("div");
    content.className = "os-rules-content";

    content.appendChild(
      this.createObjectiveSection()
    );

    content.appendChild(
      this.createScoreSection()
    );

    content.appendChild(
      this.createPopulationSection()
    );

    content.appendChild(
      this.createAttractionSection()
    );

    content.appendChild(
      this.createTurnFlowSection()
    );

    content.appendChild(
      this.createPackSection()
    );

    content.appendChild(
      this.createHandManagementSection()
    );

    content.appendChild(
      this.createPlacementSection()
    );

    content.appendChild(
      this.createRoadSection()
    );

    content.appendChild(
      this.createFamilySection()
    );

    content.appendChild(
      this.createBuildingCatalogueSection()
    );

    content.appendChild(
      this.createControlsSection()
    );
    /*
    content.appendChild(
      this.createTipsSection()
    );
    */
    const closeButton =
      document.createElement("button");

    closeButton.type = "button";
    closeButton.textContent = "Close";

    closeButton.className =
      "os-button os-modal-close-button";

    closeButton.addEventListener(
      "click",
      () => {
        this.onClose?.();
        this.hide();
      }
    );

    this.panel.appendChild(title);
    this.panel.appendChild(content);
    this.panel.appendChild(closeButton);
  }

  private createObjectiveSection(): HTMLDivElement {
    const section =
      this.createSection("Objective");

    section.appendChild(
      this.createParagraph(
        "Develop Garmiyo on your shore of the river Nimro and outscore Garmamo, the rival city controlled by the AI. The match lasts 15 turns. When the final AI actions have been revealed, the city with the highest final score wins."
      )
    );

    return section;
  }

  private createScoreSection(): HTMLDivElement {
    const section =
      this.createSection("Final Score");

    const populationWeight =
      GAME_BALANCE_CONFIG
        .scoring
        .populationWeight;

    const attractionWeight =
      GAME_BALANCE_CONFIG
        .scoring
        .attractionWeight;

    section.appendChild(
      this.createFormula(
        `Final Score = (Population × ${populationWeight}) + (Attraction × ${attractionWeight})`
      )
    );

    section.appendChild(
      this.createParagraph(
        "Population and Attraction contribute directly to your final score. A balanced city is usually stronger than a city that focuses entirely on a single resource."
      )
    );

    return section;
  }

  private createPopulationSection(): HTMLDivElement {
    const section =
      this.createSection(
        "Population and Population Capacity"
      );

    section.appendChild(
      this.createParagraph(
        "Residential buildings provide Population Capacity rather than immediate Population. Industry buildings generate Population, but only when enough unused Population Capacity is already available."
      )
    );

    section.appendChild(
      this.createList([
        "A Residential building connected directly to a road provides its full listed capacity.",
        "A Residential building without direct road access provides only 50% of its listed capacity. Fractions are rounded down.",
        "Each nearby Pollution source reduces the effective capacity of a residential building by 2.",
        "Residential capacity can never fall below 0.",
        "Industry Population is resolved immediately when the industry building is placed.",
        "Industry Population exceeding your currently available capacity is permanently wasted. Adding housing later does not recover it.",
      ])
    );

    section.appendChild(
      this.createTip(
        "Plan ahead: create road-connected residential capacity before placing major industry buildings."
      )
    );

    return section;
  }

  private createAttractionSection(): HTMLDivElement {
    const section =
      this.createSection(
        "Attraction and Migration"
      );

    section.appendChild(
      this.createParagraph(
        "Culture buildings provide Attraction. Their value can increase through good urban planning or decrease when they are placed near Pollution."
      )
    );

    section.appendChild(
      this.createList([
        "Each Culture building starts with +1 Attraction.",
        "A Culture building gains +1 Attraction when directly adjacent to a Civic building..",
        "A Culture building gains +1 Attraction when directly adjacent to a road.",
        "Each Pollution source nearby causes -1 Attraction to every affected Culture building.",
      ])
    );

    section.appendChild(
      this.createSubheading(
        "MIGRATION AT THE END OF THE TURN"
      )
    );

    section.appendChild(
      this.createParagraph(
        `After the AI actions are revealed, Attraction is compared between both cities. If the difference is lower than ${GAME_BALANCE_CONFIG.attractionMigration.threshold}, no migration occurs. If the difference reaches the threshold, the more attractive city pulls Population from its rival. The transferred amount increases with the Attraction difference and is capped at ${GAME_BALANCE_CONFIG.attractionMigration.maxMigration} Population per turn.`
      )
    );

    section.appendChild(
      this.createParagraph(
        "Migration cannot remove more Population than the losing city currently has."
      )
    );

    return section;
  }

  private createTurnFlowSection(): HTMLDivElement {
    const section =
      this.createSection("Turn Flow");

    section.appendChild(
      this.createParagraph(
        "At the start of each turn, choose one of three structure-family packs. Receive the cards to your hand and place buildings on your shore. When you end your turn, AI actions are revealed, Attraction effects are resolved, and the next turn begins."
      )
    );

    section.appendChild(
      this.createNumberedList([
        "Choose one of the three offered packs.",
        "Receive the cards contained in the selected pack.",
        "Place any number of cards from your hand while legal positions remain available.",
        "Press End Turn when you are ready.",
        "If your hand contains more than three cards, discard cards until the limit is respected.",
        "The AI chooses a pack and develops Garmamo on the opposite shore.",
        "Review the revealed AI actions.",
        "Resolve Attraction-based migration.",
        "Press Next Turn to continue.",
      ])
    );

    return section;
  }

  private createPackSection(): HTMLDivElement {
    const section =
      this.createSection(
        "Pack Selection and Fairness"
      );

    section.appendChild(
      this.createParagraph(
        "Three structure-family packs are offered at the start of every turn. Both the player and the AI make their decisions from the same offer."
      )
    );

    section.appendChild(
      this.createList([
        `Residential, Industry, Civic and Culture packs each contain ${GAME_BALANCE_CONFIG.hand.cardsPerPack} randomly generated cards from their own family.`,
        "Buildings may appear more than once inside a normal pack.",
        "Infrastructure packs always contain exactly 3 Road Segments and 3 Main Avenues.",
        "Pack contents are generated when the offer appears.",
        "The AI receives the same three offered packs.",
        "If the player and AI select the same pack, both receive the same card contents.",
      ])
    );

    return section;
  }

  private createHandManagementSection(): HTMLDivElement {
    const section =
      this.createSection(
        "Hand Limit and Replace Hand"
      );

    section.appendChild(
      this.createParagraph(
        `You may temporarily hold more than ${GAME_BALANCE_CONFIG.hand.maxCards} cards while developing your city. However, your hand may contain no more than ${GAME_BALANCE_CONFIG.hand.maxCards} cards when your turn ends.`
      )
    );

    section.appendChild(
      this.createList([
        "If you press End Turn while holding too many cards, the discard panel opens.",
        "Select the required number of cards and confirm the discard before the AI turn reveal begins.",
        "Replace Hand replaces every card currently in your hand with the same number of randomly drawn cards.",
        `Replace Hand can be used ${GAME_BALANCE_CONFIG.replaceHand.playerMaxUsesPerGame} time per match.`,
        "Replacement cards are drawn from the complete building pool and may include Infrastructure cards.",
        "The same replacement building may appear more than once.",
      ])
    );

    return section;
  }

  private createPlacementSection(): HTMLDivElement {
    const section =
      this.createSection(
        "General Placement Rules"
      );

    section.appendChild(
      this.createList([
        "Every occupied cell of a building must remain inside your grid.",
        "Buildings can only be placed on buildable land.",
        "Buildings cannot overlap existing structures.",
        "Every new building must connect orthogonally to your existing city. Diagonal contact does not count as a valid connection.",
        "Use the placement preview to check whether the selected position is valid. A green preview indicates a legal placement. A red preview indicates an invalid placement.",
        "Press R to rotate the selected building before placement.",
      ])
    );

    return section;
  }

  private createRoadSection(): HTMLDivElement {
    const section =
      this.createSection(
        "Road and Infrastructure Placement"
      );

    section.appendChild(
      this.createParagraph(
        "Infrastructure buildings follow stricter connection rules. A Road Segment or Main Avenue cannot be attached to every building type."
      )
    );

    section.appendChild(
      this.createParagraph(
        "A new road must be directly adjacent to at least one valid road anchor:"
      )
    );

    section.appendChild(
      this.createList([
        "The starting monument",
        "An existing road",
        "A Civic building",
      ])
    );

    section.appendChild(
      this.createParagraph(
        "Residential, Industry and Culture buildings do not allow a new road connection by themselves. Expand your road network outward from the monument, another road or a suitable Civic structure."
      )
    );

    return section;
  }

  private createFamilySection(): HTMLDivElement {
    const section =
      this.createSection(
        "Building Families and Synergies"
      );

    const familyOrder: StructureFamily[] = [
      "residential",
      "industry",
      "infrastructure",
      "civic",
      "culture",
    ];

    const familyGrid =
      document.createElement("div");

    familyGrid.className =
      "os-rules-family-overview-grid";

    for (const family of familyOrder) {
      const visual =
        getFamilyVisualInfo(family);

      const card =
        document.createElement("div");

      card.className =
        `os-rules-family-overview-card ${visual.className}`;

      const title =
        document.createElement("div");

      title.className =
        "os-rules-family-overview-title";

      title.textContent =
        visual.label;

      const body =
        document.createElement("div");

      body.className =
        "os-rules-family-overview-text";

      body.textContent =
        visual.description;

      card.appendChild(title);
      card.appendChild(body);

      familyGrid.appendChild(card);
    }

    section.appendChild(familyGrid);

    section.appendChild(
      this.createSubheading(
        "Industry support"
      )
    );

    section.appendChild(
      this.createList([
        "The first adjacent Infrastructure source gives an Industry building +2 Population.",
        "The second adjacent Infrastructure source gives the same Industry building +1 additional Population.",
        "The first adjacent Civic source gives an Industry building +1 Population.",
        "Industry support bonuses still require available Population Capacity.",
      ])
    );

    return section;
  }

  private createBuildingCatalogueSection(): HTMLDivElement {
    const section =
      this.createSection(
        "Building Catalogue"
      );

    section.appendChild(
      this.createParagraph(
        "The values below are the base values shown before placement-based bonuses and penalties are resolved."
      )
    );

    const familyOrder: StructureFamily[] = [
      "residential",
      "industry",
      "infrastructure",
      "civic",
      "culture",
    ];

    for (const family of familyOrder) {
      section.appendChild(
        this.createBuildingFamilyCatalogue(
          family
        )
      );
    }

    return section;
  }

  private createBuildingFamilyCatalogue(
    family: StructureFamily
  ): HTMLDivElement {
    const visual =
      getFamilyVisualInfo(family);

    const container =
      document.createElement("div");

    container.className =
      "os-rules-catalogue-family";

    const title =
      document.createElement("div");

    title.className =
      "os-rules-catalogue-family-title";

    title.textContent =
      visual.label;

    const grid =
      document.createElement("div");

    grid.className =
      "os-rules-building-grid";

    const buildings =
      TEST_BUILDING_POOL.filter(
        (building) =>
          building.family === family
      );

    for (const building of buildings) {
      grid.appendChild(
        this.createBuildingCard(building)
      );
    }

    container.appendChild(title);
    container.appendChild(grid);

    return container;
  }

  private createBuildingCard(
    building: BuildingDefinition
  ): HTMLDivElement {
    const visual =
      getFamilyVisualInfo(
        building.family
      );

    const card =
      document.createElement("div");

    card.className =
      `os-rules-building-card ${visual.className}`;

    const title =
      document.createElement("div");

    title.className =
      "os-rules-building-title";

    title.textContent =
      building.name;

    card.appendChild(title);

    const shape =
      createBuildingShapeLines(
        building
      )[0];

    card.appendChild(
      this.createBuildingLine(
        `Shape: ${shape}`
      )
    );

    if (
      building.family ===
      "residential"
    ) {
      card.appendChild(
        this.createBuildingLine(
          `Base Capacity: ${building.basePopulation}`
        )
      );
    } else if (
      building.basePopulation !== 0
    ) {
      card.appendChild(
        this.createBuildingLine(
          `Base Population: ${this.formatSignedValue(
            building.basePopulation
          )}`
        )
      );
    }

    if (
      building.baseAttraction !== 0
    ) {
      card.appendChild(
        this.createBuildingLine(
          `Base Attraction: ${this.formatSignedValue(
            building.baseAttraction
          )}`
        )
      );
    }

    if (
      building.tags.includes(
        "pollution"
      )
    ) {
      card.appendChild(
        this.createBuildingBadge(
          "Pollution Source",
          "negative"
        )
      );
    }

    return card;
  }

  private createControlsSection(): HTMLDivElement {
    const section =
      this.createSection("Controls");

    section.appendChild(
      this.createControlRow(
        "Left Click",
        "Select packs, choose cards and place buildings."
      )
    );

    section.appendChild(
      this.createControlRow(
        "Mouse Drag",
        "Rotate the camera."
      )
    );

    section.appendChild(
      this.createControlRow(
        "Mouse Wheel",
        "Zoom in or out."
      )
    );

    section.appendChild(
      this.createControlRow(
        "W / A / S / D",
        "Move the camera in QWERTY mode."
      )
    );

    section.appendChild(
      this.createControlRow(
        "Z / Q / S / D",
        "Move the camera in AZERTY mode."
      )
    );

    section.appendChild(
      this.createControlRow(
        "Q / E",
        "Rotate the camera in QWERTY mode."
      )
    );

    section.appendChild(
      this.createControlRow(
        "A / E",
        "Rotate the camera in AZERTY mode."
      )
    );

    section.appendChild(
      this.createControlRow(
        "← / →",
        "Alternative camera rotation."
      )
    );

    section.appendChild(
      this.createControlRow(
        "R",
        "Rotate the currently selected building."
      )
    );

    return section;
  }

  private createTipsSection(): HTMLDivElement {
    const section =
      this.createSection("Quick Tips");

    section.appendChild(
      this.createList([
        "Expand your road network before committing to large residential districts.",
        "Create residential capacity before placing major Industry buildings.",
        "Keep pollution away from both Residential and Culture buildings.",
        "Place Culture buildings near both Civic support and Roads whenever possible.",
        "Use Civic buildings as flexible support structures and as possible anchors for future road expansion.",
        "Do not forget to manage your hand before ending the turn.",
        "Save Replace Hand for a moment when your remaining cards no longer fit your city plan.",
      ])
    );

    return section;
  }

  private createSection(
    titleText: string
  ): HTMLDivElement {
    const section =
      document.createElement("div");

    section.className =
      "os-rules-section";

    const title =
      document.createElement("div");

    title.className =
      "os-rules-section-title";

    title.textContent =
      titleText;

    section.appendChild(title);

    return section;
  }

  private createSubheading(
    text: string
  ): HTMLDivElement {
    const heading =
      document.createElement("div");

    heading.className =
      "os-rules-subtitle";

    heading.textContent = text;

    return heading;
  }

  private createParagraph(
    text: string
  ): HTMLDivElement {
    const paragraph =
      document.createElement("div");

    paragraph.className =
      "os-rules-text";

    paragraph.textContent = text;

    return paragraph;
  }

  private createFormula(
    text: string
  ): HTMLDivElement {
    const formula =
      document.createElement("div");

    formula.className =
      "os-rules-formula";

    formula.textContent = text;

    return formula;
  }

  private createTip(
    text: string
  ): HTMLDivElement {
    const tip =
      document.createElement("div");

    tip.className =
      "os-rules-tip";

    tip.textContent = text;

    return tip;
  }

  private createList(
    items: string[]
  ): HTMLDivElement {
    const list =
      document.createElement("div");

    list.className =
      "os-rules-list";

    for (const itemText of items) {
      const item =
        document.createElement("div");

      item.className =
        "os-rules-list-item";

      item.textContent =
        itemText;

      list.appendChild(item);
    }

    return list;
  }

  private createNumberedList(
    items: string[]
  ): HTMLDivElement {
    const list =
      document.createElement("div");

    list.className =
      "os-rules-numbered-list";

    items.forEach(
      (itemText, index) => {
        const row =
          document.createElement("div");

        row.className =
          "os-rules-numbered-item";

        const number =
          document.createElement("div");

        number.className =
          "os-rules-number";

        number.textContent =
          `${index + 1}`;

        const body =
          document.createElement("div");

        body.className =
          "os-rules-numbered-text";

        body.textContent =
          itemText;

        row.appendChild(number);
        row.appendChild(body);

        list.appendChild(row);
      }
    );

    return list;
  }

  private createBuildingLine(
    text: string
  ): HTMLDivElement {
    const line =
      document.createElement("div");

    line.className =
      "os-rules-building-line";

    line.textContent = text;

    return line;
  }

  private createBuildingBadge(
    text: string,
    kind: "negative" | "support"
  ): HTMLDivElement {
    const badge =
      document.createElement("div");

    badge.className =
      `os-rules-building-badge os-rules-building-badge-${kind}`;

    badge.textContent =
      text;

    return badge;
  }

  private createControlRow(
    input: string,
    description: string
  ): HTMLDivElement {
    const row =
      document.createElement("div");

    row.className =
      "os-rules-control-row";

    const inputLabel =
      document.createElement("div");

    inputLabel.className =
      "os-rules-control-input";

    inputLabel.textContent =
      input;

    const descriptionLabel =
      document.createElement("div");

    descriptionLabel.className =
      "os-rules-control-description";

    descriptionLabel.textContent =
      description;

    row.appendChild(
      inputLabel
    );

    row.appendChild(
      descriptionLabel
    );

    return row;
  }

  private formatSignedValue(
    value: number
  ): string {
    if (value > 0) {
      return `+${value}`;
    }

    return `${value}`;
  }
}