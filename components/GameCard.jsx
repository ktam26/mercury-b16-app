'use client';

import Link from 'next/link';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatGameDate } from '@/lib/game-utils';
import { cn } from '@/lib/utils';

export function GameCard({ game }) {
  const isPast = game.result !== null;
  const isWin = isPast && game.result.us > game.result.them;
  const isLoss = isPast && game.result.us < game.result.them;
  const isTie = isPast && game.result.us === game.result.them;

  return (
    <Card className="mb-3 active:scale-[0.98] transition-transform">
      <CardContent className="pt-4">
        {/* Date/Time Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {formatGameDate(game.date)}
            </p>
            <p className="text-lg font-bold">{game.time}</p>
          </div>
          {game.homeAway === 'home' ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Home
            </Badge>
          ) : (
            <Badge variant="outline">Away</Badge>
          )}
        </div>

        {/* Opponent */}
        <div className="mb-3">
          <p className="text-xl font-bold mb-1">vs {game.opponent}</p>
          {isPast && game.result && (
            <p className="text-lg font-semibold">
              <span className={cn(
                isWin && 'text-green-600',
                isLoss && 'text-red-600',
                isTie && 'text-gray-600'
              )}>
                {game.result.us} - {game.result.them}
              </span>
              {isWin && ' 🎉'}
            </p>
          )}
        </div>

        {/* Jersey */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          <div className={cn(
            "w-6 h-6 rounded-full",
            game.jersey === 'white'
              ? 'bg-white border-2 border-gray-300'
              : 'bg-black'
          )} />
          <span className="text-gray-600">
            {game.jersey} jersey • {game.socks} socks
          </span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">{game.location.name}</p>
            <p className="text-xs">{game.location.field}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-mercury-green hover:bg-mercury-green/90"
            asChild
          >
            <Link href={`/game/${game.id}`}>
              View Details
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="min-w-[44px]"
            asChild
          >
            <a
              href={game.location.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
