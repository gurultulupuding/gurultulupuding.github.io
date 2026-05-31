import { Scene } from "@babylonjs/core/scene";

import { GridModel } from "../grid/GridModel";
import {
  DEFAULT_BOARD_ENVIRONMENT_CONFIG,
  type BoardEnvironmentConfig,
} from "./BoardEnvironmentConfig";
import { TerrainPlateRenderer } from "./TerrainPlateRenderer";
import { AtmosphereRenderer } from "./AtmosphereRenderer";
import { PanoramicSkyRenderer } from "./PanoramicSkyRenderer";
import { RiverBridgeRenderer, type EnvironmentSide } from "./RiverBridgeRenderer";
import { EnvironmentScatterRenderer } from "./EnvironmentScatterRenderer";

export class BoardEnvironmentRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly config: BoardEnvironmentConfig;
  private readonly namePrefix: string;
  private readonly side: EnvironmentSide;
  private readonly getActiveSide: () => EnvironmentSide;

  constructor(
    scene: Scene,
    grid: GridModel,
    side: EnvironmentSide,
    namePrefix: string,
    getActiveSide: () => EnvironmentSide,
    config: BoardEnvironmentConfig = DEFAULT_BOARD_ENVIRONMENT_CONFIG
  ) {
    this.scene = scene;
    this.grid = grid;
    this.side = side;
    this.namePrefix = namePrefix;
    this.getActiveSide = getActiveSide;
    this.config = config;
  }

  public async render(): Promise<void> {
    const panoramicSkyRenderer = new PanoramicSkyRenderer(
      this.scene,
      this.grid,
      this.config,
      this.namePrefix
    );

    panoramicSkyRenderer.render();

    const terrainPlateRenderer = new TerrainPlateRenderer(
      this.scene,
      this.grid,
      this.config,
      `${this.namePrefix}-terrain`
    );

    terrainPlateRenderer.render();

    const riverBridgeRenderer = new RiverBridgeRenderer(
      this.scene,
      this.grid,
      this.side,
      this.config,
      this.getActiveSide,
      `${this.namePrefix}-river-bridge`
    );

    await riverBridgeRenderer.render();

    const environmentScatterRenderer = new EnvironmentScatterRenderer(
      this.scene,
      this.grid,
      this.side,
      this.config,
      `${this.namePrefix}-scatter`
    );

    await environmentScatterRenderer.render();

    const atmosphereRenderer = new AtmosphereRenderer(
      this.scene,
      this.grid,
      this.side,
      this.config,
      `${this.namePrefix}-atmosphere`
    );

    atmosphereRenderer.render();
  }
}