import { chatClient } from "../client";
import { settings } from "../settings";

let uri: string;
let votes = 0;

export async function skip() {
  const current = Spicetify.Queue.track.contextTrack.uri;

  const skipVotes: number = settings.getFieldValue("skip-votes");

  if (current == uri) {
    votes++;

    if (votes >= skipVotes) {
      Spicetify.Player.next();

      chatClient.say(`Трек успешно проскипан. Спасибо за участие.`);
    } else {
      chatClient.say(`Осталось ${skipVotes - votes} голосов`);
    }
  } else {
    uri = current;
    votes = 1;

    chatClient.say(
      `Запущено голосование на скип трека. Осталось ${skipVotes - votes} голосов.`,
    );
  }
}
