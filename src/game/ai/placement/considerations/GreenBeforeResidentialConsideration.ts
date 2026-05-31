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

export class GreenBeforeResidentialConsideration
  implements AIPlacementConsideration
{
  public readonly id = "green-before-residential";

  private readonly bonus: number;
  private readonly radius: number;
  private readonly maxCheckedResidentialCards: number;

  constructor(
    bonus: number = 14,
    radius: number = 2,
    maxCheckedResidentialCards: number = 3
  ) {
    this.bonus = bonus;
    this.radius = radius;
    this.maxCheckedResidentialCards = maxCheckedResidentialCards;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (!building.tags.includes("green")) {
      return {
        score: 0,
        reason: `${this.id}: not green = 0`,
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
      this.canResidentialFitWithinGreenRadius(context, card.building)
    );

    if (!supportedResidential) {
      return {
        score: 0,
        reason: `${this.id}: no future residential spot found within radius ${this.radius} = 0`,
      };
    }

    return {
      score: this.bonus,
      reason:
        `${this.id}: ${building.name} creates future green synergy for ` +
        `${supportedResidential.building.name} within radius ${this.radius} = +${this.bonus}`,
    };
  }

  private canResidentialFitWithinGreenRadius(
    context: AIPlacementEvaluationContext,
    residentialBuilding: BuildingDefinition
  ): boolean {
    const candidateAnchors = this.getCandidateAnchorsAroundCells(
      context.plan.cells,
      this.radius
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

        if (this.overlapsWithPlannedGreen(cells, context.plan.cells)) {
          continue;
        }

        const validation = validateFootprintPlacement(
          context.grid,
          cells
        );

        if (!validation.isValid) {
          continue;
        }

        const isWithinGreenRadius = this.areAnyCellsWithinManhattanRadius(
          cells,
          context.plan.cells,
          this.radius
        );

        if (isWithinGreenRadius) {
          return true;
        }
      }
    }

    return false;
  }

  private getCandidateAnchorsAroundCells(
    cells: { row: number; col: number }[],
    radius: number
  ): { row: number; col: number }[] {
    const anchors = new Map<string, { row: number; col: number }>();

    for (const cell of cells) {
      for (let rowOffset = -radius; rowOffset <= radius; rowOffset++) {
        for (let colOffset = -radius; colOffset <= radius; colOffset++) {
          const distance = Math.abs(rowOffset) + Math.abs(colOffset);

          if (distance > radius) {
            continue;
          }

          const candidate = {
            row: cell.row + rowOffset,
            col: cell.col + colOffset,
          };

          anchors.set(`${candidate.row}:${candidate.col}`, candidate);
        }
      }
    }

    return [...anchors.values()];
  }

  private overlapsWithPlannedGreen(
    candidateCells: { row: number; col: number }[],
    greenCells: { row: number; col: number }[]
  ): boolean {
    const greenCellKeys = new Set(
      greenCells.map((cell) => `${cell.row}:${cell.col}`)
    );

    return candidateCells.some((cell) =>
      greenCellKeys.has(`${cell.row}:${cell.col}`)
    );
  }

  private areAnyCellsWithinManhattanRadius(
    firstCells: { row: number; col: number }[],
    secondCells: { row: number; col: number }[],
    radius: number
  ): boolean {
    for (const firstCell of firstCells) {
      for (const secondCell of secondCells) {
        const distance =
          Math.abs(firstCell.row - secondCell.row) +
          Math.abs(firstCell.col - secondCell.col);

        if (distance <= radius) {
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