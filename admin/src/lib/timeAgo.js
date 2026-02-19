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
  if (days < 30) {
    return `${weeks} minggu`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} bulan`;
  }

  const years = Math.floor(days / 365);
  return `${years} tahun`;
};

export const formatRelativeTimeWithClock = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let relative;
  if (seconds < 60) relative = "Baru saja";
  else if (minutes < 60) relative = `${minutes} menit lalu`;
  else if (hours < 24) relative = `${hours} jam lalu`;
  else if (days < 7) relative = `${days} hari lalu`;
  else if (weeks < 4) relative = `${weeks} minggu lalu`;
  else if (months < 12) relative = `${months} bulan lalu`;
  else relative = `${years} tahun lalu`;

  const time = past
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(":", ".");

  return `${relative} | ${time}`;
};
