import { format, formatDistance, parseISO, isPast, isFuture } from 'date-fns';

export function getGameDateTime(game) {
  const dateStr = `${game.date}T${convertTo24Hour(game.time)}`;
  return parseISO(dateStr);
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
  const date = parseISO(dateString);
  return format(date, 'EEE, MMM d');
}

export function formatGameDateLong(dateString) {
  const date = parseISO(dateString);
  return format(date, 'EEEE, MMMM d, yyyy');
}

export function getTimeUntilGame(game) {
  const gameDateTime = getGameDateTime(game);
  const now = new Date();

  if (isPast(gameDateTime)) {
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
    .filter(game => isFuture(getGameDateTime(game)))
    .sort((a, b) => getGameDateTime(a) - getGameDateTime(b))[0];
}

export function getUpcomingGames(games, limit = 3) {
  const now = new Date();
  return games
    .filter(game => isFuture(getGameDateTime(game)))
    .sort((a, b) => getGameDateTime(a) - getGameDateTime(b))
    .slice(0, limit);
}

export function getPastGames(games) {
  const now = new Date();
  return games
    .filter(game => isPast(getGameDateTime(game)))
    .sort((a, b) => getGameDateTime(b) - getGameDateTime(a));
}

export function getGameById(games, id) {
  return games.find(game => game.id === id);
}
