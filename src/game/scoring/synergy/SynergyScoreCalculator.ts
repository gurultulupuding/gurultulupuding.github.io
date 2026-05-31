import { PlacedBuildingRegistry } from "../../../world/city/PlacedBuildingRegistry";
import type { PlacedBuildingInstance } from "../../../world/city/PlacedBuildingInstance";
import type { SynergyEffect } from "./SynergyEffect";
import type { SynergyRule } from "./SynergyRule";
import type { SynergyScore } from "./SynergyScore";

export class SynergyScoreCalculator {
  private readonly rules: SynergyRule[];

  constructor(rules: SynergyRule[]) {
    this.rules = rules;
  }

  public calculateForInstance(
    instance: PlacedBuildingInstance,
    registry: PlacedBuildingRegistry
  ): SynergyScore {
    const effects: SynergyEffect[] = [];

    for (const rule of this.rules) {
      effects.push(...rule.evaluate(instance, registry));
    }

    return this.sumEffects(effects);
  }

  public calculate(registry: PlacedBuildingRegistry): SynergyScore {
    const effects: SynergyEffect[] = [];

    for (const instance of registry.getAll()) {
      for (const rule of this.rules) {
        effects.push(...rule.evaluate(instance, registry));
      }
    }

    return this.sumEffects(effects);
  }

  private sumEffects(effects: SynergyEffect[]): SynergyScore {
    const populationBonus = effects.reduce(
      (total, effect) => total + effect.populationDelta,
      0
    );

    const attractionBonus = effects.reduce(
      (total, effect) => total + effect.attractionDelta,
      0
    );

    return {
      populationBonus,
      attractionBonus,
      effects,
    };
  }
}