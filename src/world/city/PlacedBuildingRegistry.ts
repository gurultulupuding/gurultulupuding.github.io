import type {
  GridPosition,
  PlacedBuildingInstance,
} from "./PlacedBuildingInstance";

export class PlacedBuildingRegistry {
  private readonly instances: PlacedBuildingInstance[] = [];
  private readonly cellToInstanceId = new Map<string, string>();

  public add(instance: PlacedBuildingInstance): void {
    this.instances.push(instance);

    for (const cell of instance.cells) {
      this.cellToInstanceId.set(this.createCellKey(cell), instance.id);
    }
  }

  public getAll(): PlacedBuildingInstance[] {
    return [...this.instances];
  }

  public getById(id: string): PlacedBuildingInstance | null {
    return this.instances.find((instance) => instance.id === id) ?? null;
  }

  public getAtCell(cell: GridPosition): PlacedBuildingInstance | null {
    const instanceId = this.cellToInstanceId.get(this.createCellKey(cell));

    if (!instanceId) {
      return null;
    }

    return this.getById(instanceId);
  }

  public getNeighborsOf(
    instance: PlacedBuildingInstance
  ): PlacedBuildingInstance[] {
    const neighborIds = new Set<string>();

    for (const cell of instance.cells) {
      for (const neighbor of this.getOrthogonalNeighbors(cell)) {
        const neighborInstance = this.getAtCell(neighbor);

        if (!neighborInstance) {
          continue;
        }

        if (neighborInstance.id === instance.id) {
          continue;
        }

        neighborIds.add(neighborInstance.id);
      }
    }

    return [...neighborIds]
      .map((id) => this.getById(id))
      .filter(
        (instance): instance is PlacedBuildingInstance => instance !== null
      );
  }

  public getInstancesWithinManhattanRadius(
    sourceCells: GridPosition[],
    radius: number,
    excludedInstanceId?: string
  ): PlacedBuildingInstance[] {
    const foundInstanceIds = new Set<string>();

    for (const sourceCell of sourceCells) {
      for (let rowOffset = -radius; rowOffset <= radius; rowOffset++) {
        for (let colOffset = -radius; colOffset <= radius; colOffset++) {
          const distance = Math.abs(rowOffset) + Math.abs(colOffset);

          if (distance > radius) {
            continue;
          }

          const targetCell: GridPosition = {
            row: sourceCell.row + rowOffset,
            col: sourceCell.col + colOffset,
          };

          const instance = this.getAtCell(targetCell);

          if (!instance) {
            continue;
          }

          if (excludedInstanceId && instance.id === excludedInstanceId) {
            continue;
          }

          foundInstanceIds.add(instance.id);
        }
      }
    }

    return [...foundInstanceIds]
      .map((id) => this.getById(id))
      .filter(
        (instance): instance is PlacedBuildingInstance => instance !== null
      );
  }

  public hasInstanceWithinManhattanRadius(
    sourceCells: GridPosition[],
    radius: number,
    predicate: (instance: PlacedBuildingInstance) => boolean,
    excludedInstanceId?: string
  ): boolean {
    const nearbyInstances = this.getInstancesWithinManhattanRadius(
      sourceCells,
      radius,
      excludedInstanceId
    );

    return nearbyInstances.some(predicate);
  }

  private getOrthogonalNeighbors(cell: GridPosition): GridPosition[] {
    return [
      { row: cell.row - 1, col: cell.col },
      { row: cell.row + 1, col: cell.col },
      { row: cell.row, col: cell.col - 1 },
      { row: cell.row, col: cell.col + 1 },
    ];
  }

  private createCellKey(cell: GridPosition): string {
    return `${cell.row}:${cell.col}`;
  }
}