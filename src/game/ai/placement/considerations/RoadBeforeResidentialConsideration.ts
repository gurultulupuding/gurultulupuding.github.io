import { BuildingSelection } from "../../../../world/buildings/placements/BuildingSelection";
import { getFootprintCellsAt } from "../../../../world/buildings/footprint/FootprintUtils";
import { validateFootprintPlacement } from "../../../../world/buildings/placements/PlacementValidation";
import type { FootprintRotation } from "../../../../world/buildings/footprint/FootprintRotation";
import type { BuildingDefinition } from "../../../../world/buildings/definitions/BuildingDefinition";
import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class RoadBeforeResidentialConsideration
  implements AIPlacementConsideration
{
  public readonly id = "road-before-residential";

  private readonly bonus: number;
  private readonly maxCheckedResidentialCards: number;

  constructor(bonus: number = 18, maxCheckedResidentialCards: number = 3) {
    this.bonus = bonus;
    this.maxCheckedResidentialCards = maxCheckedResidentialCards;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (!building.tags.includes("road")) {
      return {
        score: 0,
        reason: `${this.id}: not a road = 0`,
      };
    }

    const residentialCards = context.handCards
      .filter((card) => card.building.family === "residential")
      .slice(0, this.maxCheckedResidentialCards);

    if (residentialCards.length === 0) {
      return {
        score: 0,
        reason: `${this.id}: no residential card in hand = 0`,
      };
    }

    const supportedResidential = residentialCards.find((card) =>
      this.canResidentialFitNearPlannedRoad(context, card.building)
    );

    if (!supportedResidential) {
      return {
        score: 0,
        reason: `${this.id}: no future residential spot found = 0`,
      };
    }

    return {
      score: this.bonus,
      reason:
        `${this.id}: ${building.name} creates future road access for ` +
        `${supportedResidential.building.name} = +${this.bonus}`,
    };
  }

  private canResidentialFitNearPlannedRoad(
    context: AIPlacementEvaluationContext,
    residentialBuilding: BuildingDefinition
  ): boolean {
    const candidateAnchors = this.getCandidateAnchorsAroundCells(
      context.plan.cells
    );

    const selection = new BuildingSelection(residentialBuilding);
    const rotations: FootprintRotation[] = [0, 90, 180, 270];

    for (const rotation of rotations) {
      this.rotateSelectionTo(selection, rotation);

      const footprint = selection.getCurrentFootprint();

      for (const anchor of candidateAnchors) {
        const cells = getFootprintCellsAt(
          footprint,
          anchor.row,
          anchor.col
        );

        if (this.overlapsWithPlannedRoad(cells, context.plan.cells)) {
          continue;
        }

        const validation = validateFootprintPlacement(
          context.grid,
          cells,
          residentialBuilding
        );

        if (!validation.isValid) {
          continue;
        }

        const touchesPlannedRoad = this.areCellsOrthogonallyAdjacent(
          cells,
          context.plan.cells
        );

        if (touchesPlannedRoad) {
          return true;
        }
      }
    }

    return false;
  }

  private getCandidateAnchorsAroundCells(
    cells: { row: number; col: number }[]
  ): { row: number; col: number }[] {
    const anchors = new Map<string, { row: number; col: number }>();

    for (const cell of cells) {
      const candidates = [
        { row: cell.row - 1, col: cell.col },
        { row: cell.row + 1, col: cell.col },
        { row: cell.row, col: cell.col - 1 },
        { row: cell.row, col: cell.col + 1 },
      ];

      for (const candidate of candidates) {
        anchors.set(`${candidate.row}:${candidate.col}`, candidate);
      }
    }

    return [...anchors.values()];
  }

  private overlapsWithPlannedRoad(
    candidateCells: { row: number; col: number }[],
    roadCells: { row: number; col: number }[]
  ): boolean {
    const roadCellKeys = new Set(
      roadCells.map((cell) => `${cell.row}:${cell.col}`)
    );

    return candidateCells.some((cell) =>
      roadCellKeys.has(`${cell.row}:${cell.col}`)
    );
  }

  private areCellsOrthogonallyAdjacent(
    firstCells: { row: number; col: number }[],
    secondCells: { row: number; col: number }[]
  ): boolean {
    const secondCellKeys = new Set(
      secondCells.map((cell) => `${cell.row}:${cell.col}`)
    );

    for (const cell of firstCells) {
      const neighbors = [
        { row: cell.row - 1, col: cell.col },
        { row: cell.row + 1, col: cell.col },
        { row: cell.row, col: cell.col - 1 },
        { row: cell.row, col: cell.col + 1 },
      ];

      for (const neighbor of neighbors) {
        if (secondCellKeys.has(`${neighbor.row}:${neighbor.col}`)) {
          return true;
        }
      }
    }

    return false;
  }

  private rotateSelectionTo(
    selection: BuildingSelection,
    targetRotation: FootprintRotation
  ): void {
    while (selection.getRotation() !== targetRotation) {
      selection.rotateClockwise();
    }
  }
}