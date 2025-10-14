/**
 * Player stats serializer for MCP tools
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface PlayerStats {
  playerId: string;
  playerName: string;
  number: number;
  gamesPlayed: number;
  goals: number;
  assists: number;
}

let statsCache: PlayerStats[] | null = null;

/**
 * Load player stats from JSON with caching
 */
export function loadStats(): PlayerStats[] {
  if (statsCache) {
    return statsCache;
  }

  const statsPath = join(process.cwd(), 'data', 'player-stats.json');
  const statsData = readFileSync(statsPath, 'utf-8');
  statsCache = JSON.parse(statsData);

  return statsCache!;
}

/**
 * Get stats for a specific player
 */
export function getPlayerStats(playerId: string): PlayerStats | null {
  const stats = loadStats();
  return stats.find(s => s.playerId === playerId) || null;
}

/**
 * Get top scorers
 */
export function getTopScorers(limit: number = 5): PlayerStats[] {
  const stats = loadStats();
  return [...stats]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, limit);
}

/**
 * Get team totals
 */
export function getTeamStats() {
  const stats = loadStats();

  const totals = stats.reduce(
    (acc, player) => ({
      gamesPlayed: Math.max(acc.gamesPlayed, player.gamesPlayed),
      totalGoals: acc.totalGoals + player.goals,
      totalAssists: acc.totalAssists + player.assists,
      activePlayers: player.gamesPlayed > 0 ? acc.activePlayers + 1 : acc.activePlayers
    }),
    { gamesPlayed: 0, totalGoals: 0, totalAssists: 0, activePlayers: 0 }
  );

  return totals;
}

/**
 * Format player stats for tool output
 */
export function serializePlayerStats(playerId: string) {
  const stats = getPlayerStats(playerId);

  if (!stats) {
    return {
      structuredContent: undefined,
      content: `No stats found for player: ${playerId}`
    };
  }

  const goalsPerGame = stats.gamesPlayed > 0
    ? (stats.goals / stats.gamesPlayed).toFixed(2)
    : '0.00';

  const assistsPerGame = stats.gamesPlayed > 0
    ? (stats.assists / stats.gamesPlayed).toFixed(2)
    : '0.00';

  return {
    structuredContent: {
      playerId: stats.playerId,
      playerName: stats.playerName,
      number: stats.number,
      season: '2025 Fall',
      stats: {
        gamesPlayed: stats.gamesPlayed,
        goals: stats.goals,
        assists: stats.assists,
        goalsPerGame: parseFloat(goalsPerGame),
        assistsPerGame: parseFloat(assistsPerGame)
      }
    },
    content: `${stats.playerName} (#${stats.number}): ${stats.gamesPlayed} games, ${stats.goals} goals, ${stats.assists} assists (${goalsPerGame} G/G, ${assistsPerGame} A/G)`
  };
}

/**
 * Format team stats overview
 */
export function serializeTeamStats() {
  const teamStats = getTeamStats();
  const topScorers = getTopScorers(5);

  return {
    structuredContent: {
      season: '2025 Fall',
      totals: teamStats,
      topScorers: topScorers.map(p => ({
        name: p.playerName,
        number: p.number,
        goals: p.goals,
        assists: p.assists
      }))
    },
    content: `Team stats: ${teamStats.totalGoals} goals, ${teamStats.totalAssists} assists in ${teamStats.gamesPlayed} games. Top scorers: ${topScorers.map(p => `${p.playerName} (${p.goals}G)`).join(', ')}.`
  };
}

/**
 * Clear the stats cache
 */
export function clearCache() {
  statsCache = null;
}
