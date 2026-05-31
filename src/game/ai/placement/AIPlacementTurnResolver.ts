import { HandState } from "../../hand/HandState";
import { HandLimitResolver } from "../../hand/HandLimitResolver";
import { TurnController } from "../../turn/TurnController";
import { AIPlacementDecisionMaker } from "../placement/AIPlacementDecisionMaker";
import { AIPlacementResolution } from "../placement/AIPlacementResolution";
import { AIPlacementTurnPolicy } from "../placement/AIPlacementTurnPolicy";
import type { AIPlacementDecision } from "../placement/AIPlacementDecision";
import type { CityScore } from "../../scoring/CityScore";

export interface AIPlacementTurnResult {
  placedDecisions: AIPlacementDecision[];
  stoppedReason: string;
}

export interface AIPlacementScoreContext {
  aiScore: CityScore;
  playerScore: CityScore;
}

export class AIPlacementTurnResolver {
  private readonly aiHandState: HandState;
  private readonly handLimitResolver: HandLimitResolver;
  private readonly turnController: TurnController;
  private readonly placementDecisionMaker: AIPlacementDecisionMaker;
  private readonly placementResolution: AIPlacementResolution;
  private readonly placementTurnPolicy: AIPlacementTurnPolicy;
  private readonly getScoreContext: () => AIPlacementScoreContext;

  constructor(
    aiHandState: HandState,
    handLimitResolver: HandLimitResolver,
    turnController: TurnController,
    placementDecisionMaker: AIPlacementDecisionMaker,
    placementResolution: AIPlacementResolution,
    placementTurnPolicy: AIPlacementTurnPolicy,
    getScoreContext: () => AIPlacementScoreContext
  ) {
    this.aiHandState = aiHandState;
    this.handLimitResolver = handLimitResolver;
    this.turnController = turnController;
    this.placementDecisionMaker = placementDecisionMaker;
    this.placementResolution = placementResolution;
    this.placementTurnPolicy = placementTurnPolicy;
    this.getScoreContext = getScoreContext;
  }

  public resolvePlacementTurn(): AIPlacementTurnResult {
    const placedDecisions: AIPlacementDecision[] = [];
    const turnState = this.turnController.getTurnState();
    const currentTurn = turnState.getCurrentTurn();

    while (true) {
      const cards = this.aiHandState.getCards();

      if (cards.length === 0) {
        return {
          placedDecisions,
          stoppedReason: "AI hand is empty.",
        };
      }

      const scoreContext = this.getScoreContext();

      const decision =
        this.placementDecisionMaker.chooseBestPlacementDecision(
          cards,
          currentTurn,
          scoreContext.aiScore,
          scoreContext.playerScore
        );

      if (!decision) {
        return {
          placedDecisions,
          stoppedReason: "No valid AI placement decision found.",
        };
      }

      const turnState = this.turnController.getTurnState();

      const shouldPlace = this.placementTurnPolicy.shouldPlace({
        handSizeBeforePlacement: cards.length,
        maxHandCards: this.handLimitResolver.getMaxCards(),
        decisionScore: decision.score,
        placementsAlreadyMade: placedDecisions.length,
        building: decision.card.building,

        currentTurn: turnState.getCurrentTurn(),
        maxTurns: turnState.getMaxTurns(),
      });

      if (!shouldPlace) {
        return {
          placedDecisions,
          stoppedReason:
            `Best decision score ${decision.score} was not worth placing.`,
        };
      }

      console.log("AI places building during placement turn:", {
        building: decision.card.building.name,
        score: decision.score,
        reason: decision.reason,
        plan: decision.plan,
      });

      this.placementResolution.resolvePlacement(
        decision.plan,
        decision.card.id
      );

      placedDecisions.push(decision);
    }
  }
}