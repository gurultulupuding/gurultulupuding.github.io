import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Material } from "@babylonjs/core/Materials/material";

import { GridModel } from "../grid/GridModel";
import type { BoardEnvironmentConfig } from "./BoardEnvironmentConfig";
import type { EnvironmentSide } from "./RiverBridgeRenderer";

export type RiverWorldBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
};

type CloudEdgeOrientation = "x-axis" | "z-axis";

export class CloudEdgeRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly config: BoardEnvironmentConfig;
  private readonly side: EnvironmentSide;
  private readonly namePrefix: string;

  constructor(
    scene: Scene,
    grid: GridModel,
    side: EnvironmentSide,
    config: BoardEnvironmentConfig,
    namePrefix: string = "cloud-edge"
  ) {
    this.scene = scene;
    this.grid = grid;
    this.side = side;
    this.config = config;
    this.namePrefix = namePrefix;
  }

  public renderFromRiverBounds(bounds: RiverWorldBounds): void {
    if (!this.config.cloudEdgeEnabled) {
      return;
    }

    const cloudHeight = this.config.cloudEdgeHeight;
    const center = this.grid.getCenterWorldPosition();

    const terrainWidth =
      this.grid.cols *
      this.grid.cellSize *
      this.config.terrainWidthMultiplier;

    const terrainMinX = center.x - terrainWidth * 0.5;
    const terrainMaxX = center.x + terrainWidth * 0.5;

    const riverCenterZ = (bounds.minZ + bounds.maxZ) * 0.5;
    const riverLength = bounds.maxZ - bounds.minZ;

    const riverCloudLength =
        riverLength + this.config.cloudEdgeRiverLengthPadding;

    const verticalCloudLength =
        riverLength + this.config.cloudEdgeWidthPadding;

    const rectMinZ = riverCenterZ - verticalCloudLength * 0.5;
    const rectMaxZ = riverCenterZ + verticalCloudLength * 0.5;

    const riverSideX =
      this.side === "player"
        ? bounds.maxX + this.config.cloudEdgeDistanceFromRiverEdge
        : bounds.minX - this.config.cloudEdgeDistanceFromRiverEdge;

    const oppositeSideX =
      this.side === "player"
        ? terrainMinX + this.config.cloudEdgeOppositeInset
        : terrainMaxX - this.config.cloudEdgeOppositeInset;

    const insetRectMinZ = rectMinZ + this.config.cloudEdgeNonRiverInset;
    const insetRectMaxZ = rectMaxZ - this.config.cloudEdgeNonRiverInset;

    const rectMinX = Math.min(riverSideX, oppositeSideX);
    const rectMaxX = Math.max(riverSideX, oppositeSideX);
    const rectCenterX = (rectMinX + rectMaxX) * 0.5;

    const horizontalCloudLength = rectMaxX - rectMinX;
    const cloudY = this.config.cloudEdgeYOffset + cloudHeight * 0.5;

    this.renderCloudEdgePlane(
      `${this.namePrefix}-river-mesh`,
      new Vector3(riverSideX, cloudY, riverCenterZ),
      riverCloudLength,
      "z-axis"
    );

    this.renderCloudEdgePlane(
      `${this.namePrefix}-opposite-mesh`,
      new Vector3(oppositeSideX, cloudY, riverCenterZ),
      verticalCloudLength,
      "z-axis"
    );

    this.renderCloudEdgePlane(
      `${this.namePrefix}-north-mesh`,
      new Vector3(rectCenterX, cloudY, insetRectMinZ),
      horizontalCloudLength,
      "x-axis"
    );

    this.renderCloudEdgePlane(
      `${this.namePrefix}-south-mesh`,
      new Vector3(rectCenterX, cloudY, insetRectMaxZ),
      horizontalCloudLength,
      "x-axis"
    );
  }

  private getOffsetTowardBoardCenter(
    position: Vector3,
    orientation: CloudEdgeOrientation
    ): Vector3 {
    const center = this.grid.getCenterWorldPosition();
    const offset = this.config.cloudEdgeLayerOffset;

    if (orientation === "z-axis") {
        const directionX = center.x >= position.x ? 1 : -1;
        return new Vector3(directionX * offset, 0, 0);
    }

    const directionZ = center.z >= position.z ? 1 : -1;
    return new Vector3(0, 0, directionZ * offset);
    }

    private disposeExistingCloudEdgePlane(cloudName: string): void {
      const existingCloud = this.scene.getMeshByName(cloudName);
      const existingBacking = this.scene.getMeshByName(`${cloudName}-backing`);

      existingCloud?.dispose(false, true);
      existingBacking?.dispose(false, true);
    }

  private renderCloudEdgePlane(
    cloudName: string,
    position: Vector3,
    width: number,
    orientation: CloudEdgeOrientation
    ): void {
    this.disposeExistingCloudEdgePlane(cloudName);

    const rotationY = orientation === "z-axis" ? Math.PI / 2 : 0;

    const offsetTowardCenter = this.getOffsetTowardBoardCenter(
        position,
        orientation
    );

    if (this.config.cloudEdgeBackingEnabled) {
        const backingHeight =
        this.config.cloudEdgeHeight *
        this.config.cloudEdgeBackingHeightRatio;

        const backing = MeshBuilder.CreatePlane(
        `${cloudName}-backing`,
        {
            width,
            height: backingHeight,
        },
        this.scene
        );

        const backingPosition = position.clone();

        backingPosition.y =
        this.config.cloudEdgeYOffset + backingHeight * 0.5;

        if (orientation === "z-axis") {
        backingPosition.x -= offsetTowardCenter.x;
        } else {
        backingPosition.z -= offsetTowardCenter.z;
        }

        backing.position = backingPosition;
        backing.rotation.y = rotationY;
        backing.isPickable = false;
        backing.material = this.createCloudEdgeBackingMaterial(cloudName);
    }

    const cloud = MeshBuilder.CreatePlane(
        cloudName,
        {
        width,
        height: this.config.cloudEdgeHeight,
        },
        this.scene
    );

    const cloudPosition = position.clone();

    if (orientation === "z-axis") {
        cloudPosition.x += offsetTowardCenter.x;
    } else {
        cloudPosition.z += offsetTowardCenter.z;
    }

    cloud.position = cloudPosition;
    cloud.rotation.y = rotationY;
    cloud.isPickable = false;
    cloud.material = this.createCloudEdgeMaterial(cloudName, width);
    }

  private createCloudEdgeMaterial(
    cloudName: string,
    cloudWidth: number
  ): StandardMaterial {
    const material = new StandardMaterial(
      `${cloudName}-material`,
      this.scene
    );

    const texture = new Texture(
      this.config.cloudEdgeTexturePath,
      this.scene
    );

    texture.hasAlpha = true;
    texture.wrapU = Texture.WRAP_ADDRESSMODE;
    texture.wrapV = Texture.CLAMP_ADDRESSMODE;

    const textureAspectRatio = 1774 / 887;

    const singleTileWorldWidth =
      this.config.cloudEdgeTileWorldHeight * textureAspectRatio;

    texture.uScale = cloudWidth / singleTileWorldWidth;
    texture.vScale = 1;

    material.diffuseTexture = texture;
    material.opacityTexture = texture;

    material.diffuseColor = new Color3(1.0, 0.92, 0.98);
    material.emissiveColor = new Color3(1.0, 0.86, 0.98);

    material.alpha = this.config.cloudEdgeAlpha;
    material.specularColor = Color3.Black();
    material.backFaceCulling = false;

    material.useAlphaFromDiffuseTexture = true;
    material.transparencyMode = Material.MATERIAL_ALPHABLEND;
    material.fogEnabled = false;

    material.disableLighting = true;

    return material;
  }

  private createCloudEdgeBackingMaterial(
    cloudName: string
  ): StandardMaterial {
    const material = new StandardMaterial(
      `${cloudName}-backing-material`,
      this.scene
    );

    material.diffuseColor = this.config.cloudEdgeBackingColor;
    material.emissiveColor = this.config.cloudEdgeBackingColor;
    material.specularColor = Color3.Black();
    material.alpha = 1.0;
    material.backFaceCulling = false;
    material.fogEnabled = false;

    return material;
  }
}