import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Navigation, ArrowLeft } from 'lucide-react';
import { formatGameDateLong, getFormDisplay, getFormBadgeVariant, getArrivalTime } from '@/lib/game-utils';
import gamesData from '@/data/games.json';
import teamInfo from '@/data/team-info.json';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

export default async function GameDetail({ params }) {
  const { id } = await params;
  const game = gamesData.find(g => g.id === id);

  if (!game) {
    logger.warn(`Game not found: ${id}`);
    notFound();
  }

  logger.pageView(`Game Detail: ${game.opponent}`);
  logger.info(`Viewing game: ${game.date} vs ${game.opponent}`);

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
        <Card className="mb-4 bg-gradient-to-br from-kelly-green to-green-800 text-white">
          <CardContent className="pt-6">
            <p className="text-sm opacity-90 mb-1">
              {formatGameDateLong(game.date)}
            </p>
            <div className="mb-4">
              <p className="text-sm opacity-75 mb-1">Arrive by: {getArrivalTime(game.time)}</p>
              <p className="text-3xl font-bold">Game: {game.time}</p>
            </div>

            <div className="py-4">
              {/* Team Logos Display */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center flex-1 max-w-[120px]">
                  <div className="relative w-20 h-20 mb-2 mx-auto bg-white/10 rounded-full p-2">
                    <Image
                      src={game.homeAway === 'home' ? game.teamLogos.home : game.teamLogos.away}
                      alt="Mercury Black B16"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <p className="text-sm font-semibold">Mercury Black B16</p>
                </div>

                <div className="text-center">
                  <p className="text-3xl font-bold mb-2">vs</p>
                  {isPast && game.result && (
                    <div className="text-4xl font-bold">
                      {game.result.us} - {game.result.them}
                    </div>
                  )}
                </div>

                <div className="text-center flex-1 max-w-[120px]">
                  <div className="relative w-20 h-20 mb-2 mx-auto bg-white/10 rounded-full p-2">
                    <Image
                      src={game.homeAway === 'home' ? game.teamLogos.away : game.teamLogos.home}
                      alt={game.opponent}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <p className="text-sm font-semibold">{game.opponent.split(' ').slice(0, 3).join(' ')}</p>
                </div>
              </div>

              <div className="text-center">
                <Badge className="bg-white/20 text-white border-white/30">
                  {game.homeAway === 'home' ? 'HOME GAME' : 'AWAY GAME'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-4 p-3 bg-white/10 rounded-lg">
              <div className={cn(
                "w-10 h-10 rounded-full",
                game.jersey === 'white'
                  ? 'bg-white'
                  : 'bg-black border-2 border-white'
              )} />
              <div className="text-left">
                <p className="font-semibold">{game.jersey.charAt(0).toUpperCase() + game.jersey.slice(1)} Jersey</p>
                <p className="text-sm opacity-90">{game.socks.charAt(0).toUpperCase() + game.socks.slice(1)} Socks</p>
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

              <Button className="w-full bg-kelly-green hover:bg-kelly-green/90" asChild>
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

        {/* Scouting Report Card */}
        <Card className="mb-4">
          <CardContent className="pt-5">
            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
              🔍 Scouting Report
            </h3>

            {/* Team Logos - Always Mercury on left, Opponent on right */}
            <div className="flex items-center justify-between mb-6 px-4">
              <div className="text-center">
                <div className="relative w-16 h-16 mb-2 mx-auto">
                  <Image
                    src={game.homeAway === 'home' ? game.teamLogos.home : game.teamLogos.away}
                    alt="Mercury Black B16"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs font-medium text-gray-600">Mercury</p>
              </div>
              <div className="text-2xl font-bold text-gray-400">VS</div>
              <div className="text-center">
                <div className="relative w-16 h-16 mb-2 mx-auto">
                  <Image
                    src={game.homeAway === 'home' ? game.teamLogos.away : game.teamLogos.home}
                    alt={game.opponent}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs font-medium text-gray-600">{game.opponent.split(' ')[0]}</p>
              </div>
            </div>

            {/* League Records - Both Teams */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Mercury Record</p>
                <p className="text-2xl font-bold text-green-900">{game.mercuryRecord}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Opponent Record</p>
                <p className="text-2xl font-bold text-gray-900">{game.opponentRecord}</p>
              </div>
            </div>

            {/* Recent Form - Both Teams */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Mercury Form */}
              {game.mercuryRecentResults && game.mercuryRecentResults.length > 0 && (() => {
                const { results } = getFormDisplay(game.mercuryRecentResults);
                return (
                  <div>
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Mercury Form</p>
                    <div className="flex gap-1 flex-wrap">
                      {results.map((r, idx) => (
                        <Badge
                          key={idx}
                          variant={getFormBadgeVariant(r.result)}
                          className="text-xs font-bold px-2 py-0.5"
                        >
                          {r.result}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Opponent Form */}
              {game.opponentRecentResults && game.opponentRecentResults.length > 0 && (() => {
                const { results } = getFormDisplay(game.opponentRecentResults);
                return (
                  <div>
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Opponent Form</p>
                    <div className="flex gap-1 flex-wrap">
                      {results.map((r, idx) => (
                        <Badge
                          key={idx}
                          variant={getFormBadgeVariant(r.result)}
                          className="text-xs font-bold px-2 py-0.5"
                        >
                          {r.result}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Detailed Recent Results - Opponent Only */}
            {game.opponentRecentResults && game.opponentRecentResults.length > 0 && (() => {
              const { results } = getFormDisplay(game.opponentRecentResults);
              return (
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Opponent Recent Results</p>
                  <div className="space-y-2">
                    {results.map((r, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{r.opponent}</p>
                          <p className="text-xs text-gray-500">{r.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-bold",
                            r.result === 'W' && "text-green-600",
                            r.result === 'L' && "text-red-600",
                            r.result === 'D' && "text-gray-600"
                          )}>
                            {r.score}
                          </span>
                          <Badge
                            variant={getFormBadgeVariant(r.result)}
                            className="text-xs font-bold"
                          >
                            {r.result}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
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