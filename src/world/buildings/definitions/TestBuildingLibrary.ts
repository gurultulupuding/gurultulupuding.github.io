import type { BuildingDefinition } from "./BuildingDefinition";
import { FOOTPRINT_LIBRARY } from "../footprint/FootprintLibrary";

export const TEST_BUILDINGS = {
  residenceSmall: {
    id: "residence-small",
    name: "Residence Small",
    family: "residential",
    footprint: FOOTPRINT_LIBRARY.single1x1,
    basePopulation: 6,
    baseAttraction: 0,
    tags: ["housing"],
    description: "A compact home that provides basic population.",
  },

  residenceBlock: {
    id: "residence-block",
    name: "Residence Block",
    family: "residential",
    footprint: FOOTPRINT_LIBRARY.line1x2,
    basePopulation: 8,
    baseAttraction: 0,
    tags: ["housing"],
    description: "A denser residential structure for early population growth.",
  },

  courtyardHousing: {
    id: "courtyard-housing",
    name: "Courtyard Housing",
    family: "residential",
    footprint: FOOTPRINT_LIBRARY.square2x2,
    basePopulation: 10,
    baseAttraction: 0,
    tags: ["housing", "public-space"],
    description: "A larger housing block organized around a shared inner space.",
  },

  riversideApartments: {
    id: "riverside-apartments",
    name: "Riverside Apartments",
    family: "residential",
    footprint: FOOTPRINT_LIBRARY.lShape,
    basePopulation: 10,
    baseAttraction: 0,
    tags: ["housing", "landmark"],
    description: "Dense apartments with strong potential near attractive areas.",
  },

  roadSegment: {
    id: "road-segment",
    name: "Road Segment",
    family: "infrastructure",
    footprint: FOOTPRINT_LIBRARY.line1x2,
    basePopulation: 0,
    baseAttraction: 0,
    tags: ["road", "mobility", "infrastructure"],
    description: "A basic road segment that will later support nearby buildings.",
  },

  /*
  tramStop: {
    id: "tram-stop",
    name: "Tram Stop",
    family: "infrastructure",
    footprint: FOOTPRINT_LIBRARY.single1x1,
    basePopulation: 0,
    baseAttraction: 0,
    tags: ["mobility", "infrastructure"],
    description: "A small mobility node that supports urban expansion.",
  },

  utilityHub: {
    id: "utility-hub",
    name: "Utility Hub",
    family: "infrastructure",
    footprint: FOOTPRINT_LIBRARY.uShape,
    basePopulation: 1,
    baseAttraction: 0,
    tags: ["infrastructure", "service", "mobility"],
    description: "A support structure that will later improve nearby production and services.",
  },

  */

  mainAvenue: {
    id: "main-avenue",
    name: "Main Avenue",
    family: "infrastructure",
    footprint: FOOTPRINT_LIBRARY.line1x3,
    basePopulation: 0,
    baseAttraction: 0,
    tags: ["road", "mobility", "infrastructure"],
    description: "A longer mobility corridor that supports nearby housing, civic buildings, and future commercial activity.",
  },

  workshop: {
    id: "workshop",
    name: "Workshop",
    family: "industry",
    footprint: FOOTPRINT_LIBRARY.square2x2,
    basePopulation: 6,
    baseAttraction: -1,
    tags: ["industry", "production"],
    description: "A compact production building with moderate population value.",
  },

  factoryL: {
    id: "factory-l",
    name: "Factory L",
    family: "industry",
    footprint: FOOTPRINT_LIBRARY.lShape,
    basePopulation: 9,
    baseAttraction: -1,
    tags: ["industry", "production", "pollution"],
    description: "A strong industrial building that may later create penalties nearby.",
  },

  warehouseYard: {
    id: "warehouse-yard",
    name: "Warehouse",
    family: "industry",
    footprint: FOOTPRINT_LIBRARY.uShape,
    basePopulation: 7,
    baseAttraction: -1,
    tags: ["industry", "production"],
    description: "A reliable industrial support building with stable value.",
  },

  powerYard: {
    id: "power-yard",
    name: "Power Yard",
    family: "industry",
    footprint: FOOTPRINT_LIBRARY.smallLShape,
    basePopulation: 8,
    baseAttraction: -1,
    tags: ["industry", "production", "pollution"],
    description: "A powerful but unattractive industrial structure.",
  },

  townServices: {
    id: "town-services",
    name: "Town Services",
    family: "civic",
    footprint: FOOTPRINT_LIBRARY.line1x3,
    basePopulation: 0,
    baseAttraction: 0,
    tags: ["service", "administration", "civic"],
    description: "A civic support building that stabilizes the city.",
  },

  emergencyServices: {
    id: "emergency-services",
    name: "Emergency Services",
    family: "civic",
    footprint: FOOTPRINT_LIBRARY.line1x2,
    basePopulation: 0,
    baseAttraction: 0,
    tags: ["service", "civic"],
    description: "A compact civic service that supports nearby residents.",
  },

  broadcastBuilding: {
    id: "broadcast-building",
    name: "Broadcast Building",
    family: "civic",
    footprint: FOOTPRINT_LIBRARY.single1x1,
    basePopulation: 0,
    baseAttraction: 0,
    tags: ["education", "civic", "service"],
    description: "An educational civic building with balanced long-term value.",
  },

  courthouse: {
    id: "courthouse",
    name: "Courthouse",
    family: "civic",
    footprint: FOOTPRINT_LIBRARY.square2x2,
    basePopulation: 0,
    baseAttraction: 0,
    tags: ["administration", "civic", "service"],
    description: "A larger administrative building that strengthens city structure.",
  },

  library: {
    id: "library",
    name: "Library",
    family: "culture",
    footprint: FOOTPRINT_LIBRARY.single1x1,
    basePopulation: 0,
    baseAttraction: 1,
    tags: ["culture", "education", "public-space"],
    description: "A cultural building that will later contribute to attraction.",
  },

  ferrisWheel: {
    id: "ferris-wheel",
    name: "Ferris Wheel",
    family: "culture",
    footprint: FOOTPRINT_LIBRARY.square2x2,
    basePopulation: 0,
    baseAttraction: 1,
    tags: ["culture", "public-space", "landmark"],
    description: "A public gathering place with future attraction potential.",
  },

  park: {
    id: "park",
    name: "Park",
    family: "culture",
    footprint: FOOTPRINT_LIBRARY.zShape,
    basePopulation: 0,
    baseAttraction: 1,
    tags: ["green", "public-space", "culture"],
    description: "A green public space that will later improve nearby housing.",
  },

  museum: {
    id: "museum",
    name: "Museum",
    family: "culture",
    footprint: FOOTPRINT_LIBRARY.tShape,
    basePopulation: 0,
    baseAttraction: 1,
    tags: ["culture", "landmark", "education"],
    description: "A high-attraction cultural building.",
  },
} as const satisfies Record<string, BuildingDefinition>;

export const TEST_BUILDING_POOL: BuildingDefinition[] =
  Object.values(TEST_BUILDINGS);