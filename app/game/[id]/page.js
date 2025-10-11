import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Navigation, ArrowLeft } from 'lucide-react';
import { formatGameDateLong, getFormDisplay, getArrivalTime, getShortTeamName } from '@/lib/game-utils';
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
  const mercuryShortName = getShortTeamName(teamInfo.name);
  const opponentShortName = getShortTeamName(game.opponent);

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
        {/* Enhanced Game Header Card */}
        <Card className="mb-4 gradient-overlay-dark text-white overflow-hidden relative border-0">
          <div className="stadium-lights" />
          <CardContent className="pt-6 relative z-10">
            {/* Date and Time Section */}
            <div className="text-center mb-6">
              <p className="text-sm opacity-90 mb-2">
                {formatGameDateLong(game.date)}
              </p>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl px-4 py-3 inline-block">
                <p className="text-xs opacity-75 mb-1">Arrive by: {getArrivalTime(game.time)}</p>
                <p className="text-2xl font-bold">Kickoff: {game.time}</p>
              </div>
            </div>

            {/* Enhanced Teams Matchup */}
            <div className="py-4">
              <div className="flex items-center justify-around mb-6">
                {/* Home/Away Team */}
                <div className="text-center animate-scale-in">
                  <div className="relative w-20 h-20 mb-3 mx-auto">
                    <div className="absolute inset-0 bg-white rounded-full shadow-lg" />
                    <div className="relative w-full h-full p-3">
                      <Image
                        src={game.homeAway === 'home' ? game.teamLogos.home : game.teamLogos.away}
                        alt="Mercury Black B16"
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <p className="text-sm font-bold opacity-95">{mercuryShortName}</p>
                </div>

                {/* VS Divider or Score */}
                <div className="text-center px-4">
                  {isPast && game.result ? (
                    <div className="animate-scale-in">
                      <div className={cn(
                        "text-4xl font-bold mb-2",
                        isWin && "text-yellow-300",
                        isLoss && "text-red-300",
                        !isWin && !isLoss && "text-white"
                      )}>
                        {game.result.us} - {game.result.them}
                      </div>
                      {isWin && (
                        <Badge className="bg-green-500 text-white border-0">
                          VICTORY
                        </Badge>
                      )}
                      {isLoss && (
                        <Badge className="bg-red-500 text-white border-0">
                          DEFEAT
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                      VS
                    </div>
                  )}
                </div>

                {/* Opponent Team */}
                <div className="text-center animate-scale-in">
                  <div className="relative w-20 h-20 mb-3 mx-auto">
                    <div className="absolute inset-0 bg-white rounded-full shadow-lg" />
                    <div className="relative w-full h-full p-3">
                      <Image
                        src={game.homeAway === 'home' ? game.teamLogos.away : game.teamLogos.home}
                        alt={game.opponent}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <p className="text-sm font-bold opacity-95 line-clamp-2 max-w-[100px]">
                    {opponentShortName}
                  </p>
                </div>
              </div>

              {/* Info Pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-xs border border-white/20 rounded-full text-xs">
                  <span>🏠</span>
                  <span className="font-medium">
                    {game.homeAway === 'home' ? 'HOME GAME' : 'AWAY GAME'}
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-xs border border-white/20 rounded-full text-xs">
                  <div className={cn(
                    "w-4 h-4 rounded-full",
                    game.jersey === 'white'
                      ? 'bg-white'
                      : 'bg-black border border-white'
                  )} />
                  <span className="font-medium">
                    {game.jersey.charAt(0).toUpperCase() + game.jersey.slice(1)} / {game.socks.charAt(0).toUpperCase() + game.socks.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Goal Scorers for Past Games */}
            {isPast && game.result?.goalScorers && game.result.goalScorers.length > 0 && (
              <div className="mt-4 p-4 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20">
                <p className="text-xs uppercase tracking-wider opacity-75 mb-2">⚽ Goal Scorers</p>
                <p className="font-bold">{game.result.goalScorers.join(', ')}</p>
              </div>
            )}

            {/* Assists for Past Games */}
            {isPast && game.result?.assists && game.result.assists.length > 0 && (
              <div className="mt-3 p-4 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20">
                <p className="text-xs uppercase tracking-wider opacity-75 mb-2">🅰️ Assists</p>
                <p className="font-bold">{game.result.assists.join(', ')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Map Section */}
        <Card className="mb-4 shadow-md border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <iframe
                src={game.location.embedUrl}
                width="100%"
                height="250"
                style={{ border: 0 }}
                loading="lazy"
                className="w-full"
                title="Field location"
              />
              <div className="absolute inset-0 pointer-events-none border-b-4 border-primary-green/20" />
            </div>

            <div className="p-5">
              <div className="mb-4">
                <h3 className="font-bold text-xl text-gray-900 mb-2">{game.location.name}</h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="font-medium">Field:</span> {game.location.field}
                  </p>
                  <p className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="font-medium">Address:</span>
                    <span className="flex-1">{game.location.address}</span>
                  </p>
                </div>
              </div>

              {/* Parking Status Indicator */}
              <div className="flex items-center gap-2 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg mb-4">
                <span className="text-xl">🅿️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">Parking Available</p>
                  <p className="text-xs text-amber-700">Arrive early on game days</p>
                </div>
              </div>

              <Button
                className="w-full bg-primary-green hover:bg-primary-green-dark font-semibold h-12 text-base"
                asChild
              >
                <a
                  href={game.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Get Directions
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Scouting Report Card */}
        <Card className="mb-4 shadow-md border-0">
          <CardContent className="pt-5">
            <h3 className="text-sm font-bold text-gray-500 mb-6 uppercase tracking-wider flex items-center gap-2">
              <span>🔍</span>
              <span>Scouting Report</span>
            </h3>

            {/* Team Comparison Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="relative w-16 h-16 mb-2 mx-auto bg-white rounded-full p-2 shadow-sm">
                    <Image
                      src={game.homeAway === 'home' ? game.teamLogos.home : game.teamLogos.away}
                      alt="Mercury Black B16"
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm font-bold text-gray-900">{mercuryShortName}</p>
                </div>

                <div className="px-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-green to-primary-green-light rounded-full flex items-center justify-center shadow-inner">
                    <span className="text-white font-bold text-sm">VS</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="relative w-16 h-16 mb-2 mx-auto bg-white rounded-full p-2 shadow-sm">
                    <Image
                      src={game.homeAway === 'home' ? game.teamLogos.away : game.teamLogos.home}
                      alt={game.opponent}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {opponentShortName}
                  </p>
                </div>
              </div>
            </div>

            {/* League Records Comparison */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className={cn(
                "p-4 rounded-xl border-2 transition-all",
                "bg-gradient-to-br from-green-50 to-green-100 border-green-300"
              )}>
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">{mercuryShortName}</p>
                <p className="text-2xl font-bold text-green-900">{game.mercuryRecord}</p>
                <p className="text-xs text-green-600 mt-1">League Record</p>
              </div>

              <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-gray-50 to-white border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Opponent</p>
                <p className="text-2xl font-bold text-gray-900">{game.opponentRecord}</p>
                <p className="text-xs text-gray-500 mt-1">League Record</p>
              </div>
            </div>

            {/* Recent Form - Both Teams Enhanced */}
            <div className="space-y-4 mb-6">
              {/* Mercury Form */}
              {game.mercuryRecentResults && game.mercuryRecentResults.length > 0 && (() => {
                const { results } = getFormDisplay(game.mercuryRecentResults);
                return (
                  <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                    <p className="text-xs text-green-700 font-semibold mb-2 uppercase tracking-wide">
                      {mercuryShortName} Recent Form
                    </p>
                    <div className="flex gap-1">
                      {results.map((r, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white",
                            r.result === 'W' && "bg-win",
                            r.result === 'L' && "bg-loss",
                            r.result === 'D' && "bg-tie"
                          )}
                        >
                          {r.result}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Opponent Form */}
              {game.opponentRecentResults && game.opponentRecentResults.length > 0 && (() => {
                const { results } = getFormDisplay(game.opponentRecentResults);
                return (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-2 uppercase tracking-wide">
                      Opponent Recent Form
                    </p>
                    <div className="flex gap-1">
                      {results.map((r, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white",
                            r.result === 'W' && "bg-win",
                            r.result === 'L' && "bg-loss",
                            r.result === 'D' && "bg-tie"
                          )}
                        >
                          {r.result}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Detailed Recent Results - Opponent Only Enhanced */}
            {game.opponentRecentResults && game.opponentRecentResults.length > 0 && (() => {
              const { results } = getFormDisplay(game.opponentRecentResults);
              return (
                <div>
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-semibold">
                    📊 Opponent Match History
                  </p>
                  <div className="space-y-2">
                    {results.map((r, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{r.opponent}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{r.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "font-bold text-lg",
                            r.result === 'W' && "text-green-600",
                            r.result === 'L' && "text-red-600",
                            r.result === 'D' && "text-gray-600"
                          )}>
                            {r.score}
                          </span>
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                            r.result === 'W' && "bg-win",
                            r.result === 'L' && "bg-loss",
                            r.result === 'D' && "bg-tie"
                          )}>
                            {r.result}
                          </div>
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
