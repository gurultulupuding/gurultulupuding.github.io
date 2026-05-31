import type { TurnState } from "../turn/TurnState";
import { TurnController } from "../turn/TurnController";
import { HandState } from "../hand/HandState";
import { PackOfferState } from "../packs/PackOfferState";
import { AIPackDecision } from "./pack/AIPackDecision";
import { AIRevealState } from "./reveal/AIRevealState";
import { PackSelectionResolver } from "../packs/PackSelectionResolver";
import { AIPlacementTurnResolver } from "./placement/AIPlacementTurnResolver";
import type { AIPackEvaluationContext } from "./pack/AIPackEvaluationContext";
import type { PackDefinition } from "../packs/PackDefinition";
import { AIReplaceHandController } from "./hand/AIReplaceHandController";
import { AIPackMemoryState } from "./pack/AIPackMemoryState";

export class AITurnController {
  private readonly turnController: TurnController;
  private readonly packOfferState: PackOfferState;
  private readonly aiHandState: HandState;
  private readonly packDecision: AIPackDecision;
  private readonly aiRevealState: AIRevealState;
  private readonly packSelectionResolver: PackSelectionResolver;
  private readonly placementTurnResolver: AIPlacementTurnResolver;
  private readonly aiReplaceHandController: AIReplaceHandController;

  private isResolving = false;
  private lastSelectedPackScore = 0;
  private readonly aiPackMemoryState: AIPackMemoryState;

  private readonly createPackEvaluationContext: (
    offeredPacks: PackDefinition[]
  ) => AIPackEvaluationContext;

  constructor(
    turnController: TurnController,
    packOfferState: PackOfferState,
    aiHandState: HandState,
    packDecision: AIPackDecision,
    aiPackMemoryState: AIPackMemoryState,
    placementTurnResolver: AIPlacementTurnResolver,
    aiReplaceHandController: AIReplaceHandController,
    aiRevealState: AIRevealState,
    packSelectionResolver: PackSelectionResolver,
    createPackEvaluationContext: (
      offeredPacks: PackDefinition[]
    ) => AIPackEvaluationContext
  ) {
    this.turnController = turnController;
    this.packOfferState = packOfferState;
    this.aiHandState = aiHandState;
    this.packDecision = packDecision;
    this.aiPackMemoryState = aiPackMemoryState;
    this.placementTurnResolver = placementTurnResolver;
    this.aiReplaceHandController = aiReplaceHandController;
    this.aiRevealState = aiRevealState;
    this.packSelectionResolver = packSelectionResolver;
    this.createPackEvaluationContext = createPackEvaluationContext;
  }

  public handleTurnStateChanged(turnState: TurnState): void {
    if (this.isResolving) {
        return;
    }

    if (turnState.getCurrentActor() !== "ai") {
        return;
    }

    if (turnState.getCurrentPhase() === "pack-selection") {
        this.resolvePackSelection();
        return;
    }

    if (turnState.getCurrentPhase() === "placement") {
        this.resolvePlacement();
    }
  }

  private resolvePackSelection(): void {
    this.isResolving = true;

    this.aiRevealState.clear();

    const currentTurn =
      this.turnController.getTurnState().getCurrentTurn();

    this.aiReplaceHandController.tryReplaceHand(currentTurn);

    const offeredPacks = this.packOfferState.getOfferedPacks();
    const packEvaluationContext =
      this.createPackEvaluationContext(offeredPacks);

    const selectedPack =
      this.packDecision.choosePack(packEvaluationContext);

    if (!selectedPack) {
      console.warn("AI could not select a pack because no packs were offered.");
      this.isResolving = false;
      this.turnController.requestAdvanceFromAI();
      return;
    }

    const generatedBuildings =
      this.packSelectionResolver.resolvePackIntoHand(
        selectedPack,
        this.aiHandState
      );

    this.aiPackMemoryState.recordSelectedPack(selectedPack.family);

    console.log("AI selected pack:", selectedPack);
    console.log("Generated AI hand buildings:", generatedBuildings);
    console.log("AI hand after pack selection:", this.aiHandState.getBuildings());

    this.isResolving = false;
    this.turnController.requestAdvanceFromAI();
  }

  private resolvePlacement(): void {
    this.isResolving = true;

    const result = this.placementTurnResolver.resolvePlacementTurn();

    console.log("AI placement turn resolved:", {
      placedCount: result.placedDecisions.length,
      stoppedReason: result.stoppedReason,
      placedBuildings: result.placedDecisions.map(
        (decision) => decision.card.building.name
      ),
    });

    this.isResolving = false;

    this.turnController.requestAdvanceFromAI();
  }
}