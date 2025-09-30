import Link from 'next/link';
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-mercury-green mb-1">
          {teamInfo.shortName}
        </h1>
        <p className="text-gray-600">{teamInfo.ageGroup}</p>
      </div>

      {/* Next Game Hero */}
      {nextGame && (
        <Card className="mb-4 bg-gradient-to-br from-mercury-green to-green-800 text-white overflow-hidden">
          <CardContent className="pt-6">
            <p className="text-sm opacity-90 mb-2 uppercase tracking-wide">Next Game</p>
            <h2 className="text-2xl font-bold mb-3">vs {nextGame.opponent}</h2>

            {timeUntil && (
              <div className="text-4xl font-bold mb-4">
                {timeUntil.days}d {timeUntil.hours}h {timeUntil.minutes}m
              </div>
            )}

            <div className="text-sm space-y-1 opacity-90 mb-4">
              <p>{formatGameDate(nextGame.date)} • {nextGame.time}</p>
              <p>📍 {nextGame.location.name}</p>
              <p>👕 {nextGame.jersey} jersey • {nextGame.socks} socks</p>
            </div>

            <Button
              className="w-full bg-white text-mercury-green hover:bg-gray-50"
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
        <Card className="mb-4">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Season Record
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-3xl font-bold">{wins}-{losses}-{ties}</p>
                <p className="text-sm text-gray-500">Win-Loss-Tie</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{goalDiff > 0 ? '+' : ''}{goalDiff}</p>
                <p className="text-sm text-gray-500">Goal Differential</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xl font-semibold">{totalGoalsFor}</p>
                <p className="text-xs text-gray-500">Goals For</p>
              </div>
              <div>
                <p className="text-xl font-semibold">{totalGoalsAgainst}</p>
                <p className="text-xs text-gray-500">Goals Against</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Games Preview */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Upcoming Games
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/schedule" className="text-mercury-green">
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
      <Card>
        <CardContent className="pt-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Quick Links
          </h3>

          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3 px-4"
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
            className="w-full justify-between h-auto py-3 px-4"
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
            className="w-full justify-between h-auto py-3 px-4"
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

          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3 px-4"
            asChild
          >
            <Link href="/gameday">
              <span className="flex items-center gap-2">
                <span>⚽</span>
                <span className="text-left">
                  <span className="block font-semibold">Game Day Tools</span>
                  <span className="block text-xs text-gray-500">Subs & tactics</span>
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
