import { NextResponse } from 'next/server';
import gamesData from '@/data/games.json';
import { sanitizeGame } from '@/lib/sanitize';

/**
 * GET /api/games/[id]
 *
 * Returns a single game by ID (sanitized)
 *
 * Examples:
 * - GET /api/games/game-001
 * - GET /api/games/game-002
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Find the game by ID
    const game = gamesData.find((g) => g.id === id);

    if (!game) {
      return NextResponse.json(
        {
          success: false,
          error: 'Game not found',
        },
        { status: 404 }
      );
    }

    // Sanitize the game data
    const sanitizedGame = sanitizeGame(game);

    return NextResponse.json({
      success: true,
      game: sanitizedGame,
    });
  } catch (error) {
    console.error(`Error in /api/games/[id]:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch game data',
      },
      { status: 500 }
    );
  }
}
