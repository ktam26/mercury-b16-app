/**
 * Roster data serializer for MCP tools
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface RosterPlayer {
  id: string;
  number: number;
  firstName: string;
  lastName: string;
  fullName: string;
  birthdate: string;
  usClubId: string;
}

let rosterCache: RosterPlayer[] | null = null;

/**
 * Load roster from JSON with caching
 */
export function loadRoster(): RosterPlayer[] {
  if (rosterCache) {
    return rosterCache;
  }

  const rosterPath = join(process.cwd(), 'data', 'roster.json');
  const rosterData = readFileSync(rosterPath, 'utf-8');
  rosterCache = JSON.parse(rosterData);

  return rosterCache!;
}

/**
 * Get player by ID
 */
export function getPlayerById(playerId: string): RosterPlayer | null {
  const roster = loadRoster();
  return roster.find(p => p.id === playerId) || null;
}

/**
 * Calculate age from birthdate
 */
function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Format roster for tool output
 */
export function serializeRoster() {
  const roster = loadRoster();

  const players = roster.map(player => ({
    id: player.id,
    name: player.fullName,
    number: player.number,
    age: calculateAge(player.birthdate),
    jerseyNumber: player.number
  })).sort((a, b) => a.number - b.number);

  return {
    structuredContent: {
      players,
      totalPlayers: players.length
    },
    content: `Roster: ${players.length} players. ${players.map(p => `#${p.number} ${p.name}`).join(', ')}.`
  };
}

/**
 * Format individual player info
 */
export function serializePlayer(playerId: string) {
  const player = getPlayerById(playerId);

  if (!player) {
    return {
      structuredContent: null,
      content: `Player not found: ${playerId}`
    };
  }

  return {
    structuredContent: {
      id: player.id,
      name: player.fullName,
      number: player.number,
      age: calculateAge(player.birthdate),
      birthdate: player.birthdate
    },
    content: `${player.fullName} (#${player.number}), age ${calculateAge(player.birthdate)}`
  };
}

/**
 * Clear the roster cache
 */
export function clearCache() {
  rosterCache = null;
}
