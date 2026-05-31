import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GridModel } from "../grid/GridModel";
import type { BuildingDefinition } from "../buildings/definitions/BuildingDefinition";
import type { FootprintRotation } from "../buildings/footprint/FootprintRotation";
import type { BuildingRenderPartDefinition } from "./BuildingRenderDefinition";
import { BuildingRenderCatalog } from "./BuildingRenderCatalog";
import { BuildingModelRepository } from "./BuildingModelRepository";
import { createFlatColorMaterial } from "./MaterialFactory";

type GridPosition = {
  row: number;
  col: number;
};

type PositionedRenderPart = BuildingRenderPartDefinition & {
  normalizedRowOffset: number;
  normalizedColOffset: number;
};

export class BuildingGhostPreviewRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly renderCatalog: BuildingRenderCatalog;
  private readonly modelRepository: BuildingModelRepository;

  private readonly validMaterial: StandardMaterial;
  private readonly invalidMaterial: StandardMaterial;

  private readonly activeRoots: TransformNode[] = [];
  private renderVersion = 0;

  constructor(
    scene: Scene,
    grid: GridModel,
    renderCatalog: BuildingRenderCatalog,
    modelRepository: BuildingModelRepository
  ) {
    this.scene = scene;
    this.grid = grid;
    this.renderCatalog = renderCatalog;
    this.modelRepository = modelRepository;

    this.validMaterial = createFlatColorMaterial(
      this.scene,
      "ghost-preview-valid-material",
      new Color3(0.35, 0.9, 0.45),
      0.38
    );

    this.invalidMaterial = createFlatColorMaterial(
      this.scene,
      "ghost-preview-invalid-material",
      new Color3(1.0, 0.25, 0.25),
      0.38
    );

    this.validMaterial.backFaceCulling = false;
    this.invalidMaterial.backFaceCulling = false;
  }

  public renderGhost(
    building: BuildingDefinition,
    rotation: FootprintRotation,
    cells: GridPosition[],
    isValid: boolean
  ): void {
    this.clear();

    if (building.tags.includes("road")) {
      return;
    }

    const renderDefinition = this.renderCatalog.getForBuilding(building);

    if (!renderDefinition) {
      return;
    }

    const version = ++this.renderVersion;

    if (renderDefinition.parts.length === 1) {
      void this.renderSinglePart(
        building,
        rotation,
        cells,
        renderDefinition.parts[0],
        isValid,
        version
      );

      return;
    }

    const positionedParts = this.getRotatedNormalizedParts(
      building,
      rotation,
      renderDefinition.parts
    );

    for (let partIndex = 0; partIndex < positionedParts.length; partIndex++) {
      void this.renderCompositePart(
        building,
        rotation,
        cells,
        positionedParts[partIndex],
        partIndex,
        isValid,
        version
      );
    }
  }

  public clear(): void {
    this.renderVersion++;

    for (const root of this.activeRoots) {
      root.dispose(false, false);
    }

    this.activeRoots.length = 0;
  }

  private async renderSinglePart(
    building: BuildingDefinition,
    rotation: FootprintRotation,
    cells: GridPosition[],
    part: BuildingRenderPartDefinition,
    isValid: boolean,
    expectedVersion: number
  ): Promise<void> {
    try {
      const root = await this.modelRepository.instantiateModel(
        part.assetPath,
        `ghost-${building.id}-single`
      );

      if (this.renderVersion !== expectedVersion) {
        root.dispose(false, false);
        return;
      }

      const center = this.getPlacementCenter(cells);
      const scale = part.scale ?? 1;

      root.position = new Vector3(center.x, part.yOffset ?? 0.06, center.z);
      root.scaling = new Vector3(scale, scale, scale);
      root.rotation = new Vector3(
        0,
        this.degreesToRadians(
          this.getSingleModelRotationDegrees(rotation, part)
        ),
        0
      );

      this.applyGhostMaterial(root, isValid);
      this.activeRoots.push(root);
    } catch (error) {
      console.error(`Failed to render ghost for '${building.id}'.`, error);
    }
  }

  private async renderCompositePart(
    building: BuildingDefinition,
    rotation: FootprintRotation,
    cells: GridPosition[],
    part: PositionedRenderPart,
    partIndex: number,
    isValid: boolean,
    expectedVersion: number
  ): Promise<void> {
    try {
      const root = await this.modelRepository.instantiateModel(
        part.assetPath,
        `ghost-${building.id}-part-${partIndex}`
      );

      if (this.renderVersion !== expectedVersion) {
        root.dispose(false, false);
        return;
      }

      const position = this.getCompositePartWorldPosition(cells, part);
      const scale = part.scale ?? 1;

      root.position = new Vector3(position.x, part.yOffset ?? 0.06, position.z);
      root.scaling = new Vector3(scale, scale, scale);
      root.rotation = new Vector3(
        0,
        this.degreesToRadians(
          this.getPartRotationDegrees(rotation, part)
        ),
        0
      );

      this.applyGhostMaterial(root, isValid);
      this.activeRoots.push(root);
    } catch (error) {
      console.error(
        `Failed to render ghost part for '${building.id}'.`,
        error
      );
    }
  }

  private applyGhostMaterial(root: TransformNode, isValid: boolean): void {
    const material = isValid ? this.validMaterial : this.invalidMaterial;

    for (const mesh of root.getChildMeshes(false)) {
      mesh.material = material;
      mesh.isPickable = false;
      mesh.visibility = 0.7;
    }
  }

  private getRotatedNormalizedParts(
    building: BuildingDefinition,
    rotation: FootprintRotation,
    parts: BuildingRenderPartDefinition[]
  ): PositionedRenderPart[] {
    const rotatedFootprintCells = building.footprint.cells.map((cell) =>
      this.rotateGridOffset(cell.rowOffset, cell.colOffset, rotation)
    );

    const minFootprintRow = Math.min(
      ...rotatedFootprintCells.map((cell) => cell.rowOffset)
    );

    const minFootprintCol = Math.min(
      ...rotatedFootprintCells.map((cell) => cell.colOffset)
    );

    return parts.map((part) => {
      const rotatedOffset = this.rotateGridOffset(
        part.rowOffset,
        part.colOffset,
        rotation
      );

      return {
        ...part,
        normalizedRowOffset: rotatedOffset.rowOffset - minFootprintRow,
        normalizedColOffset: rotatedOffset.colOffset - minFootprintCol,
      };
    });
  }

  private getCompositePartWorldPosition(
    cells: GridPosition[],
    part: PositionedRenderPart
  ): Vector3 {
    const origin = this.getCompositeVisualOrigin(cells);

    return new Vector3(
      origin.x + part.normalizedColOffset * this.grid.cellSize,
      0,
      origin.z + part.normalizedRowOffset * this.grid.cellSize
    );
  }

  private getCompositeVisualOrigin(cells: GridPosition[]): Vector3 {
    if (cells.length === 0) {
      return Vector3.Zero();
    }

    const minRow = Math.min(...cells.map((cell) => cell.row));
    const minCol = Math.min(...cells.map((cell) => cell.col));

    return this.grid.cellToWorld(minRow, minCol);
  }

  private getPlacementCenter(cells: GridPosition[]): Vector3 {
    if (cells.length === 0) {
      return Vector3.Zero();
    }

    let sumX = 0;
    let sumZ = 0;

    for (const cell of cells) {
      const world = this.grid.cellToWorld(cell.row, cell.col);
      sumX += world.x;
      sumZ += world.z;
    }

    return new Vector3(sumX / cells.length, 0, sumZ / cells.length);
  }

  private rotateGridOffset(
    rowOffset: number,
    colOffset: number,
    rotation: FootprintRotation
  ): { rowOffset: number; colOffset: number } {
    switch (rotation) {
      case 0:
        return { rowOffset, colOffset };

      case 90:
        return {
          rowOffset: colOffset,
          colOffset: -rowOffset,
        };

      case 180:
        return {
          rowOffset: -rowOffset,
          colOffset: -colOffset,
        };

      case 270:
        return {
          rowOffset: -colOffset,
          colOffset: rowOffset,
        };
    }
  }

  private getPartRotationDegrees(
    rotation: FootprintRotation,
    part: BuildingRenderPartDefinition
  ): number {
    const baseOffset = part.rotationOffsetDegrees ?? 0;

    const sidewaysOffset =
      rotation === 90 || rotation === 270
        ? part.sidewaysRotationOffsetDegrees ?? 0
        : 0;

    return rotation + baseOffset + sidewaysOffset;
  }

  private getSingleModelRotationDegrees(
    rotation: FootprintRotation,
    part: BuildingRenderPartDefinition
  ): number {
    const baseOffset = part.rotationOffsetDegrees ?? 0;

    return this.normalizeDegrees(-rotation + baseOffset);
  }

  private normalizeDegrees(degrees: number): number {
    return ((degrees % 360) + 360) % 360;
  }

  private degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}