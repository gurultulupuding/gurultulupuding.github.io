import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GridModel } from "../grid/GridModel";
import type { BoardEnvironmentConfig } from "./BoardEnvironmentConfig";
import { createGrassTerrainMaterial } from "./TerrainMaterialFactory";

export class TerrainPlateRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly config: BoardEnvironmentConfig;
  private readonly namePrefix: string;

  constructor(
    scene: Scene,
    grid: GridModel,
    config: BoardEnvironmentConfig,
    namePrefix: string = "environment-terrain"
  ) {
    this.scene = scene;
    this.grid = grid;
    this.config = config;
    this.namePrefix = namePrefix;
  }

  public render(): Mesh {
    const center = this.grid.getCenterWorldPosition();

    const terrainWidth =
      this.grid.cols *
      this.grid.cellSize *
      this.config.terrainWidthMultiplier;

    const terrainHeight =
      this.grid.rows *
      this.grid.cellSize *
      this.config.terrainHeightMultiplier;

    const material = createGrassTerrainMaterial(
      this.scene,
      `${this.namePrefix}-material`,
      this.config.grassTexturePath,
      this.config.grassTextureScale
    );

    const terrain = MeshBuilder.CreateGround(
      `${this.namePrefix}-plate`,
      {
        width: terrainWidth,
        height: terrainHeight,
      },
      this.scene
    );

    terrain.position = new Vector3(
      center.x,
      this.config.terrainYOffset,
      center.z
    );

    terrain.material = material;
    terrain.isPickable = false;

    return terrain;
  }
}