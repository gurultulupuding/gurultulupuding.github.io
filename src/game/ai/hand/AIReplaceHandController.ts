import { HandState } from "../../hand/HandState";
import { HandReplacementService } from "../../hand/HandReplacementService";
import { AIReplaceHandStrategy } from "./AIReplaceHandStrategy";

export class AIReplaceHandController {
  private readonly handState: HandState;
  private readonly handReplacementService: HandReplacementService;
  private readonly strategy: AIReplaceHandStrategy;

  private usesLeft: number;

  constructor(
    handState: HandState,
    handReplacementService: HandReplacementService,
    strategy: AIReplaceHandStrategy,
    maxUsesPerGame: number
  ) {
    this.handState = handState;
    this.handReplacementService = handReplacementService;
    this.strategy = strategy;
    this.usesLeft = maxUsesPerGame;
  }

  public tryReplaceHand(
    currentTurn: number,
    selectedPackScore?: number
  ): boolean {
    if (this.usesLeft <= 0) {
      return false;
    }

    if (
      !this.strategy.shouldReplaceHand(
        this.handState,
        currentTurn,
        selectedPackScore
      )
    ) {
      return false;
    }

    const oldCards = this.handState.getCards();
    const newBuildings =
      this.handReplacementService.replaceHandWithRandomBuildings(
        this.handState
      );

    if (newBuildings.length === 0) {
      return false;
    }

    this.usesLeft--;

    console.log("AI replaced hand:", {
      oldBuildings: oldCards.map((card) => card.building.name),
      newBuildings: newBuildings.map((building) => building.name),
      usesLeft: this.usesLeft,
      selectedPackScore,
    });

    return true;
  }
}