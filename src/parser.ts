export function parseYoutubeURL(url: string) {
  const regex = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/,
  ];

  for (let pattern of regex) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export function parseSpotifyURL(url: string) {
  const regex = [
    /(?:https?:\/\/)?(?:open\.spotify\.com\/track\/|spotify:track:)([a-zA-Z0-9]+)/,
  ];

  for (let pattern of regex) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
