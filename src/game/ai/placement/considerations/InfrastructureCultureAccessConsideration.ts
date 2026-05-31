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

export class InfrastructureCultureAccessConsideration
  implements AIPlacementConsideration
{
  public readonly id = "infrastructure-culture-access";

  private readonly existingAccessBonus: number;
  private readonly futureSetupBonus: number;
  private readonly radius: number;
  private readonly maxCheckedCultureCards: number;

  constructor(
    existingAccessBonus: number = 4,
    futureSetupBonus: number = 10,
    radius: number = 1,
    maxCheckedCultureCards: number = 3
  ) {
    this.existingAccessBonus = existingAccessBonus;
    this.futureSetupBonus = futureSetupBonus;
    this.radius = radius;
    this.maxCheckedCultureCards = maxCheckedCultureCards;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (building.family === "culture") {
      return this.evaluateCulturePlacement(context);
    }

    if (this.isAccessBuilding(building)) {
      return this.evaluateAccessSetup(context);
    }

    return {
      score: 0,
      reason: `${this.id}: not culture/access building = 0`,
    };
  }

  private evaluateCulturePlacement(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const accessSources =
      context.registry
        .getInstancesWithinManhattanRadius(
          context.plan.cells,
          this.radius
        )
        .filter((nearby) => this.isAccessBuilding(nearby.building));

    if (accessSources.length === 0) {
      return {
        score: 0,
        reason: `${this.id}: culture has no nearby road/mobility access = 0`,
      };
    }

    return {
      score: this.existingAccessBonus,
      reason:
        `${this.id}: culture has nearby road/mobility access ` +
        `= +${this.existingAccessBonus}`,
    };
  }

  private evaluateAccessSetup(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const cultureCards = context.handCards
      .filter((card) => card.building.family === "culture")
      .slice(0, this.maxCheckedCultureCards);

    if (cultureCards.length === 0) {
      return {
        score: 0,
        reason: `${this.id}: no culture card in hand = 0`,
      };
    }

    const supportedCulture = cultureCards.find((card) =>
      this.canBuildingFitWithinRadius(context, card.building)
    );

    if (!supportedCulture) {
      return {
        score: 0,
        reason:
          `${this.id}: no future culture spot found within radius ` +
          `${this.radius} = 0`,
      };
    }

    return {
      score: this.futureSetupBonus,
      reason:
        `${this.id}: ${context.plan.building.name} creates future access for ` +
        `${supportedCulture.building.name} within radius ${this.radius} ` +
        `= +${this.futureSetupBonus}`,
    };
  }

  private isAccessBuilding(building: BuildingDefinition): boolean {
    return (
      building.tags.includes("road") ||
      building.tags.includes("mobility")
    );
  }

  private canBuildingFitWithinRadius(
    context: AIPlacementEvaluationContext,
    futureBuilding: BuildingDefinition
  ): boolean {
    const candidateAnchors = this.getCandidateAnchorsAroundCells(
      context.plan.cells,
      this.radius
    );

    const selection = new BuildingSelection(futureBuilding);
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

        if (this.overlapsWithPlannedCells(cells, context.plan.cells)) {
          continue;
        }

        const validation = validateFootprintPlacement(
          context.grid,
          cells
        );

        if (!validation.isValid) {
          continue;
        }

        if (
          this.areAnyCellsWithinManhattanRadius(
            cells,
            context.plan.cells,
            this.radius
          )
        ) {
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

  private overlapsWithPlannedCells(
    candidateCells: { row: number; col: number }[],
    plannedCells: { row: number; col: number }[]
  ): boolean {
    const plannedCellKeys = new Set(
      plannedCells.map((cell) => `${cell.row}:${cell.col}`)
    );

    return candidateCells.some((cell) =>
      plannedCellKeys.has(`${cell.row}:${cell.col}`)
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