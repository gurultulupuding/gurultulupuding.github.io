import type { BuildingDefinition } from "../world/buildings/definitions/BuildingDefinition";
import type { StructureFamily } from "../game/packs/StructureFamily";

export type BuildingValueKind = "population" | "attraction" | "capacity";

export type BuildingValuePill = {
  kind: BuildingValueKind;
  text: string;
};

export type FamilyVisualInfo = {
  label: string;
  className: string;
  cardClassName: string;
  description: string;
};

export function getFamilyVisualInfo(
  family: StructureFamily
): FamilyVisualInfo {
  switch (family) {
    case "residential":
      return {
        label: "Residential",
        className: "os-family-residential",
        cardClassName: "os-hand-card-residential",
        description:
          "Provides Population Capacity. Without adjacent road access, Population Capacity works at 50%; nearby Pollution then reduces it further.",
      };

    case "industry":
      return {
        label: "Industry",
        className: "os-family-industry",
        cardClassName: "os-hand-card-industry",
        description:
          "Provides Population when Population Capacity is available. Adjacent Infrastructure source give strong Population support; Civic buildings give weaker support. Pollution can hurt nearby Culture and Residential.",
      };

    case "infrastructure":
      return {
        label: "Infrastructure",
        className: "os-family-infrastructure",
        cardClassName: "os-hand-card-infrastructure",
        description:
          "Adjacent roads can unlock full Population Capacity and support Culture or Industry.",
      };

    case "civic":
      return {
        label: "Civic",
        className: "os-family-civic",
        cardClassName: "os-hand-card-civic",
        description:
          "Provides support. Nearby Culture can gain Attraction from Civic support, and adjacent Industry can gain weak Population support.",
      };

    case "culture":
      return {
        label: "Culture",
        className: "os-family-culture",
        cardClassName: "os-hand-card-culture",
        description:
          "Provides Attraction. Gains Attraction from nearby Civic support and adjacent road, but loses Attraction near Pollution.",
      };
  }
}

export function createBuildingValuePills(
  building: BuildingDefinition
): BuildingValuePill[] {
  const pills: BuildingValuePill[] = [];

  if (building.family === "residential") {
    const capacity = Math.max(0, building.basePopulation);

    if (capacity !== 0) {
      pills.push({
        kind: "capacity",
        text: `${capacity} CAP`,
      });
    }

    if (building.baseAttraction !== 0) {
      pills.push({
        kind: "attraction",
        text: `${building.baseAttraction} ATT`,
      });
    }

    return pills;
  }

  if (building.basePopulation !== 0) {
    pills.push({
      kind: "population",
      text: `${building.basePopulation} POP`,
    });
  }

  if (building.baseAttraction !== 0) {
    pills.push({
      kind: "attraction",
      text: `${building.baseAttraction} ATT`,
    });
  }

  return pills;
}

export function createValuePillElement(
  pill: BuildingValuePill
): HTMLDivElement {
  const element = document.createElement("div");

  const classNameByKind: Record<BuildingValueKind, string> = {
    population: "os-ai-reveal-pill-population",
    attraction: "os-ai-reveal-pill-attraction",
    capacity: "os-ai-reveal-pill-capacity",
  };

  element.className =
    `os-ai-reveal-pill ${classNameByKind[pill.kind]}`;
  element.textContent = pill.text;

  return element;
}

export function createBuildingShapeLines(
  building: BuildingDefinition
): string[] {
  const cells = building.footprint.cells;
  const cellCount = cells.length;

  const rows = cells.map((cell) => cell.rowOffset);
  const cols = cells.map((cell) => cell.colOffset);

  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);

  const width = maxCol - minCol + 1;
  const height = maxRow - minRow + 1;

  const shapeName = getFootprintShapeName(
    building.footprint.id,
    width,
    height,
    cellCount
  );

  return [
    shapeName,
    ];
}

function getFootprintShapeName(
  footprintId: string,
  width: number,
  height: number,
  cellCount: number
): string {
  switch (footprintId) {
    case "single-1x1":
      return "Single tile";

    case "line-1x2":
      return "1 × 2 line";

    case "line-1x3":
      return "1 × 3 line";

    case "square-2x2":
      return "2 × 2 block";

    case "l-shape":
      return "L shape";

    case "small-l-shape":
      return "Small L shape";

    case "z-shape":
      return "Z shape";

    case "t-shape":
      return "T shape";

    case "u-shape":
      return "U shape";
  }

  if (cellCount === 1) {
    return "Single tile";
  }

  if (cellCount === width * height) {
    if (width === height) {
      return `${width} × ${height} block`;
    }

    return `${width} × ${height} rectangle`;
  }

  if (cellCount === 2) {
    return "Domino";
  }

  if (cellCount === 3) {
    return "Triomino";
  }

  if (cellCount === 4) {
    return "Tetromino";
  }

  return "Irregular shape";
}