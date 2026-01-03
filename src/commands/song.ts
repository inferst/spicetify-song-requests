import { trackTitle } from "../api/spotify";
import { chatClient } from "../client";

export function song() {
  const queueTrack = Spicetify.Queue.track;
  const track = queueTrack?.contextTrack?.metadata;

  if (track) {
    chatClient.say(
      `Сейчас играет ${trackTitle(track.title, track.artist_name)}`,
    );
  }
}
