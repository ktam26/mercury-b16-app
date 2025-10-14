"use strict";
/**
 * Player stats serializer for MCP tools
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadStats = loadStats;
exports.getPlayerStats = getPlayerStats;
exports.getTopScorers = getTopScorers;
exports.getTeamStats = getTeamStats;
exports.serializePlayerStats = serializePlayerStats;
exports.serializeTeamStats = serializeTeamStats;
exports.clearCache = clearCache;
const fs_1 = require("fs");
const path_1 = require("path");
let statsCache = null;
/**
 * Load player stats from JSON with caching
 */
function loadStats() {
    if (statsCache) {
        return statsCache;
    }
    const statsPath = (0, path_1.join)(process.cwd(), 'data', 'player-stats.json');
    const statsData = (0, fs_1.readFileSync)(statsPath, 'utf-8');
    statsCache = JSON.parse(statsData);
    return statsCache;
}
/**
 * Get stats for a specific player
 */
function getPlayerStats(playerId) {
    const stats = loadStats();
    return stats.find(s => s.playerId === playerId) || null;
}
/**
 * Get top scorers
 */
function getTopScorers(limit = 5) {
    const stats = loadStats();
    return [...stats]
        .sort((a, b) => b.goals - a.goals)
        .slice(0, limit);
}
/**
 * Get team totals
 */
function getTeamStats() {
    const stats = loadStats();
    const totals = stats.reduce((acc, player) => ({
        gamesPlayed: Math.max(acc.gamesPlayed, player.gamesPlayed),
        totalGoals: acc.totalGoals + player.goals,
        totalAssists: acc.totalAssists + player.assists,
        activePlayers: player.gamesPlayed > 0 ? acc.activePlayers + 1 : acc.activePlayers
    }), { gamesPlayed: 0, totalGoals: 0, totalAssists: 0, activePlayers: 0 });
    return totals;
}
/**
 * Format player stats for tool output
 */
function serializePlayerStats(playerId) {
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
function serializeTeamStats() {
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
function clearCache() {
    statsCache = null;
}
