import { SettingsSection } from "spcr-settings";
import { start } from "./client";

export const settings = new SettingsSection(
  "Song Requests",
  "spicetify-song-requests",
);

export function pushSettings() {
  settings.addInput("twitch-channel", "Twitch Channel", "");
  settings.addInput("client-id", "Client Id", "");
  settings.addInput("access-token", "Access Token", "");

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
