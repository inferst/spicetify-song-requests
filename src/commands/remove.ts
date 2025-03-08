import { chatClient } from "../client";
import { chatterQueue } from "../queue";

export async function remove(user: string, message: string) {
  const id = message == "" ? 0 : Number(message.replace("#", ""));

  const queue = [...chatterQueue].reverse();

  let chatterTrack;

  if (id == 0) {
    chatterTrack = queue.find((track) => track.user == user);
  } else {
    chatterTrack = queue.find((track) => track.user == user && track.id == id);
  }

  if (chatterTrack) {
    const playerTrack = Spicetify.Queue.nextTracks.find(
      (track) => track.contextTrack.uri == chatterTrack.uri,
    );

    if (playerTrack) {
      chatClient.say(
        `Трек #${chatterTrack.id} ${chatterTrack.title} удален из очереди`,
      );

      await Spicetify.removeFromQueue([{ uri: chatterTrack.uri }]);
    }
  }
}
