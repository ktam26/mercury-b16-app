/**
 * Player Stats Widget
 * Displays player or team statistics
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

interface PlayerStatsData {
  playerId: string;
  playerName: string;
  number: number;
  season: string;
  stats: {
    gamesPlayed: number;
    goals: number;
    assists: number;
    goalsPerGame: number;
    assistsPerGame: number;
  };
}

interface TeamStatsData {
  season: string;
  totals: {
    gamesPlayed: number;
    totalGoals: number;
    totalAssists: number;
    activePlayers: number;
  };
  topScorers: Array<{
    name: string;
    number: number;
    goals: number;
    assists: number;
  }>;
}

function PlayerStatsWidget() {
  const [data, setData] = useState<PlayerStatsData | TeamStatsData | null>(null);

  useEffect(() => {
    if (window.openai?.toolOutput?.structuredContent) {
      setData(window.openai.toolOutput.structuredContent);
    }
  }, []);

  if (!data) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p>Loading stats...</p>
      </div>
    );
  }

  // Check if this is player stats or team stats
  const isPlayerStats = 'playerId' in data;

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '16px'
      }}
    >
      {isPlayerStats ? (
        // Player Stats View
        <>
          {/* Header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Player Stats
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#059669',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700'
                }}
              >
                {data.number}
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {data.playerName}
                </h2>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {data.season}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '16px'
            }}
          >
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                GAMES PLAYED
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                {data.stats.gamesPlayed}
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                GOALS
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669' }}>
                {data.stats.goals}
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                ASSISTS
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#2563eb' }}>
                {data.stats.assists}
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                GOALS / GAME
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                {data.stats.goalsPerGame.toFixed(2)}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Team Stats View
        <>
          {/* Header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Team Stats
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '8px 0 4px' }}>
              Almaden Mercury B16
            </h2>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {data.season}
            </div>
          </div>

          {/* Team Totals */}
          <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>
                  {data.totals.totalGoals}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  GOALS
                </div>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>
                  {data.totals.totalAssists}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  ASSISTS
                </div>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
                  {data.totals.gamesPlayed}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  GAMES
                </div>
              </div>
            </div>
          </div>

          {/* Top Scorers */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
              Top Scorers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.topScorers.slice(0, 5).map((scorer, index) => (
                <div
                  key={scorer.number}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#9ca3af', minWidth: '24px' }}>
                      {index + 1}
                    </div>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#059669',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                    >
                      {scorer.number}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                      {scorer.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: '#059669' }}>{scorer.goals}</span>
                      <span style={{ color: '#6b7280' }}> G</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: '700', color: '#2563eb' }}>{scorer.assists}</span>
                      <span style={{ color: '#6b7280' }}> A</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Mount the widget
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<PlayerStatsWidget />);
}
