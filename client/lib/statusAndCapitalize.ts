export const capitalizeLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "diterima":
      return "#2fd4bf";
    case "dikirim":
      return "#0ca5e9";
    case "dikemas":
      return "#ffc586";
    default:
      return "#666";
  }
};
