import { Scene } from "@babylonjs/core/scene";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/loaders/glTF";

import { GridModel } from "../grid/GridModel";
import {
  getInitialTownHallCells,
  type InitialCitySide,
} from "../terrain/InitialCityLayout";
import { FootprintOutlineRenderer } from "../rendering/FootprintOutlineRenderer";
import { createFlatColorMaterial } from "../rendering/MaterialFactory";
import {
  DEFAULT_STARTING_BASE_VISUAL_CONFIG,
  type StartingBaseVisualConfig,
} from "./StartingBaseVisualConfig";

type GridPosition = {
  row: number;
  col: number;
};

export class StartingBaseRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly config: StartingBaseVisualConfig;
  private readonly outlineRenderer: FootprintOutlineRenderer;
  private readonly baseMaterial: StandardMaterial;

  constructor(
    scene: Scene,
    grid: GridModel,
    config: StartingBaseVisualConfig = DEFAULT_STARTING_BASE_VISUAL_CONFIG
  ) {
    this.scene = scene;
    this.grid = grid;
    this.config = config;

    this.outlineRenderer = new FootprintOutlineRenderer(
      this.scene,
      this.grid,
      "starting-base-outline"
    );

    this.baseMaterial = createFlatColorMaterial(
      this.scene,
      "starting-base-plate-material",
      this.config.baseColor,
      this.config.baseAlpha
    );
  }

  public async renderForSide(side: InitialCitySide): Promise<TransformNode> {
    const cells = getInitialTownHallCells(this.grid, side);

    this.renderBasePlate(side, cells);
    // this.outlineRenderer.renderOutline(cells);

    const root = await this.importModel(side);

    root.position = this.getCenterWorldPosition(cells);
    root.position.y = this.config.modelYOffset;

    root.scaling = new Vector3(
      this.config.modelScale,
      this.config.modelScale,
      this.config.modelScale
    );

    return root;
  }

  private renderBasePlate(
    side: InitialCitySide,
    cells: GridPosition[]
  ): void {
    const center = this.getCenterWorldPosition(cells);

    const baseWidth = this.grid.cellSize * 2 - this.config.baseCellPadding;
    const baseHeight = this.grid.cellSize * 2 - this.config.baseCellPadding;

    const base = MeshBuilder.CreateGround(
      `starting-base-${side}-plate`,
      {
        width: baseWidth,
        height: baseHeight,
      },
      this.scene
    );

    base.position = new Vector3(
      center.x,
      this.config.baseYOffset,
      center.z
    );

    base.material = this.baseMaterial;
    base.isPickable = false;
  }

  private async importModel(side: InitialCitySide): Promise<TransformNode> {
    const { rootUrl, fileName } = this.splitModelPath(this.config.modelPath);

    const result = await SceneLoader.ImportMeshAsync(
      "",
      rootUrl,
      fileName,
      this.scene
    );

    const root = new TransformNode(`starting-base-${side}-root`, this.scene);

    for (const mesh of result.meshes) {
      mesh.parent = root;
      mesh.isPickable = false;

      this.disablePickingForChildren(mesh);
    }

    return root;
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

  private getCenterWorldPosition(cells: GridPosition[]): Vector3 {
    const center = new Vector3(0, 0, 0);

    for (const cell of cells) {
      center.addInPlace(this.grid.cellToWorld(cell.row, cell.col));
    }

    center.scaleInPlace(1 / cells.length);

    return center;
  }
}