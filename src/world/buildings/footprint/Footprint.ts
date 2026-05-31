export interface FootprintCellOffset {
  rowOffset: number;
  colOffset: number;
}

export interface BuildingFootprint {
  id: string;
  cells: FootprintCellOffset[];
}