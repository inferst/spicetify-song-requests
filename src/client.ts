import { StaticAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import SpotifyWebApi from "spotify-web-api-js";
import { settings } from "./settings";
import { parseSpotifyURL, parseYoutubeURL } from "./parser";

const SCOPES = ["chat:read", "chat:edit", "channel:moderate"];

let chatClient: ChatClient;

const spotifyApi = new SpotifyWebApi();

export function start() {
  const channel: string = settings.getFieldValue("twitch-channel");
  const clientId: string = settings.getFieldValue("twitch-client-id");
  const accessToken: string = settings.getFieldValue("twitch-access-token");

  if (channel && clientId && accessToken) {
    const authProvider = new StaticAuthProvider(clientId, accessToken, SCOPES);

    spotifyApi.setAccessToken(Spicetify.Platform.Session.accessToken);

    async function addToQueue(track: SpotifyApi.TrackObjectFull) {
      if (isRequested(track.uri)) {
        return;
      }

      const name = track.name;
      const artists = track.artists.map((artist) => artist.name).join(" ");

      await Spicetify.addToQueue([{ uri: track.uri }]);
      chatClient.say(channel, `Трек "${artists} - ${name}" добавлен в очередь`);
    }

    if (chatClient) {
      chatClient.quit();
    }

    chatClient = new ChatClient({
      authProvider,
      channels: [channel],
    });

    chatClient.connect();

    chatClient.onConnect(() => {
      Spicetify.showNotification("Song Requests Initialized");
    });

    chatClient.onMessage(async (_channel, _user, text, _msg) => {
      const words = text.trim().split(" ");
      const command = words[0];
      const message = words.slice(1).join(" ");

      if (command == "!sr") {
        const nextTracks = Spicetify.Queue.nextTracks.filter(
          (track) => track.provider == "queue",
        );

        const maxTracks: number = settings.getFieldValue('max-tracks');

        if (nextTracks.length >= maxTracks) {
          chatClient.say(channel, `Очередь переполнена (${maxTracks} треков)`);
          return;
        }

        try {
          const youtubeId = parseYoutubeURL(message);

          if (youtubeId) {
            return;
          }

          const spotifyId = parseSpotifyURL(message);

          if (spotifyId) {
            const data = await spotifyApi.getTracks([spotifyId]);
            const foundTrack = data.tracks[0];

            addToQueue(foundTrack);
            return;
          }

          const data = await spotifyApi.searchTracks(message);
          const foundTrack = data.tracks.items[0];

          if (foundTrack) {
            addToQueue(foundTrack);
          }
        } catch (e) {
          Spicetify.showNotification("Song Requests Error");
          console.error(e);
        }
      }
    });
  }
}

function isRequested(uri: string) {
  const nextTracks = Spicetify.Queue.nextTracks.filter(
    (track) => track.provider == "queue",
  );

  return nextTracks.some((track) => track.contextTrack.uri == uri);
}
