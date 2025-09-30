// Native Date utility functions - no external dependencies

export function getGameDateTime(game) {
  const dateStr = `${game.date}T${convertTo24Hour(game.time)}`;
  return new Date(dateStr);
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