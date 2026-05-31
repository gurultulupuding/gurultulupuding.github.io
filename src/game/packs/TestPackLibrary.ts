import type { PackDefinition } from "./PackDefinition";

export const TEST_PACKS: PackDefinition[] = [
  {
    id: "pack-residential",
    family: "residential",
    title: "Residential Pack",
    description: "Small homes and compact housing options.",
  },
  {
    id: "pack-infrastructure",
    family: "infrastructure",
    title: "Infrastructure Pack",
    description: "Road and mobility support structures.",
    contentDescription: "Guaranteed: 3 Road Segments + 3 Main Avenues.",
  },
  {
    id: "pack-industry",
    family: "industry",
    title: "Industry Pack",
    description: "Production-oriented structures.",
  },
  {
    id: "pack-civic",
    family: "civic",
    title: "Civic Pack",
    description: "Public services and administrative support.",
  },
  {
    id: "pack-culture",
    family: "culture",
    title: "Culture Pack",
    description: "Public spaces and cultural attraction.",
  },
];