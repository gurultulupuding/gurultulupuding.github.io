import { GridModel } from "../../../world/grid/GridModel";
import { PlacedBuildingRenderer } from "../../../world/rendering/PlacedBuildingRenderer";
import { HandState } from "../../hand/HandState";
import type { AIPlacementPlan } from "./AIPlacementPlan";
import { AIRevealState } from "../reveal/AIRevealState";
import { TurnController } from "../../turn/TurnController";
import { PlacedBuildingRegistry } from "../../../world/city/PlacedBuildingRegistry";
import type { PlacedBuildingInstance } from "../../../world/city/PlacedBuildingInstance";
import { PlacedBuildingScoreContributionFactory } from "../../scoring/PlacedBuildingScoreContributionFactory";
import { PlacedBuildingScoreRegistry } from "../../scoring/PlacedBuildingScoreRegistry";
import { RoadNetworkRenderer } from "../../../world/rendering/roads/RoadNetworkRenderer";
import { PlacedBuildingRenderRegistry } from "../../../world/rendering/PlacedBuildingRenderRegistry";
import { CityPopulationModifierState } from "../../scoring/CityPopulationModifierState";

export class AIPlacementResolution {
  private readonly grid: GridModel;
  private readonly placedBuildingRenderer: PlacedBuildingRenderer;
  private readonly aiHandState: HandState;
  private readonly aiRevealState: AIRevealState;
  private readonly placedBuildingRegistry: PlacedBuildingRegistry;
  private readonly turnController: TurnController;
  private readonly scoreContributionFactory: PlacedBuildingScoreContributionFactory;
  private readonly scoreRegistry: PlacedBuildingScoreRegistry;
  private readonly roadNetworkRenderer: RoadNetworkRenderer;
  private readonly renderRegistry: PlacedBuildingRenderRegistry;
  private readonly populationModifierState: CityPopulationModifierState;

  constructor(
    grid: GridModel,
    placedBuildingRenderer: PlacedBuildingRenderer,
    roadNetworkRenderer: RoadNetworkRenderer,
    renderRegistry: PlacedBuildingRenderRegistry,
    aiHandState: HandState,
    aiRevealState: AIRevealState,
    placedBuildingRegistry: PlacedBuildingRegistry,
    turnController: TurnController,
    scoreContributionFactory: PlacedBuildingScoreContributionFactory,
    scoreRegistry: PlacedBuildingScoreRegistry,
    populationModifierState: CityPopulationModifierState
  ) {
    this.grid = grid;
    this.placedBuildingRenderer = placedBuildingRenderer;
    this.renderRegistry = renderRegistry;
    this.roadNetworkRenderer = roadNetworkRenderer;
    this.aiHandState = aiHandState;
    this.aiRevealState = aiRevealState;
    this.placedBuildingRegistry = placedBuildingRegistry;
    this.turnController = turnController;
    this.scoreContributionFactory = scoreContributionFactory;
    this.scoreRegistry = scoreRegistry;
    this.populationModifierState = populationModifierState;
  }

  public resolvePlacement(plan: AIPlacementPlan, handCardId: string): void {
    for (const cell of plan.cells) {
      this.grid.setOccupied(cell.row, cell.col, true, {
        family: plan.building.family,
        tags: plan.building.tags,
      });
    }

    const instance: PlacedBuildingInstance = {
      id: crypto.randomUUID(),
      owner: "ai",
      building: plan.building,
      anchor: { row: plan.row, col: plan.col },
      rotation: plan.rotation,
      cells: plan.cells,
      placedTurn: this.turnController.getTurnState().getCurrentTurn(),
    };

    this.placedBuildingRegistry.add(instance);

    const contribution =
      this.scoreContributionFactory.createForInstance(
        instance,
        this.placedBuildingRegistry,
        this.scoreRegistry,
        this.populationModifierState.getPopulationModifier()
      );

    this.scoreRegistry.add(contribution);

    if (this.isRoadBuilding(instance)) {
      this.roadNetworkRenderer.refreshAroundCells(
        instance.cells,
        this.placedBuildingRegistry
      );
    } else {
      const renderHandle =
        this.placedBuildingRenderer.renderPlacedBuilding(instance);

      this.renderRegistry.add(renderHandle);
    }

    console.log("AI placed contribution:", contribution);

    this.aiRevealState.recordPlacement({
      instance,
      contribution,
    });

    this.aiHandState.removeCardById(handCardId);

    console.log("AI placement confirmed:", plan);
    console.log("AI placed instance:", instance);
    console.log("AI hand after placement:", this.aiHandState.getBuildings());
  }

  private isRoadBuilding(instance: PlacedBuildingInstance): boolean {
    return instance.building.tags.includes("road");
  }
}