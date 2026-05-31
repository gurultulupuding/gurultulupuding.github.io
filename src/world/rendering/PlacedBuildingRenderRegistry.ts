import type { PlacedBuildingRenderHandle } from "./PlacedBuildingRenderHandle";
import { DefaultPlacedBuildingRenderHandle } from "./DefaultPlacedBuildingRenderHandle";

export class PlacedBuildingRenderRegistry {
  private readonly handlesByInstanceId =
    new Map<string, PlacedBuildingRenderHandle>();

  public add(handle: PlacedBuildingRenderHandle): void {
    this.handlesByInstanceId.set(handle.instanceId, handle);
  }

  public getByInstanceId(
    instanceId: string
  ): PlacedBuildingRenderHandle | null {
    return this.handlesByInstanceId.get(instanceId) ?? null;
  }

  public getAll(): PlacedBuildingRenderHandle[] {
    return [...this.handlesByInstanceId.values()];
  }

  public clear(): void {
    this.handlesByInstanceId.clear();
  }

  public getOrCreate(instanceId: string): PlacedBuildingRenderHandle {
    const existing = this.handlesByInstanceId.get(instanceId);

    if (existing) {
      return existing;
    }

    const handle = new DefaultPlacedBuildingRenderHandle(instanceId);
    this.handlesByInstanceId.set(instanceId, handle);

    return handle;
  }
}