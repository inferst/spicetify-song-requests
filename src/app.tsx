import { start } from "./client";
import { pushSettings } from "./settings";

async function main() {
  while (!Spicetify?.showNotification) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  pushSettings();
  start();
}

export default main;
