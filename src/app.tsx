import { chatClient } from "./client";
import { remove } from "./commands/remove";
import { request } from "./commands/request";
import { skip } from "./commands/skip";
import { song } from "./commands/song";
import { pushSettings, settings } from "./settings";

const init = (isEnabled: boolean) => {
  if (isEnabled) {
    chatClient.connect();

    chatClient.onMessage(async (user, text) => {
      const words = text.trim().split(" ");

      const command = words[0];
      const message = words.slice(1).join(" ");

      const skipCommand: string = settings.getFieldValue("skip-command-alias");
      const skipCommands = skipCommand.split("|");

      if (["!sr"].includes(command) && message) {
        request(user, message);
      } else if (["!rm"].includes(command)) {
        remove(user, message);
      } else if (["!song"].includes(command)) {
        song();
      } else if (["!skip", ...skipCommands].includes(command)) {
        skip();
      }
    });
  } else {
    chatClient.disconnect();
  }
};

async function main() {
  while (!Spicetify?.showNotification) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  pushSettings(chatClient.connect, init);

  const isEnabled: boolean = settings.getFieldValue("enabled") ?? false;
  init(isEnabled);
}

export default main;
