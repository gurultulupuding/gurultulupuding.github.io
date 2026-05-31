import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { StructureFamily } from "../../game/packs/StructureFamily";

export function getFamilyBaseColor(family: StructureFamily): Color3 {
  switch (family) {
    case "residential":
      return new Color3(0.42, 0.62, 0.42);

    case "industry":
      return new Color3(0.55, 0.43, 0.30);

    case "infrastructure":
      return new Color3(0.36, 0.46, 0.56);

    case "civic":
      return new Color3(0.38, 0.55, 0.72);

    case "culture":
      return new Color3(0.55, 0.42, 0.68);

    default:
      return new Color3(0.28, 0.45, 0.28);
  }
}