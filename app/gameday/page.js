'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function GameDay() {
  const [activeTactic, setActiveTactic] = useState('press');

  return (
    <div className="pb-6 bg-gray-900 min-h-screen text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-center sticky top-0 z-10">
        <h1 className="text-xl font-bold mb-2">⚽ U10 GAME DAY TOOLS</h1>
        <div className="flex justify-around text-sm">
          <span>⏱️ 25 min halves</span>
          <span>🔄 8 min shifts</span>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Formation Reminder */}
        <Card className="mb-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500">
          <CardContent className="text-center py-4">
            <p className="text-4xl font-bold text-blue-400 mb-1">2-3-1</p>
            <p className="text-sm text-gray-400">
              2 Defenders • 3 Midfielders • 1 Striker
            </p>
          </CardContent>
        </Card>

        {/* Warm-up */}
        <Card className="mb-4 bg-gradient-to-br from-green-600 to-green-700 border-0">
          <CardContent className="pt-4">
            <h2 className="text-white font-bold mb-3 text-lg">🔥 WARM-UP (25-30 min)</h2>
            <div className="space-y-2 text-sm text-white">
              <p><strong className="text-green-200">5-6 min:</strong> Ball each - laces, sole rolls, cuts, toe taps</p>
              <p><strong className="text-green-200">3-4 min:</strong> Partner juggle → bounce pass back</p>
              <p><strong className="text-green-200">6-7 min:</strong> 3v1/4v1 rondos (8×8) - rotate D every 30s</p>
              <p><strong className="text-green-200">5-6 min:</strong> Pass through gates + moves</p>
              <p><strong className="text-green-200">6-7 min:</strong> 3v2 finishing - quick attacks</p>
            </div>
          </CardContent>
        </Card>

        {/* Tactics */}
        <Card className="mb-4 bg-gray-800 border-gray-700">
          <CardContent className="pt-4">
            <h2 className="text-blue-400 font-bold mb-3 text-center text-lg">⚽ GAME TACTICS</h2>

            <div className="flex gap-2 mb-4">
              <Button
                className={`flex-1 ${activeTactic === 'press' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => setActiveTactic('press')}
              >
                Kickoff Press
              </Button>
              <Button
                className={`flex-1 ${activeTactic === 'build' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => setActiveTactic('build')}
              >
                Build Out
              </Button>
              <Button
                className={`flex-1 ${activeTactic === 'pulley' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => setActiveTactic('pulley')}
              >
                Pulley
              </Button>
            </div>

            {activeTactic === 'press' && (
              <div>
                <div className="bg-gradient-to-b from-green-700 to-green-800 rounded-lg p-4 mb-3">
                  <p className="text-center text-white text-sm">
                    Kickoff Press Diagram
                  </p>
                  <p className="text-center text-xs text-green-200 mt-2">
                    ST forces • Wingers mark • CBs pulley
                  </p>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-xs text-blue-400 font-bold mb-1">KEY CALLS:</p>
                  <p className="text-xs">• &quot;Force to bench!&quot; • &quot;Lock the wingers!&quot; • &quot;Pulley!&quot;</p>
                </div>
              </div>
            )}

            {activeTactic === 'build' && (
              <div>
                <div className="bg-gradient-to-b from-green-700 to-green-800 rounded-lg p-4 mb-3">
                  <p className="text-center text-white text-sm">
                    Build Out Play Diagram
                  </p>
                  <p className="text-center text-xs text-green-200 mt-2">
                    GK→CM first • Wide if blocked • Switch
                  </p>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-xs text-blue-400 font-bold mb-1">BUILD PRINCIPLES:</p>
                  <p className="text-xs">• &quot;Find the 6!&quot; • &quot;Show &amp; bounce&quot; • &quot;Switch if blocked&quot;</p>
                </div>
              </div>
            )}

            {activeTactic === 'pulley' && (
              <div>
                <div className="bg-gradient-to-b from-green-700 to-green-800 rounded-lg p-4 mb-3">
                  <p className="text-center text-white text-sm">
                    Pulley Defense Diagram
                  </p>
                  <p className="text-center text-xs text-green-200 mt-2">
                    Ball-side steps • Weak-side tucks
                  </p>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-xs text-blue-400 font-bold mb-1">DEFENSIVE SHAPE:</p>
                  <p className="text-xs">• &quot;Pulley!&quot; • &quot;Step and tuck!&quot; • &quot;Cover the middle!&quot;</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mb-4 bg-gray-800 border-gray-700">
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500 uppercase mb-2 tracking-wide">Sub Color Key</p>
            <div className="flex gap-3 flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded" />
                <span>New In</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded" />
                <span>Continuing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded" />
                <span>Last Shift</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Substitution Placeholder */}
        <Card className="mb-4 bg-gray-800 border-gray-700">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <span className="font-bold">GAME DAY SUBSTITUTIONS</span>
              <Badge className="bg-blue-400">🥅 GK Rotation</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <p className="text-center text-gray-400 py-8">
              Substitution details and player rotations go here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}