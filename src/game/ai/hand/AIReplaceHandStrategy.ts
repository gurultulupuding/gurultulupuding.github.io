import { HandState } from "../../hand/HandState";
import { AIPlacementDecisionMaker } from "../placement/AIPlacementDecisionMaker";
import type { CityScore } from "../../scoring/CityScore";

export interface AIReplaceHandScoreContext {
  aiScore: CityScore;
  playerScore: CityScore;
}

export class AIReplaceHandStrategy {
  private readonly placementDecisionMaker: AIPlacementDecisionMaker;
  private readonly getScoreContext: () => AIReplaceHandScoreContext;

  private readonly minimumTurn: number;
  private readonly minimumCardsInHand: number;
  private readonly averageQualityThreshold: number;
  private readonly bestCardProtectionThreshold: number;

  private readonly selectedPackProtectionThreshold = 28;

  constructor(
    placementDecisionMaker: AIPlacementDecisionMaker,
    getScoreContext: () => AIReplaceHandScoreContext,
    minimumTurn: number,
    minimumCardsInHand: number,
    averageQualityThreshold: number,
    bestCardProtectionThreshold: number
  ) {
    this.placementDecisionMaker = placementDecisionMaker;
    this.getScoreContext = getScoreContext;

    this.minimumTurn = minimumTurn;
    this.minimumCardsInHand = minimumCardsInHand;
    this.averageQualityThreshold = averageQualityThreshold;
    this.bestCardProtectionThreshold = bestCardProtectionThreshold;
  }

  public shouldReplaceHand(
    handState: HandState,
    currentTurn: number,
    selectedPackScore?: number
  ): boolean {
    if (currentTurn < this.minimumTurn) {
      return false;
    }

    if (
      selectedPackScore !== undefined &&
      selectedPackScore >= this.selectedPackProtectionThreshold
    ) {
      return false;
    }

    const cards = handState.getCards();

    if (cards.length < this.minimumCardsInHand) {
      return false;
    }

    const scoreContext = this.getScoreContext();

    const cardScores = cards.map((card) => {
      const decision =
        this.placementDecisionMaker.chooseBestPlacementDecisionForCard(
          card,
          cards,
          currentTurn,
          scoreContext.aiScore,
          scoreContext.playerScore
        );

      return decision?.score ?? -999;
    });

    const bestScore = Math.max(...cardScores);

    if (bestScore >= this.bestCardProtectionThreshold) {
      return false;
    }

    const averageScore =
      cardScores.reduce((total, score) => total + score, 0) /
      cardScores.length;

    return averageScore < this.averageQualityThreshold;
  }
}