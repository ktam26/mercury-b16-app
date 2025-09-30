# Mercury B16 App - Quick Start Guide

## Weekly Updates

### Update Schedule After Games

After games are completed:

1. Open `data/games.json`
2. Find the completed game
3. Update the result:
   ```json
   "result": {
     "us": 3,
     "them": 1,
     "goalScorers": ["Player (2)", "Player (1)"]
   }
   ```
4. Save the file - app updates immediately!

**See [MANUAL_UPDATE_GUIDE.md](MANUAL_UPDATE_GUIDE.md) for detailed instructions.**

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
