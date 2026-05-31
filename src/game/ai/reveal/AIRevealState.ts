import type { AIRevealEntry } from "./AIRevealEntry";

export class AIRevealState {
  private readonly entriesThisTurn: AIRevealEntry[] = [];

  public recordPlacement(entry: AIRevealEntry): void {
    this.entriesThisTurn.push(entry);
  }

  public getEntriesThisTurn(): AIRevealEntry[] {
    return [...this.entriesThisTurn];
  }

  public clear(): void {
    this.entriesThisTurn.length = 0;
  }

  public isEmpty(): boolean {
    return this.entriesThisTurn.length === 0;
  }
}