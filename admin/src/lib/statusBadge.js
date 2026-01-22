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

export const getStockStatusBadge = (stock) => {
  if (stock == null || isNaN(stock))
    return { text: "Stok Tidak Diketahui", class: "badge-ghost" };

  if (stock === 0) return { text: "Stok Habis", class: "badge-error" };
  if (stock < 20) return { text: "Stok Hampir Habis", class: "badge-warning" };
  return { text: "Stok Teredia", class: "badge-success" };
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return new Date(dateString).toLocaleDateString("id-ID", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
