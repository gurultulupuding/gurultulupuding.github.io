import { GridModel } from "../grid/GridModel";

export function applyPlayerShoreLayout(grid: GridModel): void {
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      if (col <= 13) {
        grid.setCellType(row, col, "player", true);
      } else if (col <= 20) {
        grid.setCellType(row, col, "river", false);
      } else {
        grid.setCellType(row, col, "blocked", false);
      }
    }
  }
}