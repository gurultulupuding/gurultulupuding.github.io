import type { PlacedBuildingScoreContribution } from "./PlacedBuildingScoreContribution";

export class PlacedBuildingScoreRegistry {
  private readonly contributionsByInstanceId =
    new Map<string, PlacedBuildingScoreContribution>();

  public add(contribution: PlacedBuildingScoreContribution): void {
    this.contributionsByInstanceId.set(
      contribution.instanceId,
      contribution
    );
  }

  public getByInstanceId(
    instanceId: string
  ): PlacedBuildingScoreContribution | null {
    return this.contributionsByInstanceId.get(instanceId) ?? null;
  }

  public getAll(): PlacedBuildingScoreContribution[] {
    return [...this.contributionsByInstanceId.values()];
  }

  public clear(): void {
    this.contributionsByInstanceId.clear();
  }
}