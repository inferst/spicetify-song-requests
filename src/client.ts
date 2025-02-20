import { StaticAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import { settings } from "./settings";
import { search } from "./spotify";

const MAX_TRACKS = 20;
const SCOPES = ["chat:read", "chat:edit", "channel:moderate"];

let chatClient: ChatClient;

export function start() {
  const channel: string = settings.getFieldValue("twitch-channel");
  const clientId: string = settings.getFieldValue("client-id");
  const accessToken: string = settings.getFieldValue("access-token");

  if (channel && clientId && accessToken) {
    const authProvider = new StaticAuthProvider(clientId, accessToken, SCOPES);

    if (chatClient) {
      chatClient.quit();
    }

    chatClient = new ChatClient({
      authProvider,
      channels: [channel],
    });

    chatClient.connect();

    chatClient.onConnect(() => {
      Spicetify.showNotification("Song Requests Initialized");
    });

    chatClient.onMessage(async (_channel, _user, text, _msg) => {
      const words = text.trim().split(" ");
      const command = words[0];
      const song = words.slice(1).join(" ");

      if (command == "!sr") {
        const nextTracks = Spicetify.Queue.nextTracks.filter(
          (track) => track.provider == "queue",
        );

        if (nextTracks.length >= MAX_TRACKS) {
          chatClient.say(channel, `Очередь переполнена (${MAX_TRACKS} треков)`);
          return;
        }

        try {
          const data = await search(song);

          const foundTrack = data.tracks.items[0];

          if (foundTrack) {
            const isRequested = nextTracks.some(
              (track) => track.contextTrack.uri == foundTrack.uri,
            );

            if (isRequested) {
              return;
            }

            const name = foundTrack.name;
            const artists = foundTrack.artists
              .map((artist) => artist.name)
              .join(" ");

            await Spicetify.addToQueue([{ uri: foundTrack.uri }]);
            chatClient.say(
              channel,
              `Трек "${artists} - ${name}" добавлен в очередь`,
            );
          }
        } catch (e) {
          Spicetify.showNotification("Song Requests Error");
          console.error(e);
        }
      }
    });
  }
}
