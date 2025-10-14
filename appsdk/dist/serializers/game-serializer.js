"use strict";
/**
 * Game data serializer for MCP tools
 * Reuses existing game-utils functions for consistency
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGames = loadGames;
exports.getNextGame = getNextGame;
exports.getUpcomingGames = getUpcomingGames;
exports.getPastGames = getPastGames;
exports.getAllGames = getAllGames;
exports.serializeNextMatch = serializeNextMatch;
exports.serializeSchedule = serializeSchedule;
exports.clearCache = clearCache;
const fs_1 = require("fs");
const path_1 = require("path");
// Import game utilities (will need to handle JS imports)
const gameUtils = require((0, path_1.join)(process.cwd(), 'lib', 'game-utils.js'));
let gamesCache = null;
/**
 * Load games from JSON with caching
 */
function loadGames() {
    if (gamesCache) {
        return gamesCache;
    }
    const gamesPath = (0, path_1.join)(process.cwd(), 'data', 'games.json');
    const gamesData = (0, fs_1.readFileSync)(gamesPath, 'utf-8');
    gamesCache = JSON.parse(gamesData);
    return gamesCache;
}
/**
 * Get the next upcoming game
 */
function getNextGame() {
    const games = loadGames();
    const nextGame = gameUtils.getNextGame(games);
    return nextGame || null;
}
/**
 * Get upcoming games with optional limit
 */
function getUpcomingGames(limit = 5) {
    const games = loadGames();
    return gameUtils.getUpcomingGames(games, limit);
}
/**
 * Get past games
 */
function getPastGames() {
    const games = loadGames();
    return gameUtils.getPastGames(games);
}
/**
 * Get all games (past and future)
 */
function getAllGames() {
    return loadGames();
}
/**
 * Format game for "next match" tool output
 */
function serializeNextMatch(game) {
    const timeUntil = gameUtils.getTimeUntilGame(game);
    const arrivalTime = gameUtils.getArrivalTime(game.time);
    const formattedDate = gameUtils.formatGameDateLong(game.date);
    return {
        structuredContent: {
            id: game.id,
            opponent: game.opponent,
            date: formattedDate,
            time: game.time,
            arrivalTime,
            location: {
                name: game.location.name,
                field: game.location.field,
                address: game.location.address,
                mapsUrl: game.location.googleMapsUrl
            },
            homeAway: game.homeAway,
            jersey: game.jersey,
            socks: game.socks,
            countdown: timeUntil ? {
                days: timeUntil.days,
                hours: timeUntil.hours,
                minutes: timeUntil.minutes
            } : null,
            teamLogos: game.teamLogos,
            records: {
                mercury: game.mercuryRecord,
                opponent: game.opponentRecord
            }
        },
        content: `Next match: ${game.opponent} on ${formattedDate} at ${game.time}. Location: ${game.location.name}, ${game.location.address}. ${game.homeAway === 'home' ? 'Home' : 'Away'} game - wear ${game.jersey} jersey.${timeUntil ? ` Game in ${timeUntil.days}d ${timeUntil.hours}h ${timeUntil.minutes}m.` : ''}`
    };
}
/**
 * Format games list for "schedule" tool output
 */
function serializeSchedule(options = {}) {
    const { includePast = true, upcomingLimit = 10, pastLimit = 5 } = options;
    const upcoming = getUpcomingGames(upcomingLimit);
    const pastGames = includePast ? getPastGames().slice(0, pastLimit) : [];
    const orderedPast = includePast ? [...pastGames].reverse() : [];
    const gamesList = [...orderedPast, ...upcoming].map(game => {
        const formattedDate = gameUtils.formatGameDate(game.date);
        const isPast = game.result !== null;
        return {
            id: game.id,
            opponent: game.opponent,
            date: formattedDate,
            time: game.time,
            location: game.location.name,
            homeAway: game.homeAway,
            result: game.result
                ? {
                    us: game.result.us,
                    them: game.result.them,
                    outcome: game.result.us > game.result.them ? 'W' :
                        game.result.us < game.result.them ? 'L' : 'D'
                }
                : null,
            isPast
        };
    });
    const upcomingCount = upcoming.length;
    const pastCount = includePast ? pastGames.length : 0;
    const latestRecord = pastGames[0]?.mercuryRecord ?? '0-0-0';
    return {
        structuredContent: {
            games: gamesList,
            teamRecord: latestRecord
        },
        content: `Schedule: ${gamesList.length} games (${pastCount} completed, ${upcomingCount} upcoming). Current record: ${latestRecord}.`
    };
}
/**
 * Clear the games cache (useful for testing or reloads)
 */
function clearCache() {
    gamesCache = null;
}
