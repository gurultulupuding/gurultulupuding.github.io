import { PlacedBuildingRenderer } from "../../world/rendering/PlacedBuildingRenderer";
import { PlayerTurnController } from "./PlayerTurnController";
import { TurnController } from "../turn/TurnController";
import { PlacedBuildingRegistry } from "../../world/city/PlacedBuildingRegistry";
import type { PlacedBuildingInstance } from "../../world/city/PlacedBuildingInstance";
import { PlacedBuildingScoreContributionFactory } from "../scoring/PlacedBuildingScoreContributionFactory";
import { PlacedBuildingScoreRegistry } from "../scoring/PlacedBuildingScoreRegistry";
import { RoadNetworkRenderer } from "../../world/rendering/roads/RoadNetworkRenderer";
import { PlacedBuildingRenderRegistry } from "../../world/rendering/PlacedBuildingRenderRegistry";
import { CityPopulationModifierState } from "../scoring/CityPopulationModifierState";
import type { StructureFamily } from "../packs/StructureFamily";

export class PlayerPlacementResolution {
  private readonly placedBuildingRenderer: PlacedBuildingRenderer;
  private readonly playerTurnController: PlayerTurnController;
  private readonly placedBuildingRegistry: PlacedBuildingRegistry;
  private readonly turnController: TurnController;
  private readonly scoreContributionFactory: PlacedBuildingScoreContributionFactory;
  private readonly scoreRegistry: PlacedBuildingScoreRegistry;
  private readonly roadNetworkRenderer: RoadNetworkRenderer;
  private readonly renderRegistry: PlacedBuildingRenderRegistry;
  private readonly populationModifierState: CityPopulationModifierState;

  private readonly onPlayerBuildingPlaced?: (
    family: StructureFamily,
    placedBuildingId: string
  ) => void;

  constructor(
    placedBuildingRenderer: PlacedBuildingRenderer,
    roadNetworkRenderer: RoadNetworkRenderer,
    renderRegistry: PlacedBuildingRenderRegistry,
    playerTurnController: PlayerTurnController,
    placedBuildingRegistry: PlacedBuildingRegistry,
    turnController: TurnController,
    scoreContributionFactory: PlacedBuildingScoreContributionFactory,
    scoreRegistry: PlacedBuildingScoreRegistry,
    populationModifierState: CityPopulationModifierState,
    onPlayerBuildingPlaced?: (
      family: StructureFamily,
      placedBuildingId: string
    ) => void
  ) {
    this.placedBuildingRenderer = placedBuildingRenderer;
    this.roadNetworkRenderer = roadNetworkRenderer;
    this.renderRegistry = renderRegistry;
    this.playerTurnController = playerTurnController;
    this.placedBuildingRegistry = placedBuildingRegistry;
    this.turnController = turnController;
    this.scoreContributionFactory = scoreContributionFactory;
    this.scoreRegistry = scoreRegistry;
    this.populationModifierState = populationModifierState;
    this.onPlayerBuildingPlaced = onPlayerBuildingPlaced;
  }

  public resolvePlacement(cells: { row: number; col: number }[]): void {
    const selectedBuilding = this.playerTurnController.getSelectedBuilding();

    if (!selectedBuilding) {
      console.warn("Placement rejected: no selected building.");
      return;
    }

    const instance: PlacedBuildingInstance = {
      id: crypto.randomUUID(),
      owner: "player",
      building: selectedBuilding.getBuilding(),
      anchor: cells[0],
      rotation: selectedBuilding.getRotation(),
      cells,
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

    this.onPlayerBuildingPlaced?.(
      instance.building.family,
      instance.id
    );

    this.playerTurnController.consumeSelectedBuildingAfterPlacement();

    console.log("Player placed contribution:", contribution);
    console.log("Player placed instance:", instance);
    console.log("Placement confirmed at cells:", cells);
  }

  private isRoadBuilding(instance: PlacedBuildingInstance): boolean {
    return instance.building.tags.includes("road");
  }
}