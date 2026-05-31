import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export function createFlatColorMaterial(
  scene: Scene,
  name: string,
  color: Color3,
  alpha: number = 1
): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = color;
  material.alpha = alpha;
  material.specularColor = Color3.Black();

  return material;
}