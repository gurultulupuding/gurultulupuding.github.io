import type { PackDefinition } from "./PackDefinition";

export class PackOfferState {
  private offeredPacks: PackDefinition[] = [];

  public setOfferedPacks(packs: PackDefinition[]): void {
    this.offeredPacks = [...packs];
  }

  public getOfferedPacks(): PackDefinition[] {
    return [...this.offeredPacks];
  }

  public clear(): void {
    this.offeredPacks = [];
  }

  public isEmpty(): boolean {
    return this.offeredPacks.length === 0;
  }
}