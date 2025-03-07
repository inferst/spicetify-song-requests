import { chatClient } from "../client";
import { chatterQueue } from "../queue";

export async function remove(user: string, message: string) {
  const id = message == "" ? 0 : Number(message.replace("#", ""));

  if (chatterQueue[user]) {
    const trackId = id == 0 ? chatterQueue[user].at(-1)?.id : id;
    const chatterTrack = chatterQueue[user].find(
      (track) => track.id == trackId,
    );

    if (chatterTrack) {
      const playerTrack = Spicetify.Queue.nextTracks.find(
        (track) => track.contextTrack.uri == chatterTrack.uri,
      );

      if (playerTrack) {
        chatClient.say(
          `Трек #${trackId} ${chatterTrack.title} удален из очереди`,
        );

        await Spicetify.removeFromQueue([{ uri: chatterTrack.uri }]);
      }
    }
  }
}
