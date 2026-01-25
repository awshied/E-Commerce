export const capitalizeText = (text) => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getOrderStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "diterima":
      return "badge-success";
    case "dikirim":
      return "badge-info";
    case "dikemas":
      return "badge-warning";
    default:
      return "badge-ghost";
  }
};

export const getTotalStock = (sizes = []) => {
  return sizes.reduce((total, s) => total + s.stock, 0);
};

export const getStockStatusBadge = (stock) => {
  if (stock == null || isNaN(stock))
    return { text: "Tidak Diketahui", class: "badge-ghost" };

  if (stock === 0) return { text: "Habis", class: "badge-error" };
  if (stock < 20) return { text: "Hampir Habis", class: "badge-warning" };
  return { text: "Tersedia", class: "badge-success" };
};

export const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const tanggal = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const waktu = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${tanggal}, ${waktu}`;
};
