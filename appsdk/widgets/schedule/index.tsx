/**
 * Schedule Widget
 * Displays team schedule with past results and upcoming games
 */

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

declare global {
  interface Window {
    openai?: {
      toolOutput: any;
      setWidgetState?: (state: any) => void;
      displayMode?: 'light' | 'dark';
    };
  }
}

interface GameItem {
  id: string;
  opponent: string;
  date: string;
  time: string;
  location: string;
  homeAway: 'home' | 'away';
  result: {
    us: number;
    them: number;
    outcome: 'W' | 'L' | 'D';
  } | null;
  isPast: boolean;
}

interface ScheduleData {
  games: GameItem[];
  teamRecord: string;
}

function ScheduleWidget() {
  const [data, setData] = useState<ScheduleData | null>(null);

  useEffect(() => {
    if (window.openai?.toolOutput?.structuredContent) {
      setData(window.openai.toolOutput.structuredContent);
    }
  }, []);

  if (!data) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p>Loading schedule...</p>
      </div>
    );
  }

  const pastGames = data.games.filter(g => g.isPast);
  const upcomingGames = data.games.filter(g => !g.isPast);

  const getOutcomeBadgeColor = (outcome: 'W' | 'L' | 'D') => {
    if (outcome === 'W') return { bg: '#d1fae5', text: '#065f46' };
    if (outcome === 'L') return { bg: '#fee2e2', text: '#991b1b' };
    return { bg: '#e5e7eb', text: '#374151' };
  };

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '700px',
        margin: '0 auto',
        padding: '16px'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Team Schedule
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Almaden Mercury B16
          </h2>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669', padding: '4px 8px', backgroundColor: '#d1fae5', borderRadius: '6px' }}>
            {data.teamRecord}
          </div>
        </div>
      </div>

      {/* Upcoming Games */}
      {upcomingGames.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
            Upcoming Games
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingGames.map((game) => (
              <div
                key={game.id}
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    vs {game.opponent}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {game.date} • {game.time}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {game.location} ({game.homeAway})
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  padding: '6px 12px',
                  backgroundColor: '#fff',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  {game.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Games */}
      {pastGames.length > 0 && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
            Recent Results
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pastGames.map((game) => {
              if (!game.result) return null;
              const outcomeColor = getOutcomeBadgeColor(game.result.outcome);

              return (
                <div
                  key={game.id}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                      vs {game.opponent}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {game.date} • {game.location}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                      {game.result.us} - {game.result.them}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        backgroundColor: outcomeColor.bg,
                        color: outcomeColor.text,
                        padding: '6px 12px',
                        borderRadius: '6px',
                        minWidth: '32px',
                        textAlign: 'center'
                      }}
                    >
                      {game.result.outcome}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {pastGames.length === 0 && upcomingGames.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <p>No games scheduled</p>
        </div>
      )}
    </div>
  );
}

// Mount the widget
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<ScheduleWidget />);
}
