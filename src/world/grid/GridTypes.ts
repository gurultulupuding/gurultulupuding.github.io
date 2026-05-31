export type ShoreType = "player" | "ai" | "river" | "blocked";

export interface GridOccupantInfo {
  family: string;
  tags: string[];
}

export interface GridCell {
  row: number;
  col: number;
  buildable: boolean;
  occupied: boolean;
  shoreType: ShoreType;
  occupant: GridOccupantInfo | null;
}