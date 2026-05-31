import { BuildingSelection } from "../../../../world/buildings/placements/BuildingSelection";
import { getFootprintCellsAt } from "../../../../world/buildings/footprint/FootprintUtils";
import { validateFootprintPlacement } from "../../../../world/buildings/placements/PlacementValidation";
import type { FootprintRotation } from "../../../../world/buildings/footprint/FootprintRotation";
import type { BuildingDefinition } from "../../../../world/buildings/definitions/BuildingDefinition";
import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";

export class CivicBeforeCultureConsideration
  implements AIPlacementConsideration
{
  public readonly id = "civic-before-culture";

  private readonly cultureSetupBonus: number;
  private readonly industrySetupBonus: number;
  private readonly radius: number;
  private readonly maxCheckedCardsPerFamily: number;
  private readonly attractionComebackBonus: number;
  private readonly populationComebackBonus: number;
  private readonly maxScore: number;

  constructor(
    cultureSetupBonus: number = 8,
    radius: number = 2,
    maxCheckedCardsPerFamily: number = 3,
    industrySetupBonus: number = 5,
    attractionComebackBonus: number = 4,
    populationComebackBonus: number = 3,
    maxScore: number = 18
  ) {
    this.cultureSetupBonus = cultureSetupBonus;
    this.radius = radius;
    this.maxCheckedCardsPerFamily = maxCheckedCardsPerFamily;
    this.industrySetupBonus = industrySetupBonus;
    this.attractionComebackBonus = attractionComebackBonus;
    this.populationComebackBonus = populationComebackBonus;
    this.maxScore = maxScore;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (!this.isCivicSupportBuilding(building)) {
      return {
        score: 0,
        reason: `${this.id}: not civic/service = 0`,
      };
    }

    let score = 0;
    const reasons: string[] = [];

    const supportedCulture = this.findSupportedFutureBuilding(
      context,
      "culture"
    );

    if (supportedCulture !== null) {
      let cultureScore = this.cultureSetupBonus;

      const attractionGap =
        context.playerScore.finalAttraction -
        context.aiScore.finalAttraction;

      if (attractionGap >= 8) {
        cultureScore += this.attractionComebackBonus;
      }

      score += cultureScore;

      reasons.push(
        `future culture support for ${supportedCulture.name} = +${cultureScore}`
      );
    }

    /*
    const supportedIndustry = this.findSupportedFutureBuilding(
      context,
      "industry"
    );

    if (supportedIndustry !== null) {
      let industryScore = this.industrySetupBonus;

      const populationGap =
        context.playerScore.finalPopulation -
        context.aiScore.finalPopulation;

      if (populationGap >= 8) {
        industryScore += this.populationComebackBonus;
      }

      score += industryScore;

      reasons.push(
        `future industry support for ${supportedIndustry.name} = +${industryScore}`
      );
    }
    */

    const cappedScore = Math.min(this.maxScore, score);

    if (cappedScore <= 0) {
      return {
        score: 0,
        reason:
          `${this.id}: no future culture/industry spot found within radius ` +
          `${this.radius} = 0`,
      };
    }

    return {
      score: cappedScore,
      reason:
        `${this.id}: ${building.name} creates support setup ` +
        `[${reasons.join(", ")}], capped=+${cappedScore}`,
    };
  }

  private isCivicSupportBuilding(building: BuildingDefinition): boolean {
    return (
      building.family === "civic" ||
      building.tags.includes("service")
    );
  }

  private findSupportedFutureBuilding(
    context: AIPlacementEvaluationContext,
    family: "culture" | "industry"
  ): BuildingDefinition | null {
    const candidateCards = context.handCards
      .filter((card) => card.building.family === family)
      .slice(0, this.maxCheckedCardsPerFamily);

    for (const card of candidateCards) {
      if (this.canBuildingFitWithinCivicRadius(context, card.building)) {
        return card.building;
      }
    }

    return null;
  }

  private canBuildingFitWithinCivicRadius(
    context: AIPlacementEvaluationContext,
    futureBuilding: BuildingDefinition
  ): boolean {
    const candidateAnchors = this.getCandidateAnchorsAroundCells(
      context.plan.cells,
      this.radius
    );

    const selection = new BuildingSelection(futureBuilding);
    const rotations: FootprintRotation[] = [0, 90, 180, 270];

    for (const rotation of rotations) {
      this.rotateSelectionTo(selection, rotation);

      const footprint = selection.getCurrentFootprint();

      for (const anchor of candidateAnchors) {
        const cells = getFootprintCellsAt(
          footprint,
          anchor.row,
          anchor.col
        );

        if (this.overlapsWithPlannedCivic(cells, context.plan.cells)) {
          continue;
        }

        const validation = validateFootprintPlacement(
          context.grid,
          cells,
          futureBuilding
        );

        if (!validation.isValid) {
          continue;
        }

        const isWithinCivicRadius = this.areAnyCellsWithinManhattanRadius(
          cells,
          context.plan.cells,
          this.radius
        );

        if (isWithinCivicRadius) {
          return true;
        }
      }
    }

    return false;
  }

  private getCandidateAnchorsAroundCells(
    cells: { row: number; col: number }[],
    radius: number
  ): { row: number; col: number }[] {
    const anchors = new Map<string, { row: number; col: number }>();

    for (const cell of cells) {
      for (let rowOffset = -radius; rowOffset <= radius; rowOffset++) {
        for (let colOffset = -radius; colOffset <= radius; colOffset++) {
          const distance = Math.abs(rowOffset) + Math.abs(colOffset);

          if (distance > radius) {
            continue;
          }

          const candidate = {
            row: cell.row + rowOffset,
            col: cell.col + colOffset,
          };

          anchors.set(`${candidate.row}:${candidate.col}`, candidate);
        }
      }
    }

    return [...anchors.values()];
  }

  private overlapsWithPlannedCivic(
    candidateCells: { row: number; col: number }[],
    civicCells: { row: number; col: number }[]
  ): boolean {
    const civicCellKeys = new Set(
      civicCells.map((cell) => `${cell.row}:${cell.col}`)
    );

    return candidateCells.some((cell) =>
      civicCellKeys.has(`${cell.row}:${cell.col}`)
    );
  }

  private areAnyCellsWithinManhattanRadius(
    firstCells: { row: number; col: number }[],
    secondCells: { row: number; col: number }[],
    radius: number
  ): boolean {
    for (const firstCell of firstCells) {
      for (const secondCell of secondCells) {
        const distance =
          Math.abs(firstCell.row - secondCell.row) +
          Math.abs(firstCell.col - secondCell.col);

        if (distance <= radius) {
          return true;
        }
      }
    }

    return false;
  }

  private rotateSelectionTo(
    selection: BuildingSelection,
    targetRotation: FootprintRotation
  ): void {
    while (selection.getRotation() !== targetRotation) {
      selection.rotateClockwise();
    }
  }
}