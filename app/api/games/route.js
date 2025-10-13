import { NextResponse } from 'next/server';
import gamesData from '@/data/games.json';
import { sanitizeGames } from '@/lib/sanitize';

/**
 * GET /api/games
 *
 * Returns all games data (sanitized)
 *
 * Query parameters:
 * - filter: "upcoming" | "past" | "all" (default: "all")
 *
 * Examples:
 * - GET /api/games - Returns all games
 * - GET /api/games?filter=upcoming - Returns only upcoming games
 * - GET /api/games?filter=past - Returns only past games
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    // Sanitize all games data first
    const sanitizedGames = sanitizeGames(gamesData);

    let filteredGames = sanitizedGames;

    // Apply filter if requested
    if (filter === 'upcoming') {
      const now = new Date();
      filteredGames = sanitizedGames.filter((game) => {
        const gameDate = new Date(game.date);
        return gameDate >= now;
      });
    } else if (filter === 'past') {
      const now = new Date();
      filteredGames = sanitizedGames.filter((game) => {
        const gameDate = new Date(game.date);
        return gameDate < now;
      });
    }

    return NextResponse.json({
      success: true,
      count: filteredGames.length,
      filter: filter,
      games: filteredGames,
    });
  } catch (error) {
    console.error('Error in /api/games:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch games data',
      },
      { status: 500 }
    );
  }
}
