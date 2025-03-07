import { Track } from "./track";

export type QueueTrack = { id: number } & Track;

export type ChatterQueue = {
  [key: string]: QueueTrack[];
};

export const chatterQueue: ChatterQueue = {};
