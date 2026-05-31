export type GameWinner = "player" | "ai" | "draw";

export interface GameResult {
  winner: GameWinner;

  playerPopulation: number;
  aiPopulation: number;

  playerAttraction: number;
  aiAttraction: number;

  playerScore: number;
  aiScore: number;

  reason: string;
}