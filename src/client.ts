import { StaticAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import { settings } from "./settings";
import { getTracksByMessage, Track, trackTitle } from "./track";

const SCOPES = ["chat:read", "chat:edit", "channel:moderate"];

let chatClient: ChatClient;

type QueueTrack = { index: number } & Track;

type ChatterQueue = {
  [key: string]: QueueTrack[];
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

      const chatterUris = chatterQueue[user] ?? [];
      const trackToQueue: QueueTrack[] = [];

      const index = getNextIndex(chatterQueue);

      for (const track of tracks) {
        if (track.duration < maxDuration * 60 * 1000) {
          if (isRequested(track.uri)) {
            chatClient.say(
              channel,
              `Трек #${index} ${track.title} уже в очереди`,
            );
            return;
          }

          chatClient.say(
            channel,
            `Трек #${index} ${track.title} добавлен в очередь`,
          );

          trackToQueue.push({ index, ...track });
        } else {
          chatClient.say(
            channel,
            `Трек должен быть меньше ${maxDuration} (мин)`,
          );
        }
      }

      await Spicetify.addToQueue(
        trackToQueue.map((track) => ({ uri: track.uri })),
      );

      chatterQueue[user] = [...chatterUris, ...trackToQueue];
    }

    async function removeFromQueue(user: string, index: number) {
      if (chatterQueue[user]) {
        const chatterTrack = chatterQueue[user].find(
          (track) => track.index == index,
        );

        if (chatterTrack) {
          const playerTrack = Spicetify.Queue.nextTracks.find(
            (track) => track.contextTrack.uri == chatterTrack.uri,
          );

          if (playerTrack) {
            chatClient.say(
              channel,
              `Трек #${index} ${chatterTrack.title} удален из очереди`,
            );

            await Spicetify.removeFromQueue([{ uri: chatterTrack.uri }]);
          }
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
        const index = message == "" ? 1 : Number(message.replace("#", ""));

        if (index > 0) {
          await removeFromQueue(user, index);
        }
      } else if (["!song"].includes(command)) {
        const queueTrack = Spicetify.Queue.track;
        const track = queueTrack?.contextTrack?.metadata;

        if (track) {
          chatClient.say(
            channel,
            `Сейчас играет ${trackTitle(track.title, track.artist_name)}`,
          );
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

function getNextIndex(queue: ChatterQueue) {
  const keys = Object.keys(queue);
  return keys.flatMap((user) => queue[user]).length + 1;
}
