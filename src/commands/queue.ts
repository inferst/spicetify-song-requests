import { settings } from "../settings";
import { streamerbotClient } from "../streamerbot";

export function queue() {
  const tracks = [Spicetify.Queue.track, ...Spicetify.Queue.nextTracks].map(

    (track) => ({
      title: track.contextTrack.title,
      artist: track.contextTrack.artist_name,
    }),
  );

  const actionId: string = settings.getFieldValue("queueAction");

  streamerbotClient.doAction(actionId, {
    tracks: tracks,
  });
}
