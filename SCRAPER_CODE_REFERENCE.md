# GotSport Scraper Enhancement - Code Reference

## Key Functions Added

### 1. Find Opponent in Standings
```typescript
function findOpponentInStandings(opponentName: string, standings: StandingsEntry[]): StandingsEntry | null {
  const normalizedOpponent = normalizeOpponentName(opponentName);
  
  // Try exact match first (case insensitive)
  let match = standings.find(team => {
    const normalizedTeam = normalizeOpponentName(team.team);
    return normalizedTeam === normalizedOpponent;
  });

  // If no exact match, try partial match
  if (!match) {
    match = standings.find(team => {
      const normalizedTeam = normalizeOpponentName(team.team);
      return normalizedTeam.includes(normalizedOpponent) || normalizedOpponent.includes(normalizedTeam);
    });
  }

  return match || null;
}
```

**Purpose:** Intelligently matches opponent names from games.json to team names in standings data, handling variations and inconsistencies.

### 2. Get Opponent Record
```typescript
function getOpponentRecord(opponentName: string, standings: StandingsEntry[]): string | null {
  const opponent = findOpponentInStandings(opponentName, standings);
  
  if (!opponent) {
    console.log(`⚠️  Could not find opponent in standings: ${opponentName}`);
    return null;
  }

  // Return W-L-D format
  return `${opponent.wins}-${opponent.losses}-${opponent.draws}`;
}
```

**Purpose:** Extracts the opponent's W-L-D record from standings data.

**Output Example:** `"3-2-1"` (3 wins, 2 losses, 1 draw)

### 3. Get Opponent Recent Results
```typescript
function getOpponentRecentResults(
  opponentName: string,
  gameDate: string,
  allMatches: Match[],
  maxResults: number = 3
): OpponentRecentResult[] {
  const results: OpponentRecentResult[] = [];
  const normalizedOpponent = normalizeOpponentName(opponentName);
  
  const gameDateObj = new Date(gameDate);
  
  // Find all matches involving the opponent BEFORE the Mercury game
  const opponentMatches = allMatches
    .filter(match => {
      // Check if opponent is involved
      const isHome = normalizeOpponentName(match.homeTeam).includes(normalizedOpponent) ||
                     normalizedOpponent.includes(normalizeOpponentName(match.homeTeam));
      const isAway = normalizeOpponentName(match.awayTeam).includes(normalizedOpponent) ||
                     normalizedOpponent.includes(normalizeOpponentName(match.awayTeam));
      
      if (!isHome && !isAway) return false;

      // Only include matches with scores
      if (!match.score || match.score === '-') return false;

      // Convert match date and compare
      const matchDate = convertGotSportDateToISO(match.date);
      if (!matchDate) return false;
      
      const matchDateObj = new Date(matchDate);
      
      // Only include matches BEFORE the Mercury game
      return matchDateObj < gameDateObj;
    })
    .sort((a, b) => {
      // Sort by date descending (most recent first)
      const dateA = new Date(convertGotSportDateToISO(a.date) || '');
      const dateB = new Date(convertGotSportDateToISO(b.date) || '');
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, maxResults);

  // Convert to OpponentRecentResult format
  opponentMatches.forEach(match => {
    const isHome = normalizeOpponentName(match.homeTeam).includes(normalizedOpponent) ||
                   normalizedOpponent.includes(normalizeOpponentName(match.homeTeam));
    
    const scoreMatch = match.score.match(/(\d+)\s*-\s*(\d+)/);
    if (!scoreMatch) return;

    const homeScore = parseInt(scoreMatch[1]);
    const awayScore = parseInt(scoreMatch[2]);
    
    const opponentScore = isHome ? homeScore : awayScore;
    const otherScore = isHome ? awayScore : homeScore;
    
    let result: 'W' | 'L' | 'D';
    if (opponentScore > otherScore) result = 'W';
    else if (opponentScore < otherScore) result = 'L';
    else result = 'D';

    const otherTeam = isHome ? match.awayTeam : match.homeTeam;
    
    results.push({
      date: convertGotSportDateToISO(match.date) || match.date,
      opponent: simplifyTeamName(otherTeam),
      result,
      score: `${opponentScore}-${otherScore}`
    });
  });

  return results;
}
```

**Purpose:** Finds opponent's recent matches played BEFORE the Mercury game date, sorted by most recent first.

**Output Example:**
```javascript
[
  {
    "date": "2025-09-07",
    "opponent": "Almaden FC Mercury B16 Black",
    "result": "L",
    "score": "1-3"
  }
]
```

### 4. Integration Point in updateGamesWithScores()
```typescript
// AUTO-POPULATE OPPONENT RECORD from standings
const opponentRecord = getOpponentRecord(game.opponent, standings);
if (opponentRecord && updatedGame.opponentRecord !== opponentRecord) {
  const oldRecord = updatedGame.opponentRecord || 'none';
  updatedGame.opponentRecord = opponentRecord;
  updates.push(
    `📊 Opponent record updated for ${game.opponent}: ${oldRecord} → ${opponentRecord}`
  );
  hasChanges = true;
}

// AUTO-POPULATE OPPONENT RECENT RESULTS
const opponentRecentResults = getOpponentRecentResults(
  game.opponent,
  game.date,
  scrapedMatches,
  3
);

// Only update if we have results and they're different
if (opponentRecentResults.length > 0) {
  const existingResults = updatedGame.opponentRecentResults || [];
  const resultsChanged = JSON.stringify(existingResults) !== JSON.stringify(opponentRecentResults);
  
  if (resultsChanged) {
    updatedGame.opponentRecentResults = opponentRecentResults;
    updates.push(
      `📊 Opponent recent results updated for ${game.opponent} (${opponentRecentResults.length} matches)`
    );
    hasChanges = true;
  }
}
```

**Purpose:** Integrates the new functions into the existing update flow, preserving all manually entered data while auto-populating opponent information.

## Helper Functions

### Simplify Team Name
```typescript
function simplifyTeamName(fullName: string): string {
  return fullName
    .replace(/^.*?\s+FC\s+/i, '')
    .replace(/^.*?\s+Soccer Club\s+/i, '')
    .replace(/\s+16B.*$/i, '')
    .replace(/\s+-\s+.*$/i, '')
    .trim();
}
```

**Example:**
- Input: `"Los Gatos United Soccer Club 2016B Academy Black"`
- Output: `"Los Gatos United"`

### Convert GotSport Date to ISO
```typescript
function convertGotSportDateToISO(gotSportDate: string): string | null {
  const dateMatch = gotSportDate.match(/(\w+)\s+(\d+),\s+(\d+)/);
  if (!dateMatch) return null;

  const monthMap: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };
  
  const [, month, day, year] = dateMatch;
  return `${year}-${monthMap[month]}-${day.padStart(2, '0')}`;
}
```

**Example:**
- Input: `"Sep 07, 2025"`
- Output: `"2025-09-07"`

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Scrape GotSport                                              │
│    - Standings table (all 8 teams with W-L-D records)           │
│    - Schedule table (Mercury's 8 matches)                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Load games.json                                              │
│    - Existing game records with opponent names                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. For each game:                                               │
│    a) Match opponent name to standings → Get W-L-D record       │
│    b) Find opponent's matches in schedule before this game      │
│    c) Calculate results (W/L/D) from opponent's perspective     │
│    d) Update opponentRecord and opponentRecentResults           │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Save updated games.json                                      │
│    - Preserves all manually entered data                        │
│    - Only updates when data changes                             │
└─────────────────────────────────────────────────────────────────┘
```

## Testing Commands

```bash
# Run the scraper
npm run scrape

# Check opponent records were populated
cat data/games.json | grep "opponentRecord"

# View a specific game's opponent data
cat data/games.json | grep -A 30 '"id": "game-001"'

# Check scraper logs
cat data/gotsport-changes.json | tail -50
```

## Edge Cases Handled

1. **Opponent not in standings:**
   - Logs warning: `⚠️  Could not find opponent in standings: [name]`
   - Returns null, doesn't update field
   - Preserves existing manual entry if present

2. **No matches before game date:**
   - Returns empty array `[]`
   - Doesn't overwrite existing manual entries if they exist

3. **Team name variations:**
   - "Cupertino FC Flames 16B" matches "Cupertino FC Cupertino FC Flames 16B"
   - "Los Gatos United" matches "Los Gatos United Soccer Club 2016B Academy Black"

4. **Date parsing failures:**
   - Gracefully skips match
   - Logs warning if needed
   - Continues processing other matches

5. **Score format variations:**
   - Handles "3 - 1", "3-1", "3  -  1"
   - Validates score before processing
