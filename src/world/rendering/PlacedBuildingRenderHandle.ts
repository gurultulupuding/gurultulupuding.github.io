import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";

export interface PlacedBuildingRenderHandle {
  instanceId: string;

  roots: TransformNode[];
  meshes: AbstractMesh[];

  addRoot(root: TransformNode): void;
  addMesh(mesh: AbstractMesh): void;

  clearReferences(): void;
}