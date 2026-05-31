import type { BuildingDefinition } from "../../world/buildings/definitions/BuildingDefinition";
import type { HandCardInstance } from "./HandCardInstance";

export class HandState {
  private cards: HandCardInstance[] = [];

  public setBuildings(buildings: BuildingDefinition[]): void {
    this.cards = buildings.map((building) => this.createCard(building));
  }

  public addBuildings(buildings: BuildingDefinition[]): void {
    const newCards = buildings.map((building) => this.createCard(building));
    this.cards = [...this.cards, ...newCards];
  }

  public getCards(): HandCardInstance[] {
    return [...this.cards];
  }

  public getBuildings(): BuildingDefinition[] {
    return this.cards.map((card) => card.building);
  }

  public isEmpty(): boolean {
    return this.cards.length === 0;
  }

  public clear(): void {
    this.cards = [];
  }

  public removeCardById(cardId: string): void {
    this.cards = this.cards.filter((card) => card.id !== cardId);
  }

  public removeOneBuildingById(buildingId: string): void {
    const index = this.cards.findIndex(
      (card) => card.building.id === buildingId
    );

    if (index === -1) {
      return;
    }

    this.cards.splice(index, 1);
  }

  public removeBuildingById(buildingId: string): void {
    this.removeOneBuildingById(buildingId);
  }

  private createCard(building: BuildingDefinition): HandCardInstance {
    return {
      id: crypto.randomUUID(),
      building,
    };
  }

  public removeCardsByIds(cardIds: string[]): void {
    const idsToRemove = new Set(cardIds);

    this.cards = this.cards.filter(
      (card) => !idsToRemove.has(card.id)
    );
  }

  public replaceBuildings(buildings: BuildingDefinition[]): void {
    this.setBuildings(buildings);
  }
}