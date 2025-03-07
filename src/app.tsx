import { chatClient } from "./client";
import { remove } from "./commands/remove";
import { request } from "./commands/request";
import { song } from "./commands/song";
import { pushSettings } from "./settings";

async function main() {
  while (!Spicetify?.showNotification) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  pushSettings(chatClient.connect);

  chatClient.connect();

  chatClient.onMessage(async (user, text) => {
    const words = text.trim().split(" ");

    const command = words[0];
    const message = words.slice(1).join(" ");

    if (["!sr"].includes(command) && message) {
      request(user, message);
    } else if (["!rm"].includes(command)) {
      remove(user, message);
    } else if (["!song"].includes(command)) {
      song();
    }
  });
}

export default main;
