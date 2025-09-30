/**
 * Game utility functions for the Mercury B16 Team App
 * Native Date implementation - no external dependencies
 */

/**
 * Converts game date and time into a JavaScript Date object
 * @param {Object} game - The game object containing date and time
 * @param {string} game.date - The game date in YYYY-MM-DD format
 * @param {string} game.time - The game time in 12-hour format (e.g., "2:30 PM")
 * @returns {Date} JavaScript Date object representing the game date/time
 * @throws {Error} If game data is invalid or missing date/time
 */
export function getGameDateTime(game) {
  if (!game?.date || !game?.time) {
    throw new Error('Invalid game data: missing date or time');
  }

  const dateStr = `${game.date}T${convertTo24Hour(game.time)}`;
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${game.date} ${game.time}`);
  }

  return date;
}

/**
 * Converts 12-hour time format to 24-hour format
 * @param {string} time12h - Time in 12-hour format (e.g., "2:30 PM")
 * @returns {string} Time in 24-hour format (e.g., "14:30:00")
 * @example
 * convertTo24Hour("2:30 PM") // Returns "14:30:00"
 * convertTo24Hour("12:00 AM") // Returns "00:00:00"
 */
export function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}:00`;
}

/**
 * Formats a date string into a short, readable format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date (e.g., "Sat, Sep 20")
 */
export function formatGameDate(dateString) {
  const date = createLocalDate(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

export function formatGameDateLong(dateString) {
  const date = createLocalDate(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getArrivalTime(gameTime) {
  // Parse the game time (e.g., "10:30 AM")
  const [time, modifier] = gameTime.split(' ');
  let [hours, minutes] = time.split(':');

  // Convert to 24-hour format
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  // Subtract 30 minutes
  let arrivalHours = hours;
  let arrivalMinutes = minutes - 30;

  if (arrivalMinutes < 0) {
    arrivalMinutes += 60;
    arrivalHours -= 1;
    if (arrivalHours < 0) {
      arrivalHours = 23;
    }
  }

  // Convert back to 12-hour format
  const arrivalModifier = arrivalHours >= 12 ? 'PM' : 'AM';
  let displayHours = arrivalHours % 12;
  if (displayHours === 0) displayHours = 12;

  const displayMinutes = arrivalMinutes.toString().padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${arrivalModifier}`;
}

/**
 * Calculates time remaining until a game starts
 * @param {Object} game - The game object
 * @returns {Object|null} Object with days, hours, minutes until game, or null if game has passed
 * @example
 * getTimeUntilGame(nextGame) // Returns { days: 2, hours: 14, minutes: 30 }
 */
export function getTimeUntilGame(game) {
  const gameDateTime = getGameDateTime(game);
  const now = new Date();

  if (now >= gameDateTime) {
    return null;
  }

  const diff = gameDateTime - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

/**
 * Finds the next upcoming game from an array of games
 * @param {Array} games - Array of game objects
 * @returns {Object|undefined} The next upcoming game or undefined if no future games
 */
export function getNextGame(games) {
  const now = new Date();
  return games
    .filter(game => getGameDateTime(game) > now)
    .sort((a, b) => getGameDateTime(a) - getGameDateTime(b))[0];
}

export function getUpcomingGames(games, limit = 3) {
  const now = new Date();
  return games
    .filter(game => getGameDateTime(game) > now)
    .sort((a, b) => getGameDateTime(a) - getGameDateTime(b))
    .slice(0, limit);
}

export function getPastGames(games) {
  const now = new Date();
  return games
    .filter(game => getGameDateTime(game) <= now)
    .sort((a, b) => getGameDateTime(b) - getGameDateTime(a));
}

export function getGameById(games, id) {
  return games.find(game => game.id === id);
}

// Get form string from recent results (e.g., "WWLLD")
export function getFormString(recentResults) {
  if (!recentResults || recentResults.length === 0) {
    return '';
  }
  return recentResults
    .slice(-5) // Last 5 games
    .map(r => r.result.toUpperCase())
    .join('');
}

// Get badge variant/color for form letter
export function getFormBadgeVariant(result) {
  const upper = result.toUpperCase();
  if (upper === 'W') return 'success'; // green
  if (upper === 'L') return 'destructive'; // red
  return 'secondary'; // gray for draw
}

// Get readable form display with colors
export function getFormDisplay(recentResults) {
  if (!recentResults || recentResults.length === 0) {
    return { form: '', results: [] };
  }

  const last5 = recentResults.slice(-5);
  return {
    form: last5.map(r => r.result.toUpperCase()).join(''),
    results: last5
  };
}

// Ensure ISO dates are interpreted in the local timezone to avoid off-by-one day errors
function createLocalDate(dateString) {
  if (typeof dateString !== 'string') {
    throw new Error(`Invalid date value: ${dateString}`);
  }

  const parts = dateString.split('-');
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateString}`);
  }

  const [year, month, day] = parts.map(Number);
  if ([year, month, day].some(Number.isNaN)) {
    throw new Error(`Invalid date components: ${dateString}`);
  }

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Unable to parse date: ${dateString}`);
  }

  return date;
}

/**
 * Returns a short, display-friendly version of a team name
 * Applies custom mappings for known teams and falls back to the first two words
 * @param {string} name - Full team name
 * @returns {string} Short display name
 */
export function getShortTeamName(name) {
  if (!name) {
    return '';
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return '';
  }

  const normalized = trimmed.toLowerCase();

  if (normalized.includes('esjfc') || normalized.includes('east san jose')) {
    return 'ESJFC';
  }

  if (normalized.includes('mercury')) {
    return 'AFC';
  }

  const words = trimmed.split(/\s+/);
  if (words.length <= 2) {
    return trimmed;
  }

  return words.slice(0, 2).join(' ');
}
