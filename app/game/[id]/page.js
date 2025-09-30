import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Navigation, ArrowLeft } from 'lucide-react';
import { formatGameDateLong } from '@/lib/game-utils';
import gamesData from '@/data/games.json';
import teamInfo from '@/data/team-info.json';
import { cn } from '@/lib/utils';

export default async function GameDetail({ params }) {
  const { id } = await params;
  const game = gamesData.find(g => g.id === id);

  if (!game) {
    notFound();
  }

  const isPast = game.result !== null;
  const isWin = isPast && game.result.us > game.result.them;
  const isLoss = isPast && game.result.us < game.result.them;

  return (
    <div className="pb-6">
      {/* Back Button */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/schedule" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Game Details</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Game Header Card */}
        <Card className="mb-4 bg-gradient-to-br from-mercury-green to-green-800 text-white">
          <CardContent className="pt-6">
            <p className="text-sm opacity-90 mb-1">
              {formatGameDateLong(game.date)}
            </p>
            <p className="text-3xl font-bold mb-4">{game.time}</p>

            <div className="text-center py-4">
              <p className="text-lg mb-2">Mercury Black B16</p>
              <p className="text-3xl font-bold mb-2">vs</p>
              <p className="text-lg mb-4">{game.opponent}</p>

              {isPast && game.result && (
                <div className="text-5xl font-bold mb-4">
                  {game.result.us} - {game.result.them}
                </div>
              )}

              <Badge className="bg-white/20 text-white border-white/30">
                {game.homeAway === 'home' ? 'HOME GAME' : 'AWAY GAME'}
              </Badge>
            </div>

            <div className="flex items-center justify-center gap-3 mt-4 p-3 bg-white/10 rounded-lg">
              <div className={cn(
                "w-10 h-10 rounded-full",
                game.jersey === 'white'
                  ? 'bg-white'
                  : 'bg-black border-2 border-white'
              )} />
              <div className="text-left">
                <p className="font-semibold">{game.jersey} jersey</p>
                <p className="text-sm opacity-90">{game.socks} socks</p>
              </div>
            </div>

            {isPast && game.result?.goalScorers && (
              <div className="mt-4 p-3 bg-white/10 rounded-lg">
                <p className="text-sm opacity-90 mb-2">Goal Scorers:</p>
                <p className="font-semibold">{game.result.goalScorers.join(', ')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map Card */}
        <Card className="mb-4">
          <CardContent className="p-0">
            <iframe
              src={game.location.embedUrl}
              width="100%"
              height="250"
              style={{ border: 0 }}
              loading="lazy"
              className="rounded-t-lg"
              title="Field location"
            />
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{game.location.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{game.location.field}</p>
              <p className="text-sm text-gray-600 mb-4">{game.location.address}</p>

              <Button className="w-full bg-mercury-green hover:bg-mercury-green/90" asChild>
                <a
                  href={game.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Opponent Card */}
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
              <span>⚠️</span>
              <span>Opponent: {game.opponent}</span>
            </h3>
            <div className="space-y-2 text-sm mb-4">
              <p><strong className="text-red-900">Record:</strong> {game.opponentRecord}</p>
              <p><strong className="text-red-900">Goals:</strong> {game.opponentGoals}</p>
            </div>
            {game.gotsportUrl && (
              <Button variant="outline" className="w-full" asChild>
                <a
                  href={game.gotsportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GotSport
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="mb-4">
          <CardContent className="pt-4 space-y-2">
            <h3 className="font-semibold mb-3 text-gray-700">Quick Links</h3>

            {!isPast && (
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-3"
                asChild
              >
                <a
                  href={game.weatherUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex items-center gap-2">
                    <span>☀️</span>
                    <span>Weather Forecast</span>
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-between h-auto py-3"
              asChild
            >
              <a
                href={game.gotsportUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="flex items-center gap-2">
                  <span>📊</span>
                  <span>GotSport Game Page</span>
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between h-auto py-3"
              asChild
            >
              <a
                href={teamInfo.links.gotsportStandings}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="flex items-center gap-2">
                  <span>📈</span>
                  <span>League Standings</span>
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>

            {isPast && game.photoAlbumUrl && (
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-3 border-green-200 bg-green-50"
                asChild
              >
                <a
                  href={game.photoAlbumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex items-center gap-2">
                    <span>📷</span>
                    <span className="font-semibold text-green-900">View Game Photos</span>
                  </span>
                  <ExternalLink className="w-4 h-4 text-green-700" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}