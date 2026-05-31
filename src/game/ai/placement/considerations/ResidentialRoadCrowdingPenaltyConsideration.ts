import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

type GridCell = {
  row: number;
  col: number;
};

export class ResidentialRoadCrowdingPenaltyConsideration
  implements AIPlacementConsideration
{
  public readonly id = "residential-road-crowding-penalty";

  private readonly freeRoadNeighborLimit: number;
  private readonly penaltyPerExtraRoadNeighbor: number;
  private readonly maxPenalty: number;

  public constructor(
    freeRoadNeighborLimit: number = 2,
    penaltyPerExtraRoadNeighbor: number = 8,
    maxPenalty: number = 24
  ) {
    this.freeRoadNeighborLimit = freeRoadNeighborLimit;
    this.penaltyPerExtraRoadNeighbor = penaltyPerExtraRoadNeighbor;
    this.maxPenalty = maxPenalty;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (building.family !== "residential") {
      return {
        score: 0,
        reason: `${this.id}: not residential = 0`,
      };
    }

    const roadNeighborCount = this.countRoadNeighborCells(context);

    if (roadNeighborCount <= this.freeRoadNeighborLimit) {
      return {
        score: 0,
        reason:
          `${this.id}: roadNeighbors=${roadNeighborCount}, ` +
          `limit=${this.freeRoadNeighborLimit}, no penalty = 0`,
      };
    }

    const extraRoadNeighbors =
      roadNeighborCount - this.freeRoadNeighborLimit;

    const penalty = Math.min(
      this.maxPenalty,
      extraRoadNeighbors * this.penaltyPerExtraRoadNeighbor
    );

    return {
      score: -penalty,
      reason:
        `${this.id}: residential touches too many road cells, ` +
        `roadNeighbors=${roadNeighborCount}, freeLimit=${this.freeRoadNeighborLimit}, ` +
        `extra=${extraRoadNeighbors}, penalty=-${penalty}`,
    };
  }

  private countRoadNeighborCells(
    context: AIPlacementEvaluationContext
  ): number {
    const planCellKeys = new Set(
      context.plan.cells.map((cell) => this.getCellKey(cell))
    );

    const roadNeighborCellKeys = new Set<string>();

    for (const cell of context.plan.cells) {
      for (const neighbor of this.getOrthogonalNeighbors(cell)) {
        const neighborKey = this.getCellKey(neighbor);

        if (planCellKeys.has(neighborKey)) {
          continue;
        }

        const gridCell = context.grid.getCell(neighbor.row, neighbor.col);

        if (!gridCell) {
          continue;
        }

        if (!gridCell.occupied) {
          continue;
        }

        const tags = gridCell.occupant?.tags ?? [];
        const family = gridCell.occupant?.family;

        const isRoadLike =
          family === "infrastructure" &&
          (tags.includes("road") || tags.includes("mobility"));

        if (!isRoadLike) {
          continue;
        }

        roadNeighborCellKeys.add(neighborKey);
      }
    }

    return roadNeighborCellKeys.size;
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