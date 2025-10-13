import { NextResponse } from 'next/server';
import gamesData from '@/data/games.json';
import teamInfo from '@/data/team-info.json';
import { sanitizeTeamInfo } from '@/lib/sanitize';

/**
 * GET /api/team
 *
 * Returns team information and season statistics (sanitized)
 *
 * Response includes:
 * - Team name, age group, colors
 * - Public links (GotSport)
 * - Season record (W-L-T)
 * - Goals for/against
 * - Recent form (last 5 games)
 *
 * Examples:
 * - GET /api/team
 */
export async function GET(request) {
  try {
    // Sanitize team info (removes any contact details)
    const sanitizedTeamInfo = sanitizeTeamInfo(teamInfo);

    // Calculate season statistics from games data
    const pastGames = gamesData.filter((g) => g.result);

    const wins = pastGames.filter((g) => g.result.us > g.result.them).length;
    const losses = pastGames.filter((g) => g.result.us < g.result.them).length;
    const ties = pastGames.filter((g) => g.result.us === g.result.them).length;

    const totalGoalsFor = pastGames.reduce((sum, g) => sum + g.result.us, 0);
    const totalGoalsAgainst = pastGames.reduce((sum, g) => sum + g.result.them, 0);
    const goalDiff = totalGoalsFor - totalGoalsAgainst;

    // Calculate recent form (last 5 games)
    const recentGames = pastGames.slice(-5).map((game) => {
      const isWin = game.result.us > game.result.them;
      const isLoss = game.result.us < game.result.them;
      return {
        date: game.date,
        opponent: game.opponent,
        score: `${game.result.us}-${game.result.them}`,
        result: isWin ? 'W' : isLoss ? 'L' : 'T',
      };
    });

    // Get next game info
    const now = new Date();
    const upcomingGames = gamesData.filter((game) => {
      const gameDate = new Date(game.date);
      return gameDate >= now;
    });
    upcomingGames.sort((a, b) => new Date(a.date) - new Date(b.date));
    const nextGame = upcomingGames[0] || null;

    const nextGameInfo = nextGame
      ? {
          id: nextGame.id,
          date: nextGame.date,
          time: nextGame.time,
          opponent: nextGame.opponent,
          location: nextGame.location.name,
          homeAway: nextGame.homeAway,
        }
      : null;

    return NextResponse.json({
      success: true,
      team: sanitizedTeamInfo,
      seasonStats: {
        record: {
          wins,
          losses,
          ties,
          gamesPlayed: pastGames.length,
          winPercentage: pastGames.length > 0 ? Math.round((wins / pastGames.length) * 100) : 0,
        },
        goals: {
          for: totalGoalsFor,
          against: totalGoalsAgainst,
          differential: goalDiff,
          avgPerGame: pastGames.length > 0 ? (totalGoalsFor / pastGames.length).toFixed(1) : 0,
        },
        recentForm: recentGames,
      },
      nextGame: nextGameInfo,
    });
  } catch (error) {
    console.error('Error in /api/team:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch team data',
      },
      { status: 500 }
    );
  }
}
