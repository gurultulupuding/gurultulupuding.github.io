import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

type GridCell = {
  row: number;
  col: number;
};

export class ResidentialRoadAccessPlacementConsideration
  implements AIPlacementConsideration
{
  public readonly id = "residential-road-access-placement";

  private readonly roadAccessBonus: number;
  private readonly noRoadPenalty: number;

  constructor(
    roadAccessBonus: number = 10,
    noRoadPenalty: number = 8
  ) {
    this.roadAccessBonus = roadAccessBonus;
    this.noRoadPenalty = noRoadPenalty;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    if (context.plan.building.family !== "residential") {
      return {
        score: 0,
        reason: `${this.id}: not residential = 0`,
      };
    }

    const planCellKeys = new Set(
      context.plan.cells.map((cell) => this.getCellKey(cell))
    );

    for (const cell of context.plan.cells) {
      for (const neighbor of this.getOrthogonalNeighbors(cell)) {
        if (planCellKeys.has(this.getCellKey(neighbor))) {
          continue;
        }

        const instance = context.registry.getAtCell(neighbor);

        if (instance?.building.tags.includes("road")) {
          return {
            score: this.roadAccessBonus,
            reason:
              `${this.id}: residential touches road, capacity works at 100% ` +
              `= +${this.roadAccessBonus}`,
          };
        }
      }
    }

    return {
      score: -this.noRoadPenalty,
      reason:
        `${this.id}: residential does not touch road, capacity works at 50% ` +
        `= -${this.noRoadPenalty}`,
    };
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