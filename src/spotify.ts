import { SpotifyResponse } from "./types/spotify";

const SPOTIFY_API_URL = "api.spotify.com";

export async function search(
  query: string,
  limit: number = 1,
): Promise<SpotifyResponse> {
  const token = Spicetify.Platform.Session.accessToken;

  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  return fetch(
    `https://${SPOTIFY_API_URL}/v1/search?q=${query}&type=track&limit=${limit}`,
    options,
  ).then((data) => data.json());
}
