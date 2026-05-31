import { Scene } from "@babylonjs/core/scene";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";

export function createGrassTerrainMaterial(
  scene: Scene,
  name: string,
  texturePath: string,
  textureScale: number
): PBRMaterial {
  console.log("[GRASS TEXTURE DEBUG]", texturePath);

  const material = new PBRMaterial(name, scene);

  const texture = new Texture(texturePath, scene);
  texture.uScale = textureScale;
  texture.vScale = textureScale;
  texture.wrapU = Texture.WRAP_ADDRESSMODE;
  texture.wrapV = Texture.WRAP_ADDRESSMODE;

  material.albedoTexture = texture;

  material.albedoColor = new Color3(0.92, 1.0, 0.82);

  material.metallic = 0.0;

  material.roughness = 0.78;

  material.environmentIntensity = 0.35;

  return material;
}