import type { AIPlacementConsideration, AIPlacementConsiderationResult } from "../../placement/AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../../placement/AIPlacementEvaluationContext";

export class CultureLeadDiminishingReturnConsideration
  implements AIPlacementConsideration
{
  public readonly id = "culture-lead-diminishing-return";

  private readonly leadThreshold: number;
  private readonly penaltyPerLeadPoint: number;
  private readonly maxPenalty: number;

  constructor(
    leadThreshold: number = 5,
    penaltyPerLeadPoint: number = 2,
    maxPenalty: number = 24
  ) {
    this.leadThreshold = leadThreshold;
    this.penaltyPerLeadPoint = penaltyPerLeadPoint;
    this.maxPenalty = maxPenalty;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (building.family !== "culture") {
      return {
        score: 0,
        reason: "not culture = 0",
      };
    }

    const aiAttraction = context.aiScore.finalAttraction;
    const playerAttraction = context.playerScore.finalAttraction;
    const lead = aiAttraction - playerAttraction;

    if (lead < this.leadThreshold) {
      return {
        score: 0,
        reason: `attraction lead ${lead} below threshold ${this.leadThreshold} = 0`,
      };
    }

    const penalty = Math.min(
      this.maxPenalty,
      Math.round((lead - this.leadThreshold + 1) * this.penaltyPerLeadPoint)
    );

    return {
      score: -penalty,
      reason:
        `AI already leads attraction: ai=${aiAttraction}, player=${playerAttraction}, ` +
        `lead=${lead}, penalty=-${penalty}`,
    };
  }
}