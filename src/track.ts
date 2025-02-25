import { parseSpotifyURL, parseYoutubeURL } from "./parser";
import { spotifyApi } from "./spotify";

export async function getTracksByMessage(
  message: string,
): Promise<SpotifyApi.TrackObjectFull[]> {
  const words = message.split(" ");
  const urls = new Set(words);

  const spotifyIds: string[] = [];

  const tracks: SpotifyApi.TrackObjectFull[] = [];

  spotifyApi.setAccessToken(Spicetify.Platform.Session.accessToken);

  for (let item of urls) {
    const youtubeId = parseYoutubeURL(item);
    const spotifyId = parseSpotifyURL(item);

    if (youtubeId) {
      const uri = await searchSpotifyIdByYoutubeURL(item);

      if (uri) {
        spotifyIds.push(uri);
      } else {
        const title = await getYoutubeTitle(item);

        if (title) {
          const data = await spotifyApi.searchTracks(title);
          const foundTrack = data.tracks.items[0];

          if (foundTrack) {
            tracks.push(foundTrack);
          }
        }
      }
    } else if (spotifyId) {
      if (!spotifyIds.includes(spotifyId)) {
        spotifyIds.push(spotifyId);
      }
    }
  }

  if (spotifyIds.length > 0) {
    const data = await spotifyApi.getTracks(spotifyIds);
    for (const item of data.tracks) {
      tracks.push(item);
    }
  }

  if (tracks.length == 0) {
    const data = await spotifyApi.searchTracks(message);
    const foundTrack = data.tracks.items[0];

    if (foundTrack) {
      return [foundTrack];
    }
  }

  return tracks;
}

async function searchSpotifyIdByYoutubeURL(
  url: string,
): Promise<string | null> {
  try {
    const proxy = "https://cors-proxy.spicetify.app";
    const data = await fetch(
      `${proxy}/https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(url)}&userCountry=US&songIfSingle=true`,
    ).then((data) => data.json());

    const spotifyUrl = data["linksByPlatform"]["spotify"]["url"];
    const spotifyId = parseSpotifyURL(spotifyUrl);

    if (spotifyId) {
      return spotifyId;
    }
  } catch (e) {
    console.error(e);
  }

  return null;
}

async function getYoutubeTitle(url: string): Promise<string | null> {
  try {
    const video = await fetch(
      `https://www.youtube.com/oembed?url=${url}&format=json`,
    ).then((data) => data.json());

    if (video.title) {
      return video.title;
    }
  } catch (e) {
    console.error(e);
  }

  return null;
}
