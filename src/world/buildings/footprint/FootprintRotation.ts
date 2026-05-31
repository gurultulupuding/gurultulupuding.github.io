import type { BuildingFootprint, FootprintCellOffset } from "./Footprint";

export type FootprintRotation = 0 | 90 | 180 | 270;

export function rotateFootprint(
  footprint: BuildingFootprint,
  rotation: FootprintRotation
): BuildingFootprint {
  const rotatedCells = footprint.cells.map((cell) =>
    rotateCellOffset(cell, rotation)
  );

  const normalizedCells = normalizeOffsets(rotatedCells);

  return {
    id: `${footprint.id}-rot-${rotation}`,
    cells: normalizedCells,
    //cells: sortOffsets(rotatedCells),
  };
}

function rotateCellOffset(
  cell: FootprintCellOffset,
  rotation: FootprintRotation
): FootprintCellOffset {
  const { rowOffset, colOffset } = cell;

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

/*
function sortOffsets(cells: FootprintCellOffset[]): FootprintCellOffset[] {
  return [...cells].sort((a, b) => {
    if (a.rowOffset !== b.rowOffset) {
      return a.rowOffset - b.rowOffset;
    }

    return a.colOffset - b.colOffset;
  });
}
*/

function normalizeOffsets(
  cells: FootprintCellOffset[]
): FootprintCellOffset[] {
  const minRow = Math.min(...cells.map((cell) => cell.rowOffset));
  const minCol = Math.min(...cells.map((cell) => cell.colOffset));

  return cells
    .map((cell) => ({
      rowOffset: cell.rowOffset - minRow,
      colOffset: cell.colOffset - minCol,
    }))
    .sort((a, b) => {
      if (a.rowOffset !== b.rowOffset) {
        return a.rowOffset - b.rowOffset;
      }

      return a.colOffset - b.colOffset;
    });
}
