'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GameCard } from '@/components/GameCard';
import { getUpcomingGames, getPastGames } from '@/lib/game-utils';
import gamesData from '@/data/games.json';
import { logger } from '@/lib/logger';

export default function Schedule() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingGames = getUpcomingGames(gamesData, 99);
  const pastGames = getPastGames(gamesData);

  useEffect(() => {
    logger.pageView('Schedule');
    logger.info(`Loaded ${upcomingGames.length} upcoming games, ${pastGames.length} past games`);
  }, [upcomingGames.length, pastGames.length]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    logger.click(`Schedule Tab: ${tab}`);
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">📅 Schedule</h1>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="px-4 pt-4">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="bg-gray-100 rounded-xl p-1 mb-4">
            <TabsList className="w-full grid grid-cols-3 bg-transparent border-0 h-auto p-0">
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:bg-white data-[state=active]:text-primary-green data-[state=active]:shadow-sm data-[state=active]:font-semibold rounded-lg py-2.5 text-sm transition-all"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="data-[state=active]:bg-white data-[state=active]:text-primary-green data-[state=active]:shadow-sm data-[state=active]:font-semibold rounded-lg py-2.5 text-sm transition-all"
              >
                Past
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-white data-[state=active]:text-primary-green data-[state=active]:shadow-sm data-[state=active]:font-semibold rounded-lg py-2.5 text-sm transition-all"
              >
                All
              </TabsTrigger>
            </TabsList>
          </div>

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