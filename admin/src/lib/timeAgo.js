export const timeAgo = (date) => {
  if (!date) return "-";

  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

  if (seconds < 60) {
    return `${seconds} detik`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} menit`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} jam`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} hari`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} minggu`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} bulan`;
  }

  const years = Math.floor(days / 365);
  return `${years} tahun`;
};
