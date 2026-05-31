import type { BuildingDefinition } from "../../world/buildings/definitions/BuildingDefinition";
import type { PackDefinition } from "./PackDefinition";
import type { StructureFamily } from "./StructureFamily";
import { PackContentGenerator } from "./PackContentGenerator";

export class PackOfferGenerator {
  private readonly packContentGenerator: PackContentGenerator;
  private readonly buildingPool: BuildingDefinition[];
  private readonly cardsPerPack: number;

  constructor(
    packContentGenerator: PackContentGenerator,
    buildingPool: BuildingDefinition[],
    cardsPerPack: number = 4
  ) {
    this.packContentGenerator = packContentGenerator;
    this.buildingPool = buildingPool;
    this.cardsPerPack = cardsPerPack;
  }

  public generateRandomOffer(
    packPool: PackDefinition[],
    count: number = 3,
    guaranteedFamily?: StructureFamily
  ): PackDefinition[] {
    const selectedPacks = guaranteedFamily
      ? this.generateOfferWithGuaranteedFamily(
          packPool,
          count,
          guaranteedFamily
        )
      : this.selectRandomPacks(
          packPool,
          count
        );

    return selectedPacks.map((pack) => ({
      ...pack,
      offeredBuildings:
        this.packContentGenerator.generateBuildingsForPack(
          pack,
          this.buildingPool,
          this.cardsPerPack
        ),
    }));
  }

  private generateOfferWithGuaranteedFamily(
    packPool: PackDefinition[],
    count: number,
    guaranteedFamily: StructureFamily
  ): PackDefinition[] {
    const guaranteedCandidates = packPool.filter(
      (pack) => pack.family === guaranteedFamily
    );

    if (guaranteedCandidates.length === 0) {
      console.warn(
        `Could not guarantee pack family "${guaranteedFamily}" because no matching pack exists.`
      );

      return this.selectRandomPacks(
        packPool,
        count
      );
    }
    const guaranteedPack =
      guaranteedCandidates[
        Math.floor(
          Math.random() *
          guaranteedCandidates.length
        )
      ];

    const remainingPool = packPool.filter(
      (pack) => pack.id !== guaranteedPack.id
    );

    const remainingPacks =
      this.selectRandomPacks(
        remainingPool,
        Math.max(0, count - 1)
      );
    return this.shuffle([
      guaranteedPack,
      ...remainingPacks,
    ]);
  }

  private selectRandomPacks(
    packPool: PackDefinition[],
    count: number
  ): PackDefinition[] {
    return this.shuffle(packPool).slice(
      0,
      Math.min(
        count,
        packPool.length
      )
    );
  }

  private shuffle<T>(items: T[]): T[] {
    const shuffled = [...items];

    for (
      let index = shuffled.length - 1;
      index > 0;
      index--
    ) {
      const randomIndex =
        Math.floor(
          Math.random() *
          (index + 1)
        );

      [
        shuffled[index],
        shuffled[randomIndex],
      ] = [
        shuffled[randomIndex],
        shuffled[index],
      ];
    }

    return shuffled;
  }
}