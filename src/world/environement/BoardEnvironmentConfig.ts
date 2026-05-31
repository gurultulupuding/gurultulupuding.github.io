import { Color3 } from "@babylonjs/core/Maths/math.color";

export type EnvironmentScatterAssetConfig = {
  id: string;
  modelPath: string;
  weight: number;
  minScale: number;
  maxScale: number;
};

export type BoardEnvironmentConfig = {
  terrainWidthMultiplier: number;
  terrainHeightMultiplier: number;
  terrainYOffset: number;

  grassColor: Color3;
  grassTexturePath: string;
  grassTextureScale: number;

  fogEnabled: boolean;
  fogColor: Color3;
  fogStart: number;
  fogEnd: number;

  skyboxEnabled: boolean;
  skyboxTexturePath: string;
  skyboxSize: number;
  skyboxResolution: number;

  riverBridgeEnabled: boolean;
  riverBridgeModelPath: string;
  riverBridgeScale: number;
  riverBridgeYOffset: number;
  riverBridgeRotationY: number;

  riverWaterTexturePath: string;
  riverWaterTextureScale: number;
  riverWaterFlowSpeedU: number;
  riverWaterFlowSpeedV: number;

  riverSurfaceEffectsEnabled: boolean;

  riverOverlayTexturePath: string;

  riverOverlayPrimaryScale: number;
  riverOverlaySecondaryScale: number;

  riverOverlayPrimaryAlpha: number;
  riverOverlaySecondaryAlpha: number;

  riverOverlayPrimaryFlowU: number;
  riverOverlayPrimaryFlowV: number;

  riverOverlaySecondaryFlowU: number;
  riverOverlaySecondaryFlowV: number;

  riverOverlayPrimaryYOffset: number;
  riverOverlaySecondaryYOffset: number;

  riverEdgeLightEnabled: boolean;
  riverEdgeLightThickness: number;
  riverEdgeLightAlpha: number;
  riverEdgeLightYOffset: number;

  riverFoamEnabled: boolean;
  riverFoamThickness: number;
  riverFoamAlpha: number;
  riverFoamYOffset: number;
  riverFoamInset: number;

  cloudEdgeEnabled: boolean;
  cloudEdgeTexturePath: string;
  cloudEdgeHeight: number;
  cloudEdgeYOffset: number;
  cloudEdgeDistanceFromRiverEdge: number;
  cloudEdgeAlpha: number;
  cloudEdgeWidthPadding: number;
  cloudEdgeRotationY: number;
  cloudEdgeTileWorldHeight: number;

  boardEdgeMistEnabled: boolean;
  boardEdgeMistTexturePath: string;
  boardEdgeMistHeight: number;
  boardEdgeMistYOffset: number;
  boardEdgeMistAlpha: number;
  boardEdgeMistWidthPadding: number;
  boardEdgeMistTileWorldHeight: number;
  boardEdgeMistInsetFromEdge: number;

  riverEndMistEnabled: boolean;
  riverEndMistTexturePath: string;
  riverEndMistHeight: number;
  riverEndMistYOffset: number;
  riverEndMistAlpha: number;
  riverEndMistInsetFromEnd: number;
  riverEndMistWidthPadding: number;
  riverEndMistTileWorldHeight: number;

  cloudEdgeNonRiverInset: number;
  cloudEdgeOppositeInset: number;
  cloudEdgeBackingEnabled: boolean;
  cloudEdgeBackingColor: Color3;
  cloudEdgeLayerOffset: number;
  cloudEdgeBackingHeightRatio: number;
  cloudEdgeRiverLengthPadding: number;

  environmentScatterEnabled: boolean;
  environmentScatterSeed: number;
  environmentScatterCount: number;
  environmentScatterMinDistance: number;
  environmentScatterGridPadding: number;
  environmentScatterTerrainInset: number;
  environmentScatterYOffset: number;
  environmentScatterAssets: EnvironmentScatterAssetConfig[];
  environmentScatterAroundGridDistance: number;
  environmentScatterRiverSidePadding: number;
};

export const DEFAULT_BOARD_ENVIRONMENT_CONFIG: BoardEnvironmentConfig = {
  terrainWidthMultiplier: 50,
  terrainHeightMultiplier: 50,
  terrainYOffset: -0.03,

  grassColor: new Color3(0.34, 0.55, 0.28),
  grassTexturePath: "/assets/environement/terrain/grass.png",
  grassTextureScale: 80,

  fogEnabled: false,
  fogColor: new Color3(0.82, 0.9, 0.96),
  fogStart: 460,
  fogEnd: 4800,

  skyboxEnabled: true,
  skyboxTexturePath: "/assets/environement/skybox/Skybox_4.png",
  skyboxSize: 1000,
  skyboxResolution: 64,

  riverBridgeEnabled: true,
  riverBridgeModelPath: "/assets/environement/river-bridge/riverBridge.glb",
  riverBridgeScale: 1,
  riverBridgeYOffset: 0.01,
  riverBridgeRotationY: 0,

  riverWaterTexturePath: "/assets/environement/water/waterNoise.png",
  riverWaterTextureScale: 4,
  riverWaterFlowSpeedU: 0.005,
  riverWaterFlowSpeedV: 0.017,

  riverSurfaceEffectsEnabled: true,

  riverOverlayTexturePath: "/assets/environement/water/waterNoise.png",

  riverOverlayPrimaryScale: 18,
  riverOverlaySecondaryScale: 32,

  riverOverlayPrimaryAlpha: 0.10,
  riverOverlaySecondaryAlpha: 0.05,

  riverOverlayPrimaryFlowU: 0.001,
  riverOverlayPrimaryFlowV: 0.003,

  riverOverlaySecondaryFlowU: -0.0006,
  riverOverlaySecondaryFlowV: 0.0018,

  riverOverlayPrimaryYOffset: 0.035,
  riverOverlaySecondaryYOffset: 0.04,

  riverEdgeLightEnabled: true,
  riverEdgeLightThickness: 0.45,
  riverEdgeLightAlpha: 0.08,
  riverEdgeLightYOffset: 0.023,

  riverFoamEnabled: true,
  riverFoamThickness: 0.7,
  riverFoamAlpha: 0.1,
  riverFoamYOffset: 0.02,
  riverFoamInset: 0.4,

  cloudEdgeEnabled: true,
  cloudEdgeTexturePath: "/assets/environement/clouds/cloudEdge.png",
  cloudEdgeHeight: 25,
  cloudEdgeYOffset: 0,
  cloudEdgeDistanceFromRiverEdge: -80,
  cloudEdgeAlpha: 1,
  cloudEdgeWidthPadding: 20,
  cloudEdgeRotationY: 0,
  cloudEdgeTileWorldHeight: 25,

  boardEdgeMistEnabled: false,
  boardEdgeMistTexturePath: "/assets/environement/clouds/cloudEdge.png",
  boardEdgeMistHeight: 30,
  boardEdgeMistYOffset: -4,
  boardEdgeMistAlpha: 0.75,
  boardEdgeMistWidthPadding: 1100,
  boardEdgeMistTileWorldHeight: 6,
  boardEdgeMistInsetFromEdge: 120,

  riverEndMistEnabled: false,
  riverEndMistTexturePath: "/assets/environement/clouds/cloudEdge.png",
  riverEndMistHeight: 12,
  riverEndMistYOffset: -3,
  riverEndMistAlpha: 0.55,
  riverEndMistInsetFromEnd: 10,
  riverEndMistWidthPadding: 0,
  riverEndMistTileWorldHeight: 16,


  cloudEdgeNonRiverInset: 320,
  cloudEdgeOppositeInset: 430,
  cloudEdgeBackingEnabled: true,
  cloudEdgeBackingColor: new Color3(1.0, 0.65, 0.79),
  cloudEdgeLayerOffset: 0.05,
  cloudEdgeBackingHeightRatio: 0.45,
  cloudEdgeRiverLengthPadding: -600,

  environmentScatterEnabled: true,
  environmentScatterSeed: 1337,
  environmentScatterCount: 120,
  environmentScatterMinDistance: 3.5,
  environmentScatterGridPadding: 4,
  environmentScatterTerrainInset: 12,
  environmentScatterYOffset: 0.02,
  environmentScatterAssets: [
    {
      id: "Grass1",
      modelPath: "/assets/environement/scatter/Grass1.glb",
      weight: 1,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "Grass2",
      modelPath: "/assets/environement/scatter/Grass2.glb",
      weight: 1,
      minScale: 1,
      maxScale: 1,
    },
    /*{
      
      id: "DeadTree_1",
      modelPath: "/assets/environement/scatter/DeadTree_1.glb",
      weight: 1,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "DeadTree_2",
      modelPath: "/assets/environement/scatter/DeadTree_2.glb",
      weight: 1,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "DeadTree_3",
      modelPath: "/assets/environement/scatter/DeadTree_3.glb",
      weight: 1,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "DeadTree_4",
      modelPath: "/assets/environement/scatter/DeadTree_4.glb",
      weight: 1,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "DeadTree_5",
      modelPath: "/assets/environement/scatter/DeadTree_5.glb",
      weight: 1,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "NormalTree_1",
      modelPath: "/assets/environement/scatter/NormalTree_1.glb",
      weight: 3,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "NormalTree_2",
      modelPath: "/assets/environement/scatter/NormalTree_2.glb",
      weight: 3,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "NormalTree_3",
      modelPath: "/assets/environement/scatter/NormalTree_3.glb",
      weight: 3,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "NormalTree_4",
      modelPath: "/assets/environement/scatter/NormalTree_4.glb",
      weight: 3,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "NormalTree_5",
      modelPath: "/assets/environement/scatter/NormalTree_5.glb",
      weight: 3,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "Rock_1",
      modelPath: "/assets/environement/scatter/Rock_1.glb",
      weight: 2,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "Rock_2",
      modelPath: "/assets/environement/scatter/Rock_2.glb",
      weight: 2,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "Rock_3",
      modelPath: "/assets/environement/scatter/Rock_3.glb",
      weight: 2,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "Rock_4",
      modelPath: "/assets/environement/scatter/Rock_4.glb",
      weight: 2,
      minScale: 1,
      maxScale: 1,
    },
    {
      id: "Rock_5",
      modelPath: "/assets/environement/scatter/Rock_5.glb",
      weight: 2,
      minScale: 1,
      maxScale: 1,
    },*/
  ],
  environmentScatterAroundGridDistance: 55,
  environmentScatterRiverSidePadding: 8,
};