import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GridModel } from "../../grid/GridModel";
import type { PlacedBuildingInstance } from "../../city/PlacedBuildingInstance";

export type SynergyLabelLine = {
  text: string;
  color: "positive" | "negative";
};

export class SynergyFloatingLabelRenderer {
  private readonly scene: Scene;
  private readonly grid: GridModel;
  private readonly labels: Mesh[] = [];

  constructor(scene: Scene, grid: GridModel) {
    this.scene = scene;
    this.grid = grid;
  }

  public renderLabel(
    instance: PlacedBuildingInstance,
    lines: SynergyLabelLine[]
  ): void {
    const position = this.getInstanceCenter(instance);

    this.renderLabelAtPosition(
      new Vector3(position.x, 1.6, position.z),
      lines
    );
  }

  public renderLabelAtPosition(
    position: Vector3,
    lines: SynergyLabelLine[]
  ): void {
    if (lines.length === 0) {
      return;
    }

    const texture = new DynamicTexture(
      `synergy-label-texture-${Math.random()}`,
      {
        width: 512,
        height: 256,
      },
      this.scene,
      true
    );

    texture.hasAlpha = true;

    const context =
      texture.getContext() as unknown as CanvasRenderingContext2D;

    context.clearRect(0, 0, 512, 256);

    context.font = '900 72px "OppositeUI", Arial, sans-serif';
    context.textAlign = "center";
    context.textBaseline = "middle";

    const startY = lines.length === 1 ? 128 : 92;
    const lineHeight = 78;

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];

      context.fillStyle =
        line.color === "positive"
          ? "rgb(40, 255, 80)"
          : "rgb(255, 55, 55)";

      context.strokeStyle = "rgba(0, 0, 0, 0.95)";
      context.lineWidth = 12;

      const y = startY + index * lineHeight;

      context.strokeText(line.text, 256, y);
      context.fillText(line.text, 256, y);
    }

    texture.update();

    const material = new StandardMaterial(
      `synergy-label-material-${Math.random()}`,
      this.scene
    );

    material.diffuseTexture = texture;
    material.opacityTexture = texture;
    material.emissiveColor = Color3.White();
    material.disableLighting = true;
    material.backFaceCulling = false;

    const plane = MeshBuilder.CreatePlane(
      `synergy-label-${Math.random()}`,
      {
        width: 2.5,
        height: 1,
      },
      this.scene
    );

    plane.position = position;
    plane.material = material;
    plane.isPickable = false;
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    this.labels.push(plane);
  }

  public clear(): void {
    for (const label of this.labels) {
      const material = label.material as StandardMaterial | null;
      const texture = material?.diffuseTexture;

      texture?.dispose();
      material?.dispose();

      label.dispose();
    }

    this.labels.length = 0;
  }

  private getInstanceCenter(instance: PlacedBuildingInstance): Vector3 {
    if (instance.cells.length === 0) {
      return Vector3.Zero();
    }

    let sumX = 0;
    let sumZ = 0;

    for (const cell of instance.cells) {
      const world = this.grid.cellToWorld(cell.row, cell.col);

      sumX += world.x;
      sumZ += world.z;
    }

    return new Vector3(
      sumX / instance.cells.length,
      0,
      sumZ / instance.cells.length
    );
  }
}