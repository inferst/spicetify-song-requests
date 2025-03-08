import { Track } from "./track";

export type RequestTrack = { id: number; user: string } & Track;

export const allRequests: RequestTrack[] = [];
