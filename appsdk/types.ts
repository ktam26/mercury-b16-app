/**
 * Shared TypeScript types for the Apps SDK integration
 */

export interface Game {
  id: string;
  date: string;
  time: string;
  opponent: string;
  mercuryRecord: string;
  opponentRecord: string;
  location: {
    name: string;
    field: string;
    address: string;
    googleMapsUrl: string;
    embedUrl: string;
  };
  homeAway: 'home' | 'away';
  jersey: string;
  socks: string;
  result: {
    us: number;
    them: number;
    goalScorers: string[];
    assists: string[];
  } | null;
  teamLogos: {
    home: string;
    away: string;
  };
  weatherUrl: string;
  gotsportUrl: string;
  photoAlbumUrl: string | null;
  mercuryRecentResults: Array<{
    date: string;
    opponent: string;
    score: string;
    result: 'W' | 'L' | 'D';
  }>;
  opponentRecentResults: Array<{
    date: string;
    opponent: string;
    score: string;
    result: 'W' | 'L' | 'D';
  }>;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  grade: string;
  height: string;
  school: string;
  bio: string;
  imageUrl?: string;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  season: string;
  games: number;
  goals: number;
  assists: number;
  minutesPlayed: number;
  recentHighlights: string[];
}

export interface TeamInfo {
  name: string;
  season: string;
  coach: string;
  record: string;
  league: string;
  division: string;
}

export interface ToolMetadata {
  'openai/outputTemplate': {
    type: 'text/html+skybridge';
    uri: string;
  };
}
