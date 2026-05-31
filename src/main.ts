import "./ui/styles/uiTheme.css";
import { MainApp } from "./app/MainApp";

function applyGlobalPageStyles(): void {
  document.documentElement.style.width = "100%";
  document.documentElement.style.height = "100%";

  document.body.style.margin = "0";
  document.body.style.width = "100%";
  document.body.style.height = "100%";
  document.body.style.overflow = "hidden";

  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    throw new Error("Could not find #app root element.");
  }

  app.style.width = "100%";
  app.style.height = "100%";
}

function bootstrap(): void {
  applyGlobalPageStyles();

  const app = new MainApp();
  app.run();
}

bootstrap();