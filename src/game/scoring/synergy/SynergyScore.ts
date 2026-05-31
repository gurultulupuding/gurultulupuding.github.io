import type { SynergyEffect } from "./SynergyEffect";

export interface SynergyScore {
  populationBonus: number;
  attractionBonus: number;
  effects: SynergyEffect[];
}