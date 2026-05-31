import { BuildingRenderCatalog } from "./BuildingRenderCatalog";
import type { BuildingRenderDefinition } from "./BuildingRenderDefinition";

const RESIDENTIAL_ITH_ASSET_ROOT = "/assets/buildings/residential-ith";
const RESIDENTIAL_ASSET_ROOT = "/assets/buildings/residential";
const INDUSTRY_ASSET_ROOT = "/assets/buildings/industry";
const CIVIC_ITH_ASSET_ROOT = "/assets/buildings/civic-ith";
const CULTURE_ITH_ASSET_ROOT = "/assets/buildings/culture-ith";

const DEFAULT_BUILDING_RENDER_DEFINITIONS: BuildingRenderDefinition[] = [
  {
    buildingId: "residence-small",
    parts: [
      {
        assetPath: `${RESIDENTIAL_ITH_ASSET_ROOT}/residenceSmall.glb`,
        rowOffset: 0,
        colOffset: 0,
        scale: 0.75,
        rotationOffsetDegrees: 180,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
      },
    ],
  },

  {
    buildingId: "residence-block",
    parts: [
      {
        assetPath: `${RESIDENTIAL_ITH_ASSET_ROOT}/residenceBlock.glb`,
        rowOffset: 0,
        colOffset: 0,
        scale: 0.75,
        rotationOffsetDegrees: 180,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
      },
    ],
  },

  {
    buildingId: "courtyard-housing",
    parts: [
      {
        assetPath: `${RESIDENTIAL_ITH_ASSET_ROOT}/courtyardHousing.glb`,
        rowOffset: 0,
        colOffset: 0,
        scale: 0.75,
        rotationOffsetDegrees: 180,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
      },
    ],
  },

  {
    buildingId: "riverside-apartments",
    parts: [
        {
        assetPath: `${RESIDENTIAL_ASSET_ROOT}/path-stones-messy.glb`,
        rowOffset: 0.05,
        colOffset: 0,
        scale: 2.5,
        rotationOffsetDegrees: 0,
        yOffset: 0.02,
        },
        {
        assetPath: `${RESIDENTIAL_ASSET_ROOT}/path-stones-messy.glb`,
        rowOffset: 1.05,
        colOffset: 0,
        scale: 2.5,
        rotationOffsetDegrees: 0,
        yOffset: 0.02,
        },
        {
        assetPath: `${RESIDENTIAL_ITH_ASSET_ROOT}/riversideApartments.glb`,
        rowOffset: 2,
        colOffset: 0.5,
        scale: 0.75,
        rotationOffsetDegrees: 180,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
    ],
  },

  {
    buildingId: "workshop",
    parts: [
      {
        assetPath: `${INDUSTRY_ASSET_ROOT}/building-r.glb`,
        rowOffset: 0,
        colOffset: 0.5,
        scale: 0.75,
        rotationOffsetDegrees: 0,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
      },
      {
        assetPath: `${INDUSTRY_ASSET_ROOT}/building-s.glb`,
        rowOffset: 0.85,
        colOffset: 0.5,
        scale: 0.9,
        rotationOffsetDegrees: 180,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
      },
    ],
  },

  {
    buildingId: "factory-l",
    parts: [
        {
        assetPath: `${INDUSTRY_ASSET_ROOT}/chimney-medium.glb`,
        rowOffset: 0.15,
        colOffset: 0.03,
        scale: 0.75,
        rotationOffsetDegrees: 270,
        yOffset: 0.02,
        },
        {
        assetPath: `${INDUSTRY_ASSET_ROOT}/building-p.glb`,
        rowOffset: 0.83,
        colOffset: 0.07,
        scale: 0.75,
        rotationOffsetDegrees: 270,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
        {
        assetPath: `${INDUSTRY_ASSET_ROOT}/building-e.glb`,
        rowOffset: 2.05,
        colOffset: 0.3,
        scale: 0.75,
        rotationOffsetDegrees: 180,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
        {
        assetPath: `${INDUSTRY_ASSET_ROOT}/building-n.glb`,
        rowOffset: 1.59,
        colOffset: 0.8,
        scale: 0.65,
        rotationOffsetDegrees: 0,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
    ],
  },

  {
    buildingId: "warehouse-yard",
    parts: [
      {
        assetPath: `${INDUSTRY_ASSET_ROOT}/building-o.glb`,
        rowOffset: -0.3,
        colOffset: -0.28,
        scale: 0.8,
        rotationOffsetDegrees: 0,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
      },
      {
        assetPath: `${INDUSTRY_ASSET_ROOT}/building-o.glb`,
        rowOffset: -0.3,
        colOffset: 1.6,
        scale: 0.8,
        rotationOffsetDegrees: 0,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
      },
      {
        assetPath: `${INDUSTRY_ASSET_ROOT}/building-k.glb`,
        rowOffset: 1,
        colOffset: 0.3,
        scale: 0.9,
        rotationOffsetDegrees: 180,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
      },
      {
        assetPath: `${INDUSTRY_ASSET_ROOT}/building-d.glb`,
        rowOffset: 1,
        colOffset: 1,
        scale: 0.65,
        rotationOffsetDegrees: 0,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
      },
      {
        assetPath: `${INDUSTRY_ASSET_ROOT}/building-k.glb`,
        rowOffset: 1,
        colOffset: 1.7,
        scale: 0.9,
        rotationOffsetDegrees: 0,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
      },
    ],
  },

  {
    buildingId: "power-yard",
    parts: [
        {
        assetPath: `${INDUSTRY_ASSET_ROOT}/building-m.glb`,
        rowOffset: 0.885,
        colOffset: 1,
        scale: 0.65,
        rotationOffsetDegrees: 0,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
        {
        assetPath: `${INDUSTRY_ASSET_ROOT}/building-m.glb`,
        rowOffset: 0.115,
        colOffset: 1,
        scale: 0.65,
        rotationOffsetDegrees: 0,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
        {
        assetPath: `${INDUSTRY_ASSET_ROOT}/building-g.glb`,
        rowOffset: 0,
        colOffset: 0.1,
        scale: 0.65,
        rotationOffsetDegrees: 180,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
    ],
  },

  {
    buildingId: "town-services",
    parts: [
        {
        assetPath: `${CIVIC_ITH_ASSET_ROOT}/townServices.glb`,
        rowOffset: 0,
        colOffset: 0.45,
        scale: 0.75,
        rotationOffsetDegrees: 180,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
    ],
  },

  {
    buildingId: "emergency-services",
    parts: [
        {
        assetPath: `${CIVIC_ITH_ASSET_ROOT}/emergencyServices.glb`,
        rowOffset: 0,
        colOffset: 0,
        scale: 0.75,
        rotationOffsetDegrees: 180,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
    ],
  },

  {
    buildingId: "broadcast-building",
    parts: [
        {
        assetPath: `${CIVIC_ITH_ASSET_ROOT}/broadcastBuilding.glb`,
        rowOffset: 0,
        colOffset: 0,
        scale: 0.75,
        rotationOffsetDegrees: 270,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
    ],
  },

  {
    buildingId: "courthouse",
    parts: [
        {
        assetPath: `${CIVIC_ITH_ASSET_ROOT}/courthouse.glb`,
        rowOffset: 0,
        colOffset: 0,
        scale: 0.75,
        rotationOffsetDegrees: 180,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
    ],
  },

  {
    buildingId: "library",
    parts: [
        {
        assetPath: `${CULTURE_ITH_ASSET_ROOT}/library.glb`,
        rowOffset: 0,
        colOffset: 0,
        scale: 0.75,
        rotationOffsetDegrees: 180,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
    ],
  },

  {
    buildingId: "ferris-wheel",
    parts: [
        {
        assetPath: `${CULTURE_ITH_ASSET_ROOT}/ferrisWheel.glb`,
        rowOffset: 0,
        colOffset: 0,
        scale: 0.75,
        rotationOffsetDegrees: 270,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
    ],
  },

  {
    buildingId: "park",
    parts: [
        {
        assetPath: `${CULTURE_ITH_ASSET_ROOT}/park.glb`,
        rowOffset: 0,
        colOffset: 0,
        scale: 0.75,
        rotationOffsetDegrees: 90,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
    ],
  },

  {
    buildingId: "museum",
    parts: [
        {
        assetPath: `${CULTURE_ITH_ASSET_ROOT}/museum.glb`,
        rowOffset: 0,
        colOffset: 0,
        scale: 0.75,
        rotationOffsetDegrees: 0,
        sidewaysRotationOffsetDegrees: 180,
        yOffset: 0.02,
        },
    ],
  },
];

export function createDefaultBuildingRenderCatalog(): BuildingRenderCatalog {
  return new BuildingRenderCatalog(DEFAULT_BUILDING_RENDER_DEFINITIONS);
}