import { parseSpotifyURL } from "../parser";

export async function searchSpotifyIdByYoutubeURL(
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
