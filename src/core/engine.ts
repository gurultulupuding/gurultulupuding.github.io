import { Engine } from "@babylonjs/core/Engines/engine";

export interface EngineContext {
  canvas: HTMLCanvasElement;
  engine: Engine;
}

function createCanvas(): HTMLCanvasElement {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    throw new Error("Could not find #app root element.");
  }

  app.innerHTML = "";

  const canvas = document.createElement("canvas");
  canvas.id = "game-canvas";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.outline = "none";
  canvas.style.touchAction = "none";

  app.appendChild(canvas);

  return canvas;
}

export function createEngineContext(): EngineContext {
  const canvas = createCanvas();
  const engine = new Engine(canvas, true);

  return { canvas, engine };
}

export function registerResize(engine: Engine): void {
  window.addEventListener("resize", () => {
    engine.resize();
  });
}