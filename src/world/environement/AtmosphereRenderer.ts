import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Material } from "@babylonjs/core/Materials/material";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GridModel } from "../grid/GridModel";
import type { BoardEnvironmentConfig } from "./BoardEnvironmentConfig";
import type { EnvironmentSide } from "./RiverBridgeRenderer";

type MistOrientation = "x-axis" | "z-axis";

export class AtmosphereRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly side: EnvironmentSide;
  private readonly config: BoardEnvironmentConfig;
  private readonly namePrefix: string;

  constructor(
    scene: Scene,
    grid: GridModel,
    side: EnvironmentSide,
    config: BoardEnvironmentConfig,
    namePrefix: string = "atmosphere"
  ) {
    this.scene = scene;
    this.grid = grid;
    this.side = side;
    this.config = config;
    this.namePrefix = namePrefix;
  }

  public render(): void {
    this.renderSceneFog();
    this.renderBoardEdgeMist();
  }

  private renderSceneFog(): void {
    if (!this.config.fogEnabled) {
      this.scene.fogEnabled = false;
      return;
    }

    this.scene.fogEnabled = true;
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogColor = this.config.fogColor;
    this.scene.fogStart = this.config.fogStart;
    this.scene.fogEnd = this.config.fogEnd;
  }

  private renderBoardEdgeMist(): void {
    if (!this.config.boardEdgeMistEnabled) {
      return;
    }

    const center = this.grid.getCenterWorldPosition();

    const terrainWidth =
      this.grid.cols *
      this.grid.cellSize *
      this.config.terrainWidthMultiplier;

    const terrainHeight =
      this.grid.rows *
      this.grid.cellSize *
      this.config.terrainHeightMultiplier;

    const minX = center.x - terrainWidth * 0.5;
    const maxX = center.x + terrainWidth * 0.5;
    const minZ = center.z - terrainHeight * 0.5;
    const maxZ = center.z + terrainHeight * 0.5;

    const inset = this.config.boardEdgeMistInsetFromEdge;

    const westX = minX + inset;
    const eastX = maxX - inset;
    const northZ = minZ + inset;
    const southZ = maxZ - inset;

    const verticalMistLength =
      terrainHeight + this.config.boardEdgeMistWidthPadding;

    const horizontalMistLength =
      terrainWidth + this.config.boardEdgeMistWidthPadding;

    this.renderMistStrip(
      `${this.namePrefix}-${this.side}-west-mist`,
      new Vector3(westX, 0, center.z),
      verticalMistLength,
      "z-axis"
    );

    this.renderMistStrip(
      `${this.namePrefix}-${this.side}-east-mist`,
      new Vector3(eastX, 0, center.z),
      verticalMistLength,
      "z-axis"
    );

    this.renderMistStrip(
      `${this.namePrefix}-${this.side}-north-mist`,
      new Vector3(center.x, 0, northZ),
      horizontalMistLength,
      "x-axis"
    );

    this.renderMistStrip(
      `${this.namePrefix}-${this.side}-south-mist`,
      new Vector3(center.x, 0, southZ),
      horizontalMistLength,
      "x-axis"
    );
  }

  private renderMistStrip(
    mistName: string,
    center: Vector3,
    length: number,
    orientation: MistOrientation
  ): void {
    if (this.scene.getMeshByName(mistName)) {
      return;
    }

    const mistHeight = this.config.boardEdgeMistHeight;

    const mist = MeshBuilder.CreatePlane(
      mistName,
      {
        width: length,
        height: mistHeight,
      },
      this.scene
    );

    mist.position = new Vector3(
      center.x,
      this.config.boardEdgeMistYOffset + mistHeight * 0.5,
      center.z
    );

    if (orientation === "z-axis") {
      mist.rotation.y = Math.PI / 2;
    } else {
      mist.rotation.y = 0;
    }

    mist.isPickable = false;

    const material = this.createMistMaterial(mistName, length);
    mist.material = material;
  }

  private createMistMaterial(mistName: string, length: number): StandardMaterial {
    const material = new StandardMaterial(`${mistName}-material`, this.scene);

    const texture = new Texture(
      this.config.boardEdgeMistTexturePath,
      this.scene
    );

    texture.hasAlpha = true;
    texture.wrapU = Texture.WRAP_ADDRESSMODE;
    texture.wrapV = Texture.CLAMP_ADDRESSMODE;

    const textureAspectRatio = 2048 / 1024;

    const singleTileWorldWidth =
      this.config.boardEdgeMistTileWorldHeight * textureAspectRatio;

    texture.uScale = length / singleTileWorldWidth;
    texture.vScale = 1;

    material.diffuseTexture = texture;
    material.opacityTexture = texture;

    material.diffuseColor = Color3.White();
    material.emissiveColor = new Color3(0.82, 0.9, 0.96);

    material.alpha = this.config.boardEdgeMistAlpha;
    material.specularColor = Color3.Black();
    material.backFaceCulling = false;

    material.useAlphaFromDiffuseTexture = true;
    material.transparencyMode = Material.MATERIAL_ALPHABLEND;
    material.fogEnabled = false;

    return material;
  }
}