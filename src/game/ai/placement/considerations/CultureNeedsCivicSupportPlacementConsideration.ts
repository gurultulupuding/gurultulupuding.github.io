import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

type GridCell = {
  row: number;
  col: number;
};

export class CultureNeedsCivicSupportPlacementConsideration
  implements AIPlacementConsideration
{
  public readonly id = "culture-needs-civic-support-placement";

  private readonly unsupportedPenalty: number;
  private readonly supportedBonus: number;

  constructor(
    unsupportedPenalty: number = 14,
    supportedBonus: number = 6
  ) {
    this.unsupportedPenalty = unsupportedPenalty;
    this.supportedBonus = supportedBonus;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    if (context.plan.building.family !== "culture") {
      return {
        score: 0,
        reason: `${this.id}: not culture = 0`,
      };
    }

    const hasAdjacentCivicSupport =
      this.hasAdjacentCivicOrServiceSupport(context);

    const hasCivicInCity = context.aiScore.familyCounts.civic > 0;

    const hasSynergyAttraction =
      context.contribution.synergyAttractionBonus > 0 ||
      context.contribution.synergyEffects.length > 0;

   if (hasAdjacentCivicSupport) {
    return {
      score: this.supportedBonus,
      reason:
        `${this.id}: culture has local civic/service support ` +
        `= +${this.supportedBonus}`,
    };
  }

  if (hasSynergyAttraction) {
    return {
      score: 0,
      reason:
        `${this.id}: culture has attraction synergy but no local civic/service support = 0`,
    };
  }

    if (!hasCivicInCity) {
      return {
        score: -this.unsupportedPenalty,
        reason:
          `${this.id}: culture placed before any civic support, weak attraction engine ` +
          `= -${this.unsupportedPenalty}`,
      };
    }

    return {
      score: -Math.floor(this.unsupportedPenalty * 0.5),
      reason:
        `${this.id}: culture has civic somewhere but no local support/synergy ` +
        `= -${Math.floor(this.unsupportedPenalty * 0.5)}`,
    };
  }

  private hasAdjacentCivicOrServiceSupport(
    context: AIPlacementEvaluationContext
  ): boolean {
    const planCellKeys = new Set(
      context.plan.cells.map((cell) => this.getCellKey(cell))
    );

    for (const cell of context.plan.cells) {
      for (const neighbor of this.getOrthogonalNeighbors(cell)) {
        if (planCellKeys.has(this.getCellKey(neighbor))) {
          continue;
        }

        const instance = context.registry.getAtCell(neighbor);

        if (!instance) {
          continue;
        }

        if (
          instance.building.family === "civic" ||
          instance.building.tags.includes("service") ||
          instance.building.tags.includes("civic")
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private getOrthogonalNeighbors(cell: GridCell): GridCell[] {
    return [
      { row: cell.row - 1, col: cell.col },
      { row: cell.row + 1, col: cell.col },
      { row: cell.row, col: cell.col - 1 },
      { row: cell.row, col: cell.col + 1 },
    ];
  }

  private getCellKey(cell: GridCell): string {
    return `${cell.row}:${cell.col}`;
  }
}