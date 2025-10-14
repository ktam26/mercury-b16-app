/**
 * Next Match Widget
 * Displays the upcoming game with countdown, location, and team info
 */

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

// Type definitions for OpenAI window API
declare global {
  interface Window {
    openai?: {
      toolOutput: any;
      setWidgetState?: (state: any) => void;
      displayMode?: 'light' | 'dark';
    };
  }
}

interface NextMatchData {
  id: string;
  opponent: string;
  date: string;
  time: string;
  arrivalTime: string;
  location: {
    name: string;
    field: string;
    address: string;
    mapsUrl: string;
  };
  homeAway: 'home' | 'away';
  jersey: string;
  socks: string;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
  } | null;
  records: {
    mercury: string;
    opponent: string;
  };
}

function NextMatchWidget() {
  const [data, setData] = useState<NextMatchData | null>(null);

  useEffect(() => {
    // Get data from OpenAI tool output
    if (window.openai?.toolOutput?.structuredContent) {
      setData(window.openai.toolOutput.structuredContent);
    }
  }, []);

  if (!data) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p>Loading game data...</p>
      </div>
    );
  }

  const { countdown } = data;

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Next Match
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '8px 0' }}>
          vs {data.opponent}
        </h2>
      </div>

      {/* Countdown */}
      {countdown && (
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#fff',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>{countdown.days}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>DAYS</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#d1d5db' }}>:</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>{countdown.hours}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>HRS</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#d1d5db' }}>:</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>{countdown.minutes}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>MIN</div>
          </div>
        </div>
      )}

      {/* Game Details */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Date & Time</div>
            <div style={{ fontSize: '14px', color: '#111827' }}>{data.date}</div>
            <div style={{ fontSize: '14px', color: '#111827' }}>Kickoff: {data.time} • Arrive: {data.arrivalTime}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Location</div>
            <div style={{ fontSize: '14px', color: '#111827' }}>{data.location.name}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>{data.location.field}</div>
            <a
              href={data.location.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '14px', color: '#2563eb', textDecoration: 'none' }}
            >
              {data.location.address} →
            </a>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Venue</div>
              <div style={{ fontSize: '14px', color: '#111827', textTransform: 'capitalize' }}>{data.homeAway}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Jersey</div>
              <div style={{ fontSize: '14px', color: '#111827', textTransform: 'capitalize' }}>{data.jersey}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Mercury Record</div>
              <div style={{ fontSize: '14px', color: '#111827' }}>{data.records.mercury}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Opponent Record</div>
              <div style={{ fontSize: '14px', color: '#111827' }}>{data.records.opponent}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>
        Almaden Mercury B16
      </div>
    </div>
  );
}

// Mount the widget
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<NextMatchWidget />);
}
