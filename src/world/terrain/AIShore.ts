import { GridModel } from "../grid/GridModel";

export function applyAIShoreLayout(grid: GridModel): void {
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      if (col <= 0) {
        grid.setCellType(row, col, "blocked", false);
      } else if (col <= 7) {
        grid.setCellType(row, col, "river", false);
      } else {
        grid.setCellType(row, col, "ai", true);
      }
    }
  }
}