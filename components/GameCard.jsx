'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Navigation, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatGameDate, getShortTeamName } from '@/lib/game-utils';
import { cn } from '@/lib/utils';
import teamInfo from '@/data/team-info.json';

const DEFAULT_LOGO = '/images/logos/default.png';

function GameCardComponent({ game }) {
  const [logoError, setLogoError] = useState({ home: false, away: false });
  const isPast = game.result !== null;
  const isWin = isPast && game.result.us > game.result.them;
  const isLoss = isPast && game.result.us < game.result.them;
  const isTie = isPast && game.result.us === game.result.them;
  const homeShortName = getShortTeamName(teamInfo.name);
  const opponentShortName = getShortTeamName(game.opponent);

  return (
    <Card className={cn(
      "mb-3 transition-all duration-200 hover:shadow-md border",
      isPast ? "bg-gray-50/50" : "bg-white",
      "card-press"
    )}>
      <CardContent className="pt-4 relative">
        {/* Result Badge for Past Games */}
        {isPast && (
          <div className={cn(
            "absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold",
            isWin && "bg-green-100 text-green-800",
            isLoss && "bg-red-100 text-red-800",
            isTie && "bg-gray-100 text-gray-700"
          )}>
            {isWin && "WIN"}
            {isLoss && "LOSS"}
            {isTie && "TIE"}
          </div>
        )}

        {/* Date/Time Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <Badge variant="secondary" className="mb-1 text-xs px-2 py-0.5">
              {formatGameDate(game.date)}
            </Badge>
            <p className="text-lg font-bold text-gray-900">{game.time}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {!isPast && (
              <Badge className={cn(
                "px-2.5 py-0.5 text-xs font-semibold",
                game.homeAway === 'home'
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              )}>
                {game.homeAway === 'home' ? 'HOME' : 'AWAY'}
              </Badge>
            )}
          </div>
        </div>

        {/* Enhanced Team Matchup */}
        <div className="mb-4 bg-gradient-to-r from-gray-50 to-white rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            {/* Home Team */}
            <div className="flex-1 text-center">
              <div className="relative w-12 h-12 mx-auto mb-2 bg-white rounded-full p-1.5 shadow-sm">
                <Image
                  src={logoError.home
                    ? DEFAULT_LOGO
                    : (game.teamLogos?.[game.homeAway === 'home' ? 'home' : 'away'] || DEFAULT_LOGO)
                  }
                  alt="Almaden Mercury Black B16"
                  fill
                  sizes="48px"
                  className="object-contain"
                  onError={() => setLogoError(prev => ({ ...prev, home: true }))}
                />
              </div>
              <p className="text-xs font-semibold text-gray-700 line-clamp-1">{homeShortName}</p>
            </div>

            {/* VS or Score */}
            <div className="px-3">
              {isPast && game.result ? (
                <div className="text-center">
                  <p className={cn(
                    "text-2xl font-bold",
                    isWin && 'text-green-600',
                    isLoss && 'text-red-600',
                    isTie && 'text-gray-600'
                  )}>
                    {game.result.us} - {game.result.them}
                  </p>
                  {isWin && (
                    <Trophy className="w-4 h-4 text-yellow-500 mx-auto mt-1" />
                  )}
                </div>
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-500">VS</span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 text-center">
              <div className="relative w-12 h-12 mx-auto mb-2 bg-white rounded-full p-1.5 shadow-sm">
                <Image
                  src={logoError.away
                    ? DEFAULT_LOGO
                    : (game.teamLogos?.[game.homeAway === 'home' ? 'away' : 'home'] || DEFAULT_LOGO)
                  }
                  alt={game.opponent}
                  fill
                  sizes="48px"
                  className="object-contain"
                  onError={() => setLogoError(prev => ({ ...prev, away: true }))}
                />
              </div>
              <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                {opponentShortName}
              </p>
            </div>
          </div>
        </div>

        {/* Jersey & Location Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs">
            <div className={cn(
              "w-4 h-4 rounded-full",
              game.jersey === 'white'
                ? 'bg-white border-2 border-gray-400'
                : 'bg-black'
            )} />
            <span className="font-medium text-gray-700">
              {game.jersey.charAt(0).toUpperCase() + game.jersey.slice(1)} / {game.socks.charAt(0).toUpperCase() + game.socks.slice(1)}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs">
            <MapPin className="w-3.5 h-3.5 text-gray-600" />
            <span className="font-medium text-gray-700">{game.location.name}</span>
          </div>
        </div>

        {/* Actions Enhanced */}
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-primary-green hover:bg-primary-green-dark font-semibold transition-all"
            asChild
          >
            <Link href={`/game/${game.id}`}>
              View Details
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="min-w-touch border-gray-300 hover:border-primary-green hover:bg-primary-green/5"
            asChild
          >
            <a
              href={game.location.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get directions"
            >
              <Navigation className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const GameCard = memo(GameCardComponent, (prevProps, nextProps) => {
  // Only re-render if the game data actually changed
  return prevProps.game.id === nextProps.game.id &&
         JSON.stringify(prevProps.game) === JSON.stringify(nextProps.game);
});
