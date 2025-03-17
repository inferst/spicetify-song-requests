import "spotify-web-api-js";

const API_URL = "https://api.spotify.com";

export const spotifyApi = {
  searchTracks: async (query: string) => {
    const data = await Spicetify.CosmosAsync.get(
      `${API_URL}/v1/search?q=${encodeURIComponent(query)}&type=track`,
    );

    return data as SpotifyApi.TrackSearchResponse;
  },
  getTracks: async (trackIds: string[]) => {
    const ids = trackIds.map((id) => encodeURIComponent(id)).join(",");
    const data = await Spicetify.CosmosAsync.get(
      `${API_URL}/v1/tracks?ids=${ids}`,
    );

    return data as SpotifyApi.MultipleTracksResponse;
  },
};
