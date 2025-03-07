import { StaticAuthProvider } from "@twurple/auth";
import { ChatClient as TwurpleChatClient } from "@twurple/chat";
import { settings } from "./settings";

export type OnMessageCallback = (user: string, text: string) => void;

const SCOPES = ["chat:read", "chat:edit", "channel:moderate"];

class ChatClient {
  private client!: TwurpleChatClient;

  private channel!: string;

  connect() {
    this.channel = settings.getFieldValue("twitch-channel");

    const clientId: string = settings.getFieldValue("twitch-client-id");
    const accessToken: string = settings.getFieldValue("twitch-access-token");

    if (this.channel && clientId && accessToken) {
      const authProvider = new StaticAuthProvider(
        clientId,
        accessToken,
        SCOPES,
      );

      this.disconnect();

      this.client = new TwurpleChatClient({
        authProvider,
        channels: [this.channel],
      });

      this.client.connect();

      this.client.onConnect(() => {
        Spicetify.showNotification("Song Requests Initialized");
      });
    } else {
      this.disconnect();
    }
  }

  disconnect() {
    if (this.client) {
      this.client.quit();
    }
  }

  say(text: string) {
    this.client.say(this.channel, text);
  }

  onMessage(callback: OnMessageCallback) {
    this.client.onMessage((_channel, user, text, _msg) => {
      callback(user, text);
    });
  }
}

export const chatClient = new ChatClient();
