import "spotify-web-api-js";
import { Track } from "../track";

const definitionSearchTracks = {
  name: "searchTracks",
  operation: "query",
  sha256Hash:
    "bc1ca2fcd0ba1013a0fc88e6cc4f190af501851e3dafd3e1ef85840297694428",
  value: null,
};

const definitionDecorateTracks = {
  name: "decorateContextTracks",
  operation: "query",
  sha256Hash:
    "4210a7207beed5259945560dbeeb0bd55d709ce25de5f28021e1393b6af59121",
  value: null,
};

export function trackTitle(name: string, artist: string): string {
  return `"${name} - ${artist}"`;
}

export function formatSearchResponse(
  searchGraphQLResponse: any,
): Track[] | undefined {
  const items: undefined | { item: any }[] =
    searchGraphQLResponse?.data?.searchV2?.tracksV2?.items;

  return items?.map(({ item }) => {
    return formatTrack(item.data);
  });
}

export function formatDecorateResponse(
  decorateGraphQLResponse: any,
): Track[] | undefined {
  const items: undefined | any[] = decorateGraphQLResponse?.data?.tracks;

  return items?.map((track) => {
    return formatTrack(track);
  });
}

export function formatTrack(graphQLTrack: any): Track {
  const name = graphQLTrack.name;
  const artists = graphQLTrack.artists.items
    .map((artist: any) => artist.profile.name)
    .join(" ");
  const duration = graphQLTrack.duration.totalMilliseconds;

  return {
    uri: graphQLTrack.uri,
    title: trackTitle(name, artists),
    duration,
  };
}

export const spotifyApi = {
  searchTracks: async (query: string): Promise<Track[] | undefined> => {
    const response = await Spicetify.GraphQL.Request(
      Spicetify.GraphQL.Definitions.searchTracks ?? definitionSearchTracks,
      {
        searchTerm: query,
        limit: 10,
        includeAudiobooks: false,
        includeAuthors: false,
        includePreReleases: false,
      },
    );

    return formatSearchResponse(response);
  },
  getTracks: async (trackIds: string[]): Promise<Track[] | undefined> => {
    const response = await Spicetify.GraphQL.Request(
      Spicetify.GraphQL.Definitions.decorateContextTracks ??
        definitionDecorateTracks,
      { uris: trackIds.map((id) => `spotify:track:${id}`) },
    );

    return formatDecorateResponse(response);
  },
};
