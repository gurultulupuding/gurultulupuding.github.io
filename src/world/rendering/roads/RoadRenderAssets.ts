const INFRASTRUCTURE_ASSET_ROOT = "/assets/buildings/infrastructure";

export const ROAD_RENDER_ASSETS = {
  end: `${INFRASTRUCTURE_ASSET_ROOT}/road-end.glb`,
  straight: `${INFRASTRUCTURE_ASSET_ROOT}/road-straight.glb`,
  bend: `${INFRASTRUCTURE_ASSET_ROOT}/road-bend-square.glb`,
  intersection: `${INFRASTRUCTURE_ASSET_ROOT}/road-intersection.glb`,
  crossroad: `${INFRASTRUCTURE_ASSET_ROOT}/road-crossroad.glb`,
} as const;