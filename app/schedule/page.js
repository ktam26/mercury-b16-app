'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GameCard } from '@/components/GameCard';
import { getUpcomingGames, getPastGames } from '@/lib/game-utils';
import gamesData from '@/data/games.json';

export default function Schedule() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingGames = getUpcomingGames(gamesData, 99);
  const pastGames = getPastGames(gamesData);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">📅 Schedule</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingGames.length > 0 ? (
              upcomingGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No upcoming games</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastGames.length > 0 ? (
              pastGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No past games</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {[...upcomingGames, ...pastGames].map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}