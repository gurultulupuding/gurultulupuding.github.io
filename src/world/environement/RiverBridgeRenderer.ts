import { Scene } from "@babylonjs/core/scene";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import "@babylonjs/loaders/glTF";

import { GridModel } from "../grid/GridModel";
import type { BoardEnvironmentConfig } from "./BoardEnvironmentConfig";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Color3, Material, Mesh, MeshBuilder, StandardMaterial, Texture, VertexBuffer } from "@babylonjs/core";
import { CloudEdgeRenderer, type RiverWorldBounds } from "./CloudEdgeRenderer";

export type EnvironmentSide = "player" | "ai";

type RiverColumnBounds = {
  startCol: number;
  endCol: number;
};

export class RiverBridgeRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly config: BoardEnvironmentConfig;
  private readonly namePrefix: string;
  private readonly side: EnvironmentSide;
  private readonly getActiveSide: () => EnvironmentSide;

  constructor(
    scene: Scene,
    grid: GridModel,
    side: EnvironmentSide,
    config: BoardEnvironmentConfig,
    getActiveSide: () => EnvironmentSide,
    namePrefix: string = "river-bridge"
  ) {
    this.scene = scene;
    this.grid = grid;
    this.side = side;
    this.config = config;
    this.getActiveSide = getActiveSide;
    this.namePrefix = namePrefix;
  }

  public async render(): Promise<void> {
    if (!this.config.riverBridgeEnabled) {
      return;
    }

    const rootName = `${this.namePrefix}-root`;

    const existingRoot = this.scene.getTransformNodeByName(rootName);

    if (existingRoot) {
      return;
    }

    const root = new TransformNode(rootName, this.scene);

    await this.importAndPlaceModel(root);
  }

    private async importAndPlaceModel(root: TransformNode): Promise<void> {
    const riverBounds = this.findRiverColumnBounds();

    if (!riverBounds) {
        console.warn(`[RiverBridgeRenderer] No river columns found for ${this.namePrefix}.`);
        root.dispose();
        return;
    }

    const center = this.getRiverCenterWorldPosition(
        riverBounds.startCol,
        riverBounds.endCol
    );

    root.position = new Vector3(
        center.x,
        this.config.riverBridgeYOffset,
        center.z
    );

    root.scaling = new Vector3(
        this.config.riverBridgeScale,
        this.config.riverBridgeScale,
        this.config.riverBridgeScale
    );

    root.rotation.y =
        this.side === "ai"
        ? this.config.riverBridgeRotationY + Math.PI
        : this.config.riverBridgeRotationY;

    const { rootUrl, fileName } = this.splitModelPath(
        this.config.riverBridgeModelPath
    );

    const result = await SceneLoader.ImportMeshAsync(
        "",
        rootUrl,
        fileName,
        this.scene
    );

    for (const mesh of result.meshes) {
      mesh.parent = root;
      mesh.isPickable = false;

      this.disablePickingForChildren(mesh);
    }

    const childMeshes = root.getChildMeshes(false);

    this.applyRiverWaterMaterial(childMeshes);

    const riverMesh = this.findRiverBaseMesh(childMeshes);

    if (riverMesh) {
      this.renderRiverSurfaceEffectsFromMesh(riverMesh);
    }

    console.log("[RIVER ASSET DEBUG]", {
      namePrefix: this.namePrefix,
      side: this.side,
      rootName: root.name,
      rootPosition: root.position.asArray(),
      rootRotationY: root.rotation.y,
      rootScaling: root.scaling.asArray(),
      meshCount: result.meshes.length,
      childMeshCount: root.getChildMeshes(false).length,
      meshes: root.getChildMeshes(false).map((mesh) => ({
        name: mesh.name,
        id: mesh.id,
        materialName: mesh.material?.name ?? null,
        materialClass: mesh.material?.getClassName?.() ?? null,
        hasAlphaBlending: mesh.material?.needAlphaBlending?.() ?? null,
        hasAlphaTesting: mesh.material?.needAlphaTesting?.() ?? null,
        visibility: mesh.visibility,
        isEnabled: mesh.isEnabled(),
        position: mesh.position.asArray(),
        absolutePosition: mesh.getAbsolutePosition().asArray(),
      })),
    });
    }

  private findRiverColumnBounds(): RiverColumnBounds | null {
    let startCol: number | null = null;
    let endCol: number | null = null;

    for (let col = 0; col < this.grid.cols; col++) {
      if (!this.columnContainsRiver(col)) {
        continue;
      }

      if (startCol === null) {
        startCol = col;
      }

      endCol = col;
    }

    if (startCol === null || endCol === null) {
      return null;
    }

    return {
      startCol,
      endCol,
    };
  }

  private columnContainsRiver(col: number): boolean {
    for (let row = 0; row < this.grid.rows; row++) {
      const cell = this.grid.getCell(row, col);

      if (cell?.shoreType === "river") {
        return true;
      }
    }

    return false;
  }

  private getRiverCenterWorldPosition(
    startCol: number,
    endCol: number
  ): Vector3 {
    const centerRow = this.grid.rows / 2;
    const centerCol = (startCol + endCol + 1) / 2;

    const x = this.grid.originX + centerCol * this.grid.cellSize;
    const z = this.grid.originZ + centerRow * this.grid.cellSize;

    return new Vector3(x, 0, z);
  }

  private disablePickingForChildren(mesh: AbstractMesh): void {
    for (const child of mesh.getChildMeshes()) {
      child.isPickable = false;
    }
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
/*
  private applyRiverBaseMaterialPolish(meshes: AbstractMesh[]): void {
    for (const mesh of meshes) {
      const meshName = mesh.name.toLowerCase();

      if (!meshName.includes("tile_for_home")) {
        continue;
      }

      const material = mesh.material;

      if (!(material instanceof PBRMaterial)) {
        continue;
      }

      const riverMaterial = material.clone(`${mesh.name}-river-pbr`);

      riverMaterial.albedoColor = new Color3(0.12, 0.48, 0.82);
      riverMaterial.emissiveColor = new Color3(0.01, 0.06, 0.1);
      riverMaterial.metallic = 0.0;
      riverMaterial.roughness = 0.32;

      mesh.material = riverMaterial;
    }
  }
*/
  private applyRiverWaterMaterial(meshes: AbstractMesh[]): void {
    for (const mesh of meshes) {
      const meshName = mesh.name.toLowerCase();

      if (!meshName.includes("tile_for_home")) {
        continue;
      }

      this.ensurePlanarUvForRiverMesh(mesh);

      const waterMaterial = new PBRMaterial(
        `${mesh.name}-visible-water-texture-material`,
        this.scene
      );

      const waterTexture = new Texture(
        this.config.riverWaterTexturePath,
        this.scene
      );

      waterTexture.uScale = this.config.riverWaterTextureScale;
      waterTexture.vScale = this.config.riverWaterTextureScale;
      waterTexture.wrapU = Texture.WRAP_ADDRESSMODE;
      waterTexture.wrapV = Texture.WRAP_ADDRESSMODE;
      waterTexture.level = 1.5;

      waterMaterial.albedoTexture = waterTexture;
      waterMaterial.albedoColor = Color3.White();

      waterMaterial.emissiveTexture = waterTexture;
      waterMaterial.emissiveColor = new Color3(0.02, 0.07, 0.1);

      waterMaterial.metallic = 0.0;
      waterMaterial.roughness = 0.18;

      mesh.material = waterMaterial;

      this.scene.onBeforeRenderObservable.add(() => {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;

        const flowDirection = this.getActiveSide() === "ai" ? -1 : 1;

        waterTexture.uOffset +=
          this.config.riverWaterFlowSpeedU * flowDirection * deltaTime;

        waterTexture.vOffset +=
          this.config.riverWaterFlowSpeedV * flowDirection * deltaTime;
      });
    }
  }

  private ensurePlanarUvForRiverMesh(mesh: AbstractMesh): void {
    if (!(mesh instanceof Mesh)) {
      return;
    }

    const positions = mesh.getVerticesData(VertexBuffer.PositionKind);

    if (!positions) {
      return;
    }

    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }

    const width = Math.max(maxX - minX, 0.0001);
    const depth = Math.max(maxZ - minZ, 0.0001);

    const uvs: number[] = [];

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];

      const u = (x - minX) / width;
      const v = (z - minZ) / depth;

      uvs.push(u, v);
    }

    mesh.setVerticesData(VertexBuffer.UVKind, uvs, true);

    console.log("[WATER UV GENERATED]", {
      meshName: mesh.name,
      vertexCount: positions.length / 3,
      uvCount: uvs.length,
      minX,
      maxX,
      minZ,
      maxZ,
    });
  }

  private findRiverBaseMesh(meshes: AbstractMesh[]): AbstractMesh | null {
    return (
      meshes.find((mesh) =>
        mesh.name.toLowerCase().includes("tile_for_home")
      ) ?? null
    );
  }

  private renderRiverSurfaceEffectsFromMesh(riverMesh: AbstractMesh): void {
    if (!this.config.riverSurfaceEffectsEnabled) {
      return;
    }

    riverMesh.computeWorldMatrix(true);
    const boundingInfo = riverMesh.getBoundingInfo();
    const boundingBox = boundingInfo.boundingBox;

    const min = boundingBox.minimumWorld;
    const max = boundingBox.maximumWorld;

    this.renderRiverEndMistFromBounds(min.x, max.x, min.z, max.z, max.y);

    const width = max.x - min.x;
    const height = max.z - min.z;

    const riverWorldBounds: RiverWorldBounds = {
      minX: min.x,
      maxX: max.x,
      minY: min.y,
      maxY: max.y,
      minZ: min.z,
      maxZ: max.z,
    };

    const cloudEdgeRenderer = new CloudEdgeRenderer(
      this.scene,
      this.grid,
      this.side,
      this.config,
      `${this.namePrefix}-cloud-edge`
    );

    cloudEdgeRenderer.renderFromRiverBounds(riverWorldBounds);

    const centerX = (min.x + max.x) * 0.5;
    const centerZ = (min.z + max.z) * 0.5;
    const surfaceY = max.y;

    console.log("[RIVER EFFECT BOUNDS DEBUG]", {
      namePrefix: this.namePrefix,
      side: this.side,
      riverMeshName: riverMesh.name,
      minX: min.x,
      maxX: max.x,
      minY: min.y,
      maxY: max.y,
      minZ: min.z,
      maxZ: max.z,
      width,
      height,
    });

    this.renderRiverOverlayFromBounds(
      "primary",
      centerX,
      centerZ,
      width,
      height,
      surfaceY + this.config.riverOverlayPrimaryYOffset,
      this.config.riverOverlayPrimaryScale,
      this.config.riverOverlayPrimaryAlpha,
      this.config.riverOverlayPrimaryFlowU,
      this.config.riverOverlayPrimaryFlowV
    );

    this.renderRiverOverlayFromBounds(
      "secondary",
      centerX,
      centerZ,
      width,
      height,
      surfaceY + this.config.riverOverlaySecondaryYOffset,
      this.config.riverOverlaySecondaryScale,
      this.config.riverOverlaySecondaryAlpha,
      this.config.riverOverlaySecondaryFlowU,
      this.config.riverOverlaySecondaryFlowV
    );

    if (this.config.riverEdgeLightEnabled) {
      this.renderRiverEdgeLightsFromBounds(
        min.x,
        max.x,
        centerZ,
        height,
        surfaceY
      );
    }

    if (this.config.riverFoamEnabled) {
      this.renderRiverFoamFromBounds(
        min.x,
        max.x,
        centerZ,
        height,
        surfaceY
      );
    }
  }

  private renderRiverOverlayFromBounds(
    layerName: string,
    centerX: number,
    centerZ: number,
    width: number,
    height: number,
    y: number,
    textureScale: number,
    alpha: number,
    flowU: number,
    flowV: number
  ): void {
    const overlayName = `${this.namePrefix}-${layerName}-river-overlay`;

    const existingOverlay = this.scene.getMeshByName(overlayName);

    if (existingOverlay) {
      return;
    }

    const overlay = MeshBuilder.CreateGround(
      overlayName,
      {
        width,
        height,
      },
      this.scene
    );

    overlay.position = new Vector3(centerX, y, centerZ);
    overlay.isPickable = false;

    const material = new StandardMaterial(
      `${overlayName}-material`,
      this.scene
    );

    const texture = new Texture(
      this.config.riverOverlayTexturePath,
      this.scene
    );

    texture.uScale = textureScale;
    texture.vScale = textureScale;
    texture.wrapU = Texture.WRAP_ADDRESSMODE;
    texture.wrapV = Texture.WRAP_ADDRESSMODE;
    texture.level = 1.2;

    material.diffuseTexture = texture;
    material.opacityTexture = texture;

    material.diffuseColor = new Color3(0.75, 0.9, 1.0);
    material.emissiveColor = new Color3(0.12, 0.18, 0.22);
    material.alpha = alpha;
    material.specularColor = Color3.Black();
    material.backFaceCulling = false;
    material.useAlphaFromDiffuseTexture = true;

    overlay.material = material;

    this.scene.onBeforeRenderObservable.add(() => {
      const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
      const flowDirection = this.getActiveSide() === "ai" ? -1 : 1;

      texture.uOffset += flowU * flowDirection * deltaTime;
      texture.vOffset += flowV * flowDirection * deltaTime;
    });
  }

  private renderRiverEdgeLightsFromBounds(
    minX: number,
    maxX: number,
    centerZ: number,
    height: number,
    surfaceY: number
  ): void {
    this.renderVerticalRiverStrip(
      `${this.namePrefix}-left-river-edge-light`,
      minX,
      centerZ,
      this.config.riverEdgeLightThickness,
      height,
      surfaceY + this.config.riverEdgeLightYOffset,
      new Color3(0.7, 0.9, 1.0),
      this.config.riverEdgeLightAlpha
    );

    this.renderVerticalRiverStrip(
      `${this.namePrefix}-right-river-edge-light`,
      maxX,
      centerZ,
      this.config.riverEdgeLightThickness,
      height,
      surfaceY + this.config.riverEdgeLightYOffset,
      new Color3(0.7, 0.9, 1.0),
      this.config.riverEdgeLightAlpha
    );
  }

  private renderRiverFoamFromBounds(
    minX: number,
    maxX: number,
    centerZ: number,
    height: number,
    surfaceY: number
  ): void {
    this.renderVerticalRiverStrip(
      `${this.namePrefix}-left-river-foam`,
      minX + this.config.riverFoamInset,
      centerZ,
      this.config.riverFoamThickness,
      height,
      surfaceY + this.config.riverFoamYOffset,
      new Color3(0.92, 0.97, 1.0),
      this.config.riverFoamAlpha
    );

    this.renderVerticalRiverStrip(
      `${this.namePrefix}-right-river-foam`,
      maxX - this.config.riverFoamInset,
      centerZ,
      this.config.riverFoamThickness,
      height,
      surfaceY + this.config.riverFoamYOffset,
      new Color3(0.92, 0.97, 1.0),
      this.config.riverFoamAlpha
    );
  }

  private renderVerticalRiverStrip(
    name: string,
    x: number,
    z: number,
    width: number,
    height: number,
    y: number,
    color: Color3,
    alpha: number
  ): void {
    const existingStrip = this.scene.getMeshByName(name);

    if (existingStrip) {
      return;
    }

    const strip = MeshBuilder.CreateGround(
      name,
      {
        width,
        height,
      },
      this.scene
    );

    strip.position = new Vector3(x, y, z);
    strip.isPickable = false;

    const material = new StandardMaterial(`${name}-material`, this.scene);
    material.diffuseColor = color;
    material.emissiveColor = color.scale(0.35);
    material.alpha = alpha;
    material.specularColor = Color3.Black();
    material.backFaceCulling = false;

    strip.material = material;
  }

  private renderRiverEndMistFromBounds(
    minX: number,
    maxX: number,
    minZ: number,
    maxZ: number,
    surfaceY: number
  ): void {
    if (!this.config.riverEndMistEnabled) {
      return;
    }

    const riverWidth = maxX - minX;
    const centerX = (minX + maxX) * 0.5;

    const mistWidth = riverWidth + this.config.riverEndMistWidthPadding;

    const nearEndZ = minZ + this.config.riverEndMistInsetFromEnd;
    const farEndZ = maxZ - this.config.riverEndMistInsetFromEnd;

    const mistY =
      surfaceY +
      this.config.riverEndMistYOffset +
      this.config.riverEndMistHeight * 0.5;

    this.renderRiverEndMistPlane(
      `${this.namePrefix}-river-end-mist-near`,
      centerX,
      mistY,
      nearEndZ,
      mistWidth
    );

    this.renderRiverEndMistPlane(
      `${this.namePrefix}-river-end-mist-far`,
      centerX,
      mistY,
      farEndZ,
      mistWidth
    );
  }

  private renderRiverEndMistPlane(
    name: string,
    x: number,
    y: number,
    z: number,
    width: number
  ): void {
    if (this.scene.getMeshByName(name)) {
      return;
    }

    const mist = MeshBuilder.CreatePlane(
      name,
      {
        width,
        height: this.config.riverEndMistHeight,
      },
      this.scene
    );

    mist.position = new Vector3(x, y, z);

    mist.rotation.y = 0;

    mist.isPickable = false;

    const material = this.createRiverEndMistMaterial(name, width);
    mist.material = material;
  }

  private createRiverEndMistMaterial(
    name: string,
    width: number
  ): StandardMaterial {
    const material = new StandardMaterial(`${name}-material`, this.scene);

    const texture = new Texture(
      this.config.riverEndMistTexturePath,
      this.scene
    );

    texture.hasAlpha = true;
    texture.wrapU = Texture.WRAP_ADDRESSMODE;
    texture.wrapV = Texture.CLAMP_ADDRESSMODE;

    const textureAspectRatio = 2048 / 1024;

    const singleTileWorldWidth =
      this.config.riverEndMistTileWorldHeight * textureAspectRatio;

    texture.uScale = width / singleTileWorldWidth;
    texture.vScale = 1;

    material.diffuseTexture = texture;
    material.opacityTexture = texture;

    material.diffuseColor = Color3.White();
    material.emissiveColor = new Color3(0.82, 0.9, 0.96);

    material.alpha = this.config.riverEndMistAlpha;
    material.specularColor = Color3.Black();
    material.backFaceCulling = false;

    material.useAlphaFromDiffuseTexture = true;
    material.transparencyMode = Material.MATERIAL_ALPHABLEND;
    material.fogEnabled = false;

    return material;
  }
}