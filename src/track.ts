import { searchSpotifyIdByYoutubeURL } from "./api/songlink";
import { spotifyApi } from "./api/spotify";
import { getYoutubeTitle } from "./api/youtube";
import { parseSpotifyURL, parseYoutubeURL } from "./parser";

export type Track = {
  uri: string;
  title: string;
  duration: number;
};

export async function getTracksByMessage(message: string): Promise<Track[]> {
  const words = message.split(" ");
  const urls = new Set(words);

  const spotifyIds: string[] = [];

  const tracks: Track[] = [];

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
          if (data) {
            const foundTrack = data[0];

            if (foundTrack) {
              tracks.push(foundTrack);
            }
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
    if (data) {
      for (const item of data) {
        tracks.push(item);
      }
    }
  }

  if (tracks.length == 0) {
    const data = await spotifyApi.searchTracks(message);
    if (data) {
      const foundTrack = data[0];

      if (foundTrack) {
        return [foundTrack];
      }
    }
  }

  return tracks;
}
