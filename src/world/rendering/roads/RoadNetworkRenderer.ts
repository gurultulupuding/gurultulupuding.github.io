import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GridModel } from "../../grid/GridModel";
import { BuildingModelRepository } from "../BuildingModelRepository";
import { PlacedBuildingRegistry } from "../../city/PlacedBuildingRegistry";
import type {
  GridPosition,
  PlacedBuildingInstance,
} from "../../city/PlacedBuildingInstance";
import { PlacedBuildingRenderRegistry } from "../PlacedBuildingRenderRegistry";
import { ROAD_RENDER_ASSETS } from "./RoadRenderAssets";

type RoadConnections = {
  north: boolean;
  east: boolean;
  south: boolean;
  west: boolean;
};

type RoadVisualChoice = {
  assetPath: string;
  rotationDegrees: number;
};

export class RoadNetworkRenderer {
  private readonly grid: GridModel;
  private readonly modelRepository: BuildingModelRepository;
  private readonly namePrefix: string;
  private readonly roadRootsByCellKey = new Map<string, TransformNode>();
  private readonly renderVersionByCellKey = new Map<string, number>();
  private readonly renderRegistry: PlacedBuildingRenderRegistry;

  constructor(
    grid: GridModel,
    modelRepository: BuildingModelRepository,
    namePrefix: string,
    renderRegistry: PlacedBuildingRenderRegistry
  ) {
    this.grid = grid;
    this.modelRepository = modelRepository;
    this.namePrefix = namePrefix;
    this.renderRegistry = renderRegistry;
  }

  public refreshAroundCells(
    changedCells: GridPosition[],
    registry: PlacedBuildingRegistry
  ): void {
    const affectedCells = this.getAffectedCells(changedCells);
    const affectedRoadInstanceIds = new Set<string>();

    for (const cell of affectedCells) {
      const roadInstance = this.getRoadInstanceAt(cell, registry);

      if (roadInstance) {
        affectedRoadInstanceIds.add(roadInstance.id);
      }
    }

    for (const instanceId of affectedRoadInstanceIds) {
      const handle = this.renderRegistry.getOrCreate(instanceId);
      handle.clearReferences();
    }

    for (const cell of affectedCells) {
      this.refreshCell(cell, registry);
    }
  }

    private refreshCell(
    cell: GridPosition,
    registry: PlacedBuildingRegistry
    ): void {
        const cellKey = this.createCellKey(cell);
        const version = this.bumpRenderVersion(cellKey);

        this.disposeRoadVisualAt(cell);

        if (!this.grid.isInside(cell.row, cell.col)) {
            return;
        }

        const roadInstance = this.getRoadInstanceAt(cell, registry);

        if (!roadInstance) {
          return;
        }

        const connections = this.getRoadConnections(cell, registry);
        const visual = this.chooseRoadVisual(connections);

        void this.renderRoadVisual(cell, visual, roadInstance, version);
    }
    
    private bumpRenderVersion(cellKey: string): number {
        const nextVersion = (this.renderVersionByCellKey.get(cellKey) ?? 0) + 1;
        this.renderVersionByCellKey.set(cellKey, nextVersion);
        return nextVersion;
    }

    private async renderRoadVisual(
      cell: GridPosition,
      visual: RoadVisualChoice,
      roadInstance: PlacedBuildingInstance,
      expectedVersion: number
    ): Promise<void> {
        try {
            const cellKey = this.createCellKey(cell);

            const root = await this.modelRepository.instantiateModel(
            visual.assetPath,
            `${this.namePrefix}-road-${cell.row}-${cell.col}`
            );

            const currentVersion = this.renderVersionByCellKey.get(cellKey);

            if (currentVersion !== expectedVersion) {
            root.dispose(false, false);
            return;
            }

            const world = this.grid.cellToWorld(cell.row, cell.col);

            root.position = new Vector3(world.x, 0.025, world.z);
            root.rotation = new Vector3(
              0,
              this.degreesToRadians(visual.rotationDegrees),
              0
            );
            root.scaling = new Vector3(1, 1, 1);

            this.optimizeStaticRootTransformOnly(root);

            this.roadRootsByCellKey.set(cellKey, root);

            const handle = this.renderRegistry.getOrCreate(roadInstance.id);
            handle.addRoot(root);
        } catch (error) {
            console.error(
            `Failed to render road visual at ${cell.row}:${cell.col}`,
            error
            );
        }
        }

  private optimizeStaticRootTransformOnly(root: TransformNode): void {
    root.freezeWorldMatrix();

    for (const mesh of root.getChildMeshes(false)) {
      mesh.isPickable = false;
      mesh.freezeWorldMatrix();
    }
  }

  private disposeRoadVisualAt(cell: GridPosition): void {
    const cellKey = this.createCellKey(cell);
    const existingRoot = this.roadRootsByCellKey.get(cellKey);

    if (!existingRoot) {
      return;
    }

    existingRoot.dispose(false, false);
    this.roadRootsByCellKey.delete(cellKey);
  }

  private getAffectedCells(changedCells: GridPosition[]): GridPosition[] {
    const affectedByKey = new Map<string, GridPosition>();

    for (const cell of changedCells) {
      this.addAffectedCell(affectedByKey, cell);

      this.addAffectedCell(affectedByKey, {
        row: cell.row - 1,
        col: cell.col,
      });

      this.addAffectedCell(affectedByKey, {
        row: cell.row,
        col: cell.col + 1,
      });

      this.addAffectedCell(affectedByKey, {
        row: cell.row + 1,
        col: cell.col,
      });

      this.addAffectedCell(affectedByKey, {
        row: cell.row,
        col: cell.col - 1,
      });
    }

    return [...affectedByKey.values()];
  }

  private addAffectedCell(
    affectedByKey: Map<string, GridPosition>,
    cell: GridPosition
  ): void {
    if (!this.grid.isInside(cell.row, cell.col)) {
      return;
    }

    affectedByKey.set(this.createCellKey(cell), cell);
  }

  private getRoadConnections(
    cell: GridPosition,
    registry: PlacedBuildingRegistry
  ): RoadConnections {
    return {
      north: this.isRoadCell({ row: cell.row - 1, col: cell.col }, registry),
      east: this.isRoadCell({ row: cell.row, col: cell.col + 1 }, registry),
      south: this.isRoadCell({ row: cell.row + 1, col: cell.col }, registry),
      west: this.isRoadCell({ row: cell.row, col: cell.col - 1 }, registry),
    };
  }

  private isRoadCell(
    cell: GridPosition,
    registry: PlacedBuildingRegistry
  ): boolean {
    return this.getRoadInstanceAt(cell, registry) !== null;
  }

  private getRoadInstanceAt(
    cell: GridPosition,
    registry: PlacedBuildingRegistry
  ): PlacedBuildingInstance | null {
    if (!this.grid.isInside(cell.row, cell.col)) {
      return null;
    }

    const instance = registry.getAtCell(cell);

    if (!instance) {
      return null;
    }

    if (!instance.building.tags.includes("road")) {
      return null;
    }

    return instance;
  }

  private chooseRoadVisual(connections: RoadConnections): RoadVisualChoice {
    const connectionCount = [
      connections.north,
      connections.east,
      connections.south,
      connections.west,
    ].filter(Boolean).length;

    if (connectionCount === 0) {
      return {
        assetPath: ROAD_RENDER_ASSETS.end,
        rotationDegrees: 0,
      };
    }

    if (connectionCount === 1) {
      return this.chooseEndRoad(connections);
    }

    if (connectionCount === 2) {
      return this.chooseTwoConnectionRoad(connections);
    }

    if (connectionCount === 3) {
      return this.chooseIntersectionRoad(connections);
    }

    return {
      assetPath: ROAD_RENDER_ASSETS.crossroad,
      rotationDegrees: 0,
    };
  }

  private chooseEndRoad(connections: RoadConnections): RoadVisualChoice {
    if (connections.east) {
        return {
        assetPath: ROAD_RENDER_ASSETS.end,
        rotationDegrees: 180,
        };
    }

    if (connections.south) {
        return {
        assetPath: ROAD_RENDER_ASSETS.end,
        rotationDegrees: 90,
        };
    }

    if (connections.west) {
        return {
        assetPath: ROAD_RENDER_ASSETS.end,
        rotationDegrees: 0,
        };
    }

    return {
        assetPath: ROAD_RENDER_ASSETS.end,
        rotationDegrees: 270,
    };
    }

  private chooseTwoConnectionRoad(
    connections: RoadConnections
    ): RoadVisualChoice {
    if (connections.east && connections.west) {
        return {
        assetPath: ROAD_RENDER_ASSETS.straight,
        rotationDegrees: 0,
        };
    }

    if (connections.north && connections.south) {
        return {
        assetPath: ROAD_RENDER_ASSETS.straight,
        rotationDegrees: 90,
        };
    }

    if (connections.north && connections.east) {
        return {
        assetPath: ROAD_RENDER_ASSETS.bend,
        rotationDegrees: 90,
        };
    }

    if (connections.east && connections.south) {
        return {
        assetPath: ROAD_RENDER_ASSETS.bend,
        rotationDegrees: 0,
        };
    }

    if (connections.south && connections.west) {
        return {
        assetPath: ROAD_RENDER_ASSETS.bend,
        rotationDegrees: 270,
        };
    }

    return {
        assetPath: ROAD_RENDER_ASSETS.bend,
        rotationDegrees: 180,
    };
    }

  private chooseIntersectionRoad(
    connections: RoadConnections
    ): RoadVisualChoice {
    if (!connections.south) {
        return {
        assetPath: ROAD_RENDER_ASSETS.intersection,
        rotationDegrees: 180,
        };
    }

    if (!connections.west) {
        return {
        assetPath: ROAD_RENDER_ASSETS.intersection,
        rotationDegrees: 90,
        };
    }

    if (!connections.north) {
        return {
        assetPath: ROAD_RENDER_ASSETS.intersection,
        rotationDegrees: 0,
        };
    }

    return {
        assetPath: ROAD_RENDER_ASSETS.intersection,
        rotationDegrees: 270,
    };
    }

  private createCellKey(cell: GridPosition): string {
    return `${cell.row}:${cell.col}`;
  }

  private degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}