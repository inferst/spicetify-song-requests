import { StaticAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import { settings } from "./settings";
import { getTracksByMessage } from "./track";

const SCOPES = ["chat:read", "chat:edit", "channel:moderate"];

let chatClient: ChatClient;

export function start() {
  const channel: string = settings.getFieldValue("twitch-channel");
  const clientId: string = settings.getFieldValue("twitch-client-id");
  const accessToken: string = settings.getFieldValue("twitch-access-token");

  if (channel && clientId && accessToken) {
    const authProvider = new StaticAuthProvider(clientId, accessToken, SCOPES);

    async function addToQueue(tracks: SpotifyApi.TrackObjectFull[]) {
      const maxDuration: number = settings.getFieldValue("max-duration");

      const uris = [];

      for (const track of tracks) {
        if (track.duration_ms < maxDuration * 60 * 1000) {
          const name = track.name;
          const artists = track.artists.map((artist) => artist.name).join(" ");

          if (isRequested(track.uri)) {
            chatClient.say(
              channel,
              `Трек "${artists} - ${name}" уже в очереди`,
            );
            return;
          }

          chatClient.say(
            channel,
            `Трек "${artists} - ${name}" добавлен в очередь`,
          );

          uris.push({ uri: track.uri });
        }
      }

      await Spicetify.addToQueue(uris);
    }

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
      const message = words.slice(1).join(" ");

      if (["!sr", "!song"].includes(command) && message) {
        const nextTracks = Spicetify.Queue.nextTracks.filter(
          (track) => track.provider == "queue",
        );

        const maxTracks: number = settings.getFieldValue("max-tracks");

        if (nextTracks.length >= maxTracks) {
          chatClient.say(channel, `Максимум ${maxTracks} треков в очереди`);
          return;
        }

        try {
          const tracks = await getTracksByMessage(message);
          addToQueue(tracks);
        } catch (e) {
          Spicetify.showNotification("Song Requests Error");
          console.error(e);
        }
      } else if (command == "!skip") {
        // TODO: Skip implementation
      }
    });
  }
}

function isRequested(uri: string) {
  const nextTracks = Spicetify.Queue.nextTracks.filter(
    (track) => track.provider == "queue",
  );

  return nextTracks.some((track) => track.contextTrack.uri == uri);
}
