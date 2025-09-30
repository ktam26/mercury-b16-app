// Native Date utility functions - no external dependencies

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

export function formatGameDate(dateString) {
  const date = new Date(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

export function formatGameDateLong(dateString) {
  const date = new Date(dateString);
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