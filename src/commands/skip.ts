import { chatClient } from "../client";
import { settings } from "../settings";

let uri: string;
let voted: string[] = [];

export async function skip(user: string, reward = false) {
  const current = Spicetify.Queue.track.contextTrack.uri;

  const skipVotes: number = settings.getFieldValue("skip-votes");

  if (reward) {
    if (current == uri) {
      vote(user, skipVotes);
    } else {
      start(current, user, skipVotes);
    }
  } else {
    if (current == uri) {
      vote(user, skipVotes);
    }
  }
}

function start(current: string, user: string, skipVotes: number) {
  uri = current;
  voted = [user.toLowerCase()];

  chatClient.say(
    `Запущено голосование на скип трека. Осталось ${skipVotes - voted.length} голосов. Напиши !skip для голосования.`,
  );
}

function vote(user: string, skipVotes: number) {
  if (!voted.find((votedUser) => votedUser == user.toLowerCase())) {
    voted.push(user.toLowerCase());

    if (voted.length >= skipVotes) {
      Spicetify.Player.next();

      chatClient.say(`Трек успешно проскипан. Спасибо за участие.`);
    } else {
      chatClient.say(`Осталось ${skipVotes - voted.length} голосов`);
    }
  }
}
