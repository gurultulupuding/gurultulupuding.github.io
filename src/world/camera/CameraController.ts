import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GridModel } from "../grid/GridModel";

type KeyboardLayout = "qwerty" | "azerty";

export class CameraController {
  private readonly scene: Scene;
  private readonly canvas: HTMLCanvasElement;
  private activeGrid: GridModel;

  private camera: ArcRotateCamera | null = null;
  private keyboardLayout: KeyboardLayout = "qwerty";
  private readonly pressedKeys = new Set<string>();

  private readonly panSpeed = 0.12;
  private readonly rotateSpeed = 0.010;
  private readonly boundaryPadding = 1.5;

  constructor(scene: Scene, canvas: HTMLCanvasElement, grid: GridModel) {
    this.scene = scene;
    this.canvas = canvas;
    this.activeGrid = grid;
  }

  public setKeyboardLayout(layout: KeyboardLayout): void {
    this.keyboardLayout = layout;
  }

  public createMainCamera(): ArcRotateCamera {
    const target = this.getGridCenterWorldPosition(this.activeGrid);

    const camera = new ArcRotateCamera(
      "main-camera",
      -Math.PI / 2,
      Math.PI / 3,
      28,
      target,
      this.scene
    );

    camera.lowerRadiusLimit = 12;
    camera.upperRadiusLimit = 35;
    camera.wheelDeltaPercentage = 0.01;

    camera.lowerBetaLimit = 0.5;
    camera.upperBetaLimit = Math.PI / 2.1;

    camera.angularSensibilityX = 3740; // 3440
    camera.angularSensibilityY = 3840; // 3540
    camera.attachControl(this.canvas, true);
    camera._panningMouseButton = 1;
    camera.panningSensibility = 0;

    this.camera = camera;
    this.setupKeyboardControls();

    return camera;
  }

  public focusOnGrid(grid: GridModel): void {
    if (!this.camera) {
      return;
    }

    this.activeGrid = grid;

    const target = this.getGridCenterWorldPosition(grid);
    this.camera.target.copyFrom(target);
  }

  private setupKeyboardControls(): void {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    this.scene.onBeforeRenderObservable.add(() => {
      this.updateKeyboardCamera();
    });
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    this.pressedKeys.add(event.code);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code);
  };

  private updateKeyboardCamera(): void {
    if (!this.camera) {
      return;
    }

    const forward = this.getForwardVector();
    const right = new Vector3(forward.z, 0, -forward.x);

    let move = Vector3.Zero();

    const keyMap = this.getMovementKeyMap();

    if (this.pressedKeys.has(keyMap.forward)) {
      move = move.add(forward);
    }
    if (this.pressedKeys.has(keyMap.backward)) {
      move = move.subtract(forward);
    }
    if (this.pressedKeys.has(keyMap.left)) {
      move = move.subtract(right);
    }
    if (this.pressedKeys.has(keyMap.right)) {
      move = move.add(right);
    }

    if (move.lengthSquared() > 0) {
      move.normalize();
      const nextTarget = this.camera.target.add(move.scale(this.panSpeed));
      this.camera.target.copyFrom(this.clampTargetToGrid(nextTarget));
    }

    const rotateLeftKeys = this.getRotateLeftKeys();
    const rotateRightKeys = this.getRotateRightKeys();

    if (rotateLeftKeys.some((key) => this.pressedKeys.has(key))) {
      this.camera.alpha -= this.rotateSpeed;
    }

    if (rotateRightKeys.some((key) => this.pressedKeys.has(key))) {
      this.camera.alpha += this.rotateSpeed;
    }
  }

  private getMovementKeyMap(): Record<"forward" | "backward" | "left" | "right", string> {
    if (this.keyboardLayout === "azerty") {
      return {
        forward: "KeyZ",
        backward: "KeyS",
        left: "KeyQ",
        right: "KeyD",
      };
    }

    return {
      forward: "KeyW",
      backward: "KeyS",
      left: "KeyA",
      right: "KeyD",
    };
  }

  private getForwardVector(): Vector3 {
    if (!this.camera) {
      return new Vector3(0, 0, 1);
    }

    const forward = this.camera.target.subtract(this.camera.position);
    forward.y = 0;

    if (forward.lengthSquared() === 0) {
      return new Vector3(0, 0, 1);
    }

    forward.normalize();
    return forward;
  }

  private clampTargetToGrid(target: Vector3): Vector3 {
    const grid = this.activeGrid;

    const minX = grid.originX - this.boundaryPadding;
    const maxX = grid.originX + grid.cols * grid.cellSize + this.boundaryPadding;
    const minZ = grid.originZ - this.boundaryPadding;
    const maxZ = grid.originZ + grid.rows * grid.cellSize + this.boundaryPadding;

    const clampedX = Math.min(Math.max(target.x, minX), maxX);
    const clampedZ = Math.min(Math.max(target.z, minZ), maxZ);

    return new Vector3(clampedX, target.y, clampedZ);
  }

  private getRotateLeftKeys(): string[] {
    if (this.keyboardLayout === "azerty") {
        return ["ArrowLeft", "KeyA"];
    }

    return ["ArrowLeft", "KeyQ"];
  }

  private getRotateRightKeys(): string[] {
    return ["ArrowRight", "KeyE"];
  }

  private getGridCenterWorldPosition(grid: GridModel): Vector3 {
    const centerRow = grid.rows / 2;
    const centerCol = grid.cols / 2;

    const x = grid.originX + centerCol * grid.cellSize;
    const z = grid.originZ + centerRow * grid.cellSize;

    return new Vector3(x, 0, z);
  }
}