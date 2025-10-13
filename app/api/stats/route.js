import { NextResponse } from 'next/server';
import playerStatsData from '@/data/player-stats.json';
import { sanitizePlayerStats } from '@/lib/sanitize';

/**
 * GET /api/stats
 *
 * Returns player statistics (SANITIZED - no birthdates or IDs)
 *
 * Query parameters:
 * - sort: "goals" | "assists" | "name" (default: "goals")
 * - order: "asc" | "desc" (default: "desc")
 *
 * SECURITY NOTE:
 * This endpoint deliberately EXCLUDES:
 * - Player birthdates
 * - US Club Soccer IDs
 * - Contact information
 * - Addresses
 *
 * Only includes PUBLIC performance data:
 * - Player names (already public in game reports)
 * - Goals scored
 * - Assists
 * - Games played
 *
 * Examples:
 * - GET /api/stats - Returns all player stats sorted by goals (desc)
 * - GET /api/stats?sort=assists - Sorted by assists
 * - GET /api/stats?sort=name&order=asc - Sorted alphabetically
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'goals';
    const order = searchParams.get('order') || 'desc';

    // CRITICAL: Sanitize player stats to remove birthdates and IDs
    let sanitizedStats = sanitizePlayerStats(playerStatsData);

    // Sort based on query parameters
    sanitizedStats.sort((a, b) => {
      let comparison = 0;

      switch (sort) {
        case 'goals':
          comparison = a.goals - b.goals;
          break;
        case 'assists':
          comparison = a.assists - b.assists;
          break;
        case 'name':
          comparison = a.playerName.localeCompare(b.playerName);
          break;
        default:
          comparison = a.goals - b.goals;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    // Calculate team totals
    const totalGoals = sanitizedStats.reduce((sum, p) => sum + p.goals, 0);
    const totalAssists = sanitizedStats.reduce((sum, p) => sum + p.assists, 0);

    // Get top performers
    const topScorer = sanitizedStats.reduce((max, p) => (p.goals > max.goals ? p : max), sanitizedStats[0]);
    const topAssister = sanitizedStats.reduce((max, p) => (p.assists > max.assists ? p : max), sanitizedStats[0]);

    return NextResponse.json({
      success: true,
      security: {
        note: 'All player birthdates and IDs have been excluded for privacy',
        dataIncluded: ['playerName', 'goals', 'assists', 'gamesPlayed'],
        dataExcluded: ['birthdate', 'usClubId', 'contactInfo', 'addresses'],
      },
      count: sanitizedStats.length,
      teamTotals: {
        goals: totalGoals,
        assists: totalAssists,
      },
      topPerformers: {
        topScorer: {
          name: topScorer?.playerName,
          goals: topScorer?.goals || 0,
        },
        topAssister: {
          name: topAssister?.playerName,
          assists: topAssister?.assists || 0,
        },
      },
      players: sanitizedStats,
    });
  } catch (error) {
    console.error('Error in /api/stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch player stats',
      },
      { status: 500 }
    );
  }
}
