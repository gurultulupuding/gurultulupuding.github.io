import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GridModel } from "./GridModel";
import { createFlatColorMaterial } from "../rendering/MaterialFactory";
import { DEFAULT_GRID_RENDER_CONFIG, type GridRenderConfig } from "./GridRenderConfig";

export class GridRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly namePrefix: string;
  private readonly config: GridRenderConfig;

  constructor(
    scene: Scene,
    grid: GridModel,
    namePrefix: string = "grid",
    config: GridRenderConfig = DEFAULT_GRID_RENDER_CONFIG
  ) {
    this.scene = scene;
    this.grid = grid;
    this.namePrefix = namePrefix;
    this.config = config;
  }

  public render(): void {
    const occupiedMaterial = createFlatColorMaterial(
      this.scene,
      `${this.namePrefix}-occupied-material`,
      new Color3(0.45, 0.65, 0.45)
    );

    const playerMaterial = createFlatColorMaterial(
      this.scene,
      `${this.namePrefix}-player-material`,
      new Color3(0.76, 0.85, 0.76)
    );

    const aiMaterial = createFlatColorMaterial(
      this.scene,
      `${this.namePrefix}-ai-material`,
      new Color3(0.85, 0.78, 0.76)
    );

    const riverMaterial = createFlatColorMaterial(
      this.scene,
      `${this.namePrefix}-river-material`,
      new Color3(0.55, 0.72, 0.90)
    );

    const blockedMaterial = createFlatColorMaterial(
      this.scene,
      `${this.namePrefix}-blocked-material`,
      new Color3(0.82, 0.82, 0.82)
    );

    for (const cell of this.grid.getAllCells()) {
      if (cell.shoreType === "blocked" && !this.config.showBlockedTiles) {
        continue;
      }

      if (cell.shoreType === "river" && !this.config.showRiverTiles) {
        continue;
      }
      
      const cellCenter = this.grid.cellToWorld(cell.row, cell.col);

      const tile = MeshBuilder.CreateGround(
        `${this.namePrefix}-cell-${cell.row}-${cell.col}`,
        {
          width: this.grid.cellSize * 0.95,
          height: this.grid.cellSize * 0.95,
        },
        this.scene
      );

      tile.position = new Vector3(cellCenter.x, 0.01, cellCenter.z);
      tile.isPickable = true;

      tile.metadata = {
        ...(tile.metadata ?? {}),
        isPlacementPickTile: true,
      };

      tile.freezeWorldMatrix();

      if (cell.occupied) {
        tile.material = occupiedMaterial;
      } else if (cell.shoreType === "player") {
        tile.material = playerMaterial;
      } else if (cell.shoreType === "river") {
        tile.material = riverMaterial;
      } else if (cell.shoreType === "blocked"){
        tile.material = blockedMaterial;
      } else {
        tile.material = aiMaterial;
      }
    }
  }
}