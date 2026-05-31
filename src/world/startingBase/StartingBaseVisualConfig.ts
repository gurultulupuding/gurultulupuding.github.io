import { Color3 } from "@babylonjs/core/Maths/math.color";

export type StartingBaseVisualConfig = {
  modelPath: string;

  modelScale: number;
  modelYOffset: number;

  baseColor: Color3;
  baseAlpha: number;
  baseYOffset: number;

  baseCellPadding: number;
};

export const DEFAULT_STARTING_BASE_VISUAL_CONFIG: StartingBaseVisualConfig = {
  modelPath: "/assets/buildings/starting-base/startingBase.glb",

  modelScale: 0.35,
  modelYOffset: 0.06,

  baseColor: new Color3(0.25, 0.25, 0.25),
  baseAlpha: 1,
  baseYOffset: 0.025,

  baseCellPadding: 0,
};