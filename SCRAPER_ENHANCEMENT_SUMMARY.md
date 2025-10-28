# GotSport Scraper Enhancement Summary

## Overview
Enhanced the GotSport scraper to automatically populate opponent team records and recent results in game details. The scraper now extracts data from the standings table and match schedule to provide comprehensive opponent information.

## What Was Changed

### File Modified
- `/Users/kevintamura/AlmadenMB16_App/mercury-b16-app/scripts/scrape-gotsport.ts`
- Backup created: `scrape-gotsport.ts.backup`

### New Features Added

#### 1. Auto-Populate Opponent Records
- **Function:** `getOpponentRecord(opponentName, standings)`
- **Purpose:** Extracts opponent's W-L-D record from standings data
- **Example Output:** "3-2-1" (3 wins, 2 losses, 1 draw)
- **Implementation:** Matches opponent name from games.json against team names in standings using fuzzy matching

#### 2. Auto-Populate Opponent Recent Results
- **Function:** `getOpponentRecentResults(opponentName, gameDate, allMatches, maxResults)`
- **Purpose:** Finds opponent's recent matches before the Mercury game date
- **Example Output:**
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
- **Features:**
  - Only includes matches played BEFORE the Mercury vs opponent game
  - Sorts by date (most recent first)
  - Returns up to 3 most recent matches
  - Calculates W/L/D result from the opponent's perspective

#### 3. Helper Functions
- `findOpponentInStandings()` - Smart name matching with normalization
- `simplifyTeamName()` - Removes common prefixes/suffixes for display
- `convertGotSportDateToISO()` - Date format conversion

### How It Works

1. **Scraper runs and fetches:**
   - League standings (all 8 teams with W-L-D records)
   - Mercury's match schedule (8 games)

2. **For each game in games.json:**
   - Matches opponent name against standings table
   - Extracts current W-L-D record
   - Searches schedule for opponent's previous matches
   - Filters matches that occurred BEFORE the Mercury game date
   - Populates `opponentRecord` and `opponentRecentResults`

3. **Preserves existing data:**
   - Goal scorers remain intact
   - Assists remain intact
   - Manually entered data is never overwritten
   - Only updates opponent fields when data changes

## Limitations and Considerations

### Current Limitation
The scraper only has access to Mercury's schedule, not the full league schedule. This means:
- **Opponent recent results are limited to matches against Mercury**
- Example: For Santa Clara Rush vs Mercury on Nov 9, the scraper can only show Rush's Sept 7 game against Mercury, not their games against other teams

### Why This Limitation Exists
- The SCHEDULE_URL is team-specific: `schedules?team=3231307` (Mercury's team ID)
- GotSport doesn't provide a league-wide schedule endpoint in the current implementation
- The manually entered opponent data in games.json suggests this information exists somewhere, but would require scraping individual team pages or finding a league-wide endpoint

### Future Enhancement Possibility
To get complete opponent match history:
1. Scrape each team's individual schedule page (8 additional requests)
2. Or find a league-wide schedule endpoint
3. This would provide full visibility into all opponent matches

## Testing Results

Ran the enhanced scraper and verified:
- ✅ Opponent records auto-populated correctly (e.g., "3-2-1", "1-3-0")
- ✅ Recent results populated where available
- ✅ Existing game scores preserved
- ✅ Goal scorers and assists unchanged
- ✅ 6 games updated with new opponent data
- ✅ Change detection and logging working properly

### Sample Output
```
📊 Opponent record updated for Cupertino FC Flames 16B: 1-2-1 → 3-2-1
📊 Opponent record updated for East San Jose FC ESJFC 16B Latinos White: 2-1-0 → 3-2-0
📊 Opponent recent results updated for Santa Clara Rush 2016B Cougars - Blue (1 matches)
```

## Code Quality

### Maintains Existing Patterns
- Uses same TypeScript interfaces
- Follows existing naming conventions
- Preserves error handling patterns
- Maintains logging style

### Edge Case Handling
- Opponent not found in standings → logs warning, continues
- Insufficient match data → populates empty array
- Date parsing failures → gracefully skips
- Name matching uses normalization to handle variations

## Files Affected

### Modified
- `scripts/scrape-gotsport.ts` (enhanced with new functionality)

### Created
- `scripts/scrape-gotsport.ts.backup` (backup of original)

### Updated by Scraper
- `data/games.json` (6 games with opponent data)
- `data/gotsport-data.json` (refreshed scraped data)
- `data/gotsport-changes.json` (change log updated)

## Usage

Run the scraper as before:
```bash
npm run scrape
```

The scraper will now automatically:
1. Update Mercury's game scores
2. Populate opponent W-L-D records
3. Add opponent recent match results (limited to matches in our schedule)
4. Log all changes

## Recommendations

### Short Term
The current implementation provides value immediately:
- Opponent records are accurate and auto-update
- Recent results (though limited) show opponent's performance against Mercury
- Reduces manual data entry

### Long Term
Consider enhancing to scrape full league schedule:
- Would require 8 additional HTTP requests (one per team)
- Would provide complete opponent match history
- Could show opponent's form trend (last 3-5 games vs all teams)

## Technical Notes

### Name Matching Algorithm
The scraper uses smart name normalization to match opponents:
- Converts to lowercase
- Removes common terms: FC, Academy, 16B, B16, Black
- Handles team name variations (e.g., "Cupertino FC Flames 16B" matches "Cupertino FC Cupertino FC Flames 16B")

### Date Handling
- GotSport dates: "Sep 07, 2025"
- ISO format in games.json: "2025-09-07"
- Conversion ensures proper date comparison for filtering recent results

### Update Detection
Only updates games.json when:
- Opponent record changes (standings update)
- New opponent matches become available
- Different from current stored value (prevents unnecessary writes)
