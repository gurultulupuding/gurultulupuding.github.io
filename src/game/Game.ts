import { Scene } from "@babylonjs/core/scene";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";

import type { EngineContext } from "../core/engine";
import { createEngineContext, registerResize } from "../core/engine";
import { GridModel } from "../world/grid/GridModel";
import { GridRenderer } from "../world/grid/GridRenderer";
import { applyPlayerShoreLayout } from "../world/terrain/PlayerShore";
import { applyAIShoreLayout } from "../world/terrain/AIShore";
import { applyInitialCityLayout } from "../world/terrain/InitialCityLayout";
import { CameraController } from "../world/camera/CameraController";
import { PackSelectionDisplay } from "../ui/PackSelectionDisplay";
import { PlacementPreviewController } from "../world/buildings/placements/PlacementPreviewController";
import { PlacementController } from "../world/buildings/placements/PlacementController";
import { PlacedBuildingRenderer } from "../world/rendering/PlacedBuildingRenderer";
import { PopulationDisplay } from "../ui/PopulationDisplay";
import { TurnController } from "./turn/TurnController";
import { TurnPhaseCoordinator } from "./turn/TurnPhaseCoordinator";
import { HandState } from "../game/hand/HandState";
import { HandDisplay } from "../ui/HandDisplay";
import { PlayerTurnController } from "./player/PlayerTurnController";
import { PlayerPlacementResolution } from "./player/PlayerPlacementResolution";
import { BuildingRotationController } from "../world/buildings/placements/BuildingRotationController";
import { PackOfferState } from "../game/packs/PackOfferState";
import { PackOfferController } from "../game/packs/PackOfferController";
import { PackOfferGenerator } from "../game/packs/PackOfferGenerator";
import { AITurnController } from "./ai/AITurnController";
import { AIPlacementResolution } from "./ai/placement/AIPlacementResolution";
import { AIRevealState } from "./ai/reveal/AIRevealState";
import { AIRevealDisplay } from "../ui/AIRevealDisplay";
import { PlacedBuildingRegistry } from "../world/city/PlacedBuildingRegistry";
import { PackContentGenerator } from "./packs/PackContentGenerator";
import { TEST_BUILDING_POOL } from "../world/buildings/definitions/TestBuildingLibrary";
import { PackSelectionResolver } from "./packs/PackSelectionResolver";
import { CityScoreCalculator } from "./scoring/CityScoreCalculator";
import { SynergyScoreCalculator } from "./scoring/synergy/SynergyScoreCalculator";
import { PlacedBuildingScoreContributionFactory } from "./scoring/PlacedBuildingScoreContributionFactory";
import { PlacedBuildingScoreRegistry } from "./scoring/PlacedBuildingScoreRegistry";
import { AttractionDisplay } from "../ui/AttractionDisplay";
import { CityPopulationModifierState } from "./scoring/CityPopulationModifierState";
import { AttractionMigrationResolver } from "./attraction/AttractionMigrationResolver";
import { AttractionMigrationDisplay } from "../ui/AttractionMigrationDisplay";
import { AttractionResolutionController } from "./attraction/AttractionResolutionController";
import { GameResultResolver } from "./result/GameResultResolver";
import { GameOverDisplay } from "../ui/GameOverDisplay";
import { GameOverController } from "./result/GameOverController";
import { GameEndUIController } from "./result/GameEndUIController";
import { HandLimitResolver } from "./hand/HandLimitResolver";
import { PlayerDiscardDisplay } from "../ui/PlayerDiscardDisplay";
import { PlayerHandOverflowController } from "./player/PlayerHandOverflowController";
import { AIHandLimitController } from "./ai/hand/AIHandLimitController";
import { AIHandDiscardStrategy } from "./ai/hand/AIHandDiscardStrategy";
import { AIPlacementTurnResolver } from "./ai/placement/AIPlacementTurnResolver";
import { AIPlacementTurnPolicy } from "./ai/placement/AIPlacementTurnPolicy";
import { GAME_BALANCE_CONFIG } from "./config/GameBalanceConfig";
import { createSynergyScoreCalculator } from "./config/createSynergyScoreCalculator";
import { createAIPlacementDecisionMaker } from "./config/createAIPlacementDecisionMaker";
import { createAIPackDecision } from "./config/createAIPackDecision";
import { ScoreDisplay } from "../ui/ScoreDisplay";
import { HandReplacementService } from "./hand/HandReplacementService";
import { ReplaceHandDisplay } from "../ui/ReplaceHandDisplay";
import { PlayerReplaceHandController } from "./player/PlayerReplaceHandController";
import { AIReplaceHandController } from "./ai/hand/AIReplaceHandController";
import { AIReplaceHandStrategy } from "./ai/hand/AIReplaceHandStrategy";
import { BuildingModelRepository } from "../world/rendering/BuildingModelRepository";
import { createDefaultBuildingRenderCatalog } from "../world/rendering/DefaultBuildingRenderCatalog";
import { RoadNetworkRenderer } from "../world/rendering/roads/RoadNetworkRenderer";
import { BuildingGhostPreviewRenderer } from "../world/rendering/BuildingGhostPreviewRenderer";
import { PlacedBuildingRenderRegistry } from "../world/rendering/PlacedBuildingRenderRegistry";
import { SynergyHighlightRenderer } from "../world/rendering/synergy/SynergyHighlightRenderer";
import { SynergyFloatingLabelRenderer } from "../world/rendering/synergy/SynergyFloatingLabelRenderer";
import { PreviewSynergyFeedbackController } from "./scoring/synergy/preview/PreviewSynergyFeedbackController";
import { AIPackMemoryState } from "./ai/pack/AIPackMemoryState";
import { StartingBaseRenderer } from "../world/startingBase/StartingBaseRenderer";
import { BoardEnvironmentRenderer } from "../world/environement/BoardEnvironmentRenderer";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import type { EnvironmentSide } from "../world/environement/RiverBridgeRenderer";
import type { KeyboardLayout } from "../ui/menu/KeyboardLayoutSettings";
import type { TurnActor, TurnPhase } from "./turn/TurnState";
import type { StructureFamily } from "./packs/StructureFamily";
import type { GameWinner } from "./result/GameResult";

export type GameTransitionCallbacks = {
  playEndTurnTransition?: (
    onCovered: () => Promise<void> | void
  ) => Promise<void>;

  playNextTurnTransition?: (
    onCovered: () => Promise<void> | void
  ) => Promise<void>;

  onRestartRequested?: () => void;

  onPlayerBuildingPlaced?: (
    family: StructureFamily,
    placedBuildingId: string
  ) => void;

  onCardSelected?: () => void;

  onCardDeselected?: () => void;

  onPlayerHandReplaced?: () => void;

  onTurnActionButtonClicked?: () => void;

  onGameResultShown?: (
    winner: GameWinner
  ) => void;
};

export class Game {
  private readonly canvas: HTMLCanvasElement;
  private readonly engineContext: EngineContext;
  private scene: Scene | null = null;
  private playerGrid!: GridModel;
  private aiGrid!: GridModel;
  private previewController!: PlacementPreviewController;
  private placementController!: PlacementController;
  private placedBuildingRenderer!: PlacedBuildingRenderer;
  private populationDisplay!: PopulationDisplay;
  private turnController!: TurnController;
  private packSelectionDisplay!: PackSelectionDisplay;
  private playerHandState!: HandState;
  private aiHandState!: HandState;
  private aiTurnController!: AITurnController;
  private handDisplay!: HandDisplay;
  private turnPhaseCoordinator!: TurnPhaseCoordinator;
  private playerTurnController!: PlayerTurnController;
  private playerPlacementResolution!: PlayerPlacementResolution;
  private buildingRotationController!: BuildingRotationController;
  private packOfferState!: PackOfferState;
  private packOfferController!: PackOfferController;
  private aiPlacedBuildingRenderer!: PlacedBuildingRenderer;
  private cameraController!: CameraController;
  private aiRevealState!: AIRevealState;
  private aiRevealDisplay!: AIRevealDisplay;
  private playerPlacedBuildingRegistry!: PlacedBuildingRegistry;
  private aiPlacedBuildingRegistry!: PlacedBuildingRegistry;
  private packSelectionResolver!: PackSelectionResolver;
  private cityScoreCalculator!: CityScoreCalculator;
  private synergyScoreCalculator!: SynergyScoreCalculator;
  private scoreContributionFactory!: PlacedBuildingScoreContributionFactory;
  private playerScoreRegistry!: PlacedBuildingScoreRegistry;
  private aiScoreRegistry!: PlacedBuildingScoreRegistry;
  private attractionDisplay!: AttractionDisplay;
  private playerPopulationModifierState!: CityPopulationModifierState;
  private aiPopulationModifierState!: CityPopulationModifierState;
  private attractionMigrationResolver!: AttractionMigrationResolver;
  private attractionMigrationDisplay!: AttractionMigrationDisplay;
  private attractionResolutionController!: AttractionResolutionController;
  private gameOverController!: GameOverController;
  private gameEndUIController!: GameEndUIController;
  private handLimitResolver!: HandLimitResolver;
  private playerDiscardDisplay!: PlayerDiscardDisplay;
  private playerHandOverflowController!: PlayerHandOverflowController;
  private aiHandLimitController!: AIHandLimitController;
  private scoreDisplay!: ScoreDisplay;
  private handReplacementService!: HandReplacementService;
  private replaceHandDisplay!: ReplaceHandDisplay;
  private playerReplaceHandController!: PlayerReplaceHandController;
  private aiReplaceHandController!: AIReplaceHandController;
  private isPlayerDiscardFlowActive = false;
  private playerRoadNetworkRenderer!: RoadNetworkRenderer;
  private aiRoadNetworkRenderer!: RoadNetworkRenderer;
  private playerGhostPreviewRenderer!: BuildingGhostPreviewRenderer;
  private playerRenderRegistry!: PlacedBuildingRenderRegistry;
  private aiRenderRegistry!: PlacedBuildingRenderRegistry;
  private playerSynergyFeedbackController!: PreviewSynergyFeedbackController;
  private aiPackMemoryState!: AIPackMemoryState;
  private activeEnvironmentSide: EnvironmentSide = "player";
  private pendingKeyboardLayout: KeyboardLayout = "qwerty";
  private readonly transitionCallbacks: GameTransitionCallbacks;
  private isTurnTransitionPlaying = false;
  private lastObservedActorPhaseKey: string | null = null;
  private isTurnActionButtonSuppressed = false;

  constructor(transitionCallbacks: GameTransitionCallbacks = {}) {
    this.transitionCallbacks = transitionCallbacks;
    this.turnController = new TurnController(
      (turnState) => {
        void this.handleTurnStateChanged(
          turnState
        );
      },
      this.transitionCallbacks
        .onTurnActionButtonClicked
    );

    this.populationDisplay = new PopulationDisplay();
    this.attractionDisplay = new AttractionDisplay();
    this.scoreDisplay = new ScoreDisplay();
    this.attractionMigrationDisplay = new AttractionMigrationDisplay();

    this.playerPopulationModifierState = new CityPopulationModifierState();
    this.aiPopulationModifierState = new CityPopulationModifierState();

    this.attractionMigrationResolver = new AttractionMigrationResolver(
      GAME_BALANCE_CONFIG.attractionMigration.threshold,
      GAME_BALANCE_CONFIG.attractionMigration.multiplier,
      GAME_BALANCE_CONFIG.attractionMigration.maxMigration
    );

    this.aiRevealState = new AIRevealState();
    this.aiRevealDisplay = new AIRevealDisplay();

    this.packSelectionDisplay = new PackSelectionDisplay();
    this.packOfferState = new PackOfferState();
    this.packOfferController = new PackOfferController(
      this.packOfferState,
      new PackOfferGenerator(
        new PackContentGenerator(),
        TEST_BUILDING_POOL,
        GAME_BALANCE_CONFIG.hand.cardsPerPack
      )
    );

    this.playerHandState = new HandState();
    this.handDisplay = new HandDisplay();

    const maxHandCards = GAME_BALANCE_CONFIG.hand.maxCards;
    this.handDisplay.setHandLimit(maxHandCards);
    this.aiHandState = new HandState();

    this.aiPackMemoryState = new AIPackMemoryState();

    this.handLimitResolver = new HandLimitResolver(maxHandCards);

    this.handReplacementService =
      new HandReplacementService(TEST_BUILDING_POOL);

    this.replaceHandDisplay = new ReplaceHandDisplay();

    this.playerDiscardDisplay =
      new PlayerDiscardDisplay(
        this.transitionCallbacks
          .onCardSelected,
        this.transitionCallbacks
          .onCardDeselected
      );

    this.playerPlacedBuildingRegistry = new PlacedBuildingRegistry();
    this.aiPlacedBuildingRegistry = new PlacedBuildingRegistry();


    this.packSelectionResolver = new PackSelectionResolver(
      new PackContentGenerator(),
      TEST_BUILDING_POOL,
      GAME_BALANCE_CONFIG.hand.cardsPerPack
    );

    this.synergyScoreCalculator = createSynergyScoreCalculator();

    this.scoreContributionFactory =
      new PlacedBuildingScoreContributionFactory(
        this.synergyScoreCalculator
      );

    this.playerScoreRegistry = new PlacedBuildingScoreRegistry();
    this.aiScoreRegistry = new PlacedBuildingScoreRegistry();

    this.cityScoreCalculator = new CityScoreCalculator();

    this.attractionResolutionController =
      new AttractionResolutionController(
        this.cityScoreCalculator,

        this.playerPlacedBuildingRegistry,
        this.playerScoreRegistry,
        this.playerPopulationModifierState,

        this.aiPlacedBuildingRegistry,
        this.aiScoreRegistry,
        this.aiPopulationModifierState,

        this.attractionMigrationResolver,

        this.populationDisplay,
        this.attractionDisplay,
        this.attractionMigrationDisplay,
        this.scoreDisplay
      );

    this.gameEndUIController = new GameEndUIController(
      this.aiRevealDisplay,
      this.attractionMigrationDisplay,
      this.populationDisplay,
      this.attractionDisplay,
      this.scoreDisplay,
      this.replaceHandDisplay
    );

    this.gameOverController = new GameOverController(
      this.cityScoreCalculator,

      this.playerPlacedBuildingRegistry,
      this.playerScoreRegistry,
      this.playerPopulationModifierState,

      this.aiPlacedBuildingRegistry,
      this.aiScoreRegistry,
      this.aiPopulationModifierState,

      new GameResultResolver(),
      new GameOverDisplay(() => {
        this.transitionCallbacks.onRestartRequested?.();
      }),
      this.turnController,
      this.gameEndUIController,
      this.transitionCallbacks.onGameResultShown
    );

    this.engineContext = createEngineContext();
    this.canvas = this.engineContext.canvas;
    //this.engineContext.engine.setHardwareScalingLevel(1.18);

    this.canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      console.warn("[WEBGL] Context lost");
    });

    this.canvas.addEventListener("webglcontextrestored", () => {
      console.warn("[WEBGL] Context restored");
    });

    registerResize(this.engineContext.engine);
  }

  public async run(): Promise<void> {
    if (this.scene) {
      return;
    }

    this.scene = await this.createScene();

    await this.scene.whenReadyAsync();

    this.logHeavyMeshes();

    let lastPerfLogTime = 0;

    this.engineContext.engine.runRenderLoop(() => {
      this.scene?.render();

      const now = performance.now();

      if (this.scene && now - lastPerfLogTime > 1000) {
        lastPerfLogTime = now;

        console.log("[PERF]", {
          fps: Math.round(this.engineContext.engine.getFps()),
          totalMeshes: this.scene.meshes.length,
          activeMeshes: this.scene.getActiveMeshes().length,
          totalVertices: this.scene.getTotalVertices(),
        });
      }
    });
  }

  private async createScene(): Promise<Scene> {
    const scene = new Scene(this.engineContext.engine);
    scene.clearColor = new Color4(0.93, 0.96, 1.0, 1.0);

    this.playerGrid = new GridModel(16, 22, 1, -11, -7);
    applyPlayerShoreLayout(this.playerGrid);
    applyInitialCityLayout(this.playerGrid, "player");

    this.aiGrid = new GridModel(16, 22, 1, 1000, -7);
    applyAIShoreLayout(this.aiGrid);
    applyInitialCityLayout(this.aiGrid, "ai");

    this.cameraController = new CameraController(
      scene,
      this.canvas,
      this.playerGrid
    );

    this.cameraController.setKeyboardLayout(this.pendingKeyboardLayout);
    this.cameraController.createMainCamera();

    this.createLight(scene);

    this.playerRenderRegistry = new PlacedBuildingRenderRegistry();
    this.aiRenderRegistry = new PlacedBuildingRenderRegistry();

    const playerEnvironmentRenderer = new BoardEnvironmentRenderer(
      scene,
      this.playerGrid,
      "player",
      "player-environment",
      () => this.activeEnvironmentSide
    );

    await playerEnvironmentRenderer.render();

    const aiEnvironmentRenderer = new BoardEnvironmentRenderer(
      scene,
      this.aiGrid,
      "ai",
      "ai-environment",
      () => this.activeEnvironmentSide
    );

    await aiEnvironmentRenderer.render();

    const playerGridRenderer = new GridRenderer(scene, this.playerGrid, "player-grid");
    playerGridRenderer.render();

    const aiGridRenderer = new GridRenderer(scene, this.aiGrid, "ai-grid");
    aiGridRenderer.render();

    console.log("[PLAYER GRID DEBUG]", {
      originX: this.playerGrid.originX,
      originZ: this.playerGrid.originZ,
      rows: this.playerGrid.rows,
      cols: this.playerGrid.cols,
      cellSize: this.playerGrid.cellSize,
      center: this.playerGrid.getCenterWorldPosition(),
    });

    console.log("[AI GRID DEBUG]", {
      originX: this.aiGrid.originX,
      originZ: this.aiGrid.originZ,
      rows: this.aiGrid.rows,
      cols: this.aiGrid.cols,
      cellSize: this.aiGrid.cellSize,
      center: this.aiGrid.getCenterWorldPosition(),
      expectedCenterX:
        this.aiGrid.originX + (this.aiGrid.cols * this.aiGrid.cellSize) / 2,
      expectedCenterZ:
        this.aiGrid.originZ + (this.aiGrid.rows * this.aiGrid.cellSize) / 2,
    });

    const playerStartingBaseRenderer = new StartingBaseRenderer(
      scene,
      this.playerGrid
    );

    await playerStartingBaseRenderer.renderForSide("player");

    const aiStartingBaseRenderer = new StartingBaseRenderer(
      scene,
      this.aiGrid
    );

    await aiStartingBaseRenderer.renderForSide("ai");

    const buildingRenderCatalog = createDefaultBuildingRenderCatalog();
    const buildingModelRepository = new BuildingModelRepository(scene);

    this.playerRoadNetworkRenderer = new RoadNetworkRenderer(
      this.playerGrid,
      buildingModelRepository,
      "player-road",
      this.playerRenderRegistry
    );

    this.aiRoadNetworkRenderer = new RoadNetworkRenderer(
      this.aiGrid,
      buildingModelRepository,
      "ai-road",
      this.aiRenderRegistry
    );

    this.placedBuildingRenderer = new PlacedBuildingRenderer(
      scene,
      this.playerGrid,
      "player-placed",
      buildingRenderCatalog,
      buildingModelRepository
    );

    this.aiPlacedBuildingRenderer = new PlacedBuildingRenderer(
      scene,
      this.aiGrid,
      "ai-placed",
      buildingRenderCatalog,
      buildingModelRepository
    );

    this.playerGhostPreviewRenderer = new BuildingGhostPreviewRenderer(
      scene,
      this.playerGrid,
      buildingRenderCatalog,
      buildingModelRepository
    );

    this.playerSynergyFeedbackController =
      new PreviewSynergyFeedbackController(
        this.playerPlacedBuildingRegistry,
        this.playerRenderRegistry,
        this.synergyScoreCalculator,
        new SynergyHighlightRenderer(scene),
        new SynergyFloatingLabelRenderer(scene, this.playerGrid)
      );

    this.previewController = new PlacementPreviewController(
      scene,
      this.playerGrid,
      () => this.playerTurnController.getSelectedBuilding(),
      this.playerGhostPreviewRenderer,
      this.playerSynergyFeedbackController,
      () => this.turnController.getTurnState().getCurrentTurn()
    );
    this.previewController.initialize();

    this.playerTurnController =
      new PlayerTurnController(
        this.turnController,
        this.playerHandState,
        this.handDisplay,
        this.packSelectionDisplay,
        this.previewController,
        this.packSelectionResolver,
        this.transitionCallbacks
          .onCardSelected,
        this.transitionCallbacks
          .onCardDeselected
      );
    this.playerTurnController.initialize();

    this.playerReplaceHandController =
      new PlayerReplaceHandController(
        this.playerHandState,
        this.handReplacementService,
        this.handDisplay,
        this.replaceHandDisplay,
        this.turnController,
        GAME_BALANCE_CONFIG
          .replaceHand
          .playerMaxUsesPerGame,
        () => {
          this.playerTurnController
            .clearSelectedBuilding();
        },
        () => this.isPlayerDiscardFlowActive,
        this.transitionCallbacks
          .onPlayerHandReplaced
      );

    this.playerHandOverflowController =
      new PlayerHandOverflowController(
        this.playerHandState,
        this.handLimitResolver,
        this.handDisplay,
        this.playerDiscardDisplay,
        this.turnController,
        () => {
          this.isPlayerDiscardFlowActive =
            true;

          this.playerTurnController
            .clearSelectedBuilding();

          this.playerReplaceHandController
            .refreshDisplayState();
        },
        () => {
          this.isPlayerDiscardFlowActive =
            false;

          this.playerReplaceHandController
            .refreshDisplayState();
        },
        this.transitionCallbacks
          .onTurnActionButtonClicked
      );

    this.turnController.setBeforePlayerAdvanceRequested(() => {
      const canAdvance =
        this.playerHandOverflowController.requestPlayerEndTurn();

      this.playerReplaceHandController.refreshDisplayState();

      if (canAdvance) {
        this.hideTransitionSensitiveUIButKeepTurnHud();
      }

      return canAdvance;
    });

    this.buildingRotationController = new BuildingRotationController(
      this.playerTurnController,
      this.previewController
    );
    this.buildingRotationController.initialize();

    this.playerPlacementResolution = new PlayerPlacementResolution(
      this.placedBuildingRenderer,
      this.playerRoadNetworkRenderer,
      this.playerRenderRegistry,
      this.playerTurnController,
      this.playerPlacedBuildingRegistry,
      this.turnController,
      this.scoreContributionFactory,
      this.playerScoreRegistry,
      this.playerPopulationModifierState,
      this.transitionCallbacks.onPlayerBuildingPlaced
    );

    this.placementController = new PlacementController(
      this.playerGrid,
      this.previewController,
      () => this.playerTurnController.getSelectedBuilding(),
      (cells) => {
        this.playerPlacementResolution.resolvePlacement(cells);

        const playerScore = this.cityScoreCalculator.calculate(
          this.playerPlacedBuildingRegistry,
          this.playerScoreRegistry,
          this.playerPopulationModifierState.getPopulationModifier()
        );

        this.populationDisplay.updatePlayerPopulation(
          playerScore.finalPopulation,
          playerScore.populationCapacity
        );

        this.attractionDisplay.updatePlayerAttraction(
          playerScore.finalAttraction
        );

        this.scoreDisplay.updatePlayerScore(
          playerScore.finalPopulation,
          playerScore.finalAttraction
        );

        console.log("Player city score:", playerScore);
      }
    );

    this.placementController.initialize();

    this.turnPhaseCoordinator = new TurnPhaseCoordinator(
      this.packSelectionDisplay,
      this.handDisplay,
      this.playerHandState,
      this.previewController,
      this.packOfferController,
      (pack) => {
        if (pack === null) {
          this.playerTurnController.clearSelectedPack();
        }
      },
      (building) => {
        if (building === null) {
          this.playerTurnController.clearSelectedBuilding();
        }
      }
    );

    const aiPlacementDecisionMaker = createAIPlacementDecisionMaker(
      this.aiGrid,
      this.aiPlacedBuildingRegistry,
      this.scoreContributionFactory,
      this.aiScoreRegistry
    );

    this.aiReplaceHandController =
      new AIReplaceHandController(
        this.aiHandState,
        this.handReplacementService,
        new AIReplaceHandStrategy(
          aiPlacementDecisionMaker,
          () => {
            const playerScore = this.cityScoreCalculator.calculate(
              this.playerPlacedBuildingRegistry,
              this.playerScoreRegistry,
              this.playerPopulationModifierState.getPopulationModifier()
            );

            const aiScore = this.cityScoreCalculator.calculate(
              this.aiPlacedBuildingRegistry,
              this.aiScoreRegistry,
              this.aiPopulationModifierState.getPopulationModifier()
            );

            return {
              aiScore,
              playerScore,
            };
          },
          GAME_BALANCE_CONFIG.replaceHand.aiMinimumTurn,
          GAME_BALANCE_CONFIG.replaceHand.aiMinimumCardsInHand,
          GAME_BALANCE_CONFIG.replaceHand.aiAverageQualityThreshold,
          GAME_BALANCE_CONFIG.replaceHand.aiBestCardProtectionThreshold
        ),
        GAME_BALANCE_CONFIG.replaceHand.aiMaxUsesPerGame
      );

    this.aiHandLimitController = new AIHandLimitController(
      this.aiHandState,
      this.handLimitResolver,
      new AIHandDiscardStrategy(
        aiPlacementDecisionMaker,
        () => {
          const playerScore = this.cityScoreCalculator.calculate(
            this.playerPlacedBuildingRegistry,
            this.playerScoreRegistry,
            this.playerPopulationModifierState.getPopulationModifier()
          );

          const aiScore = this.cityScoreCalculator.calculate(
            this.aiPlacedBuildingRegistry,
            this.aiScoreRegistry,
            this.aiPopulationModifierState.getPopulationModifier()
          );

          return {
            aiScore,
            playerScore,
          };
        }
      )
    );

    const aiPlacementResolution = new AIPlacementResolution(
      this.aiGrid,
      this.aiPlacedBuildingRenderer,
      this.aiRoadNetworkRenderer,
      this.aiRenderRegistry,
      this.aiHandState,
      this.aiRevealState,
      this.aiPlacedBuildingRegistry,
      this.turnController,
      this.scoreContributionFactory,
      this.aiScoreRegistry,
      this.aiPopulationModifierState
    );

    const aiPlacementTurnResolver = new AIPlacementTurnResolver(
      this.aiHandState,
      this.handLimitResolver,
      this.turnController,
      aiPlacementDecisionMaker,
      aiPlacementResolution,
      new AIPlacementTurnPolicy(
        GAME_BALANCE_CONFIG.aiPlacementPolicy.optionalPlacementScoreThreshold,
        GAME_BALANCE_CONFIG.aiPlacementPolicy.forcedPlacementScoreThreshold,
        GAME_BALANCE_CONFIG.aiPlacementPolicy.maxPlacementsPerTurn,
        GAME_BALANCE_CONFIG.aiPlacementPolicy.forcedSupportPlacementScoreThreshold,

        GAME_BALANCE_CONFIG.aiPlacementPolicy.lateGameStartTurn,
        GAME_BALANCE_CONFIG.aiPlacementPolicy.lateGameOptionalPlacementScoreThreshold,

        GAME_BALANCE_CONFIG.aiPlacementPolicy.finalTurnPlacementScoreThreshold,
        GAME_BALANCE_CONFIG.aiPlacementPolicy.finalTurnMaxPlacements
      ),
      () => {
        const playerScore = this.cityScoreCalculator.calculate(
          this.playerPlacedBuildingRegistry,
          this.playerScoreRegistry,
          this.playerPopulationModifierState.getPopulationModifier()
        );

        const aiScore = this.cityScoreCalculator.calculate(
          this.aiPlacedBuildingRegistry,
          this.aiScoreRegistry,
          this.aiPopulationModifierState.getPopulationModifier()
        );

        return {
          aiScore,
          playerScore,
        };
      }
    );

    const aiPackDecision = createAIPackDecision(
      this.aiPackMemoryState
    );

    this.aiTurnController = new AITurnController(
      this.turnController,
      this.packOfferState,
      this.aiHandState,
      aiPackDecision,
      this.aiPackMemoryState,
      aiPlacementTurnResolver,
      this.aiReplaceHandController,
      this.aiRevealState,
      this.packSelectionResolver,
      (offeredPacks) => {
        const playerScore = this.cityScoreCalculator.calculate(
          this.playerPlacedBuildingRegistry,
          this.playerScoreRegistry,
          this.playerPopulationModifierState.getPopulationModifier()
        );

        const aiScore = this.cityScoreCalculator.calculate(
          this.aiPlacedBuildingRegistry,
          this.aiScoreRegistry,
          this.aiPopulationModifierState.getPopulationModifier()
        );

        const turnState = this.turnController.getTurnState();

        return {
          offeredPacks,
          aiHandCards: this.aiHandState.getCards(),
          aiScore,
          playerScore,
          currentTurn: turnState.getCurrentTurn(),
          maxTurns: turnState.getMaxTurns(),
        };
      }
    );

    this.turnController.initialize();

    return scene;
  }

  private createLight(scene: Scene): void {
    scene.imageProcessingConfiguration.isEnabled = true;
    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.toneMappingType =
      ImageProcessingConfiguration.TONEMAPPING_ACES;

    scene.imageProcessingConfiguration.exposure = 1.15;
    scene.imageProcessingConfiguration.contrast = 1.18;

    const ambientLight = new HemisphericLight(
      "ambient-light",
      new Vector3(0, 1, 0),
      scene
    );

    ambientLight.intensity = 0.42;
    ambientLight.diffuse = new Color3(0.9, 0.96, 1.0);
    ambientLight.groundColor = new Color3(0.28, 0.38, 0.22);

    const sunDirection = new Vector3(1, -0.8, 0);
    sunDirection.normalize();

    const sunLight = new DirectionalLight(
      "sun-light",
      sunDirection,
      scene
    );

    sunLight.intensity = 1.45;
    sunLight.diffuse = new Color3(1.0, 0.92, 0.76);
    sunLight.position = new Vector3(-50, 60, 3);
  }

  public setKeyboardLayout(layout: KeyboardLayout): void {
    this.pendingKeyboardLayout = layout;
    this.cameraController?.setKeyboardLayout(layout);
  }

  private getGridTransitionTarget(
    turn: number,
    actor: "player" | "ai",
    phase: string
  ): "to-ai" | "to-player" | null {
    const actorPhaseKey = `${turn}:${actor}:${phase}`;

    if (turn === 1 && actor === "player" && phase === "pack-selection") {
      this.lastObservedActorPhaseKey = actorPhaseKey;
      return null;
    }

    if (this.lastObservedActorPhaseKey === actorPhaseKey) {
      return null;
    }

    this.lastObservedActorPhaseKey = actorPhaseKey;

    if (actor === "ai" && phase === "ai-reveal") {
      return "to-ai";
    }

    if (actor === "player" && phase === "pack-selection") {
      return "to-player";
    }

    return null;
  }

  private async playGridTransition(
    target: "to-ai" | "to-player"
  ): Promise<void> {
    if (!this.cameraController) {
      return;
    }

    if (this.isTurnTransitionPlaying) {
      return;
    }

    if (this.playerDiscardDisplay?.isVisible()) {
      return;
    }

    if (this.turnController.getTurnState().isGameOver()) {
      return;
    }

    this.isTurnTransitionPlaying = true;
    this.setGameplayInputEnabled(false);

    try {
      if (target === "to-ai") {
        if (this.transitionCallbacks.playEndTurnTransition) {
          await this.transitionCallbacks.playEndTurnTransition(async () => {
            this.activeEnvironmentSide = "ai";
            this.cameraController?.focusOnGrid(this.aiGrid);
          });
        } else {
          this.activeEnvironmentSide = "ai";
          this.cameraController.focusOnGrid(this.aiGrid);
        }

        return;
      }

      if (this.transitionCallbacks.playNextTurnTransition) {
        await this.transitionCallbacks.playNextTurnTransition(async () => {
          this.activeEnvironmentSide = "player";
          this.cameraController?.focusOnGrid(this.playerGrid);
        });
      } else {
        this.activeEnvironmentSide = "player";
        this.cameraController.focusOnGrid(this.playerGrid);
      }
    } finally {
      this.isTurnTransitionPlaying = false;
      this.setGameplayInputEnabled(true);
    }
  }

  private setGameplayInputEnabled(enabled: boolean): void {
    if (!enabled) {
      this.playerTurnController?.clearSelectedBuilding();
      this.handDisplay?.clearSelection();
    }
  }

  private hideTransitionSensitiveUI(): void {
    this.packSelectionDisplay?.hide();
    this.handDisplay?.hide?.();

    this.hideAISummaryUI();

    this.setTurnActionButtonSuppressed(true);
    this.setTurnHudVisible(false);
  }

  public dispose(): void {
    this.engineContext.engine.stopRenderLoop();

    this.scene?.dispose();
    this.scene = null;

    this.disposeGameUI();

    this.engineContext.engine.dispose();

    this.canvas.remove();
  }

  private disposeGameUI(): void {
    const gameUIElementIds = [
      "ai-reveal-display",
      "attraction-display",
      "attraction-migration-display",
      "end-turn-button",
      "game-over-display",
      "hand-display-wrapper",
      "hand-limit-label",
      "pack-selection-display",
      "player-discard-display",
      "population-display",
      "replace-hand-button",
      "score-display",
      "turn-display",
    ];

    for (const id of gameUIElementIds) {
      document.getElementById(id)?.remove();
    }
  }

  private showTransitionSensitiveChrome(): void {
    this.setTurnActionButtonSuppressed(false);
    this.setTurnActionButtonVisible(true);
    this.setTurnHudVisible(true);
  }

  private setTurnActionButtonSuppressed(suppressed: boolean): void {
    this.isTurnActionButtonSuppressed = suppressed;

    const endTurnButton = document.getElementById("end-turn-button");

    if (!endTurnButton) {
      return;
    }

    if (suppressed) {
      endTurnButton.style.setProperty("display", "none", "important");
      return;
    }

    endTurnButton.style.removeProperty("display");
  }

  private setTurnActionButtonVisible(visible: boolean): void {
    const endTurnButton = document.getElementById("end-turn-button");

    if (!endTurnButton) {
      return;
    }

    if (this.isTurnActionButtonSuppressed) {
      endTurnButton.style.setProperty("display", "none", "important");
      return;
    }

    endTurnButton.style.display = visible ? "block" : "none";
  }

  private setTurnHudVisible(visible: boolean): void {
    const turnDisplay = document.getElementById("turn-display");

    if (!turnDisplay) {
      return;
    }

    turnDisplay.style.display = visible ? "flex" : "none";
  }

  private async handleTurnStateChanged(
    turnState: ReturnType<TurnController["getTurnState"]>
  ): Promise<void> {
    const currentTurn = turnState.getCurrentTurn();
    const currentActor = turnState.getCurrentActor();
    const currentPhase = turnState.getCurrentPhase();

    console.log(
      "Observed turn state change:",
      currentTurn,
      currentActor,
      currentPhase
    );

    if (turnState.isGameOver()) {
      return;
    }

    const isPlayerPackSelection =
      currentActor === "player" && currentPhase === "pack-selection";

    const isAIReveal =
      currentActor === "ai" && currentPhase === "ai-reveal";

    if (isPlayerPackSelection) {
      this.hideAISummaryUI();
    }

    const transitionTarget = this.getGridTransitionTarget(
      currentTurn,
      currentActor,
      currentPhase
    );

    if (transitionTarget) {
      if (transitionTarget === "to-ai") {
        this.hideTransitionSensitiveUIButKeepTurnHud();
      } else {
        this.hideTransitionSensitiveUI();
      }

      await this.playGridTransition(transitionTarget);
    } else {
      this.activeEnvironmentSide =
        currentActor === "ai" ? "ai" : "player";
    }

    if (this.turnPhaseCoordinator) {
      this.turnPhaseCoordinator.apply(turnState);
    }

    if (this.aiHandLimitController) {
      this.aiHandLimitController.handleTurnStateChanged(turnState);
    }

    if (isAIReveal) {
      this.aiRevealDisplay.show(
        this.aiRevealState.getEntriesThisTurn()
      );

      this.attractionResolutionController.resolveForTurn(currentTurn);

      this.gameOverController.prepareAfterFinalAIReveal(
        currentTurn,
        turnState.getMaxTurns()
      );
    }

    if (isPlayerPackSelection) {
      this.hideAISummaryUI();

      this.populationDisplay.markAIPopulationAsUncertain();
      this.attractionDisplay.markAIAttractionAsUncertain();
      this.scoreDisplay.markAIScoreAsUncertain();
    }

    if (this.playerReplaceHandController) {
      this.playerReplaceHandController.refreshDisplayState();
    }

    if (!turnState.isGameOver() && this.aiTurnController) {
      this.aiTurnController.handleTurnStateChanged(turnState);
    }

    const shouldKeepTransitionChromeHidden =
      currentActor === "ai" && currentPhase !== "ai-reveal";

    if (shouldKeepTransitionChromeHidden) {
      this.hideTransitionSensitiveUIButKeepTurnHud();
      return;
    }

    this.showTransitionSensitiveChrome();

    this.setTurnActionButtonVisible(
      this.shouldShowTurnActionButton(currentActor, currentPhase)
    );
  }

  private hideAISummaryUI(): void {
      this.aiRevealDisplay?.hide();
      this.attractionMigrationDisplay?.hide();
    }

    private shouldShowTurnActionButton(
    currentActor: TurnActor,
    currentPhase: TurnPhase
  ): boolean {
    if (currentActor === "player" && currentPhase === "pack-selection") {
      return false;
    }

    if (currentActor === "ai" && currentPhase !== "ai-reveal") {
      return false;
    }

    return true;
  }

  private hideTransitionSensitiveUIButKeepTurnHud(): void {
    this.packSelectionDisplay?.hide();
    this.handDisplay?.hide?.();

    this.hideAISummaryUI();

    this.setTurnActionButtonSuppressed(true);
  }

  private logHeavyMeshes(): void {
    if (!this.scene) {
      return;
    }

    const meshInfos = this.scene.meshes
      .map((mesh) => ({
        name: mesh.name,
        vertices: mesh.getTotalVertices(),
        indices: mesh.getTotalIndices(),
        isEnabled: mesh.isEnabled(),
        isVisible: mesh.isVisible,
      }))
      .filter((info) => info.vertices > 0)
      .sort((a, b) => b.vertices - a.vertices)
      .slice(0, 30);

    console.table(meshInfos);

    const totalVerticesByPrefix = new Map<string, number>();

    for (const mesh of this.scene.meshes) {
      const prefix = mesh.name.split("-").slice(0, 3).join("-");
      const current = totalVerticesByPrefix.get(prefix) ?? 0;

      totalVerticesByPrefix.set(
        prefix,
        current + mesh.getTotalVertices()
      );
    }

    const grouped = [...totalVerticesByPrefix.entries()]
      .map(([prefix, vertices]) => ({ prefix, vertices }))
      .sort((a, b) => b.vertices - a.vertices)
      .slice(0, 30);

    console.table(grouped);
  }
}