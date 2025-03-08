import { chatClient } from "../client";
import { chatterQueue, QueueTrack } from "../queue";
import { settings } from "../settings";
import { getTracksByMessage, Track } from "../track";

export async function request(user: string, message: string) {
  try {
    const tracks = await getTracksByMessage(message);
    await addToQueue(user, tracks);
  } catch (e) {
    Spicetify.showNotification("Song Requests Error");
    console.error(e);
  }
}

async function addToQueue(user: string, tracks: Track[]) {
  const nextTracks = Spicetify.Queue.nextTracks.filter(
    (track) => track.provider == "queue",
  );

  const maxTracks: number = settings.getFieldValue("max-tracks");
  const maxDuration: number = settings.getFieldValue("max-duration");

  const addToQueueTracks: QueueTrack[] = [];

  for (const track of tracks) {
    if (nextTracks.length + addToQueueTracks.length >= maxTracks) {
      chatClient.say(`Максимум ${maxTracks} треков в очереди`);
      break;
    }

    if (track.duration > maxDuration * 60 * 1000) {
      chatClient.say(`Трек должен быть меньше ${maxDuration} (мин)`);
      continue;
    }

    const requestedTrack = findRequestedTrack(track.uri);

    if (requestedTrack) {
      chatClient.say(
        `Трек #${requestedTrack.id} ${requestedTrack.title} уже в очереди`,
      );
      continue;
    }

    const id = chatterQueue.length + 1;
    const addTrack: QueueTrack = { id, user, ...track };

    addToQueueTracks.push(addTrack);
    chatterQueue.push(addTrack);

    chatClient.say(`Трек #${id} ${track.title} добавлен в очередь`);
  }

  await Spicetify.addToQueue(
    addToQueueTracks.map((track) => ({ uri: track.uri })),
  );
}

function findRequestedTrack(uri: string): QueueTrack | undefined {
  const currentTrack = Spicetify.Queue.track;
  const nextTracks = Spicetify.Queue.nextTracks.filter(
    (track) => track.provider == "queue",
  );

  const track = [currentTrack, ...nextTracks].find(
    (track) => track.contextTrack.uri == uri,
  );

  if (track) {
    const queue = [...chatterQueue].reverse();
    return queue.find((item) => item.uri == track.uri);
  }
}
