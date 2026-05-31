import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";
import type { PlacedBuildingInstance } from "../../../../world/city/PlacedBuildingInstance";

type GridCell = {
  row: number;
  col: number;
};

export class RoadShapeEfficiencyConsideration
  implements AIPlacementConsideration
{
  public readonly id = "road-shape-efficiency";

  private readonly frontierCellBonus: number;
  private readonly occupiedNeighborPenalty: number;
  private readonly roadClusterPenalty: number;
  private readonly maxBonus: number;
  private readonly maxPenalty: number;

  public constructor(
    frontierCellBonus: number = 2,
    occupiedNeighborPenalty: number = 2,
    roadClusterPenalty: number = 8,
    maxBonus: number = 12,
    maxPenalty: number = 24
  ) {
    this.frontierCellBonus = frontierCellBonus;
    this.occupiedNeighborPenalty = occupiedNeighborPenalty;
    this.roadClusterPenalty = roadClusterPenalty;
    this.maxBonus = maxBonus;
    this.maxPenalty = maxPenalty;
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

    const frontierCells = this.countNewFrontierCells(context);
    const occupiedNeighborInstances =
      this.getOccupiedNeighborInstances(context);

    const roadNeighborInstances =
      occupiedNeighborInstances.filter((instance) =>
        this.isRoadLikeBuilding(instance.building)
      );

    const nonRoadNeighborCount =
      occupiedNeighborInstances.length - roadNeighborInstances.length;

    const roadAdjacencyEdges = this.countRoadAdjacencyEdges(context);
    const uniqueRoadNeighborCount = roadNeighborInstances.length;

    const frontierScore = Math.min(
      this.maxBonus,
      frontierCells * this.frontierCellBonus
    );

    const nonRoadCrowdingPenalty = Math.min(
      this.maxPenalty,
      nonRoadNeighborCount * this.occupiedNeighborPenalty
    );
    const extraRoadConnections = Math.max(0, uniqueRoadNeighborCount - 1);
    const extraRoadEdges = Math.max(0, roadAdjacencyEdges - 1);

    const roadClusterPenaltyTotal = Math.min(
      this.maxPenalty,
      extraRoadConnections * this.roadClusterPenalty +
        extraRoadEdges * this.roadClusterPenalty
    );

    const score =
      frontierScore - nonRoadCrowdingPenalty - roadClusterPenaltyTotal;

    return {
      score,
      reason:
        `${this.id}: frontierCells=${frontierCells} × +${this.frontierCellBonus} ` +
        `=> +${frontierScore}, nonRoadNeighbors=${nonRoadNeighborCount} ` +
        `=> -${nonRoadCrowdingPenalty}, uniqueRoadNeighbors=${uniqueRoadNeighborCount}, ` +
        `roadAdjacencyEdges=${roadAdjacencyEdges}, extraRoadConnections=${extraRoadConnections}, ` +
        `extraRoadEdges=${extraRoadEdges}, roadClusterPenalty=-${roadClusterPenaltyTotal}, ` +
        `total=${score}`,
    };
  }

  private isRoadLikeBuilding(building: {
    family: string;
    tags: string[];
  }): boolean {
    return (
      building.family === "infrastructure" &&
      (building.tags.includes("road") ||
        building.tags.includes("mobility"))
    );
  }

  private countNewFrontierCells(
    context: AIPlacementEvaluationContext
  ): number {
    const planCellKeys = new Set(
      context.plan.cells.map((cell) => this.getCellKey(cell))
    );

    const frontierCellKeys = new Set<string>();

    for (const cell of context.plan.cells) {
      for (const neighbor of this.getOrthogonalNeighbors(cell)) {
        if (planCellKeys.has(this.getCellKey(neighbor))) {
          continue;
        }

        const gridCell = context.grid.getCell(neighbor.row, neighbor.col);

        if (!gridCell) {
          continue;
        }

        if (!gridCell.buildable) {
          continue;
        }

        if (gridCell.occupied) {
          continue;
        }

        frontierCellKeys.add(this.getCellKey(neighbor));
      }
    }

    return frontierCellKeys.size;
  }

  private getOccupiedNeighborInstances(
    context: AIPlacementEvaluationContext
  ): PlacedBuildingInstance[] {
    const planCellKeys = new Set(
      context.plan.cells.map((cell) => this.getCellKey(cell))
    );

    const occupiedNeighborInstances =
      new Map<string, PlacedBuildingInstance>();

    for (const cell of context.plan.cells) {
      for (const neighbor of this.getOrthogonalNeighbors(cell)) {
        if (planCellKeys.has(this.getCellKey(neighbor))) {
          continue;
        }

        const instance = context.registry.getAtCell(neighbor);

        if (!instance) {
          continue;
        }

        occupiedNeighborInstances.set(instance.id, instance);
      }
    }

    return [...occupiedNeighborInstances.values()];
  }

  private countRoadAdjacencyEdges(
    context: AIPlacementEvaluationContext
  ): number {
    const planCellKeys = new Set(
      context.plan.cells.map((cell) => this.getCellKey(cell))
    );

    let roadAdjacencyEdges = 0;

    for (const cell of context.plan.cells) {
      for (const neighbor of this.getOrthogonalNeighbors(cell)) {
        if (planCellKeys.has(this.getCellKey(neighbor))) {
          continue;
        }

        const instance = context.registry.getAtCell(neighbor);

        if (!instance) {
          continue;
        }

        if (!this.isRoadLikeBuilding(instance.building)) {
          continue;
        }

        roadAdjacencyEdges++;
      }
    }

    return roadAdjacencyEdges;
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