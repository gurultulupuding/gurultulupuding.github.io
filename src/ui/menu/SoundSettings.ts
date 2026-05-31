const STORAGE_KEY = "opposite-shores-sound-enabled";

export class SoundSettings {
  public static getSoundEnabled(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === "false") {
      return false;
    }

    return true;
  }

  public static setSoundEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  }
}