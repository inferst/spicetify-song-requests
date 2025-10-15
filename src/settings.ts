import { SettingsSection } from "spcr-settings";

export const settings = new SettingsSection(
  "Song Requests",
  "spicetify-song-requests",
);

export function pushSettings(
  onUpdate: () => void,
  onEnableToggle: (value: boolean) => void,
) {
  settings.addInput("twitch-channel", "Twitch Channel", "");
  settings.addInput("twitch-client-id", "Twitch Client Id", "");
  settings.addInput("twitch-access-token", "Twitch Access Token", "");

  settings.addInput("max-tracks", "Maximum tracks", "20");
  settings.addInput("max-user-tracks", "Maximum tracks per user", "5");
  settings.addInput("max-duration", "Maximum duration (min)", "10");

  settings.addInput("skip-votes", "Skip votes", "3");

  settings.addInput("skip-command-alias", "Skip Command Alias", "");
  settings.addInput("skip-command-reward-id", "Skip Command Reward Id", "");

  settings.addToggle("enabled", "Song requests enabled", false, () => {
    const value: boolean = settings.getFieldValue("enabled");
    onEnableToggle(value);
  });

  settings.addButton(
    "song-requests-update",
    "Update Song Requests Settings",
    "Update",
    () => {
      onUpdate();
    },
  );

  settings.pushSettings();
}
