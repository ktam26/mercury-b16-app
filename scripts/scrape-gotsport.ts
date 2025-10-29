#!/usr/bin/env tsx
/**
 * GotSport Data Scraper - Enhanced Version
 * Fetches league results and team schedule from GotSport
 * Detects changes and updates local data files
 * AUTO-POPULATES opponent records from standings data
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const RESULTS_URL = 'https://system.gotsport.com/org_event/events/44142/results?group=384051';
const DATA_DIR = join(__dirname, '..', 'data');
const GAMES_FILE = join(DATA_DIR, 'games.json');
const CHANGES_LOG = join(DATA_DIR, 'gotsport-changes.json');
const LEAGUE_SCHEDULE_FILE = join(DATA_DIR, 'league-schedule.json');

interface StandingsEntry {
  position: number;
  team: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface Match {
  matchNumber: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  location: string;
  division: string;
  status?: string;
}

interface ScrapedData {
  timestamp: string;
  standings: StandingsEntry[];
  schedule: Match[];
}

interface OpponentRecentResult {
  date: string;
  opponent: string;
  result: 'W' | 'L' | 'D';
  score: string;
}

interface ExistingGame {
  id: string;
  date: string;
  time: string;
  opponent: string;
  matchNumber?: string;
  opponentRecord?: string;
  opponentRecentResults?: OpponentRecentResult[];
  result?: {
    us: number;
    them: number;
    goalScorers?: string[];
    assists?: string[];
  } | null;
  [key: string]: unknown; // Allow other properties
}

interface ChangeLog {
  timestamp: string;
  changes: string[];
}

async function scrapeStandings(): Promise<StandingsEntry[]> {
  console.log('🔍 Scraping standings...');

  try {
    const response = await axios.get(RESULTS_URL);
    const $ = cheerio.load(response.data);

    const standings: StandingsEntry[] = [];

    // Find the standings table - it's the first table on the page
    $('table').first().find('tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length < 10) return;

      const entry: StandingsEntry = {
        position: parseInt($(cells[0]).text().trim()) || 0,
        team: $(cells[1]).text().trim(),
        matchesPlayed: parseInt($(cells[2]).text().trim()) || 0,
        wins: parseInt($(cells[3]).text().trim()) || 0,
        losses: parseInt($(cells[4]).text().trim()) || 0,
        draws: parseInt($(cells[5]).text().trim()) || 0,
        goalsFor: parseInt($(cells[6]).text().trim()) || 0,
        goalsAgainst: parseInt($(cells[7]).text().trim()) || 0,
        goalDifference: parseInt($(cells[8]).text().trim()) || 0,
        points: parseInt($(cells[9]).text().trim()) || 0,
      };

      standings.push(entry);
    });

    console.log(`✅ Scraped ${standings.length} teams from standings`);
    return standings;

  } catch (error) {
    console.error('❌ Error scraping standings:', error);
    throw error;
  }
}

async function scrapeSchedule(): Promise<Match[]> {
  console.log('📅 Loading full league schedule from static JSON...');

  try {
    if (!existsSync(LEAGUE_SCHEDULE_FILE)) {
      console.log(`⚠️  League schedule file not found at ${LEAGUE_SCHEDULE_FILE}`);
      console.log('ℹ️  Run: gemini "Parse PDF..." gotsport-schedule.pdf > data/league-schedule.json');
      return [];
    }

    const content = readFileSync(LEAGUE_SCHEDULE_FILE, 'utf-8');
    const matches: Match[] = JSON.parse(content);

    console.log(`✅ Loaded ${matches.length} matches from league schedule`);
    return matches;

  } catch (error) {
    console.error('❌ Error loading league schedule:', error);
    throw error;
  }
}

function loadPreviousData(): ScrapedData | null {
  const dataFile = join(DATA_DIR, 'gotsport-data.json');

  if (!existsSync(dataFile)) {
    return null;
  }

  try {
    const content = readFileSync(dataFile, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading previous data:', error);
    return null;
  }
}

function loadExistingGames(): ExistingGame[] {
  if (!existsSync(GAMES_FILE)) {
    console.log('ℹ️  No existing games.json found');
    return [];
  }

  try {
    const content = readFileSync(GAMES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading games.json:', error);
    return [];
  }
}

function normalizeOpponentName(name: string): string {
  // Normalize opponent names for matching
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\b16b\b/gi, '')
    .replace(/\bfc\b/gi, '')
    .replace(/\bacademy\b/gi, '')
    .replace(/\balmaden\s*fc\s*/gi, '')
    .replace(/\bmercury\s*/gi, '')
    .replace(/\bb16\s*/gi, '')
    .replace(/\bblack\s*/gi, '')
    .trim();
}

/**
 * Find opponent team in standings by matching team name
 */
function findOpponentInStandings(opponentName: string, standings: StandingsEntry[]): StandingsEntry | null {
  const normalizedOpponent = normalizeOpponentName(opponentName);
  
  // Try exact match first (case insensitive)
  let match = standings.find(team => {
    const normalizedTeam = normalizeOpponentName(team.team);
    return normalizedTeam === normalizedOpponent;
  });

  // If no exact match, try partial match
  if (!match) {
    match = standings.find(team => {
      const normalizedTeam = normalizeOpponentName(team.team);
      return normalizedTeam.includes(normalizedOpponent) || normalizedOpponent.includes(normalizedTeam);
    });
  }

  return match || null;
}

/**
 * Get opponent's record from standings data
 */
function getOpponentRecord(opponentName: string, standings: StandingsEntry[]): string | null {
  const opponent = findOpponentInStandings(opponentName, standings);
  
  if (!opponent) {
    console.log(`⚠️  Could not find opponent in standings: ${opponentName}`);
    return null;
  }

  // Return W-L-D format
  return `${opponent.wins}-${opponent.losses}-${opponent.draws}`;
}

/**
 * Find opponent's recent matches from the full schedule
 * Note: Currently limited to matches against Mercury since we only have Mercury's schedule
 * This function is prepared for when full league schedule becomes available
 */
function getOpponentRecentResults(
  opponentName: string,
  gameDate: string,
  allMatches: Match[],
  maxResults: number = 3
): OpponentRecentResult[] {
  const results: OpponentRecentResult[] = [];
  const normalizedOpponent = normalizeOpponentName(opponentName);
  
  // Convert game date to Date object for comparison
  const gameDateObj = new Date(gameDate);
  
  // Find all matches involving the opponent BEFORE the Mercury game
  const opponentMatches = allMatches
    .filter(match => {
      // Check if opponent is involved in this match
      const isHome = normalizeOpponentName(match.homeTeam).includes(normalizedOpponent) ||
                     normalizedOpponent.includes(normalizeOpponentName(match.homeTeam));
      const isAway = normalizeOpponentName(match.awayTeam).includes(normalizedOpponent) ||
                     normalizedOpponent.includes(normalizeOpponentName(match.awayTeam));
      
      if (!isHome && !isAway) return false;

      // Only include matches with scores
      if (!match.score || match.score === '-') return false;

      // Convert match date to Date object
      const matchDate = convertGotSportDateToISO(match.date);
      if (!matchDate) return false;
      
      const matchDateObj = new Date(matchDate);
      
      // Only include matches BEFORE the Mercury game
      return matchDateObj < gameDateObj;
    })
    .sort((a, b) => {
      // Sort by date descending (most recent first)
      const dateA = new Date(convertGotSportDateToISO(a.date) || '');
      const dateB = new Date(convertGotSportDateToISO(b.date) || '');
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, maxResults);

  // Convert to OpponentRecentResult format
  opponentMatches.forEach(match => {
    const isHome = normalizeOpponentName(match.homeTeam).includes(normalizedOpponent) ||
                   normalizedOpponent.includes(normalizeOpponentName(match.homeTeam));
    
    const scoreMatch = match.score.match(/(\d+)\s*-\s*(\d+)/);
    if (!scoreMatch) return;

    const homeScore = parseInt(scoreMatch[1]);
    const awayScore = parseInt(scoreMatch[2]);
    
    const opponentScore = isHome ? homeScore : awayScore;
    const otherScore = isHome ? awayScore : homeScore;
    
    let result: 'W' | 'L' | 'D';
    if (opponentScore > otherScore) result = 'W';
    else if (opponentScore < otherScore) result = 'L';
    else result = 'D';

    const otherTeam = isHome ? match.awayTeam : match.homeTeam;
    
    results.push({
      date: convertGotSportDateToISO(match.date) || match.date,
      opponent: simplifyTeamName(otherTeam),
      result,
      score: `${opponentScore}-${otherScore}`
    });
  });

  return results;
}

/**
 * Simplify team name for display (remove common prefixes/suffixes)
 */
function simplifyTeamName(fullName: string): string {
  return fullName
    .replace(/^.*?\s+FC\s+/i, '')
    .replace(/^.*?\s+Soccer Club\s+/i, '')
    .replace(/\s+16B.*$/i, '')
    .replace(/\s+-\s+.*$/i, '')
    .trim();
}

/**
 * Convert GotSport date format to ISO date
 */
function convertGotSportDateToISO(gotSportDate: string): string | null {
  // Format: "Sep 07, 2025" -> "2025-09-07"
  const dateMatch = gotSportDate.match(/(\w+)\s+(\d+),\s+(\d+)/);
  if (!dateMatch) return null;

  const monthMap: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };
  
  const [, month, day, year] = dateMatch;
  return `${year}-${monthMap[month]}-${day.padStart(2, '0')}`;
}

function updateGamesWithScores(
  existingGames: ExistingGame[],
  scrapedMatches: Match[],
  standings: StandingsEntry[]
): {
  games: ExistingGame[];
  updates: string[];
} {
  const updates: string[] = [];
  const updatedGames = [...existingGames];

  scrapedMatches.forEach(match => {
    const isHome = match.homeTeam.includes('Almaden');
    const matchNumber = match.matchNumber?.trim();

    // Try to find matching game in existing games
    const normalizedScrapedOpponent = normalizeOpponentName(
      isHome ? match.awayTeam : match.homeTeam
    );

    // Convert scraped date for matching
    let scrapedDate = '';
    if (match.date) {
      scrapedDate = convertGotSportDateToISO(match.date) || '';
    }

    // Prefer matching by recorded match number
    let gameIndex = -1;
    if (matchNumber) {
      gameIndex = updatedGames.findIndex(game => game.matchNumber === matchNumber);
    }

    // Find matching game by opponent name AND date proximity
    // This prevents matching completed games when there's a rematch
    if (gameIndex === -1) {
      gameIndex = updatedGames.findIndex(game => {
        const normalizedExistingOpponent = normalizeOpponentName(game.opponent);
        const opponentMatches = normalizedExistingOpponent.includes(normalizedScrapedOpponent) ||
                                normalizedScrapedOpponent.includes(normalizedExistingOpponent);

        if (!opponentMatches) return false;

        if (game.matchNumber && matchNumber) {
          return game.matchNumber === matchNumber;
        }

        if (scrapedDate && game.date === scrapedDate) {
          return true;
        }

        // If the game already has a result, only match if dates are close (within 7 days)
        if (game.result && scrapedDate) {
          const existingDate = new Date(game.date);
          const scrapedDateObj = new Date(scrapedDate);
          const daysDiff = Math.abs((existingDate.getTime() - scrapedDateObj.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7; // Only match if within 7 days
        }

        // If no result yet, match by opponent name (it's likely the upcoming game)
        return !game.result;
      });
    }

    if (gameIndex !== -1) {
      const game = updatedGames[gameIndex];
      let updatedGame: ExistingGame = { ...game };
      let hasChanges = false;

      // Store match number for future runs
      if (matchNumber && updatedGame.matchNumber !== matchNumber) {
        updatedGame.matchNumber = matchNumber;
        hasChanges = true;
      }

      // AUTO-POPULATE OPPONENT RECORD from standings
      const opponentRecord = getOpponentRecord(game.opponent, standings);
      if (opponentRecord && updatedGame.opponentRecord !== opponentRecord) {
        const oldRecord = updatedGame.opponentRecord || 'none';
        updatedGame.opponentRecord = opponentRecord;
        updates.push(
          `📊 Opponent record updated for ${game.opponent}: ${oldRecord} → ${opponentRecord}`
        );
        hasChanges = true;
      }

      // AUTO-POPULATE OPPONENT RECENT RESULTS
      // Note: Limited to matches we have in our schedule (matches involving Mercury)
      // When full league schedule is available, this will show all opponent matches
      const opponentRecentResults = getOpponentRecentResults(
        game.opponent,
        game.date,
        scrapedMatches,
        3
      );
      
      // Only update if we have results and they're different
      if (opponentRecentResults.length > 0) {
        const existingResults = updatedGame.opponentRecentResults || [];
        const resultsChanged = JSON.stringify(existingResults) !== JSON.stringify(opponentRecentResults);
        
        if (resultsChanged) {
          updatedGame.opponentRecentResults = opponentRecentResults;
          updates.push(
            `📊 Opponent recent results updated for ${game.opponent} (${opponentRecentResults.length} matches)`
          );
          hasChanges = true;
        }
      }

      const hasRecordedResult =
        typeof updatedGame.result?.us === 'number' && typeof updatedGame.result?.them === 'number';

      if (hasRecordedResult) {
        if (hasChanges) {
          updatedGames[gameIndex] = updatedGame;
        }
        return;
      }

      // Convert scraped time format "2:15 PM PDT" to "2:15 PM"
      const scrapedTime = match.time ? match.time.replace(/\s+(PDT|PST)$/, '') : '';

      // Check for date/time changes
      if (scrapedDate && scrapedDate !== game.date) {
        updates.push(
          `⚽ ${game.opponent} rescheduled: ${game.date} → ${scrapedDate}`
        );
        updatedGame = {
          ...updatedGame,
          date: scrapedDate,
        };
        hasChanges = true;
      }

      if (scrapedTime && scrapedTime !== game.time) {
        updates.push(
          `⚽ ${game.opponent} time changed: ${game.time} → ${scrapedTime}`
        );
        updatedGame = {
          ...updatedGame,
          time: scrapedTime,
        };
        hasChanges = true;
      }

      // Update score if available
      if (match.score !== '-' && match.score) {
        const scoreMatch = match.score.match(/(\d+)\s*-\s*(\d+)/);
        if (scoreMatch) {
          const mercuryScore = isHome ? parseInt(scoreMatch[1]) : parseInt(scoreMatch[2]);
          const opponentScore = isHome ? parseInt(scoreMatch[2]) : parseInt(scoreMatch[1]);

          // Only update if result doesn't exist or has changed
          if (!game.result || game.result.us !== mercuryScore || game.result.them !== opponentScore) {
            const oldResult = game.result ? `${game.result.us}-${game.result.them}` : 'no result';

            // Preserve goal scorers and assists if they exist
            updatedGame = {
              ...updatedGame,
              result: {
                us: mercuryScore,
                them: opponentScore,
                goalScorers: game.result?.goalScorers || [],
                assists: game.result?.assists || [],
              },
            };

            updates.push(
              `⚽ Score updated for ${game.opponent}: ${oldResult} → ${mercuryScore}-${opponentScore}`
            );
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        updatedGames[gameIndex] = updatedGame;
      }
    }
  });

  return { games: updatedGames, updates };
}

function detectChanges(previous: ScrapedData | null, current: ScrapedData): string[] {
  const changes: string[] = [];

  if (!previous) {
    changes.push('Initial data capture');
    return changes;
  }

  // Check standings changes
  const prevStandings = previous.standings;
  const currStandings = current.standings;

  // Find our team's position for special highlighting
  const ourTeam = 'Almaden FC Almaden FC Mercury B16 Black';

  currStandings.forEach((curr) => {
    const prev = prevStandings.find(p => p.team === curr.team);

    if (!prev) {
      changes.push(`New team added: ${curr.team}`);
      return;
    }

    if (prev.position !== curr.position) {
      const emoji = curr.team === ourTeam ? '⚽ ' : '';
      changes.push(`${emoji}${curr.team} moved from position ${prev.position} to ${curr.position}`);
    }

    if (prev.points !== curr.points) {
      const emoji = curr.team === ourTeam ? '⚽ ' : '';
      changes.push(`${emoji}${curr.team} points changed: ${prev.points} → ${curr.points}`);
    }

    if (prev.wins !== curr.wins || prev.losses !== curr.losses || prev.draws !== curr.draws) {
      const emoji = curr.team === ourTeam ? '⚽ ' : '';
      changes.push(`${emoji}${curr.team} record updated: ${curr.wins}W-${curr.losses}L-${curr.draws}D (was ${prev.wins}W-${prev.losses}L-${prev.draws}D)`);
    }
  });

  // Check schedule changes
  const prevSchedule = previous.schedule;
  const currSchedule = current.schedule;

  currSchedule.forEach(curr => {
    const prev = prevSchedule.find(p => p.matchNumber === curr.matchNumber);

    if (!prev) {
      changes.push(`⚽ New match scheduled: ${curr.homeTeam} vs ${curr.awayTeam} on ${curr.date}`);
      return;
    }

    if (prev.score !== curr.score && curr.score !== '-') {
      changes.push(`⚽ Score updated for match ${curr.matchNumber}: ${curr.homeTeam} ${curr.score} ${curr.awayTeam}`);
    }

    if (prev.date !== curr.date || prev.time !== curr.time) {
      changes.push(`⚽ Match ${curr.matchNumber} rescheduled: ${prev.date} ${prev.time} → ${curr.date} ${curr.time}`);
    }

    if (prev.location !== curr.location) {
      changes.push(`⚽ Match ${curr.matchNumber} location changed: ${prev.location} → ${curr.location}`);
    }

    if (prev.status !== curr.status && curr.status) {
      changes.push(`⚽ Match ${curr.matchNumber} status: ${curr.status}`);
    }
  });

  return changes;
}

function logChanges(changes: string[]) {
  if (changes.length === 0) {
    console.log('✅ No changes detected');
    return;
  }

  console.log(`\n📝 Detected ${changes.length} change${changes.length > 1 ? 's' : ''}:`);
  changes.forEach(change => console.log(`  - ${change}`));

  // Load existing change log
  let changeLog: ChangeLog[] = [];
  if (existsSync(CHANGES_LOG)) {
    try {
      const content = readFileSync(CHANGES_LOG, 'utf-8');
      changeLog = JSON.parse(content);
    } catch (error) {
      console.error('Error loading change log:', error);
    }
  }

  // Add new changes
  changeLog.push({
    timestamp: new Date().toISOString(),
    changes,
  });

  // Keep only last 100 change entries
  if (changeLog.length > 100) {
    changeLog = changeLog.slice(-100);
  }

  // Save change log
  writeFileSync(CHANGES_LOG, JSON.stringify(changeLog, null, 2));
  console.log(`\n💾 Changes logged to ${CHANGES_LOG}`);
}

async function main() {
  console.log('🚀 Starting GotSport scraper (Enhanced with auto opponent data)...\n');

  try {
    // Scrape current data
    const [standings, schedule] = await Promise.all([
      scrapeStandings(),
      scrapeSchedule(),
    ]);

    const currentData: ScrapedData = {
      timestamp: new Date().toISOString(),
      standings,
      schedule,
    };

    // Load previous scraped data for change detection
    const previousData = loadPreviousData();

    // Detect changes in scraped data
    const scrapedChanges = detectChanges(previousData, currentData);

    // Load and update games.json with new scores AND opponent data
    console.log('\n🔄 Updating games.json with scores and opponent data...');
    const existingGames = loadExistingGames();
    const { games: updatedGames, updates: gameUpdates } = updateGamesWithScores(
      existingGames,
      schedule,
      standings
    );

    // Combine all changes
    const allChanges = [...scrapedChanges, ...gameUpdates];

    // Log changes
    logChanges(allChanges);

    // Save updated games.json (only if there were updates)
    if (gameUpdates.length > 0) {
      writeFileSync(GAMES_FILE, JSON.stringify(updatedGames, null, 2));
      console.log(`\n💾 Updated games.json with ${gameUpdates.length} change(s)`);
    } else {
      console.log('\n✅ No updates needed for games.json');
    }

    // Save scraped data for future comparison
    const dataFile = join(DATA_DIR, 'gotsport-data.json');
    writeFileSync(dataFile, JSON.stringify(currentData, null, 2));
    console.log(`💾 Scraped data saved to ${dataFile}`);

    console.log('\n✅ Scraping completed successfully!');
    console.log('\nℹ️  Note: Opponent recent results are limited to matches in our schedule.');
    console.log('   For full opponent match history, the league-wide schedule would be needed.');

  } catch (error) {
    console.error('\n❌ Scraping failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main, scrapeStandings, scrapeSchedule };
