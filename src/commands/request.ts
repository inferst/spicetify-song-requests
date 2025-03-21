import { chatClient } from "../client";
import { allRequests, RequestTrack } from "../requests";
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

  const maxUserTracks: number = settings.getFieldValue("max-user-tracks");

  const userTracksInQueue = findUserTracks(user);

  const requestTracks: RequestTrack[] = [];

  for (const track of tracks) {
    if (nextTracks.length + requestTracks.length >= maxTracks) {
      chatClient.say(`Максимум ${maxTracks} треков в очереди`);
      break;
    }

    if (requestTracks.length + userTracksInQueue.length >= maxUserTracks) {
      chatClient.say(`Максимум ${maxUserTracks} треков на зрителя в очереди`);
      break;
    }

    if (track.duration > maxDuration * 60 * 1000) {
      chatClient.say(`Трек должен быть меньше ${maxDuration} (мин)`);
      continue;
    }

    const requestedTrack = findRequestTrack(track.uri);

    if (requestedTrack) {
      chatClient.say(
        `Трек #${requestedTrack.id} ${requestedTrack.title} уже в очереди`,
      );
      continue;
    }

    const id = allRequests.length + 1;
    const requestTrack: RequestTrack = { id, user, ...track };

    requestTracks.push(requestTrack);
    allRequests.push(requestTrack);

    const position = nextTracks.length + requestTracks.length;

    chatClient.say(
      `Трек #${id} ${track.title} добавлен в очередь (${position}-й в списке)`,
    );
  }

  await Spicetify.addToQueue(
    requestTracks.map((track) => ({ uri: track.uri })),
  );
}

function findRequestTrack(uri: string): RequestTrack | undefined {
  const currentTrack = Spicetify.Queue.track;
  const nextTracks = Spicetify.Queue.nextTracks.filter(
    (track) => track.provider == "queue",
  );

  const track = [currentTrack, ...nextTracks].find(
    (track) => track.contextTrack.uri == uri,
  );

  if (track) {
    const queue = [...allRequests].reverse();
    return queue.find((item) => item.uri == track.contextTrack.uri);
  }
}

function findUserTracks(user: string): RequestTrack[] {
  const uris = Spicetify.Queue.nextTracks
    .filter((track) => track.provider == "queue")
    .map((track) => track.contextTrack.uri);

  return allRequests.filter(
    (request) => request.user == user && uris.includes(request.uri),
  );
}
