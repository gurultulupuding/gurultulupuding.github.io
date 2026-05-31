import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

type GridCell = {
  row: number;
  col: number;
};

export class CivicDistanceFromRoadConsideration
  implements AIPlacementConsideration
{
  public readonly id = "civic-distance-from-road";

  private readonly idealDistance: number;
  private readonly idealBonus: number;
  private readonly nearBonus: number;
  private readonly tooClosePenalty: number;
  private readonly tooFarPenalty: number;

  public constructor(
    idealDistance: number = 2,
    idealBonus: number = 8,
    nearBonus: number = 4,
    tooClosePenalty: number = 10,
    tooFarPenalty: number = 6
  ) {
    this.idealDistance = idealDistance;
    this.idealBonus = idealBonus;
    this.nearBonus = nearBonus;
    this.tooClosePenalty = tooClosePenalty;
    this.tooFarPenalty = tooFarPenalty;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (building.family !== "civic") {
      return {
        score: 0,
        reason: "not civic = 0",
      };
    }

    const roadCells = this.getRoadCells(context);

    if (roadCells.length === 0) {
      return {
        score: 0,
        reason: "no road/infrastructure in city = 0",
      };
    }

    const closestDistance = this.getClosestManhattanDistance(
      context.plan.cells,
      roadCells
    );

    if (closestDistance === this.idealDistance) {
      return {
        score: this.idealBonus,
        reason: `civic placed at ideal road distance ${this.idealDistance} = +${this.idealBonus}`,
      };
    }

    if (closestDistance === this.idealDistance - 1) {
      return {
        score: this.nearBonus,
        reason: `civic near ideal road distance, distance=${closestDistance}, ideal=${this.idealDistance}, bonus=+${this.nearBonus}`,
      };
    }

    if (closestDistance === this.idealDistance + 1) {
      return {
        score: this.nearBonus,
        reason: `civic near ideal road distance, distance=${closestDistance}, ideal=${this.idealDistance}, bonus=+${this.nearBonus}`,
      };
    }

    if (closestDistance < this.idealDistance - 1) {
      return {
        score: -this.tooClosePenalty,
        reason: `civic too close to road, distance=${closestDistance}, ideal=${this.idealDistance}, penalty=-${this.tooClosePenalty}`,
      };
    }

    return {
      score: -this.tooFarPenalty,
      reason: `civic too far from road, distance=${closestDistance}, ideal=${this.idealDistance}, penalty=-${this.tooFarPenalty}`,
    };
  }

  private getRoadCells(context: AIPlacementEvaluationContext): GridCell[] {
    const roadCells: GridCell[] = [];

    for (const instance of context.registry.getAll()) {
      if (instance.owner !== "ai") {
        continue;
      }

      const isRoadLike =
        instance.building.family === "infrastructure" ||
        instance.building.tags?.includes("road") === true ||
        instance.building.tags?.includes("mobility") === true;

      if (!isRoadLike) {
        continue;
      }

      for (const cell of instance.cells) {
        roadCells.push({
          row: cell.row,
          col: cell.col,
        });
      }
    }

    return roadCells;
  }

  private getClosestManhattanDistance(
    planCells: GridCell[],
    roadCells: GridCell[]
  ): number {
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const planCell of planCells) {
      for (const roadCell of roadCells) {
        const distance =
          Math.abs(planCell.row - roadCell.row) +
          Math.abs(planCell.col - roadCell.col);

        if (distance < bestDistance) {
          bestDistance = distance;
        }
      }
    }

    return bestDistance;
  }
}