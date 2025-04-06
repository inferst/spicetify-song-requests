import { chatClient } from "../client";
import { allRequests } from "../requests";

export async function remove(user: string, message: string) {
  const id = message.replace("#", "");

  const requests = [...allRequests].reverse();

  let chatterTrack;

  if (id == "") {
    chatterTrack = requests.find((track) => track.user == user);
  } else {
    chatterTrack = requests.find(
      (track) => track.user == user && track.id == id,
    );
  }

  if (chatterTrack) {
    const playerTrack = Spicetify.Queue.nextTracks.find(
      (track) => track.contextTrack.uri == chatterTrack.uri,
    );

    if (playerTrack) {
      chatClient.say(
        `Трек #${chatterTrack.id} ${chatterTrack.title} удален из очереди`,
      );

      try {
        await Spicetify.removeFromQueue([{ uri: chatterTrack.uri }]);

        const index = allRequests.indexOf(chatterTrack);
        if (index > -1) {
          allRequests.splice(index, 1);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}
