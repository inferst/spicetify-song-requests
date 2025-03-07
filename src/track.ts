import { searchSpotifyIdByYoutubeURL } from "./api/songlink";
import { spotifyApi } from "./api/spotify";
import { getYoutubeTitle } from "./api/youtube";
import { parseSpotifyURL, parseYoutubeURL } from "./parser";

export type Track = {
  uri: string;
  title: string;
  duration: number;
};

function formatTrack(spotifyTrack: SpotifyApi.TrackObjectFull): Track {
  const name = spotifyTrack.name;
  const artists = spotifyTrack.artists.map((artist) => artist.name).join(" ");

  return {
    uri: spotifyTrack.uri,
    title: trackTitle(name, artists),
    duration: spotifyTrack.duration_ms,
  };
}

export function trackTitle(name: string, artist: string): string {
  return `"${name} - ${artist}"`;
}

export async function getTracksByMessage(message: string): Promise<Track[]> {
  const words = message.split(" ");
  const urls = new Set(words);

  const spotifyIds: string[] = [];

  const tracks: SpotifyApi.TrackObjectFull[] = [];

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
      return [formatTrack(foundTrack)];
    }
  }

  return tracks.map(formatTrack);
}
