import { parseSpotifyURL, parseYoutubeURL } from "./parser";
import { spotifyApi } from "./spotify";

export async function getTracksByMessage(
  message: string,
): Promise<SpotifyApi.TrackObjectFull[]> {
  const list = message.split(" ");

  const youtubeTracks: string[] = [];
  const spotifyTracks: string[] = [];

  const tracks: SpotifyApi.TrackObjectFull[] = [];

  spotifyApi.setAccessToken(Spicetify.Platform.Session.accessToken);

  for (let item of list) {
    const youtubeId = parseYoutubeURL(item);
    const spotifyId = parseSpotifyURL(item);

    if (youtubeId) {
      const video = await fetch(
        `https://www.youtube.com/oembed?url=${item}&format=json`,
      ).then((data) => data.json());

      if (video.title) {
        youtubeTracks.push(video.title);
      }
    } else if (spotifyId) {
      spotifyTracks.push(spotifyId);
    }
  }

  for (let track of youtubeTracks) {
    const data = await spotifyApi.searchTracks(track);
    const foundTrack = data.tracks.items[0];

    if (foundTrack) {
      tracks.push(foundTrack);
    }
  }

  if (spotifyTracks.length > 0) {
    const data = await spotifyApi.getTracks(spotifyTracks);
    for (const item of data.tracks) {
      tracks.push(item);
    }
  }

  if (youtubeTracks.length == 0 && spotifyTracks.length == 0) {
    const data = await spotifyApi.searchTracks(message);
    const foundTrack = data.tracks.items[0];

    if (foundTrack) {
      return [foundTrack];
    }
  }

  return tracks;
}
