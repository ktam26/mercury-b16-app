'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatGameDate } from '@/lib/game-utils';
import { cn } from '@/lib/utils';
import teamInfo from '@/data/team-info.json';

const DEFAULT_LOGO = '/images/logos/default.png';

export function GameCard({ game }) {
  const [logoError, setLogoError] = useState({ home: false, away: false });
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

        {/* Team Matchup - Centered Layout */}
        <div className="mb-3">
          {/* Logos and Text Combined */}
          <div className="flex items-center justify-between px-4 mb-3">
            {/* Left Logo */}
            <div className="relative w-12 h-12 flex-shrink-0">
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

            {/* Centered Matchup Text */}
            <div className="flex-1 text-center px-3">
              <p className="text-sm font-semibold text-gray-700 leading-tight">{teamInfo.name}</p>
              <p className="text-base font-bold text-gray-400 my-1">vs</p>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{game.opponent}</p>
            </div>

            {/* Right Logo */}
            <div className="relative w-12 h-12 flex-shrink-0">
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
          </div>

          {/* Score */}
          {isPast && game.result && (
            <p className="text-xl font-bold text-center">
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
            {game.jersey.charAt(0).toUpperCase() + game.jersey.slice(1)} Jersey • {game.socks.charAt(0).toUpperCase() + game.socks.slice(1)} Socks
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
            className="flex-1 bg-kelly-green hover:bg-kelly-green/90"
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
