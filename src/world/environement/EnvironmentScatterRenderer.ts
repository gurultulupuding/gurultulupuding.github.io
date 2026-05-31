import { Scene } from "@babylonjs/core/scene";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import "@babylonjs/loaders/glTF";

import { GridModel } from "../grid/GridModel";
import type {
  BoardEnvironmentConfig,
  EnvironmentScatterAssetConfig,
} from "./BoardEnvironmentConfig";
import type { EnvironmentSide } from "./RiverBridgeRenderer";

type RectBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

type ScatterPoint = {
  x: number;
  z: number;
};

type ImportedScatterAsset = {
  config: EnvironmentScatterAssetConfig;
  root: AbstractMesh;
};

export class EnvironmentScatterRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly side: EnvironmentSide;
  private readonly config: BoardEnvironmentConfig;
  private readonly namePrefix: string;

  private randomState: number;

  constructor(
    scene: Scene,
    grid: GridModel,
    side: EnvironmentSide,
    config: BoardEnvironmentConfig,
    namePrefix: string = "environment-scatter"
  ) {
    this.scene = scene;
    this.grid = grid;
    this.side = side;
    this.config = config;
    this.namePrefix = namePrefix;

    this.randomState =
      config.environmentScatterSeed + (side === "player" ? 0 : 100000);
  }

  public async render(): Promise<void> {
    if (!this.config.environmentScatterEnabled) {
      return;
    }

    if (this.config.environmentScatterAssets.length === 0) {
      console.warn("[ENVIRONMENT SCATTER] No scatter assets configured.");
      return;
    }

    const existingRoot = this.scene.getTransformNodeByName(
      `${this.namePrefix}-root`
    );

    if (existingRoot) {
      return;
    }

    await this.importAndScatter();
  }

  private async importAndScatter(): Promise<void> {
    const root = new TransformNode(`${this.namePrefix}-root`, this.scene);

    const terrainBounds = this.getTerrainBounds();
    const reservedBounds = this.getReservedBounds();

    const points = this.generateScatterPoints(terrainBounds, reservedBounds);
    const importedAssets = await this.importScatterAssets();

    const placementCounts = new Map<string, number>();

    for (let index = 0; index < points.length; index++) {
      const point = points[index];
      const asset = this.pickWeightedAsset(importedAssets);

      if (!asset) {
        continue;
      }

      placementCounts.set(
        asset.config.id,
        (placementCounts.get(asset.config.id) ?? 0) + 1
      );

      const instanceRoot = new TransformNode(
        `${this.namePrefix}-${asset.config.id}-${index}-root`,
        this.scene
      );

      instanceRoot.parent = root;
      instanceRoot.position = new Vector3(
        point.x,
        this.config.environmentScatterYOffset,
        point.z
      );

      const scale = this.randomRange(
        asset.config.minScale,
        asset.config.maxScale
      );

      instanceRoot.scaling = new Vector3(scale, scale, scale);
      instanceRoot.rotation.y = this.randomRange(0, Math.PI * 2);

      const cloneRoot = asset.root.clone(
        `${this.namePrefix}-${asset.config.id}-${index}`,
        instanceRoot,
        false
      );

      if (!cloneRoot) {
        continue;
      }

      cloneRoot.setEnabled(true);
      cloneRoot.isPickable = false;

      for (const child of cloneRoot.getChildMeshes(false)) {
        child.setEnabled(true);
        child.isPickable = false;
      }
    }

    console.log("[ENVIRONMENT SCATTER]", {
      side: this.side,
      namePrefix: this.namePrefix,
      pointCount: points.length,
      assetCount: importedAssets.length,
      terrainBounds,
      reservedBounds,
      placementCounts: Object.fromEntries(placementCounts),
    });
  }

  private async importScatterAssets(): Promise<ImportedScatterAsset[]> {
    const importedAssets: ImportedScatterAsset[] = [];

    for (const assetConfig of this.config.environmentScatterAssets) {
      const { rootUrl, fileName } = this.splitModelPath(assetConfig.modelPath);

      try {
        const result = await SceneLoader.ImportMeshAsync(
          "",
          rootUrl,
          fileName,
          this.scene
        );

        const rootMesh = result.meshes[0];

        if (!rootMesh) {
          console.warn("[SCATTER ASSET IMPORTED WITHOUT ROOT]", {
            id: assetConfig.id,
            path: assetConfig.modelPath,
          });
          continue;
        }

        for (const mesh of result.meshes) {
          mesh.isPickable = false;
          mesh.setEnabled(false);
        }

        console.log("[SCATTER ASSET IMPORTED]", {
          id: assetConfig.id,
          path: assetConfig.modelPath,
          meshCount: result.meshes.length,
          rootName: rootMesh.name,
          meshes: result.meshes.map((mesh) => ({
            name: mesh.name,
            scaling: [mesh.scaling.x, mesh.scaling.y, mesh.scaling.z],
            position: [mesh.position.x, mesh.position.y, mesh.position.z],
            rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
          })),
        });

        importedAssets.push({
          config: assetConfig,
          root: rootMesh,
        });
      } catch (error) {
        console.error("[SCATTER ASSET IMPORT FAILED]", {
          id: assetConfig.id,
          path: assetConfig.modelPath,
          error,
        });
      }
    }

    return importedAssets;
  }

  private generateScatterPoints(
    terrainBounds: RectBounds,
    reservedBounds: RectBounds[]
  ): ScatterPoint[] {
    const points: ScatterPoint[] = [];
    const maxAttempts = this.config.environmentScatterCount * 80;

    let attempts = 0;

    while (
      points.length < this.config.environmentScatterCount &&
      attempts < maxAttempts
    ) {
      attempts++;

      const x = this.randomRange(terrainBounds.minX, terrainBounds.maxX);
      const z = this.randomRange(terrainBounds.minZ, terrainBounds.maxZ);

      if (this.isInsideAnyBounds(x, z, reservedBounds)) {
        continue;
      }

      if (!this.isFarEnoughFromExistingPoints(x, z, points)) {
        continue;
      }

      points.push({ x, z });
    }

    if (points.length < this.config.environmentScatterCount) {
      console.warn("[ENVIRONMENT SCATTER] Could not place all points.", {
        side: this.side,
        requested: this.config.environmentScatterCount,
        placed: points.length,
        attempts,
      });
    }

    return points;
  }

  private getTerrainBounds(): RectBounds {
    const terrainCenter = this.grid.getCenterWorldPosition();

    const terrainWidth =
      this.grid.cols *
      this.grid.cellSize *
      this.config.terrainWidthMultiplier;

    const terrainHeight =
      this.grid.rows *
      this.grid.cellSize *
      this.config.terrainHeightMultiplier;

    const terrainInset = this.config.environmentScatterTerrainInset;

    const fullTerrainBounds: RectBounds = {
      minX: terrainCenter.x - terrainWidth * 0.5 + terrainInset,
      maxX: terrainCenter.x + terrainWidth * 0.5 - terrainInset,
      minZ: terrainCenter.z - terrainHeight * 0.5 + terrainInset,
      maxZ: terrainCenter.z + terrainHeight * 0.5 - terrainInset,
    };

    const distance = this.config.environmentScatterAroundGridDistance;

    const nearGridBounds: RectBounds = {
      minX: this.grid.originX - distance,
      maxX: this.grid.originX + this.grid.cols * this.grid.cellSize + distance,
      minZ: this.grid.originZ - distance,
      maxZ: this.grid.originZ + this.grid.rows * this.grid.cellSize + distance,
    };

    return {
      minX: Math.max(fullTerrainBounds.minX, nearGridBounds.minX),
      maxX: Math.min(fullTerrainBounds.maxX, nearGridBounds.maxX),
      minZ: Math.max(fullTerrainBounds.minZ, nearGridBounds.minZ),
      maxZ: Math.min(fullTerrainBounds.maxZ, nearGridBounds.maxZ),
    };
  }

  private getReservedBounds(): RectBounds[] {
    return [
      this.getGridReservedBounds(),
      this.getRiverSideReservedBounds(),
    ];
  }

  private getGridReservedBounds(): RectBounds {
    const padding = this.config.environmentScatterGridPadding;

    return {
      minX: this.grid.originX - padding,
      maxX: this.grid.originX + this.grid.cols * this.grid.cellSize + padding,
      minZ: this.grid.originZ - padding,
      maxZ: this.grid.originZ + this.grid.rows * this.grid.cellSize + padding,
    };
  }

  private getRiverSideReservedBounds(): RectBounds {
    const terrainBounds = this.getTerrainBounds();

    const gridMinX = this.grid.originX;
    const gridMaxX = this.grid.originX + this.grid.cols * this.grid.cellSize;

    const padding = this.config.environmentScatterRiverSidePadding;

    if (this.side === "player") {
      return {
        minX: gridMaxX - padding,
        maxX: terrainBounds.maxX,
        minZ: terrainBounds.minZ,
        maxZ: terrainBounds.maxZ,
      };
    }

    return {
      minX: terrainBounds.minX,
      maxX: gridMinX + padding,
      minZ: terrainBounds.minZ,
      maxZ: terrainBounds.maxZ,
    };
  }

  private isInsideAnyBounds(
    x: number,
    z: number,
    boundsList: RectBounds[]
  ): boolean {
    for (const bounds of boundsList) {
      if (this.isInsideBounds(x, z, bounds)) {
        return true;
      }
    }

    return false;
  }

  private isInsideBounds(x: number, z: number, bounds: RectBounds): boolean {
    return (
      x >= bounds.minX &&
      x <= bounds.maxX &&
      z >= bounds.minZ &&
      z <= bounds.maxZ
    );
  }

  private isFarEnoughFromExistingPoints(
    x: number,
    z: number,
    points: ScatterPoint[]
  ): boolean {
    const minDistance = this.config.environmentScatterMinDistance;
    const minDistanceSquared = minDistance * minDistance;

    for (const point of points) {
      const dx = x - point.x;
      const dz = z - point.z;

      if (dx * dx + dz * dz < minDistanceSquared) {
        return false;
      }
    }

    return true;
  }

  private pickWeightedAsset(
    assets: ImportedScatterAsset[]
  ): ImportedScatterAsset | null {
    const totalWeight = assets.reduce(
      (sum, asset) => sum + asset.config.weight,
      0
    );

    if (totalWeight <= 0) {
      return null;
    }

    let roll = this.randomRange(0, totalWeight);

    for (const asset of assets) {
      roll -= asset.config.weight;

      if (roll <= 0) {
        return asset;
      }
    }

    return assets[assets.length - 1] ?? null;
  }

  private random(): number {
    this.randomState =
      (1664525 * this.randomState + 1013904223) % 4294967296;

    return this.randomState / 4294967296;
  }

  private randomRange(min: number, max: number): number {
    return min + (max - min) * this.random();
  }

  private splitModelPath(modelPath: string): {
    rootUrl: string;
    fileName: string;
  } {
    const lastSlashIndex = modelPath.lastIndexOf("/");

    if (lastSlashIndex === -1) {
      return {
        rootUrl: "",
        fileName: modelPath,
      };
    }

    return {
      rootUrl: modelPath.slice(0, lastSlashIndex + 1),
      fileName: modelPath.slice(lastSlashIndex + 1),
    };
  }
}