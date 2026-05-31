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

type CityCenter = {
  row: number;
  col: number;
};

export class RoadExpansionForIndustryZoneConsideration
  implements AIPlacementConsideration
{
  public readonly id = "road-expansion-for-industry-zone";

  private readonly earlyTurnLimit: number;
  private readonly baseExpansionBonus: number;
  private readonly industryInHandBonus: number;
  private readonly futureIndustrySpotBonus: number;
  private readonly existingIndustryBonus: number;
  private readonly outwardBonus: number;
  private readonly frontierBonus: number;
  private readonly roadConnectionBonus: number;
  private readonly civicConnectionBonus: number;
  private readonly monumentConnectionBonus: number;
  private readonly innerCrowdingPenalty: number;
  private readonly maximumScore: number;
  private readonly radius: number;
  private readonly minimumUsefulOutwardDistance: number;

  constructor(
    earlyTurnLimit: number = 8,
    baseExpansionBonus: number = 4,
    industryInHandBonus: number = 6,
    futureIndustrySpotBonus: number = 8,
    existingIndustryBonus: number = 4,
    outwardBonus: number = 5,
    frontierBonus: number = 4,
    roadConnectionBonus: number = 5,
    civicConnectionBonus: number = 3,
    monumentConnectionBonus: number = 3,
    innerCrowdingPenalty: number = 8,
    maximumScore: number = 22,
    radius: number = 2,
    minimumUsefulOutwardDistance: number = 2.0
  ) {
    this.earlyTurnLimit = earlyTurnLimit;
    this.baseExpansionBonus = baseExpansionBonus;
    this.industryInHandBonus = industryInHandBonus;
    this.futureIndustrySpotBonus = futureIndustrySpotBonus;
    this.existingIndustryBonus = existingIndustryBonus;
    this.outwardBonus = outwardBonus;
    this.frontierBonus = frontierBonus;
    this.roadConnectionBonus = roadConnectionBonus;
    this.civicConnectionBonus = civicConnectionBonus;
    this.monumentConnectionBonus = monumentConnectionBonus;
    this.innerCrowdingPenalty = innerCrowdingPenalty;
    this.maximumScore = maximumScore;
    this.radius = radius;
    this.minimumUsefulOutwardDistance = minimumUsefulOutwardDistance;
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

    const instances = context.registry.getAll();

    if (instances.length === 0) {
      return {
        score: 0,
        reason: `${this.id}: no existing city instances = 0`,
      };
    }

    const industryCards = context.handCards.filter(
      (card) => card.building.family === "industry"
    );

    const hasIndustryInHand = industryCards.length > 0;
    const hasExistingIndustry = context.aiScore.familyCounts.industry > 0;

    const isEarlyPreparation =
      context.currentTurn <= this.earlyTurnLimit &&
      context.aiScore.familyCounts.infrastructure <= 2;

    const hasStrategicReason =
      hasIndustryInHand || hasExistingIndustry || isEarlyPreparation;

    if (!hasStrategicReason) {
      return {
        score: 0,
        reason:
          `${this.id}: no industry reason and not early road preparation = 0`,
      };
    }

    const neighboringInstances = this.getNeighboringInstances(
      context.plan.cells,
      context.registry
    );

    const hasRoadConnection = neighboringInstances.some((instance) =>
      this.isRoadLikeBuilding(instance.building)
    );

    const hasCivicConnection = neighboringInstances.some((instance) =>
      this.isCivicConnector(instance.building)
    );

    const hasMonumentConnection = neighboringInstances.some((instance) =>
      this.isMonumentConnector(instance.building)
    );

    const cityCenter = this.calculateCityCenter(instances);
    const planDistanceFromCenter = this.getAverageDistanceFromCenter(
      context.plan.cells,
      cityCenter
    );

    const currentRoadDistance = this.getCurrentAverageRoadDistanceFromCenter(
      instances,
      cityCenter
    );

    const pushesOutward = planDistanceFromCenter > currentRoadDistance;

    const freeFrontierNeighborCount = this.countFreeBuildableNeighborCells(
      context.plan.cells,
      context.grid
    );

    const futureIndustrySpot =
      hasIndustryInHand &&
      industryCards.some((card) =>
        this.canFutureBuildingFitNearPlannedRoad(context, card.building)
      );

    let score = this.baseExpansionBonus;
    const reasons: string[] = [`base=+${this.baseExpansionBonus}`];

    if (hasRoadConnection) {
      score += this.roadConnectionBonus;
      reasons.push(`connected to road=+${this.roadConnectionBonus}`);
    }

    if (hasCivicConnection) {
      score += this.civicConnectionBonus;
      reasons.push(`connected to civic=+${this.civicConnectionBonus}`);
    }

    if (hasMonumentConnection) {
      score += this.monumentConnectionBonus;
      reasons.push(`connected to monument=+${this.monumentConnectionBonus}`);
    }

    if (hasIndustryInHand) {
      score += this.industryInHandBonus;
      reasons.push(`industry in hand=+${this.industryInHandBonus}`);
    }

    if (hasExistingIndustry) {
      score += this.existingIndustryBonus;
      reasons.push(`existing industry=+${this.existingIndustryBonus}`);
    }

    if (futureIndustrySpot) {
      score += this.futureIndustrySpotBonus;
      reasons.push(
        `creates future industry spot=+${this.futureIndustrySpotBonus}`
      );
    }

    if (pushesOutward) {
      score += this.outwardBonus;
      reasons.push(
        `pushes road outward ` +
          `(plan=${planDistanceFromCenter.toFixed(2)} > roadAvg=${currentRoadDistance.toFixed(2)})` +
          `=+${this.outwardBonus}`
      );
    }

    if (freeFrontierNeighborCount >= 3) {
      score += this.frontierBonus;
      reasons.push(
        `opens frontier cells (${freeFrontierNeighborCount})=+${this.frontierBonus}`
      );
    }

    const isInnerCrowdedRoad =
      planDistanceFromCenter < this.minimumUsefulOutwardDistance &&
      !hasMonumentConnection;

    if (isInnerCrowdedRoad) {
      score -= this.innerCrowdingPenalty;
      reasons.push(
        `too close to city core ` +
          `(distance=${planDistanceFromCenter.toFixed(2)} < ${this.minimumUsefulOutwardDistance})` +
          `=-${this.innerCrowdingPenalty}`
      );
    }

    const clampedScore = Math.max(
      -this.innerCrowdingPenalty,
      Math.min(this.maximumScore, score)
    );

    return {
      score: clampedScore,
      reason: `${this.id}: ${reasons.join(", ")}, final=${clampedScore}`,
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

  private isCivicConnector(building: {
    family: string;
    tags: string[];
  }): boolean {
    return (
      building.family === "civic" ||
      building.tags.includes("civic") ||
      building.tags.includes("service")
    );
  }

  private isMonumentConnector(building: {
    family: string;
    tags: string[];
  }): boolean {
    return (
      building.family === "monument" ||
      building.tags.includes("monument")
    );
  }

  private getNeighboringInstances(
    cells: GridCell[],
    registry: {
      getAtCell(cell: GridCell): PlacedBuildingInstance | null;
    }
  ): PlacedBuildingInstance[] {
    const planCellKeys = new Set(cells.map((cell) => this.getCellKey(cell)));
    const neighborInstances = new Map<string, PlacedBuildingInstance>();

    for (const cell of cells) {
      const neighbors = this.getOrthogonalNeighbors(cell);

      for (const neighbor of neighbors) {
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

  private canFutureBuildingFitNearPlannedRoad(
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

  private countFreeBuildableNeighborCells(
    cells: GridCell[],
    grid: {
      getCell(row: number, col: number):
        | {
            buildable: boolean;
            occupied: boolean;
          }
        | null;
    }
  ): number {
    const planCellKeys = new Set(cells.map((cell) => this.getCellKey(cell)));
    const freeNeighborKeys = new Set<string>();

    for (const cell of cells) {
      const neighbors = this.getOrthogonalNeighbors(cell);

      for (const neighbor of neighbors) {
        if (planCellKeys.has(this.getCellKey(neighbor))) {
          continue;
        }

        const gridCell = grid.getCell(neighbor.row, neighbor.col);

        if (!gridCell) {
          continue;
        }

        if (!gridCell.buildable || gridCell.occupied) {
          continue;
        }

        freeNeighborKeys.add(this.getCellKey(neighbor));
      }
    }

    return freeNeighborKeys.size;
  }

  private calculateCityCenter(
    instances: PlacedBuildingInstance[]
  ): CityCenter {
    const cells = instances.flatMap((instance) => instance.cells);

    const total = cells.reduce(
      (sum, cell) => ({
        row: sum.row + cell.row,
        col: sum.col + cell.col,
      }),
      { row: 0, col: 0 }
    );

    return {
      row: total.row / cells.length,
      col: total.col / cells.length,
    };
  }

  private getAverageDistanceFromCenter(
    cells: GridCell[],
    center: CityCenter
  ): number {
    if (cells.length === 0) {
      return 0;
    }

    const totalDistance = cells.reduce((sum, cell) => {
      return (
        sum +
        Math.abs(cell.row - center.row) +
        Math.abs(cell.col - center.col)
      );
    }, 0);

    return totalDistance / cells.length;
  }

  private getCurrentAverageRoadDistanceFromCenter(
    instances: PlacedBuildingInstance[],
    center: CityCenter
  ): number {
    const roadInstances = instances.filter((instance) =>
      this.isRoadLikeBuilding(instance.building)
    );

    if (roadInstances.length === 0) {
      return 0;
    }

    const roadCells = roadInstances.flatMap((instance) => instance.cells);

    return this.getAverageDistanceFromCenter(roadCells, center);
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
      const neighbors = this.getOrthogonalNeighbors(cell);

      for (const neighbor of neighbors) {
        if (secondCellKeys.has(this.getCellKey(neighbor))) {
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