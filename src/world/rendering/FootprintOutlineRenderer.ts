import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GridModel } from "../grid/GridModel";
import { createFlatColorMaterial } from "./MaterialFactory";

type GridPosition = {
  row: number;
  col: number;
};

type EdgeDirection = "north" | "east" | "south" | "west";

export class FootprintOutlineRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly material: StandardMaterial;
  private readonly namePrefix: string;

  private readonly thickness: number;
  private readonly yOffset: number;

  constructor(
    scene: Scene,
    grid: GridModel,
    namePrefix: string = "footprint-outline"
  ) {
    this.scene = scene;
    this.grid = grid;
    this.namePrefix = namePrefix;

    this.thickness = this.grid.cellSize * 0.075;
    this.yOffset = 0.035;

    this.material = createFlatColorMaterial(
      this.scene,
      `${this.namePrefix}-material`,
      Color3.Black()
    );
  }

  public renderOutline(cells: GridPosition[]): void {
    const cellKeys = new Set(cells.map((cell) => this.createCellKey(cell)));

    for (const cell of cells) {
      if (!this.hasCellAt(cell.row - 1, cell.col, cellKeys)) {
        this.renderEdge(cell, "north");
      }

      if (!this.hasCellAt(cell.row, cell.col + 1, cellKeys)) {
        this.renderEdge(cell, "east");
      }

      if (!this.hasCellAt(cell.row + 1, cell.col, cellKeys)) {
        this.renderEdge(cell, "south");
      }

      if (!this.hasCellAt(cell.row, cell.col - 1, cellKeys)) {
        this.renderEdge(cell, "west");
      }
    }
  }

  private renderEdge(cell: GridPosition, direction: EdgeDirection): void {
    const cellCenter = this.grid.cellToWorld(cell.row, cell.col);
    const halfCell = this.grid.cellSize / 2;

    const isHorizontal = direction === "north" || direction === "south";

    const width = isHorizontal
      ? this.grid.cellSize + this.thickness
      : this.thickness;

    const height = isHorizontal
      ? this.thickness
      : this.grid.cellSize + this.thickness;

    const mesh = MeshBuilder.CreateGround(
      `${this.namePrefix}-${cell.row}-${cell.col}-${direction}-${Math.random()}`,
      {
        width,
        height,
      },
      this.scene
    );

    mesh.position = this.getEdgePosition(cellCenter, halfCell, direction);
    mesh.material = this.material;
    mesh.isPickable = false;
  }

  private getEdgePosition(
    cellCenter: Vector3,
    halfCell: number,
    direction: EdgeDirection
  ): Vector3 {
    switch (direction) {
      case "north":
        return new Vector3(
          cellCenter.x,
          this.yOffset,
          cellCenter.z - halfCell
        );

      case "east":
        return new Vector3(
          cellCenter.x + halfCell,
          this.yOffset,
          cellCenter.z
        );

      case "south":
        return new Vector3(
          cellCenter.x,
          this.yOffset,
          cellCenter.z + halfCell
        );

      case "west":
        return new Vector3(
          cellCenter.x - halfCell,
          this.yOffset,
          cellCenter.z
        );
    }
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