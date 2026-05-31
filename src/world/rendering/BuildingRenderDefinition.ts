import type { BuildingDefinition } from "../buildings/definitions/BuildingDefinition";

export interface BuildingRenderPartDefinition {
  assetPath: string;
  rowOffset: number;
  colOffset: number;

  scale?: number;
  rotationOffsetDegrees?: number;
  yOffset?: number;
}

export interface BuildingRenderDefinition {
  buildingId: BuildingDefinition["id"];
  parts: BuildingRenderPartDefinition[];
}

export interface BuildingRenderPartDefinition {
  assetPath: string;

  rowOffset: number;
  colOffset: number;

  scale?: number;
  rotationOffsetDegrees?: number;
  
  sidewaysRotationOffsetDegrees?: number;

  yOffset?: number;
}