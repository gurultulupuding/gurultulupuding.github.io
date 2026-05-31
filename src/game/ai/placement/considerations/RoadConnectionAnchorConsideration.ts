import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

type GridCell = {
  row: number;
  col: number;
};

export class RoadConnectionAnchorConsideration
  implements AIPlacementConsideration
{
  public readonly id = "road-connection-anchor";

  private readonly monumentAnchorBonus: number;
  private readonly roadContinuationBonus: number;
  private readonly civicAnchorBonus: number;
  private readonly maxScore: number;

  constructor(
    monumentAnchorBonus: number = 8,
    roadContinuationBonus: number = 10,
    civicAnchorBonus: number = 6,
    maxScore: number = 16
  ) {
    this.monumentAnchorBonus = monumentAnchorBonus;
    this.roadContinuationBonus = roadContinuationBonus;
    this.civicAnchorBonus = civicAnchorBonus;
    this.maxScore = maxScore;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (!this.isRoadLikeBuilding(building)) {
      return {
        score: 0,
        reason: `${this.id}: not road/mobility infrastructure = 0`,
      };
    }

    const adjacentOccupants =
      this.getAdjacentOccupants(context);

    let score = 0;
    const reasons: string[] = [];

    const touchesRoad = adjacentOccupants.some((occupant) =>
      this.isRoadLikeOccupant(occupant)
    );

    const touchesCivic = adjacentOccupants.some((occupant) =>
      this.isCivicLikeOccupant(occupant)
    );

    const touchesMonument = adjacentOccupants.some((occupant) =>
      this.isMonumentOccupant(occupant)
    );

    if (touchesRoad) {
      score += this.roadContinuationBonus;
      reasons.push(`continues road network=+${this.roadContinuationBonus}`);
    }

    if (touchesCivic) {
      score += this.civicAnchorBonus;
      reasons.push(`connects to civic/service=+${this.civicAnchorBonus}`);
    }

    if (touchesMonument) {
      score += this.monumentAnchorBonus;
      reasons.push(`starts from monument=+${this.monumentAnchorBonus}`);
    }

    const clampedScore = Math.min(score, this.maxScore);

    if (clampedScore === 0) {
      return {
        score: 0,
        reason: `${this.id}: no useful road anchor = 0`,
      };
    }

    return {
      score: clampedScore,
      reason:
        `${this.id}: ${reasons.join(", ")}, final=+${clampedScore}`,
    };
  }

  private getAdjacentOccupants(
    context: AIPlacementEvaluationContext
  ): { family: string; tags: string[] }[] {
    const planCellKeys = new Set(
      context.plan.cells.map((cell) => this.getCellKey(cell))
    );

    const occupants: { family: string; tags: string[] }[] = [];
    const seen = new Set<string>();

    for (const cell of context.plan.cells) {
      const neighbors = this.getOrthogonalNeighbors(cell);

      for (const neighbor of neighbors) {
        if (planCellKeys.has(this.getCellKey(neighbor))) {
          continue;
        }

        const gridCell = context.grid.getCell(neighbor.row, neighbor.col);

        if (!gridCell?.occupied || !gridCell.occupant) {
          continue;
        }

        const key =
          `${neighbor.row}:${neighbor.col}:` +
          `${gridCell.occupant.family}:` +
          `${gridCell.occupant.tags.join(",")}`;

        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        occupants.push(gridCell.occupant);
      }
    }

    return occupants;
  }

  private isRoadLikeBuilding(building: {
    family: string;
    tags: string[];
  }): boolean {
    return (
      building.family === "infrastructure" &&
      (
        building.tags.includes("road") ||
        building.tags.includes("mobility")
      )
    );
  }

  private isRoadLikeOccupant(occupant: {
    family: string;
    tags: string[];
  }): boolean {
    return (
      occupant.tags.includes("road") ||
      occupant.tags.includes("mobility")
    );
  }

  private isCivicLikeOccupant(occupant: {
    family: string;
    tags: string[];
  }): boolean {
    return (
      occupant.family === "civic" ||
      occupant.tags.includes("civic") ||
      occupant.tags.includes("service")
    );
  }

  private isMonumentOccupant(occupant: {
    family: string;
    tags: string[];
  }): boolean {
    return (
      occupant.family === "monument" ||
      occupant.tags.includes("monument")
    );
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