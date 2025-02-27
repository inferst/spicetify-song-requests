import { StaticAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import { settings } from "./settings";
import { getTracksByMessage, Track } from "./track";

const SCOPES = ["chat:read", "chat:edit", "channel:moderate"];

let chatClient: ChatClient;

type ChatterQueue = {
  [key: string]: Track[];
};

const chatterQueue: ChatterQueue = {};

export function start() {
  const channel: string = settings.getFieldValue("twitch-channel");
  const clientId: string = settings.getFieldValue("twitch-client-id");
  const accessToken: string = settings.getFieldValue("twitch-access-token");

  if (channel && clientId && accessToken) {
    const authProvider = new StaticAuthProvider(clientId, accessToken, SCOPES);

    async function addToQueue(user: string, tracks: Track[]) {
      const maxDuration: number = settings.getFieldValue("max-duration");

      const filteredTracks: Track[] = [];

      for (const track of tracks) {
        if (track.duration < maxDuration * 60 * 1000) {
          if (isRequested(track.uri)) {
            chatClient.say(
              channel,
              `Трек "${track.artists} - ${track.name}" уже в очереди`,
            );
            return;
          }

          chatClient.say(
            channel,
            `Трек "${track.artists} - ${track.name}" добавлен в очередь`,
          );

          filteredTracks.push(track);
        } else {
          chatClient.say(
            channel,
            `Трек должен быть меньше ${maxDuration} (мин)`,
          );
        }
      }

      await Spicetify.addToQueue(
        filteredTracks.map((track) => ({ uri: track.uri })),
      );

      const chatterUris = chatterQueue[user] ?? [];
      chatterQueue[user] = [...chatterUris, ...filteredTracks];
    }

    async function removeFromQueue(user: string, count: number) {
      if (chatterQueue[user]) {
        const tracks = chatterQueue[user].splice(-count);

        if (tracks.length > 0) {
          for (const track of tracks) {
            chatClient.say(
              channel,
              `Трек "${track.artists} - ${track.name}" удален в очередь`,
            );
          }

          await Spicetify.removeFromQueue(
            tracks.map((track) => ({ uri: track.uri })),
          );
        }
      }
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

    chatClient.onMessage(async (_channel, user, text, _msg) => {
      const words = text.trim().split(" ");

      const command = words[0];
      const message = words.slice(1).join(" ");

      if (["!sr"].includes(command) && message) {
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
          await addToQueue(user, tracks);
        } catch (e) {
          Spicetify.showNotification("Song Requests Error");
          console.error(e);
        }
      } else if (["!rm"].includes(command)) {
        const count = Math.abs(message == "" ? 1 : Number(message));

        if (count > 0) {
          await removeFromQueue(user, count);
        }
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
