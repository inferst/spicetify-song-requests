export async function getYoutubeTitle(url: string): Promise<string | null> {
  try {
    const video = await fetch(
      `https://www.youtube.com/oembed?url=${url}&format=json`,
    ).then((data) => data.json());

    if (video["title"]) {
      return video["title"];
    }
  } catch (e) {
    console.error(e);
  }

  return null;
}
