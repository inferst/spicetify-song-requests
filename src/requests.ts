import { Track } from "./track";

export type RequestTrack = { id: string; user: string } & Track;

export const allRequests: RequestTrack[] = [];
