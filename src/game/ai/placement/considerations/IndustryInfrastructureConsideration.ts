import { BuildingSelection } from "../../../../world/buildings/placements/BuildingSelection";
import { getFootprintCellsAt } from "../../../../world/buildings/footprint/FootprintUtils";
import { validateFootprintPlacement } from "../../../../world/buildings/placements/PlacementValidation";
import type { FootprintRotation } from "../../../../world/buildings/footprint/FootprintRotation";
import type { BuildingDefinition } from "../../../../world/buildings/definitions/BuildingDefinition";
import type { PlacedBuildingInstance } from "../../../../world/city/PlacedBuildingInstance";
import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

type GridCell = {
  row: number;
  col: number;
};

type SupportStrength = "strong" | "weak";

export class IndustryInfrastructureConsideration
  implements AIPlacementConsideration
{
  public readonly id = "industry-infrastructure";

  private readonly existingStrongSupportBonus: number;
  private readonly existingWeakSupportBonus: number;
  private readonly futureStrongSetupBonus: number;
  private readonly futureWeakSetupBonus: number;
  private readonly radius: number;
  private readonly maxCheckedIndustryCards: number;

  constructor(
    existingStrongSupportBonus: number = 6,
    existingWeakSupportBonus: number = 2,
    futureStrongSetupBonus: number = 16,
    futureWeakSetupBonus: number = 5,
    radius: number = 2,
    maxCheckedIndustryCards: number = 3
  ) {
    this.existingStrongSupportBonus = existingStrongSupportBonus;
    this.existingWeakSupportBonus = existingWeakSupportBonus;
    this.futureStrongSetupBonus = futureStrongSetupBonus;
    this.futureWeakSetupBonus = futureWeakSetupBonus;
    this.radius = radius;
    this.maxCheckedIndustryCards = maxCheckedIndustryCards;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (building.family === "industry") {
      return this.evaluateIndustryPlacement(context);
    }

    const supportStrength = this.getSupportStrength(building);

    if (supportStrength !== null) {
      return this.evaluateSupportSetup(context, supportStrength);
    }

    return {
      score: 0,
      reason: `${this.id}: not industry/support building = 0`,
    };
  }

  private evaluateIndustryPlacement(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const neighboringSupportSources = this.getNeighboringInstances(
      context.plan.cells,
      context.registry
    )
      .map((instance) => ({
        instance,
        strength: this.getSupportStrength(instance.building),
      }))
      .filter(
        (entry): entry is {
          instance: PlacedBuildingInstance;
          strength: SupportStrength;
        } => entry.strength !== null
      );

    const hasStrongSupport = neighboringSupportSources.some(
      (entry) => entry.strength === "strong"
    );

    if (hasStrongSupport) {
      return {
        score: this.existingStrongSupportBonus,
        reason:
          `${this.id}: industry has direct strong road/infrastructure support ` +
          `= +${this.existingStrongSupportBonus}`,
      };
    }

    const hasWeakSupport = neighboringSupportSources.some(
      (entry) => entry.strength === "weak"
    );

    if (hasWeakSupport) {
      return {
        score: this.existingWeakSupportBonus,
        reason:
          `${this.id}: industry has direct weak civic/service support ` +
          `= +${this.existingWeakSupportBonus}`,
      };
    }

    return {
      score: 0,
      reason: `${this.id}: industry has no direct support = 0`,
    };
  }

  private evaluateSupportSetup(
    context: AIPlacementEvaluationContext,
    supportStrength: SupportStrength
  ): AIPlacementConsiderationResult {
    const industryCards = context.handCards
      .filter((card) => card.building.family === "industry")
      .slice(0, this.maxCheckedIndustryCards);

    if (industryCards.length === 0) {
      return {
        score: 0,
        reason: `${this.id}: no industry card in hand = 0`,
      };
    }

    const supportedIndustry = industryCards.find((card) =>
      this.canFutureBuildingFitAdjacentToPlannedSupport(
        context,
        card.building
      )
    );

    if (!supportedIndustry) {
      return {
        score: 0,
        reason:
          `${this.id}: no future industry spot found directly adjacent ` +
          `to planned support = 0`,
      };
    }

    const score =
      supportStrength === "strong"
        ? this.futureStrongSetupBonus
        : this.futureWeakSetupBonus;

    const supportLabel =
      supportStrength === "strong"
        ? "strong road/infrastructure"
        : "weak civic/service";

    return {
      score,
      reason:
        `${this.id}: ${context.plan.building.name} creates future ` +
        `${supportLabel} support for ${supportedIndustry.building.name} ` +
        `by direct adjacency = +${score}`,
    };
  }

  private getSupportStrength(
    building: BuildingDefinition
  ): SupportStrength | null {
    if (
      building.family === "infrastructure" ||
      building.tags.includes("road") ||
      building.tags.includes("mobility")
    ) {
      return "strong";
    }

    if (
      building.family === "civic" ||
      building.tags.includes("service")
    ) {
      return "weak";
    }

    return null;
  }

  private canFutureBuildingFitAdjacentToPlannedSupport(
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
          cells,
          futureBuilding
        );

        if (!validation.isValid) {
          continue;
        }

        if (this.areCellsOrthogonallyAdjacent(cells, context.plan.cells)) {
          return true;
        }
      }
    }

    return false;
  }

  private getCandidateAnchorsAroundCells(
    cells: GridCell[],
    radius: number
  ): GridCell[] {
    const anchors = new Map<string, GridCell>();

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

          anchors.set(this.getCellKey(candidate), candidate);
        }
      }
    }

    return [...anchors.values()];
  }

  private overlapsWithPlannedCells(
    candidateCells: GridCell[],
    plannedCells: GridCell[]
  ): boolean {
    const plannedCellKeys = new Set(
      plannedCells.map((cell) => this.getCellKey(cell))
    );

    return candidateCells.some((cell) =>
      plannedCellKeys.has(this.getCellKey(cell))
    );
  }

  private areCellsOrthogonallyAdjacent(
    firstCells: GridCell[],
    secondCells: GridCell[]
  ): boolean {
    const secondCellKeys = new Set(
      secondCells.map((cell) => this.getCellKey(cell))
    );

    for (const cell of firstCells) {
      for (const neighbor of this.getOrthogonalNeighbors(cell)) {
        if (secondCellKeys.has(this.getCellKey(neighbor))) {
          return true;
        }
      }
    }

    return false;
  }

  private getNeighboringInstances(
    cells: GridCell[],
    registry: {
      getAtCell(cell: GridCell): PlacedBuildingInstance | null;
    }
  ): PlacedBuildingInstance[] {
    const planCellKeys = new Set(
      cells.map((cell) => this.getCellKey(cell))
    );

    const neighborInstances = new Map<string, PlacedBuildingInstance>();

    for (const cell of cells) {
      for (const neighbor of this.getOrthogonalNeighbors(cell)) {
        if (planCellKeys.has(this.getCellKey(neighbor))) {
          continue;
        }

        const instance = registry.getAtCell(neighbor);

        if (!instance) {
          continue;
        }

        neighborInstances.set(instance.id, instance);
      }
    }

    return [...neighborInstances.values()];
  }

  private getOrthogonalNeighbors(cell: GridCell): GridCell[] {
    return [
      { row: cell.row - 1, col: cell.col },
      { row: cell.row + 1, col: cell.col },
      { row: cell.row, col: cell.col - 1 },
      { row: cell.row, col: cell.col + 1 },
    ];
  }

  private rotateSelectionTo(
    selection: BuildingSelection,
    targetRotation: FootprintRotation
  ): void {
    while (selection.getRotation() !== targetRotation) {
      selection.rotateClockwise();
    }
  }

  private getCellKey(cell: GridCell): string {
    return `${cell.row}:${cell.col}`;
  }
}