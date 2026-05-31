import { IntroSettings } from "./IntroSettings";
import { SoundSettings } from "./SoundSettings";
import {
  KeyboardLayoutSettings,
  type KeyboardLayout,
} from "./KeyboardLayoutSettings";

export class SettingsDisplay {
  private readonly overlay: HTMLDivElement;
  private readonly panel: HTMLDivElement;

  private onKeyboardLayoutChanged?: (layout: KeyboardLayout) => void;
  private onSoundEnabledChanged?: (enabled: boolean) => void;
  private onClose?: () => void;
  private onChoice?: () => void;

  constructor() {
    this.overlay = document.createElement("div");
    this.overlay.id = "settings-overlay";
    this.overlay.className = "os-modal-overlay";

    this.panel = document.createElement("div");
    this.panel.className = "os-modal-panel os-modal-panel-narrow";

    this.overlay.appendChild(this.panel);
    document.body.appendChild(this.overlay);

    this.render();
  }

  public setOnKeyboardLayoutChanged(
    callback: (layout: KeyboardLayout) => void
  ): void {
    this.onKeyboardLayoutChanged = callback;
  }

  public setOnSoundEnabledChanged(
    callback: (enabled: boolean) => void
  ): void {
    this.onSoundEnabledChanged = callback;
  }

  public setOnClose(callback: () => void): void {
    this.onClose = callback;
  }

  public setOnChoice(callback: () => void): void {
    this.onChoice = callback;
  }

  public show(): void {
    this.render();
    this.overlay.style.display = "flex";
  }

  public hide(): void {
    this.overlay.style.display = "none";
  }

  private render(): void {
    this.panel.innerHTML = "";

    const title = document.createElement("div");
    title.textContent = "Settings";
    title.className = "os-modal-title";

    const keyboardSectionTitle = document.createElement("div");
    keyboardSectionTitle.textContent = "Keyboard Layout";
    keyboardSectionTitle.className = "os-modal-section-title";

    const keyboardButtonRow = document.createElement("div");
    keyboardButtonRow.className = "os-modal-button-row";

    const currentLayout = KeyboardLayoutSettings.getLayout();

    const qwertyButton = this.createLayoutButton(
      "QWERTY",
      "qwerty",
      currentLayout === "qwerty"
    );

    const azertyButton = this.createLayoutButton(
      "AZERTY",
      "azerty",
      currentLayout === "azerty"
    );

    keyboardButtonRow.appendChild(qwertyButton);
    keyboardButtonRow.appendChild(azertyButton);

    const introSectionTitle = document.createElement("div");
    introSectionTitle.textContent = "Intro";
    introSectionTitle.className = "os-modal-section-title";

    const introEnabled = IntroSettings.getShowIntro();

    const introButtonRow = document.createElement("div");
    introButtonRow.className = "os-modal-button-row";

    const introOnButton = this.createIntroButton(
      "ON",
      true,
      introEnabled === true
    );

    const introOffButton = this.createIntroButton(
      "OFF",
      false,
      introEnabled === false
    );

    introButtonRow.appendChild(introOnButton);
    introButtonRow.appendChild(introOffButton);

    const soundSectionTitle = document.createElement("div");
    soundSectionTitle.textContent = "Sound";
    soundSectionTitle.className = "os-modal-section-title";

    const soundEnabled = SoundSettings.getSoundEnabled();

    const soundButtonRow = document.createElement("div");
    soundButtonRow.className = "os-modal-button-row";

    const soundOnButton = this.createSoundButton(
      "ON",
      true,
      soundEnabled === true
    );

    const soundOffButton = this.createSoundButton(
      "OFF",
      false,
      soundEnabled === false
    );

    soundButtonRow.appendChild(soundOnButton);
    soundButtonRow.appendChild(soundOffButton);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "Close";
    closeButton.className = "os-button os-modal-close-button";

    closeButton.addEventListener("click", () => {
      this.onClose?.();
      this.hide();
    });

    this.panel.appendChild(title);

    this.panel.appendChild(keyboardSectionTitle);
    this.panel.appendChild(keyboardButtonRow);

    this.panel.appendChild(introSectionTitle);
    this.panel.appendChild(introButtonRow);

    this.panel.appendChild(soundSectionTitle);
    this.panel.appendChild(soundButtonRow);

    this.panel.appendChild(closeButton);
  }

  private createLayoutButton(
    label: string,
    layout: KeyboardLayout,
    selected: boolean
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = "os-modal-choice-button";

    if (selected) {
      button.classList.add("os-modal-choice-button-selected");
    }

    button.addEventListener("click", () => {
      KeyboardLayoutSettings.setLayout(layout);
      this.onKeyboardLayoutChanged?.(layout);
      this.onChoice?.();
      this.render();
    });

    return button;
  }

  private createIntroButton(
    label: string,
    enabled: boolean,
    selected: boolean
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = "os-modal-choice-button";

    if (selected) {
      button.classList.add("os-modal-choice-button-selected");
    }

    button.addEventListener("click", () => {
      IntroSettings.setShowIntro(enabled);
      this.onChoice?.();
      this.render();
    });

    return button;
  }

  private createSoundButton(
    label: string,
    enabled: boolean,
    selected: boolean
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = "os-modal-choice-button";

    if (selected) {
      button.classList.add("os-modal-choice-button-selected");
    }

    button.addEventListener("click", () => {
      if (enabled) {
        this.onSoundEnabledChanged?.(true);
        this.onChoice?.();
      } else {
        this.onChoice?.();
        this.onSoundEnabledChanged?.(false);
      }

      this.render();
    });

    return button;
  }
}