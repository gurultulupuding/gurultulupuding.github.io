import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Material } from "@babylonjs/core/Materials/material";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import type { PlacedBuildingRenderHandle } from "../PlacedBuildingRenderHandle";
import { createFlatColorMaterial } from "../MaterialFactory";

export type SynergyHighlightKind = "positive" | "negative" | "mixed";

export class SynergyHighlightRenderer {
  private readonly positiveMaterial: StandardMaterial;
  private readonly negativeMaterial: StandardMaterial;
  private readonly mixedMaterial: StandardMaterial;

  private readonly originalMaterialsByMesh =
    new Map<AbstractMesh, Material | null>();

  constructor(scene: Scene) {
    this.positiveMaterial = createFlatColorMaterial(
      scene,
      "synergy-highlight-positive-material",
      new Color3(0.1, 0.85, 0.25),
      1
    );

    this.negativeMaterial = createFlatColorMaterial(
      scene,
      "synergy-highlight-negative-material",
      new Color3(0.95, 0.05, 0.05),
      1
    );

    this.mixedMaterial = createFlatColorMaterial(
      scene,
      "synergy-highlight-mixed-material",
      new Color3(1.0, 0.78, 0.05),
      1
    );

    this.configureMaterial(this.positiveMaterial);
    this.configureMaterial(this.negativeMaterial);
    this.configureMaterial(this.mixedMaterial);
  }

  public highlight(
    handle: PlacedBuildingRenderHandle,
    kind: SynergyHighlightKind
  ): void {
    const material = this.getMaterial(kind);

    for (const mesh of handle.meshes) {
      if (mesh.isDisposed()) {
        continue;
      }

      if (!this.originalMaterialsByMesh.has(mesh)) {
        this.originalMaterialsByMesh.set(mesh, mesh.material);
      }

      mesh.material = material;
    }
  }

  public clear(): void {
    for (const [mesh, originalMaterial] of this.originalMaterialsByMesh) {
      if (mesh.isDisposed()) {
        continue;
      }

      mesh.material = originalMaterial;
    }

    this.originalMaterialsByMesh.clear();
  }

  private getMaterial(kind: SynergyHighlightKind): StandardMaterial {
    switch (kind) {
      case "positive":
        return this.positiveMaterial;

      case "negative":
        return this.negativeMaterial;

      case "mixed":
        return this.mixedMaterial;
    }
  }

  private configureMaterial(material: StandardMaterial): void {
    material.alpha = 1;
    material.specularColor = Color3.Black();
    material.emissiveColor = material.diffuseColor.scale(0.25);
    material.backFaceCulling = false;
  }
}