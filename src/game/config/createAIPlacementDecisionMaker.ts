import { GridModel } from "../../world/grid/GridModel";
import { PlacedBuildingRegistry } from "../../world/city/PlacedBuildingRegistry";

import { PlacedBuildingScoreContributionFactory } from "../scoring/PlacedBuildingScoreContributionFactory";

import { AIPlacementPlanner } from "../ai/placement/AIPlacementPlanner";
import { AIPlacementEvaluator } from "../ai/placement/AIPlacementEvaluator";
import { AIPlacementDecisionMaker } from "../ai/placement/AIPlacementDecisionMaker";

import { PopulationGainConsideration } from "../ai/placement/considerations/PopulationGainConsideration";
import { AttractionGainConsideration } from "../ai/placement/considerations/AttractionGainConsideration";
import { AttractionComebackPlacementConsideration } from "../ai/placement/considerations/AttractionComebackPlacementConsideration";
import { SynergyGainConsideration } from "../ai/placement/considerations/SynergyGainConsideration";
import { BasicFamilyPreferenceConsideration } from "../ai/placement/considerations/BasicFamilyPreferenceConsideration";

import { ResidentialCapacityGainConsideration } from "../ai/placement/considerations/ResidentialCapacityGainConsideration";
import { ResidentialRoadAccessPlacementConsideration } from "../ai/placement/considerations/ResidentialRoadAccessPlacementConsideration";
import { IndustryCapacityFitConsideration } from "../ai/placement/considerations/IndustryCapacityFitConsideration";
import { IndustryWastedPopulationAvoidanceConsideration } from "../ai/placement/considerations/IndustryWastedPopulationAvoidanceConsideration";

import { CivicBeforeCultureConsideration } from "../ai/placement/considerations/CivicBeforeCultureConsideration";
import { IndustryInfrastructureConsideration } from "../ai/placement/considerations/IndustryInfrastructureConsideration";
import { InfrastructureCultureAccessConsideration } from "../ai/placement/considerations/InfrastructureCultureAccessConsideration";
import { CulturePollutionAvoidanceConsideration } from "../ai/placement/considerations/CulturePollutionAvoidanceConsideration";

import { PollutionZonePlanningConsideration } from "../ai/placement/considerations/PollutionZonePlanningConsideration";
import { PollutionSensitiveAvoidanceConsideration } from "../ai/placement/considerations/PollutionSensitiveAvoidanceConsideration";

import { RoadBeforeResidentialConsideration } from "../ai/placement/considerations/RoadBeforeResidentialConsideration";
import { RoadExpansionForIndustryZoneConsideration } from "../ai/placement/considerations/RoadExpansionForIndustryZoneConsideration";
import { RoadConnectionAnchorConsideration } from "../ai/placement/considerations/RoadConnectionAnchorConsideration";
import { RoadShapeEfficiencyConsideration } from "../ai/placement/considerations/RoadShapeEfficiencyConsideration";
import { InfrastructureCrowdingAvoidanceConsideration } from "../ai/placement/considerations/InfrastructureCrowdingAvoidanceConsideration";
import type { PlacedBuildingScoreRegistry } from "../scoring/PlacedBuildingScoreRegistry";
import { InfrastructureOversupplyPlacementConsideration } from "../ai/placement/considerations/InfrastructureOversupplyPlacementConsideration";
import { LateGameNonScoringPlacementPenaltyConsideration } from "../ai/placement/considerations/LateGameNonScoringPlacementPenaltyConsideration";
import { CultureNeedsCivicSupportPlacementConsideration } from "../ai/placement/considerations/CultureNeedsCivicSupportPlacementConsideration";
import { CivicShortagePlacementConsideration } from "../ai/placement/considerations/CivicShortagePlacementConsideration";
import { CivicDistanceFromRoadConsideration } from "../ai/placement/considerations/CivicDistanceFromRoadConsideration";
import { CivicSeparationConsideration } from "../ai/placement/considerations/CivicSeparationConsideration";
import { ResidentialCivicDistanceConsideration } from "../ai/placement/considerations/ResidentialCivicDistanceConsideration";
import { ResidentialRoadCrowdingPenaltyConsideration } from "../ai/placement/considerations/ResidentialRoadCrowdingPenaltyConsideration";

export function createAIPlacementDecisionMaker(
  aiGrid: GridModel,
  aiPlacedBuildingRegistry: PlacedBuildingRegistry,
  scoreContributionFactory: PlacedBuildingScoreContributionFactory,
  aiScoreRegistry: PlacedBuildingScoreRegistry
): AIPlacementDecisionMaker {
  return new AIPlacementDecisionMaker(
    new AIPlacementPlanner(aiGrid),
    new AIPlacementEvaluator(
        aiGrid,
        aiPlacedBuildingRegistry,
        scoreContributionFactory,
        aiScoreRegistry,
        [
          new PopulationGainConsideration(3),
          new AttractionGainConsideration(5),
          new SynergyGainConsideration(2, 3, 0),

          new ResidentialCapacityGainConsideration(2, 6, 18),
          new ResidentialRoadAccessPlacementConsideration(8, 8),
          new ResidentialRoadCrowdingPenaltyConsideration(
            2,
            8,
            24
          ),

          new IndustryCapacityFitConsideration(10, 5, 18),
          new IndustryWastedPopulationAvoidanceConsideration(4, 24),

          new AttractionComebackPlacementConsideration(5, 10, 1, 6),

          new CivicBeforeCultureConsideration(
            10, // cultureSetupBonus
            2,  // radius
            3,  // maxCheckedCultureCards
            5,  // attractionComebackBonus
            16  // maxScore
          ),
          new CivicShortagePlacementConsideration(3, 8, 6, 18),
          new CultureNeedsCivicSupportPlacementConsideration(18, 7),
          new IndustryInfrastructureConsideration(6, 3, 12, 6, 2, 3),
          new InfrastructureCultureAccessConsideration(4, 7, 1, 3),

          new PollutionZonePlanningConsideration(
            3,
            12,
            5,
            3,
            4,
            14,
            9,
            5,
            0.5,
            6,
            4,
            5,
            12
          ),

          new PollutionSensitiveAvoidanceConsideration(
            3,
            12,
            8,
            4,
            12,
            8,
            4,
            5,
            7,
            10,
            8,
            5
          ),

          new RoadBeforeResidentialConsideration(10, 3),
          new RoadExpansionForIndustryZoneConsideration(
            8,
            3,
            5,
            7,
            3,
            4,
            3,
            4,
            2,
            2,
            7,
            12,
            2,
            2.0
          ),

          new CivicDistanceFromRoadConsideration(
            2,   // idealDistanceFromRoad
            10,   // bonusAtIdealDistance
            4,   // bonusAtNearDistance
            14,  // penaltyTooCloseToRoad
            8    // penaltyTooFarFromRoad
          ),
          new CivicSeparationConsideration(
            3,  // minimumDistance
            4,  // idealDistance
            14, // tooClosePenalty
            8,  // idealBonus
            3   // farPenalty
          ),

          new ResidentialCivicDistanceConsideration(
            2,  // minimumDistance
            3,  // idealDistance
            10, // tooClosePenalty
            6,  // idealBonus
            2   // farPenalty
          ),
          new RoadConnectionAnchorConsideration(5, 7, 3, 12),
          new RoadShapeEfficiencyConsideration(2, 2, 10, 12, 28),
          new InfrastructureCrowdingAvoidanceConsideration(1, 3, 2, 10),

          new InfrastructureOversupplyPlacementConsideration(5, 8, 6, 12, 36),
          new LateGameNonScoringPlacementPenaltyConsideration(11, 12),

          new CulturePollutionAvoidanceConsideration(3, 5),

          new BasicFamilyPreferenceConsideration(),
        ]
      ),
    1
  );
}