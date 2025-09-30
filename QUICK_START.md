# Mercury B16 App - Quick Start Guide

## Weekly Updates

### Update Schedule After Games

After games are completed, update `data/games.json` with **4 things**:

1. **Game Result** - Add score to completed game
2. **Mercury Record** - Update next game's cumulative W-L-D record
3. **Mercury Recent Results** - Add completed game to next game's recent form
4. **Opponent Info** - Update opponent record/form (optional)

**Example workflow:**
```json
// Game just played:
{
  "id": "game-003",
  "result": { "us": 2, "them": 1, "goalScorers": [] }  // ← Add this
}

// Next game:
{
  "id": "game-004",
  "mercuryRecord": "2-0-1",  // ← Update (was 1-0-1, add W)
  "mercuryRecentResults": [
    ...,
    { "date": "2025-10-05", "opponent": "East San Jose", "score": "2-1", "result": "W" }  // ← Add
  ]
}
```

**⏱️ Takes 3-5 minutes per game**

**📖 See [MANUAL_UPDATE_GUIDE.md](MANUAL_UPDATE_GUIDE.md) for detailed step-by-step instructions.**

## Adding Photo Album Covers

1. Pick a good action photo from the Pixieset album
2. Save it as: `public/images/album-001-cover.jpg`
3. Update `data/albums.json` with the path
4. App will automatically display it!

## Development

```bash
# Run dev server
npm run dev

# Visit app
http://localhost:3001
```

## File Structure

```
data/
  games.json          ← UPDATE THIS WEEKLY
  albums.json         ← Photo albums
  team-info.json      ← Team info

public/images/        ← Photo album covers
```

## Common Tasks

**Update Game Result:**
Edit `data/games.json`, change `"result": null` to:
```json
"result": { "us": 3, "them": 1, "goalScorers": [] }
```

**Add Photo Album:**
Add to `data/albums.json` with Pixieset URL

## Tips

✅ Updates are immediate - save and refresh
✅ Photo covers optional but recommended
✅ App calculates standings automatically
