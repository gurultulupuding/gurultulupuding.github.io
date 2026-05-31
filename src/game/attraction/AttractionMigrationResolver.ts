import type { CityScore } from "../scoring/CityScore";

export type CityOwner = "player" | "ai";

export interface AttractionMigrationResult {
  amount: number;
  from: CityOwner | null;
  to: CityOwner | null;
  attractionDifference: number;
  reason: string;
}

export class AttractionMigrationResolver {
  private readonly threshold: number;
  private readonly exponent: number;
  private readonly maxMigrationPerTurn: number;

  constructor(
    threshold: number = 3,
    exponent: number = 1.25,
    maxMigrationPerTurn: number = 6
  ) {
    this.threshold = threshold;
    this.exponent = exponent;
    this.maxMigrationPerTurn = maxMigrationPerTurn;
  }

  public resolve(
    playerScore: CityScore,
    aiScore: CityScore
  ): AttractionMigrationResult {
    const attractionDifference = Math.abs(
      playerScore.finalAttraction - aiScore.finalAttraction
    );

    if (attractionDifference < this.threshold) {
      return {
        amount: 0,
        from: null,
        to: null,
        attractionDifference,
        reason: "Attraction difference is too small to cause migration.",
      };
    }

    const rawAmount = Math.floor(
      Math.pow(
        attractionDifference - this.threshold + 1,
        this.exponent
      )
    );

    const cappedAmount = Math.min(
      rawAmount,
      this.maxMigrationPerTurn
    );

    if (playerScore.finalAttraction > aiScore.finalAttraction) {
      const amount = Math.min(cappedAmount, aiScore.finalPopulation);

      return {
        amount,
        from: amount > 0 ? "ai" : null,
        to: amount > 0 ? "player" : null,
        attractionDifference,
        reason:
          amount > 0
            ? `Player attracted ${amount} population from AI.`
            : "AI has no population available to migrate.",
      };
    }

    if (aiScore.finalAttraction > playerScore.finalAttraction) {
      const amount = Math.min(cappedAmount, playerScore.finalPopulation);

      return {
        amount,
        from: amount > 0 ? "player" : null,
        to: amount > 0 ? "ai" : null,
        attractionDifference,
        reason:
          amount > 0
            ? `AI attracted ${amount} population from Player.`
            : "Player has no population available to migrate.",
      };
    }

    return {
      amount: 0,
      from: null,
      to: null,
      attractionDifference,
      reason: "Attraction values are equal.",
    };
  }
}