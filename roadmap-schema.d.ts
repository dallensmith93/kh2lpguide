/** Canonical data contract for the two additional roadmaps. */
export type RoadmapGameId = 'ff9' | 'spiderman-ctns';
export type GameId = 'kh2fm' | RoadmapGameId;
export interface Episode {
  episodeNumber: number;
  gameId: RoadmapGameId;
  suggestedTitle: string;
  arcOrAct: string;
  location: string;
  storyBeats: string[];
  keyEncountersOrActivities: string[];
  stoppingPoint: string;
}
export interface RecordingEpisode extends Episode {
  /** Editorial estimates in minutes, not measured playthrough times. */
  estimatedMinutes: [number, number];
  runtimeNote?: string;
}
