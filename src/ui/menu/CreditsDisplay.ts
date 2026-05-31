export class CreditsDisplay {
  private readonly overlay: HTMLDivElement;
  private readonly panel: HTMLDivElement;

  private onClose?: () => void;

  constructor() {
    this.overlay = document.createElement("div");
    this.overlay.id = "credits-overlay";
    this.overlay.className = "os-modal-overlay";

    this.panel = document.createElement("div");
    this.panel.className =
      "os-modal-panel os-credits-panel os-modal-centered";

    this.render();

    this.overlay.appendChild(this.panel);
    document.body.appendChild(this.overlay);
  }

  public show(): void {
    this.overlay.style.display = "flex";
  }

  public hide(): void {
    this.overlay.style.display = "none";
  }

  public setOnClose(callback: () => void): void {
    this.onClose = callback;
  }

  private render(): void {
    this.panel.innerHTML = "";

    const title = document.createElement("div");
    title.textContent = "Credits";
    title.className = "os-modal-title";

    const content = document.createElement("div");
    content.className = "os-credits-content";

    content.appendChild(
      this.createIntroSection()
    );

    content.appendChild(
      this.createContributionSection()
    );

    content.appendChild(
      this.createThirdPartyAssetsSection()
    );

    content.appendChild(
      this.createTechnologySection()
    );

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "Close";
    closeButton.className =
      "os-button os-modal-close-button";

    closeButton.addEventListener("click", () => {
      this.onClose?.();
      this.hide();
    });

    this.panel.appendChild(title);
    this.panel.appendChild(content);
    this.panel.appendChild(closeButton);
  }

  private createIntroSection(): HTMLDivElement {
    const section = this.createSection(
      "Opposite Shores"
    );

    const text = document.createElement("div");
    text.className = "os-credits-highlight";
    text.textContent = "Created by Aral SOYSALAN";

    section.appendChild(text);

    return section;
  }

  private createContributionSection(): HTMLDivElement {
    const section = this.createSection(
      "Design and Development"
    );

    const roles = [
      "Game Concept and Design",
      "Programming",
      "UI Design",
      "Narrative and Worldbuilding",
      "Sound Design",
      "Original Music Composition",
      "Technical Art and Asset Integration",
      "Game Balancing and Testing",
    ];

    const creditGrid = document.createElement("div");
    creditGrid.className = "os-credits-contribution-grid";

    for (const role of roles) {
      const row = document.createElement("div");
      row.className = "os-credits-contribution-row";

      const roleLabel = document.createElement("div");
      roleLabel.className = "os-credits-contribution-role";
      roleLabel.textContent = role;

      const authorLabel = document.createElement("div");
      authorLabel.className = "os-credits-contribution-author";
      authorLabel.textContent = "Aral SOYSALAN";

      row.appendChild(roleLabel);
      row.appendChild(authorLabel);

      creditGrid.appendChild(row);
    }

    section.appendChild(creditGrid);

    return section;
  }

  private createThirdPartyAssetsSection(): HTMLDivElement {
    const section = this.createSection(
      "Third-Party Assets"
    );

    section.appendChild(
      this.createAssetEntry(
        "Selected assets by Kenney",
        [
          "City Kit (Suburban)",
          "City Kit (Roads)",
          "City Kit (Industrial)",
          "Game Icons",
          "Licensed under Creative Commons CC0.",
        ],
        [
          {
            label: "City Kit (Suburban)",
            url: "https://kenney.nl/assets/city-kit-suburban",
          },
          {
            label: "City Kit (Roads)",
            url: "https://kenney.nl/assets/city-kit-roads",
          },
          {
            label: "City Kit (Industrial)",
            url: "https://kenney.nl/assets/city-kit-industrial",
          },
          {
            label: "Game Icons",
            url: "https://kenney.nl/assets/game-icons",
          },
        ]
      )
    );

    section.appendChild(
      this.createAssetEntry(
        "Downtown City - Low Poly 3D Models Pack by ithappy",
        [
          "Used under the Standard Unity Asset Store EULA.",
        ],
        [
          {
            label: "Unity Asset Store Page",
            url: "https://assetstore.unity.com/packages/3d/props/exterior/downtown-city-low-poly-3d-models-pack-197810",
          },
        ]
      )
    );

    section.appendChild(
      this.createAssetEntry(
        "Low-poly parisienne water fountain by pino",
        [
          "Licensed under Creative Commons Attribution 4.0 International.",
        ],
        [
          {
            label: "Model Page",
            url: "https://skfb.ly/oHrvq",
          },
          {
            label: "License",
            url: "https://creativecommons.org/licenses/by/4.0/",
          },
        ]
      )
    );

    return section;
  }

  private createTechnologySection(): HTMLDivElement {
    const section = this.createSection(
      "Technology"
    );

    const text = document.createElement("div");
    text.className = "os-credits-asset-title";
    text.textContent =
      "Built with Babylon.js and TypeScript.";

    section.appendChild(text);

    return section;
  }

  private createSection(
    titleText: string
  ): HTMLDivElement {
    const section = document.createElement("div");
    section.className = "os-credits-section";

    const title = document.createElement("div");
    title.className = "os-credits-section-title";
    title.textContent = titleText;

    section.appendChild(title);

    return section;
  }

  private createAssetEntry(
    titleText: string,
    lines: string[],
    links: {
      label: string;
      url: string;
    }[]
  ): HTMLDivElement {
    const entry = document.createElement("div");
    entry.className = "os-credits-asset-entry";

    const title = document.createElement("div");
    title.className = "os-credits-asset-title";
    title.textContent = titleText;

    entry.appendChild(title);

    for (const lineText of lines) {
      const line = document.createElement("div");
      line.className = "os-credits-text";
      line.textContent = lineText;

      entry.appendChild(line);
    }

    const linkRow = document.createElement("div");
    linkRow.className = "os-credits-link-row";

    for (const linkDefinition of links) {
      const link = document.createElement("a");
      link.className = "os-credits-link";
      link.textContent = linkDefinition.label;
      link.href = linkDefinition.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      linkRow.appendChild(link);
    }

    entry.appendChild(linkRow);

    return entry;
  }
}