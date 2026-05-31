import { Scene } from "@babylonjs/core/scene";
import { PhotoDome } from "@babylonjs/core/Helpers/photoDome";

import { GridModel } from "../grid/GridModel";
import type { BoardEnvironmentConfig } from "./BoardEnvironmentConfig";

export class PanoramicSkyRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly config: BoardEnvironmentConfig;
  private readonly namePrefix: string;

  constructor(
    scene: Scene,
    grid: GridModel,
    config: BoardEnvironmentConfig,
    namePrefix: string
  ) {
    this.scene = scene;
    this.grid = grid;
    this.config = config;
    this.namePrefix = namePrefix;
  }

  public render(): void {
    if (!this.config.skyboxEnabled) {
      return;
    }

    const skyName = `${this.namePrefix}-panoramic-sky`;

    const existingSky = this.scene.getMeshByName(skyName);

    if (existingSky) {
      return;
    }

    const center = this.grid.getCenterWorldPosition();

    const dome = new PhotoDome(
      skyName,
      this.config.skyboxTexturePath,
      {
        resolution: this.config.skyboxResolution,
        size: this.config.skyboxSize,
      },
      this.scene
    );

    dome.mesh.parent = null;
    dome.mesh.setAbsolutePosition(center);
    dome.mesh.computeWorldMatrix(true);

    dome.mesh.infiniteDistance = false;
    dome.mesh.alwaysSelectAsActiveMesh = true;
    dome.mesh.isPickable = false;

    const absolutePosition = dome.mesh.getAbsolutePosition();
    const boundingSphere = dome.mesh.getBoundingInfo().boundingSphere;

    console.log("[SKYBOX WORLD DEBUG]", {
      skyName,

      gridOriginX: this.grid.originX,
      gridOriginZ: this.grid.originZ,

      requestedCenterX: center.x,
      requestedCenterY: center.y,
      requestedCenterZ: center.z,

      localPositionX: dome.mesh.position.x,
      localPositionY: dome.mesh.position.y,
      localPositionZ: dome.mesh.position.z,

      absolutePositionX: absolutePosition.x,
      absolutePositionY: absolutePosition.y,
      absolutePositionZ: absolutePosition.z,

      boundingCenterWorldX: boundingSphere.centerWorld.x,
      boundingCenterWorldY: boundingSphere.centerWorld.y,
      boundingCenterWorldZ: boundingSphere.centerWorld.z,

      skyboxSize: this.config.skyboxSize,
    });
  }
}