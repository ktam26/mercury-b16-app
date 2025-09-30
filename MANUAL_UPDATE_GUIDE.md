# Manual Weekly Update Guide

## After Each Game Weekend

### Step 1: Open GotSport Schedule
Visit: https://system.gotsport.com/org_event/events/44142/schedules?team=3231307

### Step 2: Update `data/games.json`

For each completed game, update the result:

```json
{
  "id": "game-001",
  "date": "2025-09-07",
  "time": "2:15 PM",
  "opponent": "Santa Clara Rush 2016B Cougars - Blue",
  ...
  "result": {
    "us": 3,        // ← Our score
    "them": 1,      // ← Their score
    "goalScorers": ["Player Name (2)", "Player Name (1)"]  // Optional
  }
}
```

**If game not played yet:** Keep `"result": null`

### Step 3: Check Standings (Optional)
Visit: https://system.gotsport.com/org_event/events/44142/results?group=384051

The home page will automatically calculate:
- Win-Loss-Draw record
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
  "opponentRecord": "",
  "opponentGoals": "",
  "location": {
    "name": "Field name",
    "field": "Field number",
    "address": "Full address",
    "googleMapsUrl": "https://www.google.com/maps/dir//ADDRESS",
    "embedUrl": ""
  },
  "homeAway": "away",  // or "home"
  "jersey": "white",   // or "black"
  "socks": "white",    // or "black"
  "result": null,      // null until game is played
  "weatherUrl": "https://weather.com/weather/hourbyhour/l/ZIPCODE?hour=TIME",
  "gotsportUrl": "https://system.gotsport.com/org_event/events/44142/schedules?team=3231307",
  "photoAlbumUrl": null  // Add Pixieset URL after game
}
```

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
Change `"result": null` to `"result": { "us": X, "them": Y, "goalScorers": [] }`

#### Update Photo Album Link
After game photos are uploaded:
```json
"photoAlbumUrl": "https://shotsbyryanq.pixieset.com/albumname/"
```

#### Fix Wrong Opponent Name
Just edit the `"opponent"` field in `games.json`

---

## Estimated Time: 2-3 minutes per game

✅ Simple JSON editing
✅ No scripts to run
✅ Immediate updates to app
✅ Full control over data