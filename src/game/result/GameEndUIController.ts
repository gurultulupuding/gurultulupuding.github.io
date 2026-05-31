import { AIRevealDisplay } from "../../ui/AIRevealDisplay";
import { AttractionMigrationDisplay } from "../../ui/AttractionMigrationDisplay";
import { PopulationDisplay } from "../../ui/PopulationDisplay";
import { AttractionDisplay } from "../../ui/AttractionDisplay";
import { ScoreDisplay } from "../../ui/ScoreDisplay";
import { ReplaceHandDisplay } from "../../ui/ReplaceHandDisplay";

export class GameEndUIController {
  private readonly aiRevealDisplay: AIRevealDisplay;
  private readonly attractionMigrationDisplay: AttractionMigrationDisplay;
  private readonly populationDisplay: PopulationDisplay;
  private readonly attractionDisplay: AttractionDisplay;
  private readonly scoreDisplay: ScoreDisplay;
  private readonly replaceHandDisplay: ReplaceHandDisplay;

  constructor(
    aiRevealDisplay: AIRevealDisplay,
    attractionMigrationDisplay: AttractionMigrationDisplay,
    populationDisplay: PopulationDisplay,
    attractionDisplay: AttractionDisplay,
    scoreDisplay: ScoreDisplay,
    replaceHandDisplay: ReplaceHandDisplay
  ) {
    this.aiRevealDisplay = aiRevealDisplay;
    this.attractionMigrationDisplay = attractionMigrationDisplay;
    this.populationDisplay = populationDisplay;
    this.attractionDisplay = attractionDisplay;
    this.scoreDisplay = scoreDisplay;
    this.replaceHandDisplay = replaceHandDisplay;
  }

  public hideGameplayOverlays(): void {
    this.aiRevealDisplay.hide();
    this.attractionMigrationDisplay.hide();
    this.populationDisplay.hide();
    this.attractionDisplay.hide();
    this.scoreDisplay.hide();
    this.replaceHandDisplay.hide();
  }
}