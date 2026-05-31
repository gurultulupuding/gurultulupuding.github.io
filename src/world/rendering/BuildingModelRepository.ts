import { Scene } from "@babylonjs/core/scene";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

import "@babylonjs/loaders/glTF";

export class BuildingModelRepository {
  private readonly scene: Scene;
  private readonly containersByPath = new Map<string, Promise<AssetContainer>>();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public async instantiateModel(
    assetPath: string,
    instanceName: string
  ): Promise<TransformNode> {
    const container = await this.getOrLoadContainer(assetPath);

    const root = new TransformNode(instanceName, this.scene);

    const instantiated = container.instantiateModelsToScene(
      (sourceName) => `${instanceName}-${sourceName}`,
      false,
      {
        doNotInstantiate: true,
      }
    );

    for (const rootNode of instantiated.rootNodes) {
      rootNode.parent = root;
    }

    for (const mesh of instantiated.skeletons) {
      void mesh;
    }

    this.configurePickability(root);

    return root;
  }

  private getOrLoadContainer(assetPath: string): Promise<AssetContainer> {
    const existing = this.containersByPath.get(assetPath);

    if (existing) {
      return existing;
    }

    const loadPromise = this.loadContainer(assetPath);
    this.containersByPath.set(assetPath, loadPromise);

    return loadPromise;
  }

  private async loadContainer(assetPath: string): Promise<AssetContainer> {
    const splitIndex = assetPath.lastIndexOf("/") + 1;
    const rootUrl = assetPath.slice(0, splitIndex);
    const fileName = assetPath.slice(splitIndex);

    const container = await SceneLoader.LoadAssetContainerAsync(
      rootUrl,
      fileName,
      this.scene
    );

    return container;
  }

  private configurePickability(root: TransformNode): void {
    const children = root.getChildMeshes(false);

    for (const child of children as AbstractMesh[]) {
      child.isPickable = false;
    }
  }
}