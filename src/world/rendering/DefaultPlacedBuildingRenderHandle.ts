import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";

import type { PlacedBuildingRenderHandle } from "./PlacedBuildingRenderHandle";

export class DefaultPlacedBuildingRenderHandle
  implements PlacedBuildingRenderHandle
{
  public readonly instanceId: string;

  public readonly roots: TransformNode[] = [];
  public readonly meshes: AbstractMesh[] = [];

  constructor(instanceId: string) {
    this.instanceId = instanceId;
  }

  public addRoot(root: TransformNode): void {
    this.roots.push(root);

    for (const mesh of root.getChildMeshes(false)) {
      this.addMesh(mesh);
    }
  }

  public addMesh(mesh: AbstractMesh): void {
    this.meshes.push(mesh);
  }

  public clearReferences(): void {
    this.roots.length = 0;
    this.meshes.length = 0;
  }
}