import { GAME_BALANCE_CONFIG } from "../config/GameBalanceConfig";
import type { CityScore } from "../scoring/CityScore";
import type { GameResult } from "./GameResult";

export class GameResultResolver {
  public resolve(playerScore: CityScore, aiScore: CityScore): GameResult {
    const playerFinalScore =
      playerScore.finalPopulation * GAME_BALANCE_CONFIG.scoring.populationWeight +
      playerScore.finalAttraction * GAME_BALANCE_CONFIG.scoring.attractionWeight;

    const aiFinalScore =
      aiScore.finalPopulation * GAME_BALANCE_CONFIG.scoring.populationWeight +
      aiScore.finalAttraction * GAME_BALANCE_CONFIG.scoring.attractionWeight;

    if (playerFinalScore > aiFinalScore) {
      return {
        winner: "player",

        playerPopulation: playerScore.finalPopulation,
        aiPopulation: aiScore.finalPopulation,

        playerAttraction: playerScore.finalAttraction,
        aiAttraction: aiScore.finalAttraction,

        playerScore: playerFinalScore,
        aiScore: aiFinalScore,

        reason: "Player has the highest final score.",
      };
    }

    if (aiFinalScore > playerFinalScore) {
      return {
        winner: "ai",

        playerPopulation: playerScore.finalPopulation,
        aiPopulation: aiScore.finalPopulation,

        playerAttraction: playerScore.finalAttraction,
        aiAttraction: aiScore.finalAttraction,

        playerScore: playerFinalScore,
        aiScore: aiFinalScore,

        reason: "AI has the highest final score.",
      };
    }

    return {
      winner: "draw",

      playerPopulation: playerScore.finalPopulation,
      aiPopulation: aiScore.finalPopulation,

      playerAttraction: playerScore.finalAttraction,
      aiAttraction: aiScore.finalAttraction,

      playerScore: playerFinalScore,
      aiScore: aiFinalScore,

      reason: "Both cities have the same final score.",
    };
  }
}