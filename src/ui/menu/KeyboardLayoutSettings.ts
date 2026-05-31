export type KeyboardLayout = "qwerty" | "azerty";

const STORAGE_KEY = "opposite-shores-keyboard-layout";

export class KeyboardLayoutSettings {
  public static getLayout(): KeyboardLayout {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === "azerty" || stored === "qwerty") {
      return stored;
    }

    return "qwerty";
  }

  public static setLayout(layout: KeyboardLayout): void {
    localStorage.setItem(STORAGE_KEY, layout);
  }
}