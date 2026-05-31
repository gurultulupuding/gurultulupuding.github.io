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

export class InfrastructureCrowdingAvoidanceConsideration
  implements AIPlacementConsideration
{
  public readonly id = "infrastructure-crowding-avoidance";

  private readonly freeNonConnectorNeighborLimit: number;
  private readonly penaltyPerExtraNonConnectorNeighbor: number;
  private readonly connectorBonus: number;
  private readonly maxPenalty: number;

  constructor(
    freeNonConnectorNeighborLimit: number = 1,
    penaltyPerExtraNonConnectorNeighbor: number = 4,
    connectorBonus: number = 2,
    maxPenalty: number = 12
  ) {
    this.freeNonConnectorNeighborLimit = freeNonConnectorNeighborLimit;
    this.penaltyPerExtraNonConnectorNeighbor =
      penaltyPerExtraNonConnectorNeighbor;
    this.connectorBonus = connectorBonus;
    this.maxPenalty = maxPenalty;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (!this.isInfrastructureLikeBuilding(building)) {
      return {
        score: 0,
        reason: `${this.id}: not infrastructure/road/mobility = 0`,
      };
    }

    const neighbors = this.getOccupiedNeighborInstances(
      context.plan.cells,
      context.registry
    );

    const connectorNeighbors = neighbors.filter((instance) =>
      this.isGoodInfrastructureConnector(instance.building)
    );

    const nonConnectorNeighbors = neighbors.filter(
      (instance) => !this.isGoodInfrastructureConnector(instance.building)
    );

    const extraNonConnectorNeighbors = Math.max(
      0,
      nonConnectorNeighbors.length - this.freeNonConnectorNeighborLimit
    );

    const rawPenalty =
      extraNonConnectorNeighbors *
      this.penaltyPerExtraNonConnectorNeighbor;

    const penalty = Math.min(this.maxPenalty, rawPenalty);

    const connectionScore =
      connectorNeighbors.length > 0 ? this.connectorBonus : 0;

    const score = connectionScore - penalty;

    if (score === 0) {
      return {
        score: 0,
        reason:
          `${this.id}: connectorNeighbors=${connectorNeighbors.length}, ` +
          `nonConnectorNeighbors=${nonConnectorNeighbors.length}, no crowding issue = 0`,
      };
    }

    return {
      score,
      reason:
        `${this.id}: connectorNeighbors=${connectorNeighbors.length} ` +
        `(+${connectionScore}), nonConnectorNeighbors=${nonConnectorNeighbors.length}, ` +
        `extra=${extraNonConnectorNeighbors}, penalty=-${penalty}, total=${score}`,
    };
  }

  private isInfrastructureLikeBuilding(building: {
    family: string;
    tags: string[];
  }): boolean {
    return (
      building.family === "infrastructure" ||
      building.tags.includes("road") ||
      building.tags.includes("mobility")
    );
  }

  private isGoodInfrastructureConnector(building: {
    family: string;
    tags: string[];
  }): boolean {
    return (
      building.family === "infrastructure" ||
      building.family === "civic" ||
      building.family === "monument" ||
      building.tags.includes("road") ||
      building.tags.includes("mobility") ||
      building.tags.includes("civic") ||
      building.tags.includes("service") ||
      building.tags.includes("monument")
    );
  }

  private getOccupiedNeighborInstances(
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
      const neighborCells = [
        { row: cell.row - 1, col: cell.col },
        { row: cell.row + 1, col: cell.col },
        { row: cell.row, col: cell.col - 1 },
        { row: cell.row, col: cell.col + 1 },
      ];

      for (const neighborCell of neighborCells) {
        if (planCellKeys.has(this.getCellKey(neighborCell))) {
          continue;
        }

        const neighborInstance = registry.getAtCell(neighborCell);

        if (!neighborInstance) {
          continue;
        }

        neighborInstances.set(neighborInstance.id, neighborInstance);
      }
    }

    return [...neighborInstances.values()];
  }

  private getCellKey(cell: GridCell): string {
    return `${cell.row}:${cell.col}`;
  }
}