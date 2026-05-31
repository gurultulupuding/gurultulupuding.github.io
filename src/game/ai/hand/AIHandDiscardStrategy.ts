import type { HandCardInstance } from "../../hand/HandCardInstance";
import type { CityScore } from "../../scoring/CityScore";
import { AIPlacementDecisionMaker } from "../placement/AIPlacementDecisionMaker";

interface ScoredDiscardCandidate {
  card: HandCardInstance;
  index: number;
  keepValue: number;
  reason: string;
}

interface AIDiscardScoreContext {
  aiScore: CityScore;
  playerScore: CityScore;
}

export class AIHandDiscardStrategy {
  private readonly placementDecisionMaker: AIPlacementDecisionMaker;
  private readonly getScoreContext: () => AIDiscardScoreContext;

  constructor(
    placementDecisionMaker: AIPlacementDecisionMaker,
    getScoreContext: () => AIDiscardScoreContext
  ) {
    this.placementDecisionMaker = placementDecisionMaker;
    this.getScoreContext = getScoreContext;
  }

  public chooseCardsToDiscard(
    cards: HandCardInstance[],
    discardCount: number,
    currentTurn: number
  ): HandCardInstance[] {
    if (discardCount <= 0) {
      return [];
    }

    const scoredCards = cards.map((card, index) =>
      this.scoreCardForKeeping(card, cards, index, currentTurn)
    );

    const cardsToDiscard = scoredCards
      .sort((a, b) => {
        if (a.keepValue !== b.keepValue) {
          return a.keepValue - b.keepValue;
        }

        return a.index - b.index;
      })
      .slice(0, discardCount);

    console.log("AI discard evaluation:", {
      candidates: scoredCards.map((candidate) => ({
        building: candidate.card.building.name,
        keepValue: candidate.keepValue,
        reason: candidate.reason,
      })),
      discarded: cardsToDiscard.map((candidate) => ({
        building: candidate.card.building.name,
        keepValue: candidate.keepValue,
      })),
    });

    return cardsToDiscard.map((candidate) => candidate.card);
  }

  private scoreCardForKeeping(
    card: HandCardInstance,
    allCards: HandCardInstance[],
    index: number,
    currentTurn: number
  ): ScoredDiscardCandidate {
    const scoreContext = this.getScoreContext();

    const bestPlacementDecision =
      this.placementDecisionMaker.chooseBestPlacementDecisionForCard(
        card,
        allCards,
        currentTurn,
        scoreContext.aiScore,
        scoreContext.playerScore
      );

    if (!bestPlacementDecision) {
      const fallbackValue = this.getFallbackCardKeepValue(card);

      return {
        card,
        index,
        keepValue: fallbackValue,
        reason:
          `No valid placement found. Fallback value for ` +
          `${card.building.name} = ${fallbackValue}`,
      };
    }

    return {
      card,
      index,
      keepValue: bestPlacementDecision.score,
      reason:
        `Best placement score for ${card.building.name} = ` +
        `${bestPlacementDecision.score} | ${bestPlacementDecision.reason}`,
    };
  }

  private getFallbackCardKeepValue(card: HandCardInstance): number {
    return (
      card.building.basePopulation * 4 +
      card.building.baseAttraction * 3
    );
  }
}