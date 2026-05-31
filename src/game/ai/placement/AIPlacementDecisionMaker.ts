import type { HandCardInstance } from "../../hand/HandCardInstance";
import { AIPlacementPlanner } from "./AIPlacementPlanner";
import { AIPlacementEvaluator } from "./AIPlacementEvaluator";
import type { AIPlacementDecision } from "./AIPlacementDecision";
import type { CityScore } from "../../scoring/CityScore";

export class AIPlacementDecisionMaker {
  private readonly placementPlanner: AIPlacementPlanner;
  private readonly placementEvaluator: AIPlacementEvaluator;
  private readonly tieBreakScoreTolerance: number;

  constructor(
    placementPlanner: AIPlacementPlanner,
    placementEvaluator: AIPlacementEvaluator,
    tieBreakScoreTolerance: number = 2
  ) {
    this.placementPlanner = placementPlanner;
    this.placementEvaluator = placementEvaluator;
    this.tieBreakScoreTolerance = tieBreakScoreTolerance;
  }

  public chooseBestPlacementDecision(
    cards: HandCardInstance[],
    currentTurn: number,
    aiScore: CityScore,
    playerScore: CityScore
  ): AIPlacementDecision | null {
    const decisions: AIPlacementDecision[] = [];

    for (const card of cards) {
      const plans = this.placementPlanner.findAllValidPlacements(
        card.building
      );

      for (const plan of plans) {
        const evaluation = this.placementEvaluator.evaluate(
          plan,
          currentTurn,
          cards,
          aiScore,
          playerScore
        );

        decisions.push({
          card,
          plan,
          score: evaluation.score,
          contribution: evaluation.contribution,
          reason: evaluation.reason,
          considerationResults: evaluation.considerationResults,
        });
      }
    }

    return this.pickRandomNearBestDecision(decisions);
  }

  public chooseBestPlacementDecisionForCard(
    card: HandCardInstance,
    handCards: HandCardInstance[],
    currentTurn: number,
    aiScore: CityScore,
    playerScore: CityScore
  ): AIPlacementDecision | null {
    const decisions: AIPlacementDecision[] = [];

    const plans = this.placementPlanner.findAllValidPlacements(
      card.building
    );

    for (const plan of plans) {
      const evaluation = this.placementEvaluator.evaluate(
        plan,
        currentTurn,
        handCards,
        aiScore,
        playerScore
      );

      decisions.push({
        card,
        plan,
        score: evaluation.score,
        contribution: evaluation.contribution,
        reason: evaluation.reason,
        considerationResults: evaluation.considerationResults,
      });
    }

    return this.pickRandomNearBestDecision(decisions);
  }

  private pickRandomNearBestDecision(
    decisions: AIPlacementDecision[]
  ): AIPlacementDecision | null {
    if (decisions.length === 0) {
      return null;
    }

    const bestScore = Math.max(
      ...decisions.map((decision) => decision.score)
    );

    const nearBestDecisions = decisions.filter(
      (decision) =>
        bestScore - decision.score <= this.tieBreakScoreTolerance
    );

    const randomIndex = Math.floor(
      Math.random() * nearBestDecisions.length
    );

    return nearBestDecisions[randomIndex];
  }
}