export const GAME_BALANCE_CONFIG = {
  hand: {
    maxCards: 3,
    cardsPerPack: 4,
  },

  scoring: {
    populationWeight: 1,
    attractionWeight: 1.5,
  },

  aiPackPolicy: {
    maxInfrastructurePacksPerGame: 2,
    infrastructurePackLimitPenalty: 70,

    maxCivicPacksPerGame: 2,
    civicPackLimitPenalty: 70
  },

  attractionMigration: {
    threshold: 6,
    multiplier: 0.55,
    maxMigration: 3,
  },

  aiPlacementPolicy: {
    optionalPlacementScoreThreshold: 28,
    forcedPlacementScoreThreshold: -2, //-5

    lateGameStartTurn: 12,
    lateGameOptionalPlacementScoreThreshold: 22,

    finalTurnPlacementScoreThreshold: -15,
    finalTurnMaxPlacements: 10,

    maxPlacementsPerTurn: 6,
    forcedSupportPlacementScoreThreshold: 3, //5
  },

  replaceHand: {
    playerMaxUsesPerGame: 1,
    aiMaxUsesPerGame: 1,

    aiMinimumTurn: 4,
    aiMinimumCardsInHand: 3,
    aiAverageQualityThreshold: 12,
    aiBestCardProtectionThreshold: 24,
  },
} as const;