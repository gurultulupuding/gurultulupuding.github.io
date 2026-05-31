const STORAGE_KEY = "opposite-shores-show-intro";

export class IntroSettings {
  public static getShowIntro(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === "false") {
      return false;
    }

    return true;
  }

  public static setShowIntro(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  }
}