export class CityPopulationModifierState {
  private populationModifier = 0;

  public getPopulationModifier(): number {
    return this.populationModifier;
  }

  public addPopulationModifier(amount: number): void {
    this.populationModifier += amount;
  }

  public reset(): void {
    this.populationModifier = 0;
  }
}