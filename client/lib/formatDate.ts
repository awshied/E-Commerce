export const formatDate = (dateInput: string | Date) => {
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    throw new Error("Tanggal invalid.");
  }

  const day = date.getDate();
  const month = date.toLocaleString("id-ID", { month: "long" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};
