import { HandState } from "./HandState";
import type { HandCardInstance } from "./HandCardInstance";

export interface HandLimitResult {
  wasLimited: boolean;
  maxCards: number;
  keptCards: HandCardInstance[];
  discardedCards: HandCardInstance[];
}

export class HandLimitResolver {
  private readonly maxCards: number;

  constructor(maxCards: number = 3) {
    this.maxCards = maxCards;
  }

  public getMaxCards(): number {
    return this.maxCards;
  }

  public isOverLimit(handState: HandState): boolean {
    return handState.getCards().length > this.maxCards;
  }

  public getOverflowCount(handState: HandState): number {
    return Math.max(0, handState.getCards().length - this.maxCards);
  }

  public discardCardsByIds(
    handState: HandState,
    discardedCardIds: string[]
  ): HandLimitResult {
    const beforeCards = handState.getCards();
    const discardedIds = new Set(discardedCardIds);

    const discardedCards = beforeCards.filter((card) =>
      discardedIds.has(card.id)
    );

    handState.removeCardsByIds(discardedCardIds);

    return {
      wasLimited: discardedCards.length > 0,
      maxCards: this.maxCards,
      keptCards: handState.getCards(),
      discardedCards,
    };
  }
}