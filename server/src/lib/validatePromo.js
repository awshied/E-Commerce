export const validatePromo = (promo) => {
  if (!promo) {
    throw new Error("Promo wajib diisi.");
  }
  const { title, discountPercent, startDate, endDate } = promo;

  if (!title) {
    throw new Error("Judul promo wajib diisi.");
  }

  if (
    discountPercent === undefined ||
    discountPercent === null ||
    typeof discountPercent !== "number" ||
    Number.isNaN(discountPercent) ||
    discountPercent <= 0 ||
    discountPercent > 100
  ) {
    throw new Error("Diskon harus antara 1 - 100 persen.");
  }

  if (!startDate || !endDate) {
    throw new Error("Tanggal mulai dan berakhir wajib diisi.");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Format tanggal tidak valid.");
  }

  if (start >= end) {
    throw new Error("Tanggal berakhir harus setelah tanggal mulai.");
  }
};
