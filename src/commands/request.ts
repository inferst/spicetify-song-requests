import { chatClient } from "../client";
import { ChatterQueue, chatterQueue, QueueTrack } from "../queue";
import { settings } from "../settings";
import { getTracksByMessage, Track } from "../track";

export async function request(user: string, message: string) {
  const nextTracks = Spicetify.Queue.nextTracks.filter(
    (track) => track.provider == "queue",
  );

  const maxTracks: number = settings.getFieldValue("max-tracks");

  if (nextTracks.length >= maxTracks) {
    chatClient.say(`Максимум ${maxTracks} треков в очереди`);
    return;
  }

  try {
    const tracks = await getTracksByMessage(message);
    await addToQueue(user, tracks);
  } catch (e) {
    Spicetify.showNotification("Song Requests Error");
    console.error(e);
  }
}

async function addToQueue(user: string, tracks: Track[]) {
  const maxDuration: number = settings.getFieldValue("max-duration");

  const chatterUris = chatterQueue[user] ?? [];
  const addToQueueTracks: QueueTrack[] = [];

  for (const track of tracks) {
    if (track.duration < maxDuration * 60 * 1000) {
      const id = getNextId(chatterQueue);

      if (isRequested(track.uri)) {
        chatClient.say(`Трек #${id} ${track.title} уже в очереди`);
        return;
      }

      chatClient.say(`Трек #${id} ${track.title} добавлен в очередь`);

      const addTrack: QueueTrack = { id, ...track };

      addToQueueTracks.push(addTrack);
      chatterQueue[user] = [...chatterUris, addTrack];
    } else {
      chatClient.say(`Трек должен быть меньше ${maxDuration} (мин)`);
    }
  }

  await Spicetify.addToQueue(
    addToQueueTracks.map((track) => ({ uri: track.uri })),
  );
}

function getNextId(queue: ChatterQueue) {
  return Object.keys(queue).flatMap((user) => queue[user]).length + 1;
}

function isRequested(uri: string) {
  const nextTracks = Spicetify.Queue.nextTracks.filter(
    (track) => track.provider == "queue",
  );

  return nextTracks.some((track) => track.contextTrack.uri == uri);
}
