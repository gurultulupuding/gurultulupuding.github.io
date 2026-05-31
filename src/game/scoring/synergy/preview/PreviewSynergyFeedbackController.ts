import type { BuildingDefinition } from "../../../../world/buildings/definitions/BuildingDefinition";
import type { FootprintRotation } from "../../../../world/buildings/footprint/FootprintRotation";
import { PlacedBuildingRegistry } from "../../../../world/city/PlacedBuildingRegistry";
import type {
  GridPosition,
  PlacedBuildingInstance,
} from "../../../../world/city/PlacedBuildingInstance";
import { PlacedBuildingRenderRegistry } from "../../../../world/rendering/PlacedBuildingRenderRegistry";
import {
  SynergyHighlightRenderer,
  type SynergyHighlightKind,
} from "../../../../world/rendering/synergy/SynergyHighlightRenderer";
import { SynergyFloatingLabelRenderer } from "../../../../world/rendering/synergy/SynergyFloatingLabelRenderer";
import { SynergyScoreCalculator } from "../SynergyScoreCalculator";
import type { SynergyEffect } from "../SynergyEffect";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { PlacedBuildingRenderHandle } from "../../../../world/rendering/PlacedBuildingRenderHandle";
import { ResidentialCapacityCalculator } from "../../capacity/ResidentialCapacityCalculator";

type GroupedSynergyEffect = {
  targetInstance: PlacedBuildingInstance;
  effects: SynergyEffect[];
};

export class PreviewSynergyFeedbackController {
  private readonly placedBuildingRegistry: PlacedBuildingRegistry;
  private readonly renderRegistry: PlacedBuildingRenderRegistry;
  private readonly synergyScoreCalculator: SynergyScoreCalculator;
  private readonly highlightRenderer: SynergyHighlightRenderer;
  private readonly labelRenderer: SynergyFloatingLabelRenderer;
  private readonly residentialCapacityCalculator: ResidentialCapacityCalculator;

  constructor(
    placedBuildingRegistry: PlacedBuildingRegistry,
    renderRegistry: PlacedBuildingRenderRegistry,
    synergyScoreCalculator: SynergyScoreCalculator,
    highlightRenderer: SynergyHighlightRenderer,
    labelRenderer: SynergyFloatingLabelRenderer
  ) {
    this.placedBuildingRegistry = placedBuildingRegistry;
    this.renderRegistry = renderRegistry;
    this.synergyScoreCalculator = synergyScoreCalculator;
    this.highlightRenderer = highlightRenderer;
    this.labelRenderer = labelRenderer;
    this.residentialCapacityCalculator =
      new ResidentialCapacityCalculator(2, 2);
  }

  public updatePreview(
    building: BuildingDefinition,
    rotation: FootprintRotation,
    cells: GridPosition[],
    isValid: boolean,
    currentTurn: number
  ): void {
    this.clear();

    if (!isValid) {
      return;
    }

    const previewInstance: PlacedBuildingInstance = {
      id: "__preview__",
      owner: "player",
      building,
      anchor: cells[0],
      rotation,
      cells,
      placedTurn: currentTurn,
    };

    const temporaryRegistry = this.createTemporaryRegistry(previewInstance);

    const synergyScore = this.synergyScoreCalculator.calculateForInstance(
      previewInstance,
      temporaryRegistry
    );

    const roadEffects = this.getRoadTargetEffects(synergyScore.effects);
    const nonRoadEffects = this.getNonRoadTargetEffects(synergyScore.effects);

    const roadLabelLines = this.createLabelLines(roadEffects);

    if (roadLabelLines.length > 0) {
      this.labelRenderer.renderLabel(
        previewInstance,
        roadLabelLines
      );
    }

    this.renderResidentialCapacityPreview(previewInstance);

    const groupedEffects = this.groupEffectsByTarget(nonRoadEffects);

    for (const group of groupedEffects) {
    const handle = this.renderRegistry.getByInstanceId(
        group.targetInstance.id
    );

    if (handle) {
        const kind = this.classifyEffects(group.effects);
        this.highlightRenderer.highlight(handle, kind);
    }

    const labelLines = this.createLabelLines(group.effects);

    const labelPosition = this.getLabelPositionForHandle(
      group.targetInstance,
      handle
    );

    if (labelPosition) {
      this.labelRenderer.renderLabelAtPosition(
        labelPosition,
        labelLines
      );
    } else {
      this.labelRenderer.renderLabel(
        group.targetInstance,
        labelLines
      );
    }
    }
  }

  private getLabelPositionForHandle(
    instance: PlacedBuildingInstance,
    handle: PlacedBuildingRenderHandle | null
  ): Vector3 | null {
    void instance;

    if (!handle || handle.meshes.length === 0) {
      return null;
    }

    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;

    for (const mesh of handle.meshes) {
      if (mesh.isDisposed()) {
        continue;
      }

      const boundingInfo = mesh.getBoundingInfo();
      const minimum = boundingInfo.boundingBox.minimumWorld;
      const maximum = boundingInfo.boundingBox.maximumWorld;

      minX = Math.min(minX, minimum.x);
      maxX = Math.max(maxX, maximum.x);
      maxY = Math.max(maxY, maximum.y);
      minZ = Math.min(minZ, minimum.z);
      maxZ = Math.max(maxZ, maximum.z);
    }

    if (
      !Number.isFinite(minX) ||
      !Number.isFinite(maxX) ||
      !Number.isFinite(maxY) ||
      !Number.isFinite(minZ) ||
      !Number.isFinite(maxZ)
    ) {
      return null;
    }

    return new Vector3(
      (minX + maxX) / 2,
      maxY + 0.55,
      (minZ + maxZ) / 2
    );
  }

  private getRoadTargetEffects(effects: SynergyEffect[]): SynergyEffect[] {
    return effects.filter((effect) => this.isRoadTargetEffect(effect));
    }

    private getNonRoadTargetEffects(effects: SynergyEffect[]): SynergyEffect[] {
    return effects.filter((effect) => !this.isRoadTargetEffect(effect));
    }

    private isRoadTargetEffect(effect: SynergyEffect): boolean {
    if (effect.targetInstanceId === "__preview__") {
        return false;
    }

    const targetInstance =
        this.placedBuildingRegistry.getById(effect.targetInstanceId);

    if (!targetInstance) {
        return false;
    }

    return targetInstance.building.tags.includes("road");
    }

  public clear(): void {
    this.highlightRenderer.clear();
    this.labelRenderer.clear();
  }

  private createTemporaryRegistry(
    previewInstance: PlacedBuildingInstance
  ): PlacedBuildingRegistry {
    const temporaryRegistry = new PlacedBuildingRegistry();

    for (const instance of this.placedBuildingRegistry.getAll()) {
      temporaryRegistry.add(instance);
    }

    temporaryRegistry.add(previewInstance);

    return temporaryRegistry;
  }

  private groupEffectsByTarget(
    effects: SynergyEffect[]
  ): GroupedSynergyEffect[] {
    const effectsByTargetId = new Map<string, SynergyEffect[]>();

    for (const effect of effects) {
      if (effect.targetInstanceId === "__preview__") {
        continue;
      }

      const existing = effectsByTargetId.get(effect.targetInstanceId) ?? [];
      existing.push(effect);
      effectsByTargetId.set(effect.targetInstanceId, existing);
    }

    return [...effectsByTargetId.entries()]
      .map(([targetInstanceId, groupedEffects]) => {
        const targetInstance =
          this.placedBuildingRegistry.getById(targetInstanceId);

        if (!targetInstance) {
          return null;
        }

        return {
          targetInstance,
          effects: groupedEffects,
        };
      })
      .filter(
        (group): group is GroupedSynergyEffect => group !== null
      );
  }

  private classifyEffects(
    effects: SynergyEffect[]
  ): SynergyHighlightKind {
    let hasPositive = false;
    let hasNegative = false;

    for (const effect of effects) {
      if (effect.populationDelta > 0 || effect.attractionDelta > 0) {
        hasPositive = true;
      }

      if (effect.populationDelta < 0 || effect.attractionDelta < 0) {
        hasNegative = true;
      }
    }

    if (hasPositive && hasNegative) {
      return "mixed";
    }

    if (hasNegative) {
      return "negative";
    }

    return "positive";
  }

  private createLabelLines(
    effects: SynergyEffect[]
  ): { text: string; color: "positive" | "negative" }[] {
    const populationDelta = effects.reduce(
      (total, effect) => total + effect.populationDelta,
      0
    );

    const attractionDelta = effects.reduce(
      (total, effect) => total + effect.attractionDelta,
      0
    );

    const lines: { text: string; color: "positive" | "negative" }[] = [];

    if (populationDelta !== 0) {
      lines.push({
        text: `${this.formatDelta(populationDelta)} POP`,
        color: populationDelta > 0 ? "positive" : "negative",
      });
    }

    if (attractionDelta !== 0) {
      lines.push({
        text: `${this.formatDelta(attractionDelta)} ATT`,
        color: attractionDelta > 0 ? "positive" : "negative",
      });
    }

    return lines;
  }

  private formatDelta(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }

  private renderResidentialCapacityPreview(
    previewInstance: PlacedBuildingInstance
  ): void {
    if (previewInstance.building.family !== "residential") {
      return;
    }

    const breakdown =
      this.residentialCapacityCalculator.calculateForCandidate(
        previewInstance.building,
        previewInstance.cells,
        this.placedBuildingRegistry
      );

    this.labelRenderer.renderLabel(
      previewInstance,
      [
        {
          text: breakdown.hasRoadAccess ? "100% CAP" : "50% CAP",
          color: breakdown.hasRoadAccess ? "positive" : "negative",
        },
      ]
    );

    for (const pollutionSource of breakdown.pollutionSources) {
      const handle = this.renderRegistry.getByInstanceId(
        pollutionSource.id
      );

      const labelPosition = this.getLabelPositionForHandle(
        pollutionSource,
        handle
      );

      if (labelPosition) {
        this.labelRenderer.renderLabelAtPosition(
          labelPosition,
          [
            {
              text: "-2 CAP",
              color: "negative",
            },
          ]
        );
      } else {
        this.labelRenderer.renderLabel(
          pollutionSource,
          [
            {
              text: "-2 CAP",
              color: "negative",
            },
          ]
        );
      }

      if (handle) {
        this.highlightRenderer.highlight(handle, "negative");
      }
    }
  }
}