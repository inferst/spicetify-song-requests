import { Track } from "./track";

export type QueueTrack = { id: number; user: string } & Track;

export const chatterQueue: QueueTrack[] = [];
