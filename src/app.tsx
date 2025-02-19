import { StaticAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import SpotifyWebApi from "spotify-web-api-js";

const MAX_TRACKS = 20;
const CHANNEL = "";
const SCOPES = ["chat:read", "chat:edit", "channel:moderate"];

const clientId = "";
const accessToken = "";

async function main() {
  while (!Spicetify?.showNotification) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const spotify = new SpotifyWebApi();
  spotify.setAccessToken(Spicetify.Platform.Session.accessToken);

  const authProvider = new StaticAuthProvider(clientId, accessToken, SCOPES);

  const chatClient = new ChatClient({
    authProvider,
    channels: [CHANNEL],
  });

  chatClient.connect();

  chatClient.onMessage(async (_channel, _user, text, _msg) => {
    const words = text.split(" ");
    const command = words[0];
    const song = words.slice(1).join(" ");

    if (command == "!sr") {
      const nextTracks = Spicetify.Queue.nextTracks.filter(
        (track) => track.provider == "queue",
      );

      if (nextTracks.length >= MAX_TRACKS) {
        chatClient.say(CHANNEL, `Очередь переполнена (${MAX_TRACKS} треков)`);
        return;
      }

      const data = await spotify.searchTracks(song, {
        limit: 1,
        offset: 0,
      });

      const foundTrack = data.tracks.items[0];

      if (foundTrack) {
        if (
          nextTracks.some((track) => track.contextTrack.uri == foundTrack.uri)
        ) {
          return;
        }

        const name = foundTrack.name;
        const artists = foundTrack.artists
          .map((artist) => artist.name)
          .join(" ");

        await Spicetify.addToQueue([{ uri: foundTrack.uri }]);
        chatClient.say(
          CHANNEL,
          `Трек "${artists} - ${name}" добавлен в очередь`,
        );
      }
    }
  });
}

export default main;
