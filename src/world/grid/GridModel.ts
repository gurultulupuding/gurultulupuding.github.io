import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type {
  GridCell,
  ShoreType,
  GridOccupantInfo,
} from "./GridTypes";

export class GridModel {
  public readonly rows: number;
  public readonly cols: number;
  public readonly cellSize: number;
  public readonly originX: number;
  public readonly originZ: number;

  private readonly cells: GridCell[][];

  constructor(
    rows: number,
    cols: number,
    cellSize: number = 1,
    originX: number = 0,
    originZ: number = 0
  ) {
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
    this.originX = originX;
    this.originZ = originZ;
    this.cells = this.createEmptyGrid();
  }

  private createEmptyGrid(): GridCell[][] {
    const cells: GridCell[][] = [];

    for (let row = 0; row < this.rows; row++) {
      const rowCells: GridCell[] = [];

      for (let col = 0; col < this.cols; col++) {
        rowCells.push({
          row,
          col,
          buildable: false,
          occupied: false,
          shoreType: "blocked",
          occupant: null,
        });
      }

      cells.push(rowCells);
    }

    return cells;
  }

  public isInside(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  public getCell(row: number, col: number): GridCell | null {
    if (!this.isInside(row, col)) {
      return null;
    }

    return this.cells[row][col];
  }

  public setCellType(
    row: number,
    col: number,
    shoreType: ShoreType,
    buildable: boolean
  ): void {
    const cell = this.getCell(row, col);

    if (!cell) {
      return;
    }

    cell.shoreType = shoreType;
    cell.buildable = buildable;
  }

  public setOccupied(
    row: number,
    col: number,
    occupied: boolean,
    occupant: GridOccupantInfo | null = null
  ): void {
    const cell = this.getCell(row, col);

    if (!cell) {
      return;
    }

    cell.occupied = occupied;
    cell.occupant = occupied ? occupant : null;
  }

  public getOccupant(row: number, col: number): GridOccupantInfo | null {
    const cell = this.getCell(row, col);
    return cell?.occupant ?? null;
  }

  public getAllCells(): GridCell[] {
    return this.cells.flat();
  }

  public cellToWorld(row: number, col: number): Vector3 {
    const x = this.originX + col * this.cellSize + this.cellSize / 2;
    const z = this.originZ + row * this.cellSize + this.cellSize / 2;

    return new Vector3(x, 0, z);
  }

  public worldToCell(x: number, z: number): { row: number; col: number } | null {
    const localX = x - this.originX;
    const localZ = z - this.originZ;

    const col = Math.floor(localX / this.cellSize);
    const row = Math.floor(localZ / this.cellSize);

    if (!this.isInside(row, col)) {
      return null;
    }

    return { row, col };
  }

  public getCenterWorldPosition(): Vector3 {
    const centerX = this.originX + (this.cols * this.cellSize) / 2;
    const centerZ = this.originZ + (this.rows * this.cellSize) / 2;

    return new Vector3(centerX, 0, centerZ);
  }
}