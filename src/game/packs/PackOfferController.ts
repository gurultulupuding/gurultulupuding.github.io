import type { PackDefinition } from "./PackDefinition";
import type { StructureFamily } from "./StructureFamily";
import { TEST_PACKS } from "./TestPackLibrary";
import { PackOfferGenerator } from "./PackOfferGenerator";
import { PackOfferState } from "./PackOfferState";

export class PackOfferController {
  private readonly packOfferState: PackOfferState;
  private readonly packOfferGenerator: PackOfferGenerator;
  private readonly packPool: PackDefinition[];

  constructor(
    packOfferState: PackOfferState,
    packOfferGenerator: PackOfferGenerator,
    packPool: PackDefinition[] = TEST_PACKS
  ) {
    this.packOfferState = packOfferState;
    this.packOfferGenerator = packOfferGenerator;
    this.packPool = packPool;
  }

  public refreshOffer(
    currentTurn: number,
    count: number = 3
  ): void {
    const guaranteedFamily:
      StructureFamily | undefined =
        currentTurn === 1
          ? "infrastructure"
          : undefined;

    const offeredPacks =
      this.packOfferGenerator.generateRandomOffer(
        this.packPool,
        count,
        guaranteedFamily
      );

    this.packOfferState.setOfferedPacks(
      offeredPacks
    );

    console.log("New offered packs:", {
      currentTurn,
      guaranteedFamily:
        guaranteedFamily ?? null,
      offeredPacks,
    });
  }

  public getOfferedPacks(): PackDefinition[] {
    return this.packOfferState.getOfferedPacks();
  }

  public clear(): void {
    this.packOfferState.clear();
  }
}