import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GridModel } from "../grid/GridModel";
import { createFlatColorMaterial } from "./MaterialFactory";
import { getFamilyBaseColor } from "./FamilyColorPalette";
import type { StructureFamily } from "../../game/packs/StructureFamily";

type GridPosition = {
  row: number;
  col: number;
};

export class FootprintBaseRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly namePrefix: string;
  private readonly materialsByFamily = new Map<StructureFamily, StandardMaterial>();

  private readonly cellFillSize: number;
  private readonly bridgeThickness: number;
  private readonly yOffset: number;

  constructor(
    scene: Scene,
    grid: GridModel,
    namePrefix: string = "footprint-base"
  ) {
    this.scene = scene;
    this.grid = grid;
    this.namePrefix = namePrefix;

    this.cellFillSize = this.grid.cellSize * 0.86;
    this.bridgeThickness = this.grid.cellSize * 0.16;
    this.yOffset = 0.021;
  }

  public renderBase(cells: GridPosition[], family: StructureFamily): void {
    const material = this.getMaterialForFamily(family);

    if (this.isExact2x2Footprint(cells)) {
      this.render2x2Base(cells, material);
      return;
    }

    const cellKeys = new Set(cells.map((cell) => this.createCellKey(cell)));

    for (const cell of cells) {
      this.renderCellFill(cell, material);
    }

    for (const cell of cells) {
      if (this.hasCellAt(cell.row, cell.col + 1, cellKeys)) {
        this.renderInternalBridge(cell, "east", material);
      }

      if (this.hasCellAt(cell.row + 1, cell.col, cellKeys)) {
        this.renderInternalBridge(cell, "south", material);
      }
    }
  }

  private isExact2x2Footprint(cells: GridPosition[]): boolean {
    if (cells.length !== 4) {
      return false;
    }

    const rows = cells.map((cell) => cell.row);
    const cols = cells.map((cell) => cell.col);

    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);

    if (maxRow - minRow !== 1 || maxCol - minCol !== 1) {
      return false;
    }

    const cellKeys = new Set(cells.map((cell) => this.createCellKey(cell)));

    return (
      cellKeys.has(`${minRow}:${minCol}`) &&
      cellKeys.has(`${minRow}:${maxCol}`) &&
      cellKeys.has(`${maxRow}:${minCol}`) &&
      cellKeys.has(`${maxRow}:${maxCol}`)
    );
  }

  private render2x2Base(
    cells: GridPosition[],
    material: StandardMaterial
  ): void {
    const rows = cells.map((cell) => cell.row);
    const cols = cells.map((cell) => cell.col);

    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);

    const topLeftWorld = this.grid.cellToWorld(minRow, minCol);
    const bottomRightWorld = this.grid.cellToWorld(maxRow, maxCol);

    const centerX = (topLeftWorld.x + bottomRightWorld.x) / 2;
    const centerZ = (topLeftWorld.z + bottomRightWorld.z) / 2;

    const mesh = MeshBuilder.CreateGround(
      `${this.namePrefix}-base-2x2-${minRow}-${minCol}-${Math.random()}`,
      {
        width: this.grid.cellSize * 1.86,
        height: this.grid.cellSize * 1.86,
      },
      this.scene
    );

    mesh.position = new Vector3(centerX, this.yOffset, centerZ);
    mesh.material = material;
    mesh.isPickable = false;
  }

  private renderCellFill(
    cell: GridPosition,
    material: StandardMaterial
  ): void {
    const world = this.grid.cellToWorld(cell.row, cell.col);

    const mesh = MeshBuilder.CreateGround(
      `${this.namePrefix}-cell-${cell.row}-${cell.col}-${Math.random()}`,
      {
        width: this.cellFillSize,
        height: this.cellFillSize,
      },
      this.scene
    );

    mesh.position = new Vector3(world.x, this.yOffset, world.z);
    mesh.material = material;
    mesh.isPickable = false;
  }

  private renderInternalBridge(
    cell: GridPosition,
    direction: "east" | "south",
    material: StandardMaterial
  ): void {
    const world = this.grid.cellToWorld(cell.row, cell.col);
    const halfCell = this.grid.cellSize / 2;

    const isEast = direction === "east";

    const width = isEast
      ? this.bridgeThickness
      : this.cellFillSize;

    const height = isEast
      ? this.cellFillSize
      : this.bridgeThickness;

    const mesh = MeshBuilder.CreateGround(
      `${this.namePrefix}-bridge-${cell.row}-${cell.col}-${direction}-${Math.random()}`,
      {
        width,
        height,
      },
      this.scene
    );

    mesh.position = isEast
      ? new Vector3(world.x + halfCell, this.yOffset, world.z)
      : new Vector3(world.x, this.yOffset, world.z + halfCell);

    mesh.material = material;
    mesh.isPickable = false;
  }

  private getMaterialForFamily(family: StructureFamily): StandardMaterial {
    const existing = this.materialsByFamily.get(family);

    if (existing) {
      return existing;
    }

    const material = createFlatColorMaterial(
      this.scene,
      `${this.namePrefix}-${family}-material`,
      getFamilyBaseColor(family)
    );

    this.materialsByFamily.set(family, material);

    return material;
  }

  private hasCellAt(
    row: number,
    col: number,
    cellKeys: Set<string>
  ): boolean {
    return cellKeys.has(`${row}:${col}`);
  }

  private createCellKey(cell: GridPosition): string {
    return `${cell.row}:${cell.col}`;
  }
}