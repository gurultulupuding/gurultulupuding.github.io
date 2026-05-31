import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GridModel } from "../grid/GridModel";
import { createFlatColorMaterial } from "../rendering/MaterialFactory";
import type { PlacedBuildingInstance } from "../city/PlacedBuildingInstance";
import { BuildingRenderCatalog } from "./BuildingRenderCatalog";
import { BuildingModelRepository } from "./BuildingModelRepository";
import type {
  BuildingRenderPartDefinition,
} from "./BuildingRenderDefinition";
import { FootprintOutlineRenderer } from "./FootprintOutlineRenderer";
import { FootprintBaseRenderer } from "./FootprintBaseRenderer";
import { DefaultPlacedBuildingRenderHandle } from "./DefaultPlacedBuildingRenderHandle";
import type { PlacedBuildingRenderHandle } from "./PlacedBuildingRenderHandle";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";

type PositionedRenderPart = BuildingRenderPartDefinition & {
  normalizedRowOffset: number;
  normalizedColOffset: number;
};

export class PlacedBuildingRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly placedMaterial: StandardMaterial;
  private readonly namePrefix: string;
  private readonly renderCatalog: BuildingRenderCatalog;
  private readonly modelRepository: BuildingModelRepository;
  private readonly footprintOutlineRenderer: FootprintOutlineRenderer;
  private readonly footprintBaseRenderer: FootprintBaseRenderer;

  constructor(
    scene: Scene,
    grid: GridModel,
    namePrefix: string,
    renderCatalog: BuildingRenderCatalog,
    modelRepository: BuildingModelRepository
  ) {
    this.scene = scene;
    this.grid = grid;
    this.namePrefix = namePrefix;
    this.renderCatalog = renderCatalog;
    this.modelRepository = modelRepository;

    this.placedMaterial = createFlatColorMaterial(
      this.scene,
      `${this.namePrefix}-material`,
      new Color3(0.28, 0.45, 0.28)
    );

    this.footprintOutlineRenderer = new FootprintOutlineRenderer(
      this.scene,
      this.grid,
      `${this.namePrefix}-outline`
    );

    this.footprintBaseRenderer = new FootprintBaseRenderer(
      this.scene,
      this.grid,
      `${this.namePrefix}-base`
    );
  }

  public renderPlacedBuilding(
    instance: PlacedBuildingInstance
  ): PlacedBuildingRenderHandle {
    const handle = new DefaultPlacedBuildingRenderHandle(instance.id);

    this.footprintBaseRenderer.renderBase(
      instance.cells,
      instance.building.family
    );
    this.footprintOutlineRenderer.renderOutline(instance.cells);

    const renderDefinition =
      this.renderCatalog.getForBuilding(instance.building);

    if (!renderDefinition) {
      return handle;
    }

    if (renderDefinition.parts.length === 1) {
      const part = renderDefinition.parts[0];

      void this.renderSingleModelPart(
        instance,
        part,
        0,
        handle
      );

      return handle;
    }

    const normalizedParts = this.getRotatedNormalizedParts(
      renderDefinition.parts,
      instance
    );

    for (let partIndex = 0; partIndex < normalizedParts.length; partIndex++) {
      const part = normalizedParts[partIndex];

      void this.renderModelPart(
        instance,
        part,
        partIndex,
        handle
      );
    }

    return handle;
  }

  public renderPlacedFootprint(cells: { row: number; col: number }[]): void {
    for (const cell of cells) {
      const world = this.grid.cellToWorld(cell.row, cell.col);

      const mesh = MeshBuilder.CreateGround(
        `${this.namePrefix}-${cell.row}-${cell.col}-${Math.random()}`,
        {
          width: this.grid.cellSize * 0.86,
          height: this.grid.cellSize * 0.86,
        },
        this.scene
      );

      mesh.position = new Vector3(world.x, 0.02, world.z);
      mesh.material = this.placedMaterial;
      mesh.isPickable = false;
      mesh.freezeWorldMatrix();
    }
  }

  private async renderModelPart(
    instance: PlacedBuildingInstance,
    part: PositionedRenderPart,
    partIndex: number,
    handle: PlacedBuildingRenderHandle
  ): Promise<void> {
    try {
      const root = await this.modelRepository.instantiateModel(
        part.assetPath,
        `${this.namePrefix}-${instance.id}-part-${partIndex}`
      );

      const partPosition = this.getPartWorldPosition(instance, part);

      root.position = new Vector3(
        partPosition.x,
        part.yOffset ?? 0.02,
        partPosition.z
      );

      const scale = part.scale ?? 1;

      root.scaling = new Vector3(
        scale,
        scale,
        scale
      );

      root.rotation = new Vector3(
        0,
        this.degreesToRadians(
          this.getPartRotationDegrees(instance, part)
        ),
        0
      );

      this.optimizeStaticRootTransformOnly(root);

      handle.addRoot(root);
    } catch (error) {
      console.error(
        `Failed to render model part for building '${instance.building.id}'. Falling back to footprint.`,
        error
      );

      this.renderPlacedFootprint(instance.cells);
    }
  }

  private getPartWorldPosition(
    instance: PlacedBuildingInstance,
    part: PositionedRenderPart
  ): Vector3 {
    const originWorld = this.getCompositeVisualOrigin(instance.cells);

    return new Vector3(
      originWorld.x + part.normalizedColOffset * this.grid.cellSize,
      0,
      originWorld.z + part.normalizedRowOffset * this.grid.cellSize
    );
  }

  private rotateGridOffset(
    rowOffset: number,
    colOffset: number,
    rotation: number
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

      default:
        return { rowOffset, colOffset };
    }
  }

  private degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private getRotatedNormalizedParts(
    parts: BuildingRenderPartDefinition[],
    instance: PlacedBuildingInstance
  ): PositionedRenderPart[] {
    const rotatedFootprintCells = instance.building.footprint.cells.map((cell) =>
      this.rotateGridOffset(
        cell.rowOffset,
        cell.colOffset,
        instance.rotation
      )
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
        instance.rotation
      );

      return {
        ...part,
        normalizedRowOffset: rotatedOffset.rowOffset - minFootprintRow,
        normalizedColOffset: rotatedOffset.colOffset - minFootprintCol,
      };
    });
  }

  private async renderSingleModelPart(
    instance: PlacedBuildingInstance,
    part: BuildingRenderPartDefinition,
    partIndex: number,
    handle: PlacedBuildingRenderHandle
  ): Promise<void> {
    try {
      const root = await this.modelRepository.instantiateModel(
        part.assetPath,
        `${this.namePrefix}-${instance.id}-part-${partIndex}`
      );

      const center = this.getPlacementCenter(instance.cells);

      root.position = new Vector3(
        center.x,
        part.yOffset ?? 0.02,
        center.z
      );

      const scale = part.scale ?? 1;

      root.scaling = new Vector3(
        scale,
        scale,
        scale
      );

      root.rotation = new Vector3(
        0,
        this.degreesToRadians(
          this.getSingleModelRotationDegrees(instance, part)
        ),
        0
      );

      this.optimizeStaticRootTransformOnly(root);

      handle.addRoot(root);
    } catch (error) {
      console.error(
        `Failed to render single model for building '${instance.building.id}'. Falling back to footprint.`,
        error
      );

      this.renderPlacedFootprint(instance.cells);
    }
  }

  private getSingleModelRotationDegrees(
    instance: PlacedBuildingInstance,
    part: BuildingRenderPartDefinition
  ): number {
    const baseOffset = part.rotationOffsetDegrees ?? 0;

    return this.normalizeDegrees(
      -instance.rotation + baseOffset
    );
  }

  private normalizeDegrees(degrees: number): number {
    return ((degrees % 360) + 360) % 360;
  }

  private getPlacementCenter(
    cells: { row: number; col: number }[]
  ): Vector3 {
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

    return new Vector3(
      sumX / cells.length,
      0,
      sumZ / cells.length
    );
  }

  private getCompositeVisualOrigin(
    cells: { row: number; col: number }[]
  ): Vector3 {
    if (cells.length === 0) {
      return Vector3.Zero();
    }

    const minRow = Math.min(...cells.map((cell) => cell.row));
    const minCol = Math.min(...cells.map((cell) => cell.col));

    return this.grid.cellToWorld(minRow, minCol);
  }

  private getPartRotationDegrees(
    instance: PlacedBuildingInstance,
    part: BuildingRenderPartDefinition
  ): number {
    const baseRotation = instance.rotation;
    const baseOffset = part.rotationOffsetDegrees ?? 0;

    const sidewaysOffset =
      baseRotation === 90 || baseRotation === 270
        ? part.sidewaysRotationOffsetDegrees ?? 0
        : 0;

    return baseRotation + baseOffset + sidewaysOffset;
  }

  private optimizeStaticRootTransformOnly(root: TransformNode): void {
    root.freezeWorldMatrix();

    for (const mesh of root.getChildMeshes(false)) {
      mesh.isPickable = false;
      mesh.freezeWorldMatrix();
    }
  }
}