import { Game } from "../game/Game";
import { MainMenuDisplay } from "../ui/menu/MainMenuDisplay";
import { SettingsDisplay } from "../ui/menu/SettingsDisplay";
import { CreditsDisplay } from "../ui/menu/CreditsDisplay";
import { InGameMenuDisplay } from "../ui/menu/InGameMenuDisplay";
import { KeyboardLayoutSettings } from "../ui/menu/KeyboardLayoutSettings";
import { CloudTransitionDisplay } from "../ui/transitions/CloudTransitionDisplay";
import { IntroSettings } from "../ui/menu/IntroSettings";
import { RulesDisplay } from "../ui/menu/RulesDisplay";
import { UISoundController } from "../ui/audio/UISoundController";

export class MainApp {
  private game: Game | null = null;
  private isStarting = false;
  private isReturningToMainMenu = false;
  private isRestarting = false;
  private isMainMenuActive = false;

  private readonly mainMenuDisplay: MainMenuDisplay;
  private readonly settingsDisplay: SettingsDisplay;
  private readonly creditsDisplay: CreditsDisplay;
  private readonly inGameMenuDisplay: InGameMenuDisplay;
  private readonly cloudTransitionDisplay: CloudTransitionDisplay;
  private readonly rulesDisplay: RulesDisplay;
  private readonly uiSoundController: UISoundController;

  constructor() {
    this.mainMenuDisplay = new MainMenuDisplay();
    this.settingsDisplay = new SettingsDisplay();
    this.creditsDisplay = new CreditsDisplay();
    this.inGameMenuDisplay = new InGameMenuDisplay();
    this.rulesDisplay = new RulesDisplay();
    this.uiSoundController = new UISoundController();

    this.cloudTransitionDisplay = new CloudTransitionDisplay(
      "/assets/environement/clouds/cloudEdgeTransition.png"
    );

    this.bindUI();
  }

  public run(): void {
    this.inGameMenuDisplay.hide();
    this.mainMenuDisplay.show();

    this.isMainMenuActive = true;

    this.uiSoundController.startMainMenuRandomLoop();
  }

  private bindUI(): void {
    this.mainMenuDisplay.setOnPlay(() => {
      this.isMainMenuActive = false;

      this.uiSoundController.playButtonSound("play");
      this.uiSoundController.stopMainMenuRandomLoop();

      void this.startGame();
    });

    this.mainMenuDisplay.setOnSettings(() => {
      this.uiSoundController.playButtonSound("settings");
      this.settingsDisplay.show();
    });

    this.mainMenuDisplay.setOnCredits(() => {
      this.uiSoundController.playButtonSound("credits");
      this.creditsDisplay.show();
    });

    this.inGameMenuDisplay.setOnMainMenu(() => {
      const returnSoundFinished = this.uiSoundController.playButtonSoundAndWait("returnToMainMenu");

      void this.returnToMainMenu(returnSoundFinished);
    });

    this.settingsDisplay.setOnKeyboardLayoutChanged((layout) => {
      this.game?.setKeyboardLayout(layout);
    });

    this.mainMenuDisplay.setOnRules(() => {
      this.uiSoundController.playButtonSound("rules");
      this.rulesDisplay.show();
    });

    this.inGameMenuDisplay.setOnRules(() => {
      this.uiSoundController.playButtonSound("rules");
      this.rulesDisplay.show();
    });

    this.settingsDisplay.setOnClose(() => {
      this.uiSoundController.playButtonSound("close");
    });

    this.rulesDisplay.setOnClose(() => {
      this.uiSoundController.playButtonSound("close");
    });

    this.creditsDisplay.setOnClose(() => {
      this.uiSoundController.playButtonSound("close");
    });

    this.settingsDisplay.setOnChoice(() => {
      this.uiSoundController.playButtonSound("choice");
    });

    this.settingsDisplay.setOnSoundEnabledChanged((enabled) => {
      this.uiSoundController.setSoundEnabled(enabled);
    });
  }

  private async startGame(
    showIntro: boolean = IntroSettings.getShowIntro()
  ): Promise<void> {
    if (this.game || this.isStarting) {
      return;
    }

    this.isStarting = true;

    this.isMainMenuActive = false;

    this.uiSoundController.stopMainMenuRandomLoop();
    try {
      await this.cloudTransitionDisplay.playLoadingIntroOverMenuUntilReady(
        async () => {
          this.mainMenuDisplay.hide();

          this.game = this.createGame();
          await this.game.run();

          this.inGameMenuDisplay.show();
        },
        showIntro,
        1200,
        {
          onIntroStarted: () => {
            this.uiSoundController.startIntroBackgroundLoop();
          },

          onIntroFinished: () => {
            return this.uiSoundController.fadeOutIntroBackgroundLoop(900);
          },

          onBeforeCloudExit: () => {
            this.uiSoundController.startGameBackgroundLoop();
          },
        }
      );
   } catch (error) {
      console.error("[MAIN APP] Failed to start game.", error);

      this.uiSoundController.stopIntroBackgroundLoop();
      this.uiSoundController.stopGameBackgroundLoop();
      this.uiSoundController.stopAllBuildingSoundLoops();

      this.game = null;

      this.mainMenuDisplay.show();
      this.inGameMenuDisplay.hide();

      this.isMainMenuActive = true;

      this.uiSoundController.startMainMenuRandomLoop();
    } finally {
      this.isStarting = false;
    }
  }

  private async returnToMainMenu(
    returnSoundFinished: Promise<void> = Promise.resolve()
  ): Promise<void> {
    if (this.isReturningToMainMenu) {
      return;
    }

    this.isReturningToMainMenu = true;

    this.uiSoundController.stopMainMenuRandomLoop();

    try {
      await this.cloudTransitionDisplay.play({
        direction: "right-to-left",
        enterDurationMs: 850,
        holdDurationMs: 500,
        exitDurationMs: 850,

        onCovered: () => {
          this.inGameMenuDisplay.hide();

          this.uiSoundController.stopGameBackgroundLoop();
          this.uiSoundController.stopAllBuildingSoundLoops();

          this.game?.dispose();
          this.game = null;

          this.mainMenuDisplay.show();

          this.isMainMenuActive = true;
        },
      });

      await returnSoundFinished;

      if (
        this.isMainMenuActive &&
        !this.isStarting &&
        this.game === null
      ) {
        this.uiSoundController.startMainMenuRandomLoop();
      }
    } finally {
      this.isReturningToMainMenu = false;
    }
  }

  private createGame(): Game {
    const game = new Game({
      playEndTurnTransition: (onCovered) =>
        this.cloudTransitionDisplay.play({
          direction: "right-to-left",
          enterDurationMs: 850,
          holdDurationMs: 1000,
          exitDurationMs: 850,
          onCovered,
        }),

      playNextTurnTransition: (onCovered) =>
        this.cloudTransitionDisplay.play({
          direction: "left-to-right",
          enterDurationMs: 850,
          holdDurationMs: 1000,
          exitDurationMs: 850,
          onCovered,
        }),

      onRestartRequested: () => {
        void this.restartGame();
      },

      onPlayerBuildingPlaced: (family, placedBuildingId) => {
        this.uiSoundController.startBuildingSoundLoopForPlacedBuilding(
          family,
          placedBuildingId
        );
      },

      onCardSelected: () => {
        this.uiSoundController.playButtonSound("cardSelect");
      },

      onCardDeselected: () => {
        this.uiSoundController.playButtonSound("cardDeselect");
      },

      onPlayerHandReplaced: () => {
        this.uiSoundController.playButtonSound("replaceHand");
      },

      onTurnActionButtonClicked: () => {
        this.uiSoundController.playButtonSound("turnAction");
      },

      onGameResultShown: (winner) => {
        if (winner === "player") {
          this.uiSoundController.playButtonSound("victory");

          return;
        }

        if (winner === "ai") {
          this.uiSoundController.playButtonSound("defeat");
        }
      },
    });

    game.setKeyboardLayout(KeyboardLayoutSettings.getLayout());

    return game;
  }

  private async restartGame(): Promise<void> {
    if (this.isRestarting || this.isStarting) {
      return;
    }

    this.isRestarting = true;
    this.isMainMenuActive = false;

    try {
      await this.cloudTransitionDisplay.playLoadingOverMenuUntilReady(
        async () => {
          this.inGameMenuDisplay.hide();

          this.uiSoundController.stopGameBackgroundLoop();
          this.uiSoundController.stopAllBuildingSoundLoops();

          this.game?.dispose();
          this.game = null;

          this.mainMenuDisplay.hide();

          this.game = this.createGame();

          await this.game.run();

          this.inGameMenuDisplay.show();
        },
        1200
      );

      this.uiSoundController.startGameBackgroundLoop();
    } catch (error) {
      console.error("[MAIN APP] Failed to restart game.", error);

      this.uiSoundController.stopGameBackgroundLoop();
      this.uiSoundController.stopAllBuildingSoundLoops();

      this.game?.dispose();
      this.game = null;

      this.inGameMenuDisplay.hide();
      this.mainMenuDisplay.show();
    } finally {
      this.isRestarting = false;
    }
  }
}