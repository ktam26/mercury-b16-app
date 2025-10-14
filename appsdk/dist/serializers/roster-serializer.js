"use strict";
/**
 * Roster data serializer for MCP tools
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRoster = loadRoster;
exports.getPlayerById = getPlayerById;
exports.serializeRoster = serializeRoster;
exports.serializePlayer = serializePlayer;
exports.clearCache = clearCache;
const fs_1 = require("fs");
const path_1 = require("path");
let rosterCache = null;
/**
 * Load roster from JSON with caching
 */
function loadRoster() {
    if (rosterCache) {
        return rosterCache;
    }
    const rosterPath = (0, path_1.join)(process.cwd(), 'data', 'roster.json');
    const rosterData = (0, fs_1.readFileSync)(rosterPath, 'utf-8');
    rosterCache = JSON.parse(rosterData);
    return rosterCache;
}
/**
 * Get player by ID
 */
function getPlayerById(playerId) {
    const roster = loadRoster();
    return roster.find(p => p.id === playerId) || null;
}
/**
 * Calculate age from birthdate
 */
function calculateAge(birthdate) {
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
function serializeRoster() {
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
function serializePlayer(playerId) {
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
function clearCache() {
    rosterCache = null;
}
