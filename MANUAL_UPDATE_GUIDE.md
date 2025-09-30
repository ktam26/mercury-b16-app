# Manual Weekly Update Guide

## After Each Game Weekend

### Step 1: Open GotSport Schedule
Visit: https://system.gotsport.com/org_event/events/44142/schedules?team=3231307

### Step 2: Update `data/games.json`

For each completed game, you need to update **4 fields**:

#### A. Update Game Result
```json
{
  "id": "game-003",
  "result": {
    "us": 2,        // ← Our score
    "them": 1,      // ← Their score
    "goalScorers": ["Player Name (1)", "Player Name (1)"]  // Optional
  }
}
```

#### B. Update Mercury's Record (Cumulative)
Look at the NEXT upcoming game and update Mercury's record to reflect this game's result:

```json
{
  "id": "game-004",  // ← Next game
  "mercuryRecord": "2-0-1",  // ← Update: Wins-Losses-Draws up to this point
  ...
}
```

**Example:** If Mercury was 1-0-1 and just won, next game shows "2-0-1"

#### C. Update Mercury's Recent Results
Add the completed game to the NEXT game's `mercuryRecentResults`:

```json
{
  "id": "game-004",  // ← Next game
  "mercuryRecentResults": [
    { "date": "2025-09-07", "opponent": "Santa Clara Rush", "score": "3-1", "result": "W" },
    { "date": "2025-09-20", "opponent": "Cupertino FC Flames", "score": "3-3", "result": "D" },
    { "date": "2025-10-05", "opponent": "East San Jose FC", "score": "2-1", "result": "W" }  // ← Just added
  ],
  ...
}
```

**Keep only last 5 games** (oldest first, newest last)

#### D. Update Opponent Info (if available from GotSport)
```json
{
  "id": "game-004",  // ← Next game
  "opponentRecord": "3-1-0",  // ← Check GotSport standings
  "opponentRecentResults": [
    { "date": "2025-09-20", "opponent": "Some Team", "score": "4-2", "result": "W" }
    // Add opponent's recent games if you want
  ]
}
```

**If game not played yet:** Keep `"result": null`

### Step 3: Check Standings (Optional)
Visit: https://system.gotsport.com/org_event/events/44142/results?group=384051

The home page will automatically calculate from `games.json`:
- Current Win-Loss-Draw record
- Goals for/against
- Goal differential

### Step 4: Refresh App
The app updates immediately when you save `games.json`!

---

## Adding New Games

If new games are added to the schedule:

```json
{
  "id": "game-009",  // Increment the number
  "date": "2025-11-16",  // YYYY-MM-DD format
  "time": "10:30 AM",
  "opponent": "Full opponent name from GotSport",
  "mercuryRecord": "2-1-1",  // ← Current record going into this game
  "opponentRecord": "3-0-0",
  "opponentGoals": "",
  "mercuryRecentResults": [
    // Copy from previous game and add latest result
  ],
  "opponentRecentResults": [
    // Research opponent's recent games from GotSport
  ],
  "location": {
    "name": "Field name",
    "field": "Field number",
    "address": "Full address",
    "googleMapsUrl": "https://www.google.com/maps/dir//ADDRESS",
    "embedUrl": "GET_FROM_GOOGLE_MAPS_EMBED"
  },
  "homeAway": "away",  // or "home"
  "jersey": "white",   // or "black"
  "socks": "white",    // or "black"
  "result": null,      // null until game is played
  "teamLogos": {
    "home": "/images/logos/mercury-b16.png",
    "away": "/images/logos/opponent-name.png"  // ← Add opponent logo
  },
  "weatherUrl": "https://weather.com/weather/hourbyhour/l/ZIPCODE?hour=TIME",
  "gotsportUrl": "https://system.gotsport.com/org_event/events/44142/schedules?team=3231307",
  "photoAlbumUrl": null  // Add Pixieset URL after game
}
```

### Adding Opponent Logos

1. Find opponent's logo online (Google "[Team Name] logo")
2. Save as PNG: `public/images/logos/opponent-name.png`
3. Update `teamLogos` in game data
4. Format: lowercase, hyphens between words (e.g., `east-san-jose-fc.png`)

---

## Quick Reference

### Jersey/Socks by Location:
- **Home games** (Pioneer HS): Black jersey, black socks
- **Away games**: White jersey, white socks

### Result Format:
```json
"result": {
  "us": 3,
  "them": 1,
  "goalScorers": ["Player (2)", "Player (1)"]
}
```

### Common Tasks:

#### Mark Game as Completed
1. Update `"result"`: `{ "us": X, "them": Y, "goalScorers": [] }`
2. Update next game's `mercuryRecord`
3. Add to next game's `mercuryRecentResults`

#### Update Photo Album Link
After game photos are uploaded:
```json
"photoAlbumUrl": "https://shotsbyryanq.pixieset.com/albumname/"
```

#### Fix Wrong Opponent Name
Just edit the `"opponent"` field in `games.json`

---

## Weekly Update Workflow

**After Saturday/Sunday games:**

1. ✅ Open `data/games.json`
2. ✅ Find completed game(s)
3. ✅ Update game `result`
4. ✅ Update NEXT game's `mercuryRecord` (add W/L/D)
5. ✅ Update NEXT game's `mercuryRecentResults` (add this game)
6. ✅ (Optional) Update opponent info from GotSport
7. ✅ Save file - app updates automatically!

**Estimated Time:** 3-5 minutes per game

---

## Data Structure Reference

### Required Fields for Each Game:
```json
{
  "id": "game-XXX",
  "date": "YYYY-MM-DD",
  "time": "H:MM AM/PM",
  "opponent": "Full Team Name",
  "mercuryRecord": "W-L-D",           // Cumulative before this game
  "opponentRecord": "W-L-D",
  "mercuryRecentResults": [...],      // Last 5 games (max)
  "opponentRecentResults": [...],     // Opponent's recent games
  "location": { ... },
  "homeAway": "home|away",
  "jersey": "black|white",
  "socks": "black|white",
  "result": null | { "us": X, "them": Y, "goalScorers": [...] },
  "teamLogos": {
    "home": "/images/logos/...",
    "away": "/images/logos/..."
  },
  "weatherUrl": "...",
  "gotsportUrl": "...",
  "photoAlbumUrl": null | "..."
}
```

### Recent Results Format:
```json
{
  "date": "2025-10-05",
  "opponent": "Short Name",
  "score": "2-1",
  "result": "W"  // W, L, or D
}
```

---

## Troubleshooting

**Q: Home page shows wrong record?**
A: Check that all past games have `result` filled in. The app calculates from completed games.

**Q: Scouting report looks wrong?**
A: Make sure `mercuryRecord` and `mercuryRecentResults` are updated for each game.

**Q: Logo not showing?**
A: Check file path in `teamLogos` matches actual file in `public/images/logos/`

**Q: How far back should recent results go?**
A: Keep last 5 games maximum. Delete oldest when adding new ones.

---

✅ Simple JSON editing
✅ No scripts to run
✅ Immediate updates to app
✅ Full control over data