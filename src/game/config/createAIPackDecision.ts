import { AIPackDecision } from "../ai/pack/AIPackDecision";
import { AIPackEvaluator } from "../ai/pack/AIPackEvaluator";

import { AttractionNeedPackConsideration } from "../ai/pack/considerations/AttractionNeedPackConsideration";
import { CivicForCulturePackConsideration } from "../ai/pack/considerations/CivicForCulturePackConsideration";
import { InfrastructureForCulturePackConsideration } from "../ai/pack/considerations/InfrastructureForCulturePackConsideration";
import { InfrastructureForIndustryPackConsideration } from "../ai/pack/considerations/InfrastructureForIndustryPackConsideration";
import { InfrastructureForResidentialPackConsideration } from "../ai/pack/considerations/InfrastructureForResidentialPackConsideration";
import { FamilyBalancePackConsideration } from "../ai/pack/considerations/FamilyBalancePackConsideration";
import { FamilyOversupplyPackConsideration } from "../ai/pack/considerations/FamilyOversupplyPackConsideration";
import { LateInfrastructureDecayPackConsideration } from "../ai/pack/considerations/LateInfrastructureDecayPackConsideration";
import { IndustryOverPollutionPackPenaltyConsideration } from "../ai/pack/considerations/IndustryOverPollutionPackPenaltyConsideration";
import { CapacityNeedPackConsideration } from "../ai/pack/considerations/CapacityNeedPackConsideration";
import { ProductionNeedPackConsideration } from "../ai/pack/considerations/ProductionNeedPackConsideration";
import { RoadAccessNeedPackConsideration } from "../ai/pack/considerations/RoadAccessNeedPackConsideration";
import { IndustrySupportNeedPackConsideration } from "../ai/pack/considerations/IndustrySupportNeedPackConsideration";
import { FinalTurnPackConversionConsideration } from "../ai/pack/considerations/FinalTurnPackConversionConsideration";
import { AIPackMemoryState } from "../ai/pack/AIPackMemoryState";
import { GAME_BALANCE_CONFIG } from "./GameBalanceConfig";
import { IndustryPackCapacityPressureConsideration } from "../ai/pack/considerations/IndustryPackCapacityPressureConsideration";
import { CultureCivicOversupplyPackConsideration } from "../ai/pack/considerations/CultureCivicOversupplyPackConsideration";
import { FinalTurnDeadPackPenaltyConsideration } from "../ai/pack/considerations/FinalTurnDeadPackPenaltyConsideration";
import { OpeningInfrastructurePackConsideration } from "../ai/pack/considerations/OpeningInfrastructurePackConsideration";
import { OpeningCulturePressurePackConsideration } from "../ai/pack/considerations/OpeningCulturePressurePackConsideration";
import { FamilyPackLimitConsideration } from "../ai/pack/considerations/FamilyPackLimitConsideration";

export function createAIPackDecision(
  aiPackMemoryState: AIPackMemoryState
): AIPackDecision {
  return new AIPackDecision(
    new AIPackEvaluator([
      new FinalTurnPackConversionConsideration(2, 20, 12, 10, 14, 12),
      new CapacityNeedPackConsideration(18, 24, 30), //10, 16, 22
      new ProductionNeedPackConsideration(6, 22, 30),
      new IndustryPackCapacityPressureConsideration(
        5,    // estimatedIndustryPopulationPerCard
        4,    // expectedIndustryCardsFromPack
        0.75, // existingIndustryDemandWeight
        2,    // penaltyPerMissingCapacity
        40    // maxPenalty
      ),
      new FinalTurnDeadPackPenaltyConsideration(
        2,  // finalWindowTurns
        45, // residentialWithoutIndustryPenalty
        40, // civicWithoutCultureOrIndustryPenalty
        28  // infrastructureWithoutUsefulHandPenalty
      ),
      new RoadAccessNeedPackConsideration(7, 10, 14),
      new IndustrySupportNeedPackConsideration(5, 8, 12),

      new FamilyPackLimitConsideration(
        aiPackMemoryState,
        "infrastructure",
        GAME_BALANCE_CONFIG.aiPackPolicy.maxInfrastructurePacksPerGame,
        GAME_BALANCE_CONFIG.aiPackPolicy.infrastructurePackLimitPenalty
      ),

      new FamilyPackLimitConsideration(
        aiPackMemoryState,
        "civic",
        GAME_BALANCE_CONFIG.aiPackPolicy.maxCivicPacksPerGame,
        GAME_BALANCE_CONFIG.aiPackPolicy.civicPackLimitPenalty
      ),

      new OpeningInfrastructurePackConsideration(
        1,
        45, // infrastructure Bonus
        0   // non Infrastructure Penalty
      ),

      new OpeningCulturePressurePackConsideration(  // experimental
        5,  // maxOpeningTurn
        14, // noCultureBonus
        10, // behindCultureBonus
        8,  // civicSupportBonus
        6,  // unsupportedPenalty
        28  // maxScore
      ),

      new AttractionNeedPackConsideration(10, 4),

      new InfrastructureForResidentialPackConsideration(6),
      new InfrastructureForIndustryPackConsideration(6),
      new InfrastructureForCulturePackConsideration(5),

      new CivicForCulturePackConsideration(3),

      new IndustryOverPollutionPackPenaltyConsideration(8, 0, 14),
      new LateInfrastructureDecayPackConsideration(10, 14, 4, 10, 6),

      new FamilyBalancePackConsideration(4, 2),
      new FamilyOversupplyPackConsideration(12, 5),
      new CultureCivicOversupplyPackConsideration(12, 16, 5, 5),
    ])
  );
}