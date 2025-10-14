/**
 * Roster Widget
 * Displays team roster with player names and numbers
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

interface PlayerItem {
  id: string;
  name: string;
  number: number;
  age: number;
  jerseyNumber: number;
}

interface RosterData {
  players: PlayerItem[];
  totalPlayers: number;
}

function RosterWidget() {
  const [data, setData] = useState<RosterData | null>(null);

  useEffect(() => {
    if (window.openai?.toolOutput?.structuredContent) {
      setData(window.openai.toolOutput.structuredContent);
    }
  }, []);

  if (!data) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p>Loading roster...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '16px'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Team Roster
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '8px 0 4px' }}>
          Almaden Mercury B16
        </h2>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {data.totalPlayers} Players
        </div>
      </div>

      {/* Player Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px'
        }}
      >
        {data.players.map((player) => (
          <div
            key={player.id}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s',
              cursor: 'default'
            }}
          >
            {/* Jersey Number Circle */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#059669',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '700',
                flexShrink: 0
              }}
            >
              {player.number}
            </div>

            {/* Player Info */}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {player.name}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                Age {player.age}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '20px' }}>
        2025 Fall Season
      </div>
    </div>
  );
}

// Mount the widget
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<RosterWidget />);
}
