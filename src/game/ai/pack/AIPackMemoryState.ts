import type { StructureFamily } from "../../packs/StructureFamily";

export class AIPackMemoryState {
  private readonly selectedPackCountsByFamily = new Map<StructureFamily, number>();

  public recordSelectedPack(family: StructureFamily): void {
    const currentCount = this.getSelectedPackCount(family);
    this.selectedPackCountsByFamily.set(family, currentCount + 1);
  }

  public getSelectedPackCount(family: StructureFamily): number {
    return this.selectedPackCountsByFamily.get(family) ?? 0;
  }

  public clear(): void {
    this.selectedPackCountsByFamily.clear();
  }
}