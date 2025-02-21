import { SettingsSection } from "spcr-settings";
import { start } from "./client";

export const settings = new SettingsSection(
  "Song Requests",
  "spicetify-song-requests",
);

export function pushSettings() {
  settings.addInput("max-tracks", "Maximum tracks", "20");
  settings.addInput("twitch-channel", "Twitch Channel", "");
  settings.addInput("twitch-client-id", "Twitch Client Id", "");
  settings.addInput("twitch-access-token", "Twitch Access Token", "");

  settings.addButton(
    "song-requests-update",
    "Update Song Requests Settings",
    "Update",
    () => {
      start();
    },
  );

  settings.pushSettings();
}
