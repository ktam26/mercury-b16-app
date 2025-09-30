import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { getNextGame, getUpcomingGames, getTimeUntilGame, formatGameDate } from '@/lib/game-utils';
import gamesData from '@/data/games.json';
import teamInfo from '@/data/team-info.json';

export default function Home() {
  const nextGame = getNextGame(gamesData);
  const upcomingGames = getUpcomingGames(gamesData, 3);
  const timeUntil = nextGame ? getTimeUntilGame(nextGame) : null;

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
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-kelly-green to-green-700 bg-clip-text text-transparent mb-1 leading-tight">
            {teamInfo.shortName}
          </h1>
          <p className="text-gray-600 text-sm font-medium">{teamInfo.ageGroup}</p>
        </div>
      </div>

      {/* Next Game Hero */}
      {nextGame && (
        <Card className="mb-6 bg-gradient-to-br from-kelly-green to-green-800 text-white overflow-hidden shadow-xl shadow-kelly-green/20">
          <CardContent className="pt-6">
            <p className="text-sm opacity-90 mb-2 uppercase tracking-wider font-semibold">⚽ Next Game</p>
            <h2 className="text-3xl font-bold mb-4">vs {nextGame.opponent}</h2>

            {timeUntil && (
              <div className="text-5xl font-bold mb-5 tracking-tight">
                {timeUntil.days}d {timeUntil.hours}h {timeUntil.minutes}m
              </div>
            )}

            <div className="text-sm space-y-2 opacity-95 mb-6">
              <p className="font-medium">{formatGameDate(nextGame.date)} • {nextGame.time}</p>
              <p>📍 {nextGame.location.name}</p>
              <p>👕 {nextGame.jersey} jersey • {nextGame.socks} socks</p>
            </div>

            <Button
              className="w-full bg-white text-kelly-green hover:bg-gray-50 font-semibold shadow-md transition-transform active:scale-[0.98]"
              asChild
            >
              <Link href={`/game/${nextGame.id}`}>
                View Game Details
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Team Stats */}
      {pastGames.length > 0 && (
        <Card className="mb-6 shadow-md">
          <CardContent className="pt-5">
            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
              📊 Season Record
            </h3>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-kelly-green mb-1">{wins}-{losses}-{ties}</p>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Win-Loss-Tie</p>
              </div>
              <div className="text-center">
                <p className={`text-4xl font-extrabold mb-1 ${goalDiff > 0 ? 'text-kelly-green' : goalDiff < 0 ? 'text-red-500' : 'text-gray-600'}`}>
                  {goalDiff > 0 ? '+' : ''}{goalDiff}
                </p>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Goal Diff</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700">{totalGoalsFor}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Goals For</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700">{totalGoalsAgainst}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Goals Against</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Games Preview */}
      <Card className="mb-6 shadow-md">
        <CardContent className="pt-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              📅 Upcoming Games
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/schedule" className="text-kelly-green font-semibold hover:text-kelly-green/80">
                View All →
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingGames.slice(0, 2).map(game => (
              <Link
                key={game.id}
                href={`/game/${game.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs text-gray-500">{formatGameDate(game.date)}</p>
                  <span className={`text-xs font-semibold ${game.homeAway === 'home' ? 'text-green-600' : 'text-gray-600'}`}>
                    {game.homeAway === 'home' ? 'HOME' : 'AWAY'}
                  </span>
                </div>
                <p className="font-semibold">{game.time} vs {game.opponent}</p>
                <p className="text-xs text-gray-600 mt-1">📍 {game.location.name}</p>
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
            className="w-full justify-between h-auto py-3 px-4 transition-all hover:border-kelly-green hover:bg-kelly-green/5 active:scale-[0.98]"
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
                  <span className="block text-xs text-gray-500">GotSport</span>
                </span>
              </span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3 px-4 transition-all hover:border-kelly-green hover:bg-kelly-green/5 active:scale-[0.98]"
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
                  <span className="block text-xs text-gray-500">Current rankings</span>
                </span>
              </span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3 px-4 transition-all hover:border-kelly-green hover:bg-kelly-green/5 active:scale-[0.98]"
            asChild
          >
            <Link href="/photos">
              <span className="flex items-center gap-2">
                <span>📷</span>
                <span className="text-left">
                  <span className="block font-semibold">Team Photos</span>
                  <span className="block text-xs text-gray-500">Photo albums</span>
                </span>
              </span>
              <span className="text-gray-400">→</span>
            </Link>
          </Button>

        </CardContent>
      </Card>

      {/* Contact */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Questions? Text {teamInfo.managerPhone}</p>
      </div>
    </div>
  );
}