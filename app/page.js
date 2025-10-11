'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { getNextGame, getUpcomingGames, formatGameDate, getShortTeamName } from '@/lib/game-utils';
import { useCountdown, useMounted } from '@/hooks/useCountdown';
import gamesData from '@/data/games.json';
import teamInfo from '@/data/team-info.json';
import { cn } from '@/lib/utils';

export default function Home() {
  const nextGame = getNextGame(gamesData);
  const upcomingGames = getUpcomingGames(gamesData, 3);
  const timeUntil = useCountdown(nextGame);
  const mounted = useMounted();
  const homeShortName = getShortTeamName(teamInfo.name);
  const nextOpponentShortName = nextGame ? getShortTeamName(nextGame.opponent) : '';

  // Calculate current record from past games
  const pastGames = gamesData.filter(g => g.result);
  const wins = pastGames.filter(g => g.result.us > g.result.them).length;
  const losses = pastGames.filter(g => g.result.us < g.result.them).length;
  const ties = pastGames.filter(g => g.result.us === g.result.them).length;
  const totalGoalsFor = pastGames.reduce((sum, g) => sum + g.result.us, 0);
  const totalGoalsAgainst = pastGames.reduce((sum, g) => sum + g.result.them, 0);
  const goalDiff = totalGoalsFor - totalGoalsAgainst;

  return (
    <div className="pb-6 px-4 pt-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Image
          src="/afc-logo.png"
          alt="Almaden FC Logo"
          width={60}
          height={60}
          className="flex-shrink-0"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-black leading-tight">
            {teamInfo.shortName}
          </h1>
        </div>
      </div>

      {/* Next Game Hero */}
      {nextGame && (
        <Card className="mb-6 bg-gradient-to-br from-primary-green to-primary-green-light text-white overflow-hidden shadow-green relative">
          <div className="stadium-lights" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm opacity-90 uppercase tracking-wider font-semibold">⚽ Next Game</p>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold">
                {nextGame.homeAway === 'home' ? 'HOME' : 'AWAY'}
              </span>
            </div>

            {/* Teams Display */}
            <div className="flex items-center justify-center gap-6 mb-6 animate-scale-in">
              <div className="text-center">
                <div className="w-15 h-15 bg-white rounded-full mb-2 mx-auto shadow-md flex items-center justify-center p-2">
                  <Image
                    src="/afc-logo.png"
                    alt="Almaden FC"
                    width={48}
                    height={48}
                    className="object-contain"
                    priority
                  />
                </div>
                <p className="text-sm font-semibold opacity-95">{homeShortName}</p>
              </div>

              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                VS
              </div>

              <div className="text-center">
                <div className="w-15 h-15 bg-white rounded-full mb-2 mx-auto shadow-md flex items-center justify-center p-2">
                  <Image
                    src={
                      nextGame.homeAway === 'home'
                        ? (nextGame.teamLogos?.away || "/images/logos/default.png")
                        : (nextGame.teamLogos?.home || "/images/logos/default.png")
                    }
                    alt={nextGame.opponent}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <p className="text-sm font-semibold opacity-95 line-clamp-2 max-w-[80px]">
                  {nextOpponentShortName}
                </p>
              </div>
            </div>

            {/* Countdown Timer */}
            {mounted && timeUntil && (
              <div
                className="countdown-container flex gap-2 justify-center mb-6"
                role="timer"
                aria-live="polite"
                aria-label={`Time until next game: ${timeUntil.days} days, ${timeUntil.hours} hours, ${timeUntil.minutes} minutes`}
              >
                <div className="bg-white/15 backdrop-blur-xs rounded-xl px-4 py-3 min-w-[70px] text-center">
                  <span className="text-2xl font-bold block">{timeUntil.days}</span>
                  <span className="text-xs opacity-80 uppercase tracking-wider">Days</span>
                </div>
                <div className="bg-white/15 backdrop-blur-xs rounded-xl px-4 py-3 min-w-[70px] text-center">
                  <span className="text-2xl font-bold block">{timeUntil.hours}</span>
                  <span className="text-xs opacity-80 uppercase tracking-wider">Hours</span>
                </div>
                <div className="bg-white/15 backdrop-blur-xs rounded-xl px-4 py-3 min-w-[70px] text-center">
                  <span className="text-2xl font-bold block">{timeUntil.minutes}</span>
                  <span className="text-xs opacity-80 uppercase tracking-wider">Minutes</span>
                </div>
              </div>
            )}

            {/* Loading placeholder for countdown */}
            {!mounted && nextGame && (
              <div className="countdown-container flex gap-2 justify-center mb-6">
                <div className="bg-white/15 backdrop-blur-xs rounded-xl px-4 py-3 min-w-[70px] text-center">
                  <span className="text-2xl font-bold block">--</span>
                  <span className="text-xs opacity-80 uppercase tracking-wider">Days</span>
                </div>
                <div className="bg-white/15 backdrop-blur-xs rounded-xl px-4 py-3 min-w-[70px] text-center">
                  <span className="text-2xl font-bold block">--</span>
                  <span className="text-xs opacity-80 uppercase tracking-wider">Hours</span>
                </div>
                <div className="bg-white/15 backdrop-blur-xs rounded-xl px-4 py-3 min-w-[70px] text-center">
                  <span className="text-2xl font-bold block">--</span>
                  <span className="text-xs opacity-80 uppercase tracking-wider">Minutes</span>
                </div>
              </div>
            )}

            {/* Game Info Pills */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-xs rounded-full text-xs">
                <span>📅</span>
                <span>{formatGameDate(nextGame.date)} • {nextGame.time}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-xs rounded-full text-xs">
                <span>📍</span>
                <span>{nextGame.location.name}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-xs rounded-full text-xs">
                <span>👕</span>
                <span>{nextGame.jersey.charAt(0).toUpperCase() + nextGame.jersey.slice(1)} / {nextGame.socks.charAt(0).toUpperCase() + nextGame.socks.slice(1)}</span>
              </div>
            </div>

            <Link
              href={`/game/${nextGame.id}`}
              className={cn(
                buttonVariants({ variant: 'default', size: 'default' }),
                'w-full bg-white text-primary-green hover:bg-gray-50 font-semibold shadow-md transition-transform active:scale-[0.98]'
              )}
            >
              View Game Details
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Team Stats Enhanced */}
      {pastGames.length > 0 && (
        <Card className="mb-6 shadow-md border-0">
          <CardContent className="pt-5">
            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
              📊 Season Statistics
            </h3>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:border-primary-green hover:shadow-sm transition-all">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Record</p>
                <p className="text-3xl font-extrabold text-primary-green">{wins}-{losses}-{ties}</p>

                {/* Win percentage */}
                {pastGames.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((wins / pastGames.length) * 100)}% Win Rate
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:border-primary-green hover:shadow-sm transition-all">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Goal Diff</p>
                <p className={`text-3xl font-extrabold ${goalDiff > 0 ? 'text-win' : goalDiff < 0 ? 'text-loss' : 'text-tie'}`}>
                  {goalDiff > 0 ? '+' : ''}{goalDiff}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(totalGoalsFor / pastGames.length * 10) / 10} avg/game
                </p>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">⚽</span>
                  <span className="text-2xl font-bold text-green-900">{totalGoalsFor}</span>
                </div>
                <p className="text-xs text-green-700 uppercase tracking-wide">Goals Scored</p>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border border-red-200 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">🥅</span>
                  <span className="text-2xl font-bold text-red-900">{totalGoalsAgainst}</span>
                </div>
                <p className="text-xs text-red-700 uppercase tracking-wide">Goals Against</p>
              </div>
            </div>

            {/* Recent Form Indicator */}
            {pastGames.length >= 3 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Last 5 Games</p>
                <div className="flex gap-1">
                  {pastGames.slice(-5).map((game, index) => {
                    const isWin = game.result.us > game.result.them;
                    const isLoss = game.result.us < game.result.them;
                    return (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                          isWin ? 'bg-win' : isLoss ? 'bg-loss' : 'bg-tie'
                        }`}
                      >
                        {isWin ? 'W' : isLoss ? 'L' : 'T'}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Games Preview Enhanced */}
      <Card className="mb-6 shadow-md border-0">
        <CardContent className="pt-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              📅 Upcoming Games
            </h3>
            <Button variant="ghost" size="sm" asChild className="hover:bg-primary-green/10">
              <Link href="/schedule" className="text-primary-green font-semibold">
                View All →
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingGames.slice(0, 2).map(game => (
              <Link
                key={game.id}
                href={`/game/${game.id}`}
                className="block p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-primary-green hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-gray-500 font-medium">{formatGameDate(game.date)}</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    game.homeAway === 'home'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {game.homeAway === 'home' ? 'HOME' : 'AWAY'}
                  </span>
                </div>
                <p className="font-bold text-gray-900 mb-1">
                  {game.time} <span className="text-gray-500 font-normal">vs</span> {game.opponent}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <span>📍</span>
                  <span>{game.location.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="shadow-md">
        <CardContent className="pt-5 space-y-2">
          <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
            🔗 Quick Links
          </h3>

          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3 px-4 transition-all hover:border-kelly-green hover:bg-kelly-green/10 hover:text-kelly-green group active:scale-[0.98]"
            asChild
          >
            <a
              href={teamInfo.links.gotsportSchedule}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex items-center gap-2">
                <span>📅</span>
                <span className="text-left">
                  <span className="block font-semibold">Full Schedule</span>
                  <span className="block text-xs text-gray-500 group-hover:text-kelly-green/80">GotSport</span>
                </span>
              </span>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-kelly-green" />
            </a>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3 px-4 transition-all hover:border-kelly-green hover:bg-kelly-green/10 hover:text-kelly-green group active:scale-[0.98]"
            asChild
          >
            <a
              href={teamInfo.links.gotsportStandings}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex items-center gap-2">
                <span>📊</span>
                <span className="text-left">
                  <span className="block font-semibold">League Standings</span>
                  <span className="block text-xs text-gray-500 group-hover:text-kelly-green/80">Current rankings</span>
                </span>
              </span>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-kelly-green" />
            </a>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3 px-4 transition-all hover:border-kelly-green hover:bg-kelly-green/10 hover:text-kelly-green group active:scale-[0.98]"
            asChild
          >
            <Link href="/photos">
              <span className="flex items-center gap-2">
                <span>📷</span>
                <span className="text-left">
                  <span className="block font-semibold">Team Photos</span>
                  <span className="block text-xs text-gray-500 group-hover:text-kelly-green/80">Photo albums</span>
                </span>
              </span>
              <span className="text-gray-400 group-hover:text-kelly-green">→</span>
            </Link>
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
