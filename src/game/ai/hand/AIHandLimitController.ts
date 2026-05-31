import type { TurnState } from "../../turn/TurnState";
import { HandState } from "../../hand/HandState";
import { HandLimitResolver } from "../../hand/HandLimitResolver";
import { AIHandDiscardStrategy } from "./AIHandDiscardStrategy";

export class AIHandLimitController {
  private readonly aiHandState: HandState;
  private readonly handLimitResolver: HandLimitResolver;
  private readonly discardStrategy: AIHandDiscardStrategy;

  private readonly resolvedKeys = new Set<string>();

  constructor(
    aiHandState: HandState,
    handLimitResolver: HandLimitResolver,
    discardStrategy: AIHandDiscardStrategy
  ) {
    this.aiHandState = aiHandState;
    this.handLimitResolver = handLimitResolver;
    this.discardStrategy = discardStrategy;
  }

  public handleTurnStateChanged(turnState: TurnState): void {
    const currentTurn = turnState.getCurrentTurn();
    const actor = turnState.getCurrentActor();
    const phase = turnState.getCurrentPhase();

    if (actor !== "ai" || phase !== "ai-reveal") {
      return;
    }

    const key = `ai:${currentTurn}`;

    if (this.resolvedKeys.has(key)) {
      return;
    }

    this.resolvedKeys.add(key);

    if (!this.handLimitResolver.isOverLimit(this.aiHandState)) {
      return;
    }

    const discardCount =
      this.handLimitResolver.getOverflowCount(this.aiHandState);

    const cardsToDiscard = this.discardStrategy.chooseCardsToDiscard(
      this.aiHandState.getCards(),
      discardCount,
      currentTurn
    );

    const result = this.handLimitResolver.discardCardsByIds(
      this.aiHandState,
      cardsToDiscard.map((card) => card.id)
    );

    console.log("AI hand limit applied:", {
      maxCards: result.maxCards,
      kept: result.keptCards.map((card) => card.building.name),
      discarded: result.discardedCards.map((card) => card.building.name),
    });
  }
}