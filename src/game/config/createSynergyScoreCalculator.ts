import { SynergyScoreCalculator } from "../scoring/synergy/SynergyScoreCalculator";

import { CultureCivicSynergyRule } from "../scoring/synergy/rules/CultureCivicSynergyRule";
import { InfrastructureCultureAccessRule } from "../scoring/synergy/rules/InfrastructureCultureAccessRule";
import { CulturePollutionPenaltyRule } from "../scoring/synergy/rules/CulturePollutionPenaltyRule";

import { IndustryProductionSupportRule } from "../scoring/synergy/rules/IndustryProductionSupportRule";

export function createSynergyScoreCalculator(): SynergyScoreCalculator {
  return new SynergyScoreCalculator([
    new CultureCivicSynergyRule(1, [1]),
    new InfrastructureCultureAccessRule([1]),
    new CulturePollutionPenaltyRule(3, -1),

    new IndustryProductionSupportRule([2, 1], [1]),
  ]);
}